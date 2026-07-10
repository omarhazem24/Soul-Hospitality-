import React, { useEffect, useState } from 'react';
import { fetchJobs } from '../api/http.js';
import { JobApplicationProvider, useJobApplication } from '../context/JobApplicationContext.jsx';
import { JobApplicationModal } from '../components/recruitment/JobApplicationModal.jsx';

const JobsBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { openApplication } = useJobApplication();

  useEffect(() => {
    let mounted = true;

    fetchJobs()
      .then((payload) => {
        if (mounted) {
          setJobs(Array.isArray(payload) ? payload : []);
        }
      })
      .catch((loadError) => {
        if (mounted) {
          setError(loadError.message);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="page-container py-16">
      <section className="mx-auto max-w-4xl space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand/70">Work With Us</p>
        <h1 className="text-4xl font-semibold uppercase tracking-[0.18em] text-brand">Current Openings</h1>
        <p className="text-sm leading-7 text-brand/75">
          Join the Soul Hospitality team and help us deliver a calm, premium experience for every guest and owner.
        </p>
      </section>

      {loading ? (
        <div className="mx-auto mt-10 max-w-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm uppercase tracking-[0.18em] text-brand/70">
          Loading open positions...
        </div>
      ) : null}

      {error ? (
        <div className="mx-auto mt-10 max-w-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-brand/75">{error}</div>
      ) : null}

      {!loading && !error && !jobs.length ? (
        <div className="mx-auto mt-10 max-w-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-brand/75">
          There are no open positions at the moment. Please check back soon.
        </div>
      ) : null}

      <div className="mx-auto mt-10 grid max-w-4xl gap-6">
        {jobs.map((job) => (
          <article key={job._id} className="border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(40,63,94,0.06)]">
            <h2 className="text-xl font-semibold text-brand">{job.title}</h2>
            <p className="mt-3 text-sm leading-7 text-brand/75 whitespace-pre-line">{job.description}</p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => openApplication(job)}
                className="rounded-md bg-brand px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white"
              >
                Apply Now
              </button>
            </div>
          </article>
        ))}
      </div>

      <JobApplicationModal />
    </main>
  );
};

export const Careers = () => (
  <JobApplicationProvider>
    <JobsBoard />
  </JobApplicationProvider>
);
