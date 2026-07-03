import React, { useEffect, useState } from 'react';
import { fetchAdminBookingRequests } from '../api/http.js';

export const AdminTasks = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetchAdminBookingRequests().then((payload) => {
      if (mounted) {
        setReservations(Array.isArray(payload) ? payload : []);
      }
    }).catch(() => null);

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Tasks</p>
        <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">Operational task queue</h1>
      </div>

      <div className="grid gap-4">
        {reservations.slice(0, 6).map((reservation) => (
          <div key={reservation._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">{reservation.customer?.name || reservation.user?.name || 'Guest'} · {reservation.unit?.title || 'Unit'}</p>
            <p className="mt-1 text-sm text-slate-500">Status: {reservation.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
