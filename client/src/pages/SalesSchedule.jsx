import React, { useEffect, useMemo, useState } from 'react';
import { fetchAvailableUnits, fetchSalesSchedule } from '../api/http.js';
import { SalesScheduleModal } from '../components/sales/SalesScheduleModal.jsx';

const getMonthDays = (date) => {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, index) => new Date(date.getFullYear(), date.getMonth(), index + 1));
};

const isBooked = (booking, cellDate) => {
  const start = new Date(booking.startDate);
  const end = new Date(booking.endDate);
  const current = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
  return current >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) && current < new Date(end.getFullYear(), end.getMonth(), end.getDate());
};

export const SalesSchedule = () => {
  const [units, setUnits] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const monthDate = useMemo(() => new Date(), []);
  const monthDays = useMemo(() => getMonthDays(monthDate), [monthDate]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = await fetchSalesSchedule();
      setUnits(Array.isArray(payload?.units) ? payload.units : []);
      setReservations(Array.isArray(payload?.reservations) ? payload.reservations : []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openReservation = (unitId, date) => {
    setSelectedUnitId(unitId);
    setSelectedDate(date);
    setShowModal(true);
  };

  const getCellState = (unit, day) => {
    const booking = reservations.find((item) => String(item.unit?._id || item.unitId || item.unit) === String(unit._id) && isBooked(item, day));
    return booking ? booking.status || 'Pending' : null;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Schedule</p>
        <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">Reservation Calendar</h1>
      </div>

      {loading ? <div className="admin-card p-6 text-sm text-slate-500">Loading schedule...</div> : null}
      {error ? <div className="admin-card p-6 text-sm text-slate-500">{error}</div> : null}

      <div className="admin-table-wrap overflow-x-auto">
        <div className="min-w-[1100px]">
          <div className="grid grid-cols-[260px_repeat(31,1fr)] border-b border-slate-200 admin-table-head">
            <div className="sticky left-0 z-10 bg-slate-50 px-4 py-4">Unit</div>
            {monthDays.map((day) => (
              <div key={day.toISOString()} className={`px-2 py-4 text-center ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-amber-50' : ''}`}>
                {day.getDate()}
              </div>
            ))}
          </div>

          {units.map((unit) => (
            <div key={unit._id} className="grid grid-cols-[260px_repeat(31,1fr)] border-b border-slate-100 last:border-b-0">
              <div className="sticky left-0 z-10 bg-white px-4 py-4">
                <p className="text-sm font-bold text-slate-800">{unit.uniqueId}</p>
                <p className="text-xs text-slate-500">{unit.projectName || unit.location}</p>
              </div>
              {monthDays.map((day) => {
                const state = getCellState(unit, day);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => openReservation(unit._id, day)}
                    className={`border-l border-slate-100 px-1 py-4 text-[10px] font-semibold transition-colors ${state ? 'bg-[#283f5e] text-white' : 'hover:bg-slate-50'} ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-amber-50/70' : ''}`}
                  >
                    {state || 'Open'}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {showModal ? <SalesScheduleModal open={showModal} onClose={() => setShowModal(false)} onSaved={loadData} units={units} selectedUnitId={selectedUnitId} selectedDate={selectedDate} /> : null}
    </div>
  );
};
