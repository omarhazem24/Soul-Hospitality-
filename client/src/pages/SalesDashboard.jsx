import React, { useEffect, useMemo, useState } from 'react';
import { Building2, CalendarCheck2, CircleDollarSign, TrendingUp, UserRound } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchSalesDashboardSummary } from '../api/http.js';
import { useAuth } from '../context/AuthContext.jsx';

const MetricCard = ({ label, value, subtitle, iconClass, Icon }) => (
  <article className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5 shadow-none">
    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
      <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
    </div>
    <strong className="block text-3xl font-bold text-[#283f5e]">{value}</strong>
    <span className="mt-1 block text-sm font-medium text-slate-500">{label}</span>
    <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
  </article>
);

const formatCount = (value) => Number(value || 0).toLocaleString();
const formatMoney = (value) => Number(value || 0).toLocaleString('en-EG', { style: 'currency', currency: 'EGP' });

export const SalesDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const summaryPayload = await fetchSalesDashboardSummary();

        if (!active) {
          return;
        }

        setSummary(summaryPayload);
      } catch (loadError) {
        if (active) {
          setError(loadError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(() => ([
    {
      label: 'Closed Files',
      value: formatCount(summary?.closedReservations ?? summary?.manualReservations),
      subtitle: 'Accepted reservations this month',
      iconClass: 'bg-blue-50 text-blue-600',
      Icon: CalendarCheck2,
    },
    {
      label: 'Pending Approvals',
      value: formatCount(summary?.pendingApprovals),
      subtitle: 'Awaiting action from sales',
      iconClass: 'bg-amber-50 text-amber-600',
      Icon: Building2,
    },
    {
      label: 'Monthly Commission',
      value: formatMoney(summary?.currentMonthCommission),
      subtitle: '1% from accepted reservations only',
      iconClass: 'bg-emerald-50 text-emerald-600',
      Icon: CircleDollarSign,
    },
    {
      label: 'Sales Identity',
      value: user?.uniqueSalesId || '—',
      subtitle: 'Assigned account reference',
      iconClass: 'bg-slate-100 text-slate-700',
      Icon: UserRound,
    },
  ]), [summary, user?.uniqueSalesId]);

  const performanceSeries = Array.isArray(summary?.performanceSeries) ? summary.performanceSeries : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Sales Dashboard</p>
        <h1 className="mt-3 text-3xl font-bold text-[#283f5e]">Welcome back{user?.name ? `, ${user.name}` : ''}</h1>
      </div>

      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading sales summary...</div> : null}
      {error ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">{error}</div> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <MetricCard key={card.label} {...card} />)}
      </div>

      <section className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 shadow-none">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#283f5e]">Monthly booking performance</h2>
            <p className="text-sm text-slate-500">Daily accepted-booking count for the current active month.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
            <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
            Manual sales + accepted organic reservations
          </div>
        </div>
        <div className="h-[320px] rounded-3xl border border-slate-200 bg-white p-3 sm:p-4">
          {performanceSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceSeries} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(40, 63, 94, 0.06)' }}
                  formatter={(value) => [`${value} bookings`, 'Closed files']}
                  labelFormatter={(label) => `Day ${label}`}
                />
                <Bar dataKey="totalBookings" fill="#283f5e" radius={[10, 10, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex h-full items-center justify-center text-sm text-slate-500">No accepted bookings recorded yet this month.</div>}
        </div>
      </section>
    </div>
  );
};
