import React from 'react';
import { useJobApplication } from '../../context/JobApplicationContext.jsx';

export const JobApplicationModal = () => {
  const {
    selectedJob,
    formState,
    cvFile,
    submitting,
    status,
    closeApplication,
    updateField,
    setCvFile,
    submitApplication
  } = useJobApplication();

  if (!selectedJob) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitApplication();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand/70">Apply for</p>
            <h2 className="mt-1 text-xl font-semibold text-brand">{selectedJob.title}</h2>
          </div>
          <button
            type="button"
            onClick={closeApplication}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-brand/70 hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="grid gap-2 text-xs uppercase tracking-[0.18em] text-brand/70">
            Full Name
            <input
              type="text"
              value={formState.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
              className="rounded-md border border-slate-200 px-4 py-3 text-sm text-brand outline-none"
              required
            />
          </label>

          <label className="grid gap-2 text-xs uppercase tracking-[0.18em] text-brand/70">
            Email
            <input
              type="email"
              value={formState.email}
              onChange={(event) => updateField('email', event.target.value)}
              className="rounded-md border border-slate-200 px-4 py-3 text-sm text-brand outline-none"
              required
            />
          </label>

          <label className="grid gap-2 text-xs uppercase tracking-[0.18em] text-brand/70">
            Phone
            <input
              type="tel"
              value={formState.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              className="rounded-md border border-slate-200 px-4 py-3 text-sm text-brand outline-none"
              required
            />
          </label>

          <label className="grid gap-2 text-xs uppercase tracking-[0.18em] text-brand/70">
            CV / Resume
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => setCvFile(event.target.files?.[0] || null)}
              className="rounded-md border border-slate-200 px-4 py-3 text-sm text-brand outline-none"
              required
            />
          </label>

          {status ? (
            <div
              className={[
                'rounded-md border p-3 text-sm',
                status.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-slate-200 bg-slate-50 text-brand/75'
              ].join(' ')}
            >
              {status.message}
            </div>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeApplication}
              className="rounded-md border border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-brand px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-70"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
