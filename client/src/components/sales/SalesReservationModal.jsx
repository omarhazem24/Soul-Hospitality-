import React, { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { createSalesBookingRequest, fetchUnitDetails } from '../../api/http.js';

const fieldClass = 'rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#283f5e]';
const MIN_STAY_NIGHTS = 4;
const GAIA_MIN_STAY_NIGHTS = 3;
const GAIA_BEACH_ACCESS_DAYS = 7;
const GAIA_BEACH_BASE_PRICE = 3500;
const GAIA_BEACH_EXTRA_PRICE = 4000;

const formatDateInput = (date) => date.toISOString().slice(0, 10);

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const dayDifference = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const difference = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  return Number.isFinite(difference) && difference > 0 ? difference : 0;
};

const hasDateRangeOverlap = (checkInDate, checkOutDate, bookedRanges = []) => {
  if (!checkInDate || !checkOutDate || !Array.isArray(bookedRanges) || bookedRanges.length === 0) {
    return false;
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    return false;
  }

  return bookedRanges.some((range) => {
    const existingCheckIn = new Date(range.checkIn);
    const existingCheckOut = new Date(range.checkOut);
    return checkIn < existingCheckOut && checkOut > existingCheckIn;
  });
};

const formatPrice = (value) => `EGP ${Number(value || 0).toLocaleString()}`;

const getDynamicHousekeepingFee = (unit) => {
  const propertyType = String(unit?.propertyType || unit?.type || unit?.unit_type || '').trim().toLowerCase();
  return propertyType === 'villa' ? 2500 : 1500;
};

const getUnitCapacity = (unit) => Number(unit?.capacity || Math.max(1, Number(unit?.bedrooms || unit?.bedroom_count || 0) * 2 || 1));

const getBeachAccessDays = (unit) => {
  const rawValue = Number(unit?.beachAccessDays ?? unit?.beach_access_days ?? 7);
  return Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 7;
};

const getConfiguredBeachAccessPrice = (unit) => Number(
  unit?.beachAccessPricePerPersonPerWeek ??
  unit?.beachAccessPricePerPerson ??
  unit?.beach_access_price_per_person_per_week ??
  unit?.beach_access_price_per_person ??
  unit?.beachAccessPrice ??
  500
);

const isGaiaUnit = (unit) => String(
  unit?.projectName ??
  unit?.destination ??
  unit?.location ??
  ''
).trim().toLowerCase() === 'gaia';

const getMinimumStayNights = (unit) => (isGaiaUnit(unit) ? GAIA_MIN_STAY_NIGHTS : MIN_STAY_NIGHTS);

const getGaiaBeachOverride = (unit, nights) => {
  if (isGaiaUnit(unit) && Number(nights || 0) > 3) {
    return {
      beachAccessDays: GAIA_BEACH_ACCESS_DAYS,
      beachAccessPricePerPersonPerWeek: GAIA_BEACH_BASE_PRICE,
      beachAccessExtraGuestPricePerPerson: GAIA_BEACH_EXTRA_PRICE
    };
  }

  return null;
};

const getBeachAccessExtraGuestPrice = (unit, fallbackPrice) => Number(
  unit?.beachAccessExtraGuestPricePerPerson ??
  unit?.beach_access_extra_guest_price_per_person ??
  fallbackPrice
);

const IncrementControl = ({ value, onIncrement, onDecrement, min = 1 }) => (
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={onDecrement}
      disabled={value <= min}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-[#283f5e] hover:text-[#283f5e] disabled:cursor-not-allowed disabled:opacity-40"
      aria-label="Decrease guests"
    >
      <Minus className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
    </button>
    <span className="min-w-8 text-center text-sm font-semibold text-slate-900">{value}</span>
    <button
      type="button"
      onClick={onIncrement}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-[#283f5e] hover:text-[#283f5e]"
      aria-label="Increase guests"
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
    </button>
  </div>
);

const buildInitialState = ({ selectedUnitId, selectedDate, units }) => ({
  unit_id: selectedUnitId || units[0]?._id || '',
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  guest_count: 1,
  check_in_date: selectedDate ? formatDateInput(selectedDate) : formatDateInput(new Date()),
  check_out_date: selectedDate ? formatDateInput(addDays(selectedDate, 2)) : formatDateInput(addDays(new Date(), 2)),
  payment_method: 'cash',
  deposit_collected: 0,
  notes: '',
});

export const SalesReservationModal = ({ open, onClose, onSaved, units = [], selectedUnitId = '', selectedDate = null }) => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState(() => buildInitialState({ selectedUnitId, selectedDate, units }));
  const [transferEvidencePhoto, setTransferEvidencePhoto] = useState(null);
  const [selectedUnitDetails, setSelectedUnitDetails] = useState(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormState(buildInitialState({ selectedUnitId, selectedDate, units }));
    setTransferEvidencePhoto(null);
    setMessage('');
  }, [open, selectedUnitId, selectedDate, units]);

  useEffect(() => {
    if (!open || !formState.unit_id) {
      setSelectedUnitDetails(null);
      return undefined;
    }

    let active = true;

    const loadUnit = async () => {
      try {
        const payload = await fetchUnitDetails(formState.unit_id);
        if (active) {
          setSelectedUnitDetails(payload || null);
        }
      } catch {
        if (active) {
          setSelectedUnitDetails(null);
        }
      }
    };

    loadUnit();

    return () => {
      active = false;
    };
  }, [open, formState.unit_id]);

  const selectedUnit = useMemo(() => {
    const localUnit = units.find((unit) => String(unit._id) === String(formState.unit_id));
    return selectedUnitDetails || localUnit || null;
  }, [formState.unit_id, selectedUnitDetails, units]);

  const nights = useMemo(() => dayDifference(formState.check_in_date, formState.check_out_date), [formState.check_in_date, formState.check_out_date]);
  const minimumStayNights = useMemo(() => getMinimumStayNights(selectedUnit), [selectedUnit]);
  const belowMinimumStay = nights > 0 && nights < minimumStayNights;
  const nightlyRate = Number(selectedUnit?.pricePerNight || selectedUnit?.price || 0);
  const housekeepingMandatoryPrice = getDynamicHousekeepingFee(selectedUnit);
  const gaiaBeachOverride = useMemo(() => getGaiaBeachOverride(selectedUnit, nights), [selectedUnit, nights]);
  const configuredBeachBasePrice = getConfiguredBeachAccessPrice(selectedUnit);
  const beachAccessPricePerPersonPerWeek = gaiaBeachOverride?.beachAccessPricePerPersonPerWeek ?? configuredBeachBasePrice;
  const beachAccessExtraGuestPricePerPerson = gaiaBeachOverride?.beachAccessExtraGuestPricePerPerson ?? getBeachAccessExtraGuestPrice(selectedUnit, configuredBeachBasePrice);
  const beachAccessDays = gaiaBeachOverride?.beachAccessDays ?? getBeachAccessDays(selectedUnit);
  const subtotalAmount = nights > 0 ? nightlyRate * nights : 0;
  const stayWeeks = nights > 0 ? Math.ceil(nights / beachAccessDays) : 0;
  const beachPassHeadcount = Number(formState.guest_count || 0);
  const unitCapacity = useMemo(() => getUnitCapacity(selectedUnit), [selectedUnit]);
  const includedBeachGuests = Math.min(beachPassHeadcount, unitCapacity);
  const extraBeachGuests = Math.max(0, beachPassHeadcount - unitCapacity);
  const beachAccessAmount = ((includedBeachGuests * beachAccessPricePerPersonPerWeek) + (extraBeachGuests * beachAccessExtraGuestPricePerPerson)) * stayWeeks;
  const totalAmount = subtotalAmount + housekeepingMandatoryPrice + beachAccessAmount;

  const isOverlapping = useMemo(() => hasDateRangeOverlap(formState.check_in_date, formState.check_out_date, selectedUnit?.bookedRanges), [formState.check_in_date, formState.check_out_date, selectedUnit?.bookedRanges]);

  if (!open) {
    return null;
  }

  const handleChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formState.unit_id) {
      setMessage('Please select a unit.');
      return;
    }

    if (new Date(formState.check_out_date) <= new Date(formState.check_in_date)) {
      setMessage('Check-out date must be after check-in date.');
      return;
    }

    if (nights < minimumStayNights) {
      setMessage(`Minimum stay is ${minimumStayNights} nights for this unit.`);
      return;
    }

    if (isOverlapping) {
      setMessage('The requested duration overlaps with an existing reservation for this unit.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('unit_id', formState.unit_id);
      formData.append('customer_name', formState.customer_name);
      formData.append('customer_phone', formState.customer_phone);
      formData.append('customer_email', formState.customer_email);
      formData.append('guest_count', String(formState.guest_count));
      formData.append('check_in_date', formState.check_in_date);
      formData.append('check_out_date', formState.check_out_date);
      formData.append('payment_method', formState.payment_method);
      formData.append('deposit_collected', String(formState.deposit_collected || 0));
      formData.append('is_sales_created', 'true');
      formData.append('notes', formState.notes);

      if (transferEvidencePhoto) {
        formData.append('transfer_evidence_photo', transferEvidencePhoto);
      }

      await createSalesBookingRequest(formData);

      setMessage('Reservation created successfully.');
      if (onSaved) {
        await onSaved();
      }
      if (onClose) {
        onClose();
      }
    } catch (submitError) {
      setMessage(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Sales booking</p>
              <h2 className="mt-2 text-2xl font-bold text-[#283f5e]">Create Reservation</h2>
              <p className="mt-1 text-sm text-slate-500">Sales-only manual reservation with deposit and transfer evidence capture.</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="Close modal">
              <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 px-6 py-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 md:col-span-2">
                Unit Selection *
                <select value={formState.unit_id} onChange={(event) => handleChange('unit_id', event.target.value)} className={fieldClass} required>
                  <option value="">Select unit...</option>
                  {units.map((unit) => (
                    <option key={unit._id} value={unit._id}>
                      {unit.uniqueId || unit.unit_number || 'Unit'} - {unit.name || unit.title} ({unit.projectName || unit.location || 'Project'})
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Customer Full Name *
                <input value={formState.customer_name} onChange={(event) => handleChange('customer_name', event.target.value)} className={fieldClass} required />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Phone Number *
                <input value={formState.customer_phone} onChange={(event) => handleChange('customer_phone', event.target.value)} className={fieldClass} required />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 md:col-span-2">
                Email Address *
                <input type="email" value={formState.customer_email} onChange={(event) => handleChange('customer_email', event.target.value)} className={fieldClass} required />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Guest Count *
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">Guests</p>
                  <IncrementControl
                    value={Number(formState.guest_count || 1)}
                    min={1}
                    onDecrement={() => handleChange('guest_count', Math.max(1, Number(formState.guest_count || 1) - 1))}
                    onIncrement={() => handleChange('guest_count', Number(formState.guest_count || 1) + 1)}
                  />
                </div>
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Deposit Collected
                <input type="number" min="0" step="0.01" value={formState.deposit_collected} onChange={(event) => handleChange('deposit_collected', event.target.value)} className={fieldClass} />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Check-in Date *
                <input type="date" value={formState.check_in_date} onChange={(event) => handleChange('check_in_date', event.target.value)} className={`${fieldClass} ${isOverlapping || belowMinimumStay ? 'border-rose-300 focus:border-rose-500' : ''}`} required />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Check-out Date *
                <input type="date" value={formState.check_out_date} onChange={(event) => handleChange('check_out_date', event.target.value)} className={`${fieldClass} ${isOverlapping || belowMinimumStay ? 'border-rose-300 focus:border-rose-500' : ''}`} required />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Payment Method *
                <select value={formState.payment_method} onChange={(event) => handleChange('payment_method', event.target.value)} className={fieldClass} required>
                  <option value="cash">Cash</option>
                  <option value="instapay">InstaPay</option>
                </select>
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Transfer Evidence Photo
                <input type="file" accept="image/*" onChange={(event) => setTransferEvidencePhoto(event.target.files?.[0] || null)} className={fieldClass} />
              </label>
            </div>

            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Notes
              <textarea value={formState.notes} onChange={(event) => handleChange('notes', event.target.value)} rows={4} className={fieldClass} />
            </label>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Selected unit</p>
              <h3 className="mt-2 text-xl font-bold text-[#283f5e]">{selectedUnit?.name || selectedUnit?.title || 'No unit selected'}</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                  <span>Project</span>
                  <span className="font-semibold text-slate-900">{selectedUnit?.projectName || selectedUnit?.location || '—'}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                  <span>Unit price/night</span>
                  <span className="font-semibold text-slate-900">{Number(selectedUnit?.pricePerNight ?? selectedUnit?.price ?? 0).toLocaleString('en-EG', { style: 'currency', currency: 'EGP' })}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                  <span>Nights</span>
                  <span className="font-semibold text-slate-900">{nights}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                  <span>Guests</span>
                  <span className="font-semibold text-slate-900">{formState.guest_count}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Nightly rate</span>
                <span className="font-semibold text-slate-900">{formatPrice(nightlyRate)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Subtotal ({nights} nights)</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Housekeeping mandatory fee</span>
                <span className="font-semibold text-slate-900">{formatPrice(housekeepingMandatoryPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Beach pass fees</span>
                <span className="font-semibold text-slate-900">{formatPrice(beachAccessAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Total bill</span>
                <span className="text-lg font-bold text-slate-900">{formatPrice(totalAmount)}</span>
              </div>
              <p className="text-xs text-slate-500">Beach fee uses guests and duration: ({includedBeachGuests} x {formatPrice(beachAccessPricePerPersonPerWeek)} + {extraBeachGuests} x {formatPrice(beachAccessExtraGuestPricePerPerson)}) x {stayWeeks} period(s).</p>
            </div>

            {isOverlapping ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                The selected duration overlaps with an existing reservation for this unit.
              </div>
            ) : null}

            {belowMinimumStay ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                Minimum stay is {minimumStayNights} nights for this unit.
              </div>
            ) : null}

            {message ? <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{message}</div> : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={submitting || belowMinimumStay || isOverlapping} className="rounded-full bg-[#283f5e] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1e3047] disabled:cursor-not-allowed disabled:opacity-50">{submitting ? 'Creating...' : 'Create Reservation'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};