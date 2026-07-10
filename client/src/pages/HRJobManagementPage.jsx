import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { createAdminJob, deleteAdminJob, fetchAdminJobs } from '../api/http.js';

const initialJobState = {
  title: '',
  description: ''
};

export const HRJobManagementPage = () => {
  const [jobs, setJobs] = useState([]);
  const [jobForm, setJobForm] = useState(initialJobState);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    setError('');

    try {
      const jobsResponse = await fetchAdminJobs();
      setJobs(Array.isArray(jobsResponse) ? jobsResponse : []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleChange = (field, value) => {
    setJobForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await createAdminJob(jobForm);
      setJobForm(initialJobState);
      setMessage('Job posted successfully.');
      await loadJobs();
    } catch (submitError) {
      setMessage(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (jobId) => {
    try {
      await deleteAdminJob(jobId);
      await loadJobs();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">HR Panel</p>
        <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">Manage open positions</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-6 shadow-none md:grid-cols-2">
        <div className="md:col-span-2 flex items-center gap-2 text-[#283f5e]">
          <Briefcase className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          <h2 className="text-lg font-bold">Post a new job</h2>
        </div>

        <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
          Job Title
          <input
            type="text"
            value={jobForm.title}
            onChange={(event) => handleChange('title', event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#283f5e] outline-none"
            required
          />
        </label>

        <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-slate-500 md:col-span-2">
          Job Description
          <textarea
            value={jobForm.description}
            onChange={(event) => handleChange('description', event.target.value)}
            rows={4}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#283f5e] outline-none"
            required
          />
        </label>

        {message ? <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">{message}</div> : null}

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#283f5e] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-70"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            {submitting ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </form>

      {error ? <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-600">{error}</div> : null}
      {loading ? <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-sm uppercase tracking-[0.16em] text-slate-400">Loading open positions...</div> : null}

      <div className="rounded-2xl border border-slate-200/70 bg-slate-50 shadow-none">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-[#283f5e]">Open Positions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-[0.16em] text-slate-400">
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-6 py-4 font-semibold text-slate-800">{job.title}</td>
                  <td className="px-6 py-4 text-slate-500">{job.description}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(job._id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!jobs.length ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-400">
                    No open positions yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
