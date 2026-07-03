import React, { useMemo, useState } from 'react';
import { createAdminBookingRequest } from '../../api/http.js';

const formatDate = (date) => date.toISOString().slice(0, 10);

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const ReservationModal = ({ open, onClose, onSaved, units = [], selectedUnitId = '', selectedDate = null }) => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const defaultStart = selectedDate ? formatDate(selectedDate) : formatDate(new Date());
  const defaultEnd = selectedDate ? formatDate(addDays(selectedDate, 2)) : formatDate(addDays(new Date(), 2));

  const initialState = useMemo(
    () => ({
      unit_id: selectedUnitId || units[0]?._id || '',
      booking_source: '',
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      customer_nationality: '',
      check_in_date: defaultStart,
      check_out_date: defaultEnd,
      guest_count: 1,
      price_per_night: '',
      down_payment_collected: '',
      housekeeping_fees: '',
      insurance: '',
      owner_collected_payment: false,
      broker_commission: false,
      broker_name: '',
      broker_amount_per_night: '',
      is_owner_reservation: false,
      sales_person: '',
      notes: '',
      transfer_proof_url: '',
      payment_method: 'cash'
    }),
    [defaultEnd, defaultStart, selectedUnitId, units]
  );

  const [formState, setFormState] = useState(initialState);

  if (!open) {
    return null;
  }

  const handleChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await createAdminBookingRequest(formState);
      setMessage('Reservation created successfully.');
      if (onSaved) {
        await onSaved();
      }
      setFormState(initialState);
      if (onClose) {
        onClose();
      }
    } catch (submitError) {
      setMessage(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = 'rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#283f5e]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 text-2xl text-slate-400 hover:text-slate-700">×</button>
        <h2 className="mb-6 text-2xl font-bold text-[#283f5e]">New Reservation</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Unit *
              <select value={formState.unit_id} onChange={(event) => handleChange('unit_id', event.target.value)} className={fieldClass} required>
                <option value="">Select unit...</option>
                {units.map((unit) => (
                  <option key={unit._id} value={unit._id}>
                    {unit.uniqueId} — {unit.name || unit.title} ({unit.projectName || unit.location})
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Booking Source
              <input value={formState.booking_source} onChange={(event) => handleChange('booking_source', event.target.value)} className={fieldClass} placeholder="Select source..." />
            </label>

            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Tenant Name *
              <input value={formState.customer_name} onChange={(event) => handleChange('customer_name', event.target.value)} className={fieldClass} required />
            </label>

            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Mobile No. *
              <input value={formState.customer_phone} onChange={(event) => handleChange('customer_phone', event.target.value)} className={fieldClass} required />
            </label>

            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Email
              <input type="email" value={formState.customer_email} onChange={(event) => handleChange('customer_email', event.target.value)} className={fieldClass} />
            </label>

            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Nationality
              <input value={formState.customer_nationality} onChange={(event) => handleChange('customer_nationality', event.target.value)} className={fieldClass} />
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Dates *</p>
              <p className="text-sm text-slate-400">Select a check-in date</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Check-in
                <input type="date" value={formState.check_in_date} onChange={(event) => handleChange('check_in_date', event.target.value)} className={fieldClass} required />
              </label>
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Check-out
                <input type="date" value={formState.check_out_date} onChange={(event) => handleChange('check_out_date', event.target.value)} className={fieldClass} required />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="mb-4 flex items-center gap-2 text-[#283f5e]"><span>💰</span><h3 className="text-lg font-bold">Financial Details</h3></div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Price per Night (EGP) *
                <input type="number" value={formState.price_per_night} onChange={(event) => handleChange('price_per_night', event.target.value)} className={fieldClass} required />
              </label>
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Down Payment collected by us (EGP)
                <input type="number" value={formState.down_payment_collected} onChange={(event) => handleChange('down_payment_collected', event.target.value)} className={fieldClass} />
              </label>
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Housekeeping Fees (EGP)
                <input type="number" value={formState.housekeeping_fees} onChange={(event) => handleChange('housekeeping_fees', event.target.value)} className={fieldClass} />
              </label>
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Insurance (EGP)
                <input type="number" value={formState.insurance} onChange={(event) => handleChange('insurance', event.target.value)} className={fieldClass} />
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-slate-700 md:col-span-2">
              <input type="checkbox" checked={formState.owner_collected_payment} onChange={(event) => handleChange('owner_collected_payment', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#283f5e]" />
              <span>🏠 Owner collected payment from tenant</span>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-slate-700 md:col-span-2">
              <input type="checkbox" checked={formState.broker_commission} onChange={(event) => handleChange('broker_commission', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#283f5e]" />
              <span>🤝 Broker Commission</span>
            </label>

            {formState.broker_commission ? (
              <>
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Broker Name
                  <input value={formState.broker_name} onChange={(event) => handleChange('broker_name', event.target.value)} className={fieldClass} />
                </label>
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Broker Amount / Night (EGP)
                  <input type="number" value={formState.broker_amount_per_night} onChange={(event) => handleChange('broker_amount_per_night', event.target.value)} className={fieldClass} />
                </label>
              </>
            ) : null}

            <label className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-700 md:col-span-2">
              <span>⚡ Utilities/night (EGP) [500 default]</span>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-slate-700 md:col-span-2">
              <input type="checkbox" checked={formState.is_owner_reservation} onChange={(event) => handleChange('is_owner_reservation', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#283f5e]" />
              <span>👤 Owner Reservation — no utilities deduction</span>
            </label>

            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 md:col-span-2">
              Sales Person *
              <input value={formState.sales_person} onChange={(event) => handleChange('sales_person', event.target.value)} className={fieldClass} placeholder="None" />
            </label>
          </div>

          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Notes
            <textarea value={formState.notes} onChange={(event) => handleChange('notes', event.target.value)} rows={4} className={fieldClass} />
          </label>

          <label className="grid gap-2 rounded-2xl border border-dashed border-slate-300 p-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            📤 Transfer Proof (optional)
            <input value={formState.transfer_proof_url} onChange={(event) => handleChange('transfer_proof_url', event.target.value)} placeholder="Paste proof URL" className={fieldClass} />
          </label>

          {message ? <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{message}</div> : null}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="rounded-full bg-[#283f5e] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1e3047] disabled:opacity-70">
              {submitting ? 'Creating...' : 'Create Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
