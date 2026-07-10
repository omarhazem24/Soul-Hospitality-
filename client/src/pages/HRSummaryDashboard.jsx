import React, { useEffect, useState } from 'react';
import { Briefcase, FileUser } from 'lucide-react';
import { fetchRecruitmentSummary } from '../api/http.js';

const MetricCard = ({ label, value, subtitle, icon: Icon }) => (
  <article className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5 shadow-none">
    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#283f5e]">
      <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
    </div>
    <strong className="block text-3xl font-bold text-[#283f5e]">{value}</strong>
    <span className="mt-1 block text-sm font-medium text-slate-500">{label}</span>
    <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
  </article>
);

export const HRSummaryDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const payload = await fetchRecruitmentSummary();

        if (mounted) {
          setSummary(payload);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const recentApplications = summary?.recentApplications || [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">HR Panel</p>
        <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">Recruitment overview</h1>
      </div>

      {loading ? <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-6 text-sm text-slate-500 shadow-none">Loading HR summary...</div> : null}
      {error ? <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-6 text-sm text-slate-500 shadow-none">{error}</div> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard label="Active Vacancies" value={summary?.activeVacancies || 0} subtitle="Currently published vacancies" icon={Briefcase} />
        <MetricCard label="Total Applicants" value={summary?.totalApplicants || 0} subtitle="Candidates received across all jobs" icon={FileUser} />
      </div>

      <section className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 shadow-none">
        <div className="mb-4 flex items-center gap-2 text-[#283f5e]">
          <FileUser className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          <h2 className="text-lg font-bold">Recent Candidates</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="py-3 pr-4">Full Name</th>
                <th className="py-3 pr-4">Job</th>
                <th className="py-3 pr-4">Email</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((application) => (
                <tr key={application._id} className="border-b border-slate-100 last:border-b-0">
                  <td className="py-4 pr-4 font-semibold text-slate-800">{application.fullName}</td>
                  <td className="py-4 pr-4 text-slate-600">{application.jobId?.title || 'Unknown'}</td>
                  <td className="py-4 pr-4 text-slate-600">{application.email}</td>
                </tr>
              ))}
              {!recentApplications.length ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-sm text-slate-400">
                    No applications yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
