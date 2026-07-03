import React, { useEffect, useState } from 'react';
import { fetchDashboardSummary } from '../api/http.js';

export const AdminOwnerStatement = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchDashboardSummary().then((payload) => {
      if (mounted) {
        setSummary(payload);
      }
    }).catch(() => null);

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Owner Statement</p>
        <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">Revenue and ownership snapshot</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Revenue this period', `EGP ${Number(summary?.financialSummary?.totalRevenue || 0).toLocaleString()}`],
          ['Bookings this period', Number(summary?.financialSummary?.totalBookings || 0).toLocaleString()],
          ['Total units', Number(summary?.totalUnits || 0).toLocaleString()],
          ['Total reservations', Number(summary?.totalReservations || 0).toLocaleString()]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-bold text-[#283f5e]">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">This view is backed by the live dashboard summary endpoint and is ready to expand into owner-specific payout calculations.</p>
      </div>
    </div>
  );
};
