import React, { useEffect, useMemo, useState } from 'react';
import { fetchDashboardSummary } from '../api/http.js';

const formatCount = (value) => Number(value || 0).toLocaleString();

const MetricCard = ({ label, value, subtitle, iconClass }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>□</div>
    <strong className="block text-3xl font-bold text-[#283f5e]">{value}</strong>
    <span className="mt-1 block text-sm font-medium text-slate-500">{label}</span>
    <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
  </article>
);

export const AdminOverview = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadSummary = async () => {
      setLoading(true);
      setError('');

      try {
        const payload = await fetchDashboardSummary();
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

    loadSummary();

    return () => {
      mounted = false;
    };
  }, []);

  const cards = useMemo(() => {
    if (!summary) {
      return [];
    }

    return [
      {
        label: 'Total Units',
        value: formatCount(summary.totalUnits),
        subtitle: 'Live from units collection',
        iconClass: 'bg-blue-50 text-blue-600'
      },
      {
        label: 'Total Reservations',
        value: formatCount(summary.totalReservations),
        subtitle: 'Across all projects',
        iconClass: 'bg-violet-50 text-violet-600'
      },
      {
        label: 'Check-Ins Today',
        value: formatCount(summary.checkInsToday),
        subtitle: summary.checkInsToday > 0 ? 'Arrivals in progress' : 'No arrivals today',
        iconClass: 'bg-emerald-50 text-emerald-600'
      },
      {
        label: 'Check-Outs Today',
        value: formatCount(summary.checkOutsToday),
        subtitle: summary.checkOutsToday > 0 ? 'Departures scheduled' : 'No departures today',
        iconClass: 'bg-orange-50 text-orange-600'
      }
    ];
  }, [summary]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Dashboard</p>
        <h1 className="mt-3 text-3xl font-bold text-[#283f5e]">Welcome back, Saif Magdy — Sunday, 28 June 2026</h1>
      </div>

      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading live dashboard summary...</div> : null}
      {error ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">{error}</div> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-[#283f5e]">
          <span>▦</span>
          <h2 className="text-lg font-bold">Reservations & Occupancy by Project</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="py-3 pr-4">Project</th>
                <th className="py-3 pr-4">Total Units</th>
                <th className="py-3 pr-4">Total Reservations</th>
                <th className="py-3 pr-4">Occupied Now</th>
                <th className="py-3 pr-4">Occupancy %</th>
              </tr>
            </thead>
            <tbody>
              {(summary?.occupancyByProject || []).map((row) => (
                <tr key={row.projectName} className="border-b border-slate-100 last:border-b-0">
                  <td className="py-4 pr-4 font-semibold text-slate-800">• {row.projectName}</td>
                  <td className="py-4 pr-4 text-slate-600">{row.totalUnits}</td>
                  <td className="py-4 pr-4 text-slate-600">{row.totalReservations}</td>
                  <td className="py-4 pr-4 text-slate-600">{row.occupiedNow} / {row.totalUnits}</td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-[#283f5e]" style={{ width: `${Math.min(row.occupancyPercent, 100)}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-500">{row.occupancyPercent}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
