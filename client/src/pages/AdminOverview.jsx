import React, { useEffect, useMemo, useState } from 'react';
import { Building2, CalendarCheck2, CalendarDays, CircleDollarSign, ReceiptText } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchDashboardSummary } from '../api/http.js';

const formatCount = (value) => Number(value || 0).toLocaleString();

const iconMap = {
  'Total Units': Building2,
  'Check-Ins': CalendarCheck2,
  'Check-Outs': CalendarDays,
  'Revenue This Month': ReceiptText,
};

const MetricCard = ({ label, value, subtitle, iconClass }) => {
  const Icon = iconMap[label] || CircleDollarSign;

  return (
    <article className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5 shadow-none">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <strong className="block text-3xl font-bold text-[#283f5e]">{value}</strong>
      <span className="mt-1 block text-sm font-medium text-slate-500">{label}</span>
      <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
    </article>
  );
};

export const AdminOverview = () => {
  const { user } = useAuth();
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
        value: formatCount(summary.totalUnitsInventoryCount),
        subtitle: 'Live from units collection',
        iconClass: 'bg-blue-50 text-blue-600'
      },
      {
        label: 'Check-Ins',
        value: formatCount(summary.checkInsCount),
        subtitle: 'Current month arrivals',
        iconClass: 'bg-violet-50 text-violet-600'
      },
      {
        label: 'Check-Outs',
        value: formatCount(summary.checkOutsCount),
        subtitle: 'Current month departures',
        iconClass: 'bg-emerald-50 text-emerald-600'
      },
      {
        label: 'Revenue This Month',
        value: formatCount(summary.totalRevenueCurrentMonth),
        subtitle: 'Accepted bookings only',
        iconClass: 'bg-orange-50 text-orange-600'
      },
      {
        label: 'Pending Payments',
        value: formatCount(summary.pendingPaymentsCurrentMonth),
        subtitle: 'Current month pending total',
        iconClass: 'bg-slate-100 text-slate-700'
      },
      {
        label: 'Monthly Reservations',
        value: formatCount(summary.totalMonthlyReservations),
        subtitle: 'Accepted current month bookings',
        iconClass: 'bg-rose-50 text-rose-600'
      }
    ];
  }, [summary]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Dashboard</p>
        <h1 className="mt-3 text-3xl font-bold text-[#283f5e]">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h1>
      </div>

      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading live dashboard summary...</div> : null}
      {error ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">{error}</div> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <section className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 shadow-none">
        <div className="mb-2 flex items-center gap-2 text-[#283f5e]">
          <CircleDollarSign className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          <h2 className="text-lg font-bold">Current Month Performance</h2>
        </div>
        <p className="text-sm text-slate-500">The admin summary now focuses on the six current-month blocks used by the revised portal split.</p>
      </section>
    </div>
  );
};
