import React, { useState } from 'react';
import { createStaffMember } from '../api/http.js';

const initialState = {
  name: '',
  email: '',
  phone_number: '',
  password: '',
  role: 'secondary_admin'
};

export const AdminStaffForm = () => {
  const [formState, setFormState] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await createStaffMember(formState);
      setFormState(initialState);
      setMessage('Staff profile created successfully.');
    } catch (submitError) {
      setMessage(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand/70">Recruitment / Staff Profiling</p>
        <h1 className="mt-3 text-2xl font-semibold uppercase tracking-[0.18em] text-brand">Create Staff Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
        {[
          ['name', 'Name'],
          ['email', 'Email'],
          ['phone_number', 'Phone Number'],
          ['password', 'Password']
        ].map(([field, label]) => (
          <label key={field} className="grid gap-2 text-xs uppercase tracking-[0.18em] text-brand/70">
            {label}
            <input
              type={field === 'password' ? 'password' : 'text'}
              value={formState[field]}
              onChange={(event) => handleChange(field, event.target.value)}
              className="rounded-sm border border-slate-200 px-4 py-3 text-sm text-brand outline-none"
              required
            />
          </label>
        ))}

        <label className="grid gap-2 text-xs uppercase tracking-[0.18em] text-brand/70 lg:col-span-2">
          Role
          <select
            value={formState.role}
            onChange={(event) => handleChange('role', event.target.value)}
            className="rounded-sm border border-slate-200 px-4 py-3 text-sm text-brand outline-none"
            required
          >
            <option value="secondary_admin">Secondary Admin</option>
            <option value="primary_admin">Primary Admin</option>
          </select>
        </label>

        {message ? <div className="lg:col-span-2 border border-slate-200 bg-slate-50 p-3 text-sm text-brand/75">{message}</div> : null}

        <div className="lg:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-sm bg-brand px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-70"
          >
            {submitting ? 'Saving...' : 'Create Staff Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};
