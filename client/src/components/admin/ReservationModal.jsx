import React, { useEffect, useMemo, useState } from 'react';
import { Building2, CircleDollarSign, ShieldCheck, X } from 'lucide-react';
import { createAdminBookingRequest, fetchUnitDetails } from '../../api/http.js';

const formatDateInput = (date) => date.toISOString().slice(0, 10);

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const formatMoney = (value) => new Intl.NumberFormat('en-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 2,
}).format(Number(value || 0));

const getPropertyType = (unit) => String(unit?.propertyType || unit?.type || unit?.unit_type || '').trim().toLowerCase();

const getHousekeepingFee = (unit) => (getPropertyType(unit) === 'villa' ? 2500 : 1500);

const getBeachAccessRate = (unit) => Number(
  unit?.beachAccessPricePerPersonPerWeek ??
  unit?.beachAccessPricePerPerson ??
  unit?.beach_access_price_per_person_per_week ??
  unit?.beach_access_price_per_person ??
  unit?.beachAccessPrice ??
  0
);

const buildInitialState = ({ selectedUnitId, selectedDate, units }) => {
  const unitId = selectedUnitId || units[0]?._id || '';
  const checkIn = selectedDate ? formatDateInput(selectedDate) : formatDateInput(new Date());
  const checkOut = selectedDate ? formatDateInput(addDays(selectedDate, 2)) : formatDateInput(addDays(new Date(), 2));

  return {
    unit_id: unitId,
    customer_name: '',
    customer_phone: '',
    guest_count: 1,
    check_in_date: checkIn,
    check_out_date: checkOut,
    notes: '',
  };
};

export const ReservationModal = ({ open, onClose, onSaved, units = [], selectedUnitId = '', selectedDate = null }) => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState(() => buildInitialState({ selectedUnitId, selectedDate, units }));
  const [bookedRanges, setBookedRanges] = useState([]);
  const [selectedUnitDetails, setSelectedUnitDetails] = useState(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormState(buildInitialState({ selectedUnitId, selectedDate, units }));
    setMessage('');
  }, [open, selectedUnitId, selectedDate, units]);

  useEffect(() => {
    if (!open || !formState.unit_id) {
      setBookedRanges([]);
      setSelectedUnitDetails(null);
      return undefined;
    }

    let active = true;

    const loadUnitDetails = async () => {
      try {
        const unitData = await fetchUnitDetails(formState.unit_id);
        if (active) {
          setSelectedUnitDetails(unitData || null);
          setBookedRanges(Array.isArray(unitData?.bookedRanges) ? unitData.bookedRanges : []);
        }
      } catch {
        if (active) {
          setSelectedUnitDetails(null);
          setBookedRanges([]);
        }
      }
    };

    loadUnitDetails();

    return () => {
      active = false;
    };
  }, [open, formState.unit_id]);

  const selectedUnit = useMemo(() => {
    const listUnit = units.find((unit) => String(unit._id) === String(formState.unit_id));
    return selectedUnitDetails || listUnit || null;
  }, [formState.unit_id, selectedUnitDetails, units]);

  const preview = useMemo(() => {
    const checkIn = formState.check_in_date ? new Date(formState.check_in_date) : null;
    const checkOut = formState.check_out_date ? new Date(formState.check_out_date) : null;
    const guests = Number(formState.guest_count || 0);
    const pricePerNight = Number(selectedUnit?.pricePerNight ?? selectedUnit?.price ?? 0);
    const nights = checkIn && checkOut && !Number.isNaN(checkIn.getTime()) && !Number.isNaN(checkOut.getTime())
      ? Math.max(0, Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000))
      : 0;
    const weeks = nights > 0 ? Math.ceil(nights / 7) : 0;
    const baseAccommodationPrice = nights * pricePerNight;
    const housekeepingFee = selectedUnit ? getHousekeepingFee(selectedUnit) : 0;
    const beachAccessRate = selectedUnit ? getBeachAccessRate(selectedUnit) : 0;
    const beachAccessAmount = beachAccessRate * guests * weeks;
    const grossInvoice = baseAccommodationPrice + housekeepingFee + beachAccessAmount;

    return {
      nights,
      weeks,
      pricePerNight,
      baseAccommodationPrice,
      housekeepingFee,
      beachAccessRate,
      beachAccessAmount,
      grossInvoice,
    };
  }, [formState.check_in_date, formState.check_out_date, formState.guest_count, selectedUnit]);

  const hasDateConflict = useMemo(() => {
    if (!formState.check_in_date || !formState.check_out_date || !bookedRanges.length) {
      return false;
    }

    const checkIn = new Date(formState.check_in_date);
    const checkOut = new Date(formState.check_out_date);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      return false;
    }

    return bookedRanges.some((range) => {
      const existingCheckIn = new Date(range.checkIn);
      const existingCheckOut = new Date(range.checkOut);
      return checkIn < existingCheckOut && checkOut > existingCheckIn;
    });
  }, [bookedRanges, formState.check_in_date, formState.check_out_date]);

  const isInvalidDateRange = useMemo(() => {
    if (!formState.check_in_date || !formState.check_out_date) {
      return false;
    }

    return new Date(formState.check_out_date) <= new Date(formState.check_in_date);
  }, [formState.check_in_date, formState.check_out_date]);

  if (!open) {
    return null;
  }

  const handleChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedUnit) {
      setMessage('Please select a unit before saving.');
      return;
    }

    if (isInvalidDateRange) {
      setMessage('Check-out date must be after check-in date.');
      return;
    }

    if (hasDateConflict) {
      setMessage('The requested duration overlaps with an existing reservation for this unit.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    const customerPhone = String(formState.customer_phone || '').trim();
    const generatedEmail = `${customerPhone.replace(/\D+/g, '') || 'admin'}@soul-hospitality.local`;

    try {
      await createAdminBookingRequest({
        unit_id: formState.unit_id,
        customer_name: formState.customer_name,
        customer_phone: customerPhone,
        customer_email: generatedEmail,
        guest_count: Number(formState.guest_count || 0),
        check_in_date: formState.check_in_date,
        check_out_date: formState.check_out_date,
        is_admin_created: true,
        notes: formState.notes,
        payment_method: 'cash',
      });

      setMessage('Reservation created successfully.');
      if (onSaved) {
        await onSaved();
      }
      setFormState(buildInitialState({ selectedUnitId, selectedDate, units }));
      if (onClose) {
        onClose();
      }
    } catch (submitError) {
      setMessage(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = 'rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#283f5e]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Admin booking</p>
              <h2 className="mt-2 text-2xl font-bold text-[#283f5e]">Add Reservation</h2>
              <p className="mt-1 text-sm text-slate-500">Manual back-office booking with automatic fee rules and backend-managed commission rules.</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="Close modal">
              <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 px-6 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 md:col-span-2">
                Unit Selection *
                <select value={formState.unit_id} onChange={(event) => handleChange('unit_id', event.target.value)} className={fieldClass} required>
                  <option value="">Select unit...</option>
                  {units.map((unit) => (
                    <option key={unit._id} value={unit._id}>
                      {unit.uniqueId || unit.unit_number || 'Unit'} — {unit.name || unit.title} ({unit.projectName || unit.location || 'Project'})
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Customer Full Name *
                <input value={formState.customer_name} onChange={(event) => handleChange('customer_name', event.target.value)} className={fieldClass} placeholder="Full name" required />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Phone Number *
                <input value={formState.customer_phone} onChange={(event) => handleChange('customer_phone', event.target.value)} className={fieldClass} placeholder="+20..." required />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Total Guests Count *
                <input type="number" min="1" value={formState.guest_count} onChange={(event) => handleChange('guest_count', event.target.value)} className={fieldClass} required />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Check-in Date *
                <input type="date" value={formState.check_in_date} onChange={(event) => handleChange('check_in_date', event.target.value)} className={`${fieldClass} ${hasDateConflict || isInvalidDateRange ? 'border-rose-300 focus:border-rose-500' : ''}`} required />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Check-out Date *
                <input type="date" value={formState.check_out_date} onChange={(event) => handleChange('check_out_date', event.target.value)} className={`${fieldClass} ${hasDateConflict || isInvalidDateRange ? 'border-rose-300 focus:border-rose-500' : ''}`} required />
              </label>
            </div>

            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Notes
              <textarea value={formState.notes} onChange={(event) => handleChange('notes', event.target.value)} rows={4} className={fieldClass} placeholder="Optional internal note" />
            </label>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-[#283f5e]">
                <CircleDollarSign className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                <h3 className="text-lg font-bold">Invoice Preview</h3>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                  <span className="text-slate-500">Base accommodation</span>
                  <span className="font-semibold text-slate-900">{formatMoney(preview.baseAccommodationPrice)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                  <span className="text-slate-500">Housekeeping</span>
                  <span className="font-semibold text-slate-900">{formatMoney(preview.housekeepingFee)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                  <span className="text-slate-500">Beach access</span>
                  <span className="font-semibold text-slate-900">{formatMoney(preview.beachAccessAmount)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-base">
                  <span className="font-semibold text-slate-700">Gross invoice</span>
                  <span className="font-bold text-[#283f5e]">{formatMoney(preview.grossInvoice)}</span>
                </div>
                <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Sales commission is fixed at 1% of total price and is only recorded after an accepted reservation. Organic website reservations can also generate a separate 0.5% system commission after acceptance.
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Housekeeping is fixed at EGP 2,500 for villas and EGP 1,500 for other property types. Beach access is charged per guest per week using the selected unit rate.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#283f5e] text-white">
                  <Building2 className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Selected unit</p>
                  <h3 className="text-lg font-bold text-slate-900">{selectedUnit?.name || selectedUnit?.title || 'No unit selected'}</h3>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-400">Property type</span>
                  <span className="font-medium text-slate-900">{selectedUnit ? (selectedUnit.type || selectedUnit.propertyType || selectedUnit.unit_type || 'Unit') : '—'}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-400">Unit price/night</span>
                  <span className="font-medium text-slate-900">{formatMoney(preview.pricePerNight)}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-400">Nights</span>
                  <span className="font-medium text-slate-900">{preview.nights}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-400">Weeks for beach access</span>
                  <span className="font-medium text-slate-900">{preview.weeks}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-400">Guests</span>
                  <span className="font-medium text-slate-900">{formState.guest_count}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-400">Beach access / guest / week</span>
                  <span className="font-medium text-slate-900">{formatMoney(preview.beachAccessRate)}</span>
                </div>
              </div>

              {hasDateConflict ? (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  The selected duration overlaps with an existing reservation for this unit.
                </div>
              ) : null}

              {isInvalidDateRange ? (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  Check-out date must be after check-in date.
                </div>
              ) : null}

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <ShieldCheck className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  Admin-created reservation
                </div>
                <p className="mt-1">This booking will be flagged internally and stored with the computed commission ledger.</p>
              </div>
            </div>

            {message ? <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{message}</div> : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" disabled={submitting || hasDateConflict || isInvalidDateRange} className="rounded-full bg-[#283f5e] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1e3047] disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Reservation'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};