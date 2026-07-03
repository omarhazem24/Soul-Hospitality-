import React, { useMemo, useState } from 'react';
import { createAdminUnit } from '../api/http.js';

const buildInitialState = (values = {}) => ({
  name: values.name || '',
  uniqueId: values.uniqueId || '',
  projectName: values.projectName || '',
  type: values.type || 'Apartment',
  bedrooms: values.bedrooms || '',
  bathrooms: values.bathrooms || '',
  area: values.area || '',
  floor: values.floor || '',
  pricePerNight: values.pricePerNight || '',
  utilitiesCostPerNight: values.utilitiesCostPerNight || 500,
  capacity: values.capacity || '',
  status: values.status || 'Available',
  view: values.view || '',
  description: values.description || '',
  location_link: values.location_link || '',
  commissionMode: values.commissionStructure?.mode || 'Mode A',
  modeAValue: values.commissionStructure?.modeAValue || 20,
  modeBOwnerRate: values.commissionStructure?.modeBValues?.ownerRate || 0,
  modeBTenantRate: values.commissionStructure?.modeBValues?.tenantRate || 0,
  modeCTenantFee: values.commissionStructure?.modeCValues?.tenantFee || 0,
  modeCBookingSourceRates: JSON.stringify(values.commissionStructure?.modeCValues?.bookingSourceRates || {}),
  amenities: Array.isArray(values.amenities) ? values.amenities.join(', ') : values.amenities || ''
});

export const AdminUnitForm = ({ initialValues, onCancel, onSaved }) => {
  const [formState, setFormState] = useState(() => buildInitialState(initialValues));
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const commissionStructure = useMemo(
    () => ({
      mode: formState.commissionMode,
      modeAValue: Number(formState.modeAValue || 0),
      modeBValues: {
        ownerRate: Number(formState.modeBOwnerRate || 0),
        tenantRate: Number(formState.modeBTenantRate || 0)
      },
      modeCValues: {
        bookingSourceRates: (() => {
          try {
            return JSON.parse(formState.modeCBookingSourceRates || '{}');
          } catch {
            return {};
          }
        })(),
        tenantFee: Number(formState.modeCTenantFee || 0)
      }
    }),
    [formState]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    if (!files.length) {
      setMessage('Please add at least one photo for the unit.');
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(formState).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      formData.set('capacity', String(formState.capacity || Math.max(1, Number(formState.bedrooms || 0) * 2 || 1)));
      formData.set('commissionStructure', JSON.stringify(commissionStructure));

      Array.from(files).forEach((file) => {
        formData.append('photos', file);
      });

      await createAdminUnit(formData);
      setMessage('Unit created successfully.');
      if (onSaved) {
        await onSaved();
      }
      setFiles([]);
      if (!initialValues) {
        setFormState(buildInitialState());
      }
    } catch (submitError) {
      setMessage(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = 'rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#283f5e]';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['name', 'Name', 'text'],
          ['uniqueId', 'Unique ID', 'text'],
          ['projectName', 'Project Name', 'text'],
          ['type', 'Type', 'text'],
          ['bedrooms', 'Bedrooms', 'number'],
          ['bathrooms', 'Bathrooms', 'number'],
          ['area', 'Area (m²)', 'number'],
          ['floor', 'Floor', 'text'],
          ['pricePerNight', 'Price Per Night', 'number'],
          ['utilitiesCostPerNight', 'Utilities / Night', 'number'],
          ['capacity', 'Capacity', 'number'],
          ['view', 'View', 'text'],
          ['location_link', 'Location Link', 'url']
        ].map(([field, label, type]) => (
          <label key={field} className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
            <input
              type={type}
              value={formState[field]}
              onChange={(event) => handleChange(field, event.target.value)}
              className={fieldClass}
              required={['name', 'uniqueId', 'projectName', 'type', 'bedrooms', 'bathrooms', 'area', 'floor', 'pricePerNight', 'location_link'].includes(field)}
            />
          </label>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Status
          <select value={formState.status} onChange={(event) => handleChange('status', event.target.value)} className={fieldClass}>
            <option>Available</option>
            <option>Occupied</option>
            <option>Maintenance</option>
          </select>
        </label>

        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Commission Mode
          <select value={formState.commissionMode} onChange={(event) => handleChange('commissionMode', event.target.value)} className={fieldClass}>
            <option>Mode A</option>
            <option>Mode B</option>
            <option>Mode C</option>
          </select>
        </label>
      </div>

      {formState.commissionMode === 'Mode A' ? (
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Mode A Value
          <input type="number" value={formState.modeAValue} onChange={(event) => handleChange('modeAValue', event.target.value)} className={fieldClass} />
        </label>
      ) : null}

      {formState.commissionMode === 'Mode B' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Owner Rate
            <input type="number" value={formState.modeBOwnerRate} onChange={(event) => handleChange('modeBOwnerRate', event.target.value)} className={fieldClass} />
          </label>
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Tenant Rate
            <input type="number" value={formState.modeBTenantRate} onChange={(event) => handleChange('modeBTenantRate', event.target.value)} className={fieldClass} />
          </label>
        </div>
      ) : null}

      {formState.commissionMode === 'Mode C' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 md:col-span-2">
            Booking Source Rates (JSON)
            <textarea value={formState.modeCBookingSourceRates} onChange={(event) => handleChange('modeCBookingSourceRates', event.target.value)} rows={4} className={fieldClass} />
          </label>
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Tenant Fee
            <input type="number" value={formState.modeCTenantFee} onChange={(event) => handleChange('modeCTenantFee', event.target.value)} className={fieldClass} />
          </label>
        </div>
      ) : null}

      <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Amenities
        <input value={formState.amenities} onChange={(event) => handleChange('amenities', event.target.value)} placeholder="Pool, Sea View, Concierge" className={fieldClass} />
      </label>

      <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Description
        <textarea value={formState.description} onChange={(event) => handleChange('description', event.target.value)} rows={5} className={fieldClass} required />
      </label>

      <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Photos
        <input type="file" multiple accept="image/*" onChange={(event) => setFiles(event.target.files || [])} className={fieldClass} required />
      </label>

      {message ? <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{message}</div> : null}

      <div className="flex justify-end gap-3">
        {onCancel ? (
          <button type="button" onClick={onCancel} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
            Cancel
          </button>
        ) : null}
        <button type="submit" disabled={submitting} className="rounded-full bg-[#283f5e] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e3047] disabled:opacity-70">
          {submitting ? 'Creating...' : 'Create Unit'}
        </button>
      </div>
    </form>
  );
};
