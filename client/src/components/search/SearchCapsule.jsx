import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProjectNames } from '../../api/http.js';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (left, right) =>
  left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();

const isBeforeDay = (left, right) => startOfDay(left).getTime() < startOfDay(right).getTime();

const isAfterDay = (left, right) => startOfDay(left).getTime() > startOfDay(right).getTime();

const addMonths = (date, offset) => new Date(date.getFullYear(), date.getMonth() + offset, 1);

const formatMonthLabel = (date) =>
  date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

const buildCalendarDays = (monthDate) => {
  const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const nextDate = new Date(startDate);
    nextDate.setDate(startDate.getDate() + index);
    return nextDate;
  });
};

const formatDateLabel = (value) => {
  if (!value) {
    return 'Select date';
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return 'Select date';
  }

  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
};

const formatCalendarDayLabel = (value) => {
  if (!value) {
    return 'Select date';
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return 'Select date';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const toQueryString = (criteria) => {
  const params = new URLSearchParams();

  if (criteria.destination) {
    params.set('destination', criteria.destination);
  }

  if (criteria.arriveDate) {
    params.set('arriveDate', criteria.arriveDate);
  }

  if (criteria.departDate) {
    params.set('departDate', criteria.departDate);
  }

  if (criteria.guests > 0) {
    params.set('guests', String(criteria.guests));
  }

  return params.toString();
};

export const SearchCapsule = () => {
  const navigate = useNavigate();
  const [projectOptions, setProjectOptions] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({
    destination: '',
    arriveDate: '',
    departDate: '',
    guests: 1
  });
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [activeDateField, setActiveDateField] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const capsuleRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (capsuleRef.current && !capsuleRef.current.contains(event.target)) {
        setDestinationOpen(false);
        setGuestOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadProjects = async () => {
      try {
        const payload = await fetchProjectNames();
        const nextProjects = Array.isArray(payload) ? payload : [];

        if (mounted) {
          setProjectOptions(nextProjects);
        }
      } catch {
        if (mounted) {
          setProjectOptions([]);
        }
      }
    };

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  const destinationLabel = useMemo(() => {
    if (!searchCriteria.destination) {
      return 'Where to go?';
    }

    return searchCriteria.destination;
  }, [searchCriteria.destination]);

  const openCalendar = (field) => {
    const selectedValue = field === 'arrive'
      ? searchCriteria.arriveDate
      : searchCriteria.departDate || searchCriteria.arriveDate;
    const selectedDate = selectedValue ? new Date(`${selectedValue}T00:00:00`) : new Date();

    setActiveDateField(field);
    setDestinationOpen(false);
    setGuestOpen(false);
    setCalendarMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  };

  const closeCalendar = () => {
    setActiveDateField(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate(`/units?${toQueryString(searchCriteria)}`);
  };

  const handleCalendarSelect = (field, date) => {
    const today = startOfDay(new Date());
    if (isBeforeDay(date, today)) {
      return;
    }

    const value = date.toISOString().slice(0, 10);

    setSearchCriteria((current) => {
      if (field === 'arrive') {
        const departDate = current.departDate ? new Date(`${current.departDate}T00:00:00`) : null;
        const nextDepartDate = departDate && isAfterDay(departDate, date) ? current.departDate : '';

        return {
          ...current,
          arriveDate: value,
          departDate: nextDepartDate
        };
      }

      if (!current.arriveDate) {
        return {
          ...current,
          arriveDate: value,
          departDate: ''
        };
      }

      const arriveDate = current.arriveDate ? new Date(`${current.arriveDate}T00:00:00`) : null;
      if (arriveDate && (isSameDay(date, arriveDate) || isBeforeDay(date, arriveDate))) {
        return {
          ...current,
          departDate: ''
        };
      }

      return { ...current, departDate: value };
    });

    if (field === 'arrive') {
      setActiveDateField('depart');
      const nextMonth = isSameDay(date, startOfDay(new Date())) ? date : new Date(date.getFullYear(), date.getMonth(), 1);
      setCalendarMonth(nextMonth);
      return;
    }

    const arriveDate = searchCriteria.arriveDate ? new Date(`${searchCriteria.arriveDate}T00:00:00`) : null;
    if (!arriveDate || isSameDay(date, arriveDate) || isBeforeDay(date, arriveDate)) {
      setActiveDateField('depart');
      setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      return;
    }

    closeCalendar();
  };

  const hasValidRange = searchCriteria.arriveDate && searchCriteria.departDate && isAfterDay(new Date(`${searchCriteria.departDate}T00:00:00`), new Date(`${searchCriteria.arriveDate}T00:00:00`));

  const renderCalendarPopover = (field) => {
    if (activeDateField !== field) {
      return null;
    }

    const days = buildCalendarDays(calendarMonth);
    const today = startOfDay(new Date());
    const arriveDate = searchCriteria.arriveDate ? new Date(`${searchCriteria.arriveDate}T00:00:00`) : null;
    const departDate = searchCriteria.departDate ? new Date(`${searchCriteria.departDate}T00:00:00`) : null;

    return (
      <div className="absolute top-full left-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-50 p-6 z-50 w-[340px] max-w-[calc(100vw-2rem)]">
        <div className="mb-4 flex items-center justify-between text-brand">
          <button
            type="button"
            onClick={() => setCalendarMonth((current) => addMonths(current, -1))}
            className="rounded-full px-2 py-1 text-lg font-semibold text-brand transition-colors hover:bg-slate-50"
          >
            ←
          </button>
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">{formatMonthLabel(calendarMonth)}</span>
          <button
            type="button"
            onClick={() => setCalendarMonth((current) => addMonths(current, 1))}
            className="rounded-full px-2 py-1 text-lg font-semibold text-brand transition-colors hover:bg-slate-50"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center font-medium">
          {WEEKDAYS.map((weekday) => (
            <span key={weekday} className="text-xs font-semibold tracking-[0.16em] text-slate-400">
              {weekday}
            </span>
          ))}

          {days.map((day) => {
            const inCurrentMonth = day.getMonth() === calendarMonth.getMonth();
            const isDisabled = isBeforeDay(day, today);
            const isSelectedStart = arriveDate && isSameDay(day, arriveDate);
            const isSelectedEnd = departDate && isSameDay(day, departDate);
            const isInRange = arriveDate && departDate && isAfterDay(day, arriveDate) && isBeforeDay(day, departDate);

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={isDisabled}
                onClick={() => handleCalendarSelect(field, day)}
                className={[
                  'flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors',
                  isDisabled ? 'cursor-not-allowed text-slate-300' : 'cursor-pointer text-slate-700 hover:bg-slate-50',
                  !inCurrentMonth ? 'opacity-35' : '',
                  isInRange ? 'bg-slate-50 text-[#283f5e]' : '',
                  isSelectedStart || isSelectedEnd ? 'bg-[#283f5e] font-bold text-white hover:bg-[#283f5e]' : ''
                ].join(' ')}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <form
      ref={capsuleRef}
      onSubmit={handleSubmit}
      className="w-full bg-white rounded-[2rem] p-8 shadow-[0_24px_70px_rgba(40,63,94,0.1)] border border-slate-50 flex flex-col gap-5 overflow-visible relative z-40"
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setDestinationOpen((current) => !current);
            setGuestOpen(false);
            setActiveDateField(null);
          }}
          className="flex w-full flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-left transition-colors duration-200 ease-in-out hover:bg-slate-50/80 cursor-pointer"
        >
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">DESTINATION</span>
          <span className={searchCriteria.destination ? 'truncate text-sm font-medium text-slate-700' : 'truncate text-sm font-medium text-slate-400'}>
            {destinationLabel}
          </span>
        </button>

        {destinationOpen ? (
          <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50">
            {projectOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setSearchCriteria((current) => ({ ...current, destination: option }));
                  setDestinationOpen(false);
                }}
                className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left text-sm text-brand last:border-b-0 transition-colors duration-200 ease-in-out hover:bg-slate-50/80 cursor-pointer"
              >
                <span>{option}</span>
                <span className="text-brand/40">→</span>
              </button>
            ))}
            {projectOptions.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-400">No projects available yet.</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative min-w-0">
          <button
            type="button"
            onClick={() => openCalendar('arrive')}
            className="flex w-full flex-col rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-left transition-colors duration-200 ease-in-out hover:bg-slate-50/80 cursor-pointer min-w-0"
          >
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">ARRIVE DATE</span>
            <span className={searchCriteria.arriveDate ? 'mt-1 truncate text-sm font-medium text-slate-700' : 'mt-1 truncate text-sm font-medium text-slate-400'}>
              {formatCalendarDayLabel(searchCriteria.arriveDate)}
            </span>
          </button>
          {renderCalendarPopover('arrive')}
        </div>

        <div className="relative min-w-0">
          <button
            type="button"
            onClick={() => openCalendar('depart')}
            className="flex w-full flex-col rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-left transition-colors duration-200 ease-in-out hover:bg-slate-50/80 cursor-pointer min-w-0"
          >
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">DEPART DATE</span>
            <span className={searchCriteria.departDate ? 'mt-1 truncate text-sm font-medium text-slate-700' : 'mt-1 truncate text-sm font-medium text-slate-400'}>
              {formatCalendarDayLabel(searchCriteria.departDate)}
            </span>
          </button>
          {renderCalendarPopover('depart')}
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setGuestOpen((current) => !current);
            setDestinationOpen(false);
            setActiveDateField(null);
          }}
          className="flex w-full flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-left transition-colors duration-200 ease-in-out hover:bg-slate-50/80 cursor-pointer"
        >
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">GUESTS</span>
          <span className="truncate text-sm font-medium text-slate-700">{searchCriteria.guests}  Guests</span>
        </button>

        {guestOpen ? (
          <div className="absolute top-full left-0 mt-3 w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSearchCriteria((current) => ({ ...current, guests: Math.max(1, current.guests - 1) }))}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-xl font-semibold text-brand transition-all duration-300 ease-out hover:bg-[#1e3047] hover:text-white hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              >
                -
              </button>
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">{searchCriteria.guests} guests</span>
              <button
                type="button"
                onClick={() => setSearchCriteria((current) => ({ ...current, guests: current.guests + 1 }))}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-xl font-semibold text-brand transition-all duration-300 ease-out hover:bg-[#1e3047] hover:text-white hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              >
                +
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={searchCriteria.arriveDate && searchCriteria.departDate ? !hasValidRange : false}
        className="w-full bg-[#283f5e] text-white font-bold py-4 rounded-xl text-xs tracking-widest uppercase hover:bg-[#1e3047] transition-all duration-300 ease-out hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Search Stays
      </button>
    </form>
  );
};
