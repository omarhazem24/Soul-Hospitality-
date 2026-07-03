import React, { useEffect, useMemo, useState } from 'react';
import { fetchAdminBookingRequests, fetchAdminUnits } from '../api/http.js';
import { ReservationModal } from '../components/admin/ReservationModal.jsx';

const statusClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'confirmed') return 'bg-emerald-50 text-emerald-700';
  if (normalized === 'approved') return 'bg-blue-50 text-blue-700';
  if (normalized === 'temporary_hold') return 'bg-amber-50 text-amber-700';
  if (normalized === 'cancelled') return 'bg-rose-50 text-rose-700';
  return 'bg-slate-100 text-slate-600';
};

export const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [reservationPayload, unitPayload] = await Promise.all([fetchAdminBookingRequests(), fetchAdminUnits()]);
      setReservations(Array.isArray(reservationPayload) ? reservationPayload : []);
      setUnits(Array.isArray(unitPayload) ? unitPayload : []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(() => ({
    total: reservations.length,
    confirmed: reservations.filter((item) => item.status === 'confirmed').length,
    hold: reservations.filter((item) => item.status === 'temporary_hold').length
  }), [reservations]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Reservations</p>
          <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">Live reservation requests</h1>
        </div>
        <button type="button" onClick={() => setShowModal(true)} className="rounded-full bg-[#283f5e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e3047]">
          + Add Reservation
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Total</p><p className="mt-2 text-3xl font-bold text-[#283f5e]">{summary.total}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Confirmed</p><p className="mt-2 text-3xl font-bold text-[#283f5e]">{summary.confirmed}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Holds</p><p className="mt-2 text-3xl font-bold text-[#283f5e]">{summary.hold}</p></div>
      </div>

      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading reservations...</div> : null}
      {error ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">{error}</div> : null}

      <div className="grid gap-4">
        {reservations.map((reservation) => (
          <article key={reservation._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{reservation.unit?.uniqueId || reservation.unit?.title}</p>
                <h3 className="mt-2 text-lg font-bold text-slate-800">{reservation.customer?.name || reservation.user?.name || 'Customer'}</h3>
                <p className="text-sm text-slate-500">{reservation.customer?.email || reservation.user?.email} · {reservation.customer?.phone || reservation.user?.phone_number}</p>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClass(reservation.status)}`}>{reservation.status}</span>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
              <div><span className="font-semibold text-slate-800">Check-in:</span> {reservation.startDate ? new Date(reservation.startDate).toLocaleDateString() : '-'}</div>
              <div><span className="font-semibold text-slate-800">Check-out:</span> {reservation.endDate ? new Date(reservation.endDate).toLocaleDateString() : '-'}</div>
              <div><span className="font-semibold text-slate-800">Total:</span> EGP {Number(reservation.totalPrice || 0).toLocaleString()}</div>
            </div>
          </article>
        ))}
      </div>

      {showModal ? <ReservationModal open={showModal} onClose={() => setShowModal(false)} onSaved={loadData} units={units} /> : null}
    </div>
  );
};
