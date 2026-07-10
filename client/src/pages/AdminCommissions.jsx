import React, { useEffect, useMemo, useState } from 'react';
import { CircleDollarSign, Globe2, Trophy } from 'lucide-react';
import { fetchAdminCommissionsSummary } from '../api/http.js';

const formatMoney = (value) => Number(value || 0).toLocaleString('en-EG', { style: 'currency', currency: 'EGP' });

const MetricCard = ({ label, value, subtitle, Icon, iconClassName }) => (
  <article className="admin-card p-5">
    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${iconClassName}`}>
      <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
    </div>
    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
    <p className="mt-2 text-3xl font-bold text-[#283f5e]">{value}</p>
    <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
  </article>
);

export const AdminCommissions = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const payload = await fetchAdminCommissionsSummary();
        if (active) {
          setSummary(payload);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Could not load commission data.');
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

  const leaderboard = Array.isArray(summary?.leaderboard) ? summary.leaderboard : [];
  const cards = useMemo(() => ([
    {
      label: 'Sales Agents Combined Commissions',
      value: formatMoney(summary?.salesAgentsCombinedCommissions),
      subtitle: 'Accepted reservations only, current active month.',
      iconClassName: 'bg-emerald-50 text-emerald-600',
      Icon: CircleDollarSign,
    },
    {
      label: 'System / Website Commission',
      value: formatMoney(summary?.systemWebsiteCommission),
      subtitle: '0.5% from accepted organic website reservations only.',
      iconClassName: 'bg-blue-50 text-blue-600',
      Icon: Globe2,
    },
  ]), [summary?.salesAgentsCombinedCommissions, summary?.systemWebsiteCommission]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Commissions</p>
        <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">Monthly commission analytics</h1>
        <p className="mt-2 text-sm text-slate-500">All figures are filtered to the current active calendar month.</p>
      </div>

      {loading ? <div className="admin-card p-6 text-sm text-slate-500">Loading commission analytics...</div> : null}
      {error ? <div className="admin-card p-6 text-sm text-slate-500">{error}</div> : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {cards.map((card) => <MetricCard key={card.label} {...card} />)}
      </div>

      <section className="admin-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Performance Leaderboard</p>
            <h2 className="mt-1 text-xl font-bold text-[#283f5e]">Closed files by salesperson</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            <Trophy className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
            Ranked by total monthly reservations
          </div>
        </div>

        <div className="hidden grid-cols-[0.5fr_1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 lg:grid">
          <span>Rank</span>
          <span>Salesperson</span>
          <span>Total Closed Files</span>
          <span>Organic Accepted</span>
          <span>Manual Sales</span>
          <span>Commission</span>
        </div>

        <div className="grid gap-0">
          {leaderboard.length > 0 ? leaderboard.map((entry, index) => (
            <article key={entry.salesPersonId || entry.uniqueSalesId || entry.name} className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 lg:grid-cols-[0.5fr_1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] lg:items-center">
              <p className="text-sm font-bold text-[#283f5e]">#{index + 1}</p>
              <div>
                <p className="text-sm font-semibold text-slate-800">{entry.name || 'Sales agent'}</p>
                <p className="text-xs text-slate-500">{entry.uniqueSalesId || 'No sales ID'}</p>
              </div>
              <p className="text-sm font-semibold text-slate-700">{Number(entry.totalMonthlyReservations || 0).toLocaleString()}</p>
              <p className="text-sm text-slate-600">{Number(entry.organicCustomerReservations || 0).toLocaleString()}</p>
              <p className="text-sm text-slate-600">{Number(entry.manualSalesReservations || 0).toLocaleString()}</p>
              <p className="text-sm font-semibold text-slate-700">{formatMoney(entry.commissionAmount)}</p>
            </article>
          )) : <div className="px-5 py-8 text-sm text-slate-500">No accepted commission activity recorded this month.</div>}
        </div>
      </section>
    </div>
  );
};