import React, { useEffect, useMemo, useState } from 'react';
import { fetchAdminBookingRequests, fetchAdminUnits } from '../api/http.js';

const getMonthDays = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, index) => new Date(date.getFullYear(), date.getMonth(), index + 1));
};

const isBooked = (booking, cellDate) => {
  const start = new Date(booking.startDate);
  const end = new Date(booking.endDate);
  const current = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
  return current >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) && current < new Date(end.getFullYear(), end.getMonth(), end.getDate());
};

const isLockedStatus = (status) => {
  const normalized = String(status || '').toLowerCase();
  return normalized === 'pending' || normalized === 'accepted';
};

const lockStatusClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'accepted') return 'admin-pill admin-pill-accepted';
  if (normalized === 'pending') return 'admin-pill admin-pill-pending';
  return 'admin-pill border-slate-200 bg-slate-100 text-slate-600';
};

export const AdminSchedule = () => {
  const [units, setUnits] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const monthDate = useMemo(() => new Date(), []);
  const monthDays = useMemo(() => getMonthDays(monthDate), [monthDate]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [unitPayload, reservationPayload] = await Promise.all([fetchAdminUnits(), fetchAdminBookingRequests()]);
      setUnits(Array.isArray(unitPayload) ? unitPayload : []);
      setReservations(Array.isArray(reservationPayload) ? reservationPayload : []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCellState = (unit, day) => {
    const booking = reservations.find((item) => (
      String(item.unit?._id || item.unitId || item.unit) === String(unit._id)
      && isLockedStatus(item.status)
      && isBooked(item, day)
    ));
    if (booking) {
      return booking.status || 'Pending';
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Schedule</p>
        <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">Reservation Calendar (Read Only)</h1>
        <p className="mt-1 text-sm text-slate-500">Current month occupancy map. Editing is restricted to Sales portal.</p>
      </div>

      {loading ? <div className="admin-card p-6 text-sm text-slate-500">Loading schedule...</div> : null}
      {error ? <div className="admin-card p-6 text-sm text-slate-500">{error}</div> : null}

      <div className="admin-table-wrap overflow-x-auto">
        <div className="min-w-[1100px]">
          <div className="grid grid-cols-[260px_repeat(31,1fr)] border-b border-slate-200 admin-table-head">
            <div className="sticky left-0 z-10 bg-slate-50 px-4 py-4">Unit</div>
            {monthDays.map((day) => (
              <div key={day.toISOString()} className={`px-2 py-4 text-center ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-amber-50' : ''}`}>
                {day.getDate()} {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}
              </div>
            ))}
          </div>

          {units.map((unit) => (
            <div key={unit._id} className="grid grid-cols-[260px_repeat(31,1fr)] border-b border-slate-100 last:border-b-0">
              <div className="sticky left-0 z-10 bg-white px-4 py-4">
                <p className="text-sm font-bold text-slate-800">{unit.uniqueId}</p>
                <p className="text-xs text-slate-500">{unit.projectName || unit.location}</p>
                <p className="text-xs text-slate-400">{unit.bedrooms || unit.bedroom_count || 0}BR · {unit.view || 'No view'}</p>
              </div>
              {monthDays.map((day) => {
                const state = getCellState(unit, day);
                return (
                  <div
                    key={day.toISOString()}
                    className={`border-l border-slate-100 px-1 py-4 text-center text-[10px] font-semibold ${state ? 'bg-[#283f5e] text-white' : 'text-slate-500'} ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-amber-50/70' : ''}`}
                  >
                    {state ? <span className={lockStatusClass(state)}>{state}</span> : 'Open'}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
