import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Eye, FileUser, XCircle } from 'lucide-react';
import { deleteAdminApplication, fetchAdminApplications, updateApplicationStatus } from '../api/http.js';

const statusOptions = ['Pending', 'Reviewed', 'Shortlisted', 'Rejected'];

const statusStyles = {
  Pending: 'border-amber-200 bg-amber-50 text-amber-700',
  Reviewed: 'border-sky-200 bg-sky-50 text-sky-700',
  Shortlisted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Rejected: 'border-rose-200 bg-rose-50 text-rose-700'
};

const statusIcons = {
  Pending: Clock,
  Reviewed: Eye,
  Shortlisted: CheckCircle2,
  Rejected: XCircle
};

export const HRApplicationsQueue = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadApplications = async () => {
      setLoading(true);
      setError('');

      try {
        const applicationsResponse = await fetchAdminApplications();
        if (mounted) {
          setApplications(Array.isArray(applicationsResponse) ? applicationsResponse : []);
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

    loadApplications();

    return () => {
      mounted = false;
    };
  }, []);

  const handleDelete = async (applicationId) => {
    setDeletingId(applicationId);

    try {
      await deleteAdminApplication(applicationId);
      setApplications((current) => current.filter((application) => application._id !== applicationId));
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingId('');
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    setApplications((current) =>
      current.map((application) =>
        application._id === applicationId ? { ...application, status } : application
      )
    );

    try {
      const updatedApplication = await updateApplicationStatus(applicationId, status);

      if (updatedApplication) {
        setApplications((current) =>
          current.map((application) =>
            application._id === applicationId ? { ...application, ...updatedApplication } : application
          )
        );
      }
    } catch (statusError) {
      setError(statusError.message);
      await fetchAdminApplications().then((nextApplications) => {
        setApplications(Array.isArray(nextApplications) ? nextApplications : []);
      }).catch(() => null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">HR Panel</p>
        <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">Candidate applications queue</h1>
      </div>

      {error ? <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">{error}</div> : null}
      {loading ? <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm uppercase tracking-[0.16em] text-slate-400">Loading applications...</div> : null}

      <div className="rounded-2xl border border-slate-200/70 bg-slate-50 shadow-none">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-[#283f5e]">Candidates</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-[0.16em] text-slate-400">
                <th className="px-6 py-3">Full Name</th>
                <th className="px-6 py-3">Job</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">CV</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-6 py-4 font-semibold text-slate-800">{application.fullName}</td>
                  <td className="px-6 py-4 text-slate-500">{application.jobId?.title || 'Unknown'}</td>
                  <td className="px-6 py-4 text-slate-500">{application.email}</td>
                  <td className="px-6 py-4 text-slate-500">{application.phone}</td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 ${statusStyles[application.status || 'Pending'] || statusStyles.Pending}`}>
                      {(() => {
                        const StatusIcon = statusIcons[application.status || 'Pending'] || FileUser;
                        return <StatusIcon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />;
                      })()}
                      <select
                        value={application.status || 'Pending'}
                        onChange={(event) => handleStatusChange(application._id, event.target.value)}
                        className="bg-transparent text-xs font-semibold uppercase tracking-[0.16em] outline-none"
                      >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={application.cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#334155] hover:bg-slate-50"
                    >
                      View CV
                    </a>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(application._id)}
                      disabled={deletingId === application._id}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-500 hover:bg-red-50 disabled:opacity-60"
                    >
                      {deletingId === application._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
              {!applications.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-400">
                    No applications yet.
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
