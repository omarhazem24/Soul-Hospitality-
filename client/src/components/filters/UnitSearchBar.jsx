import React from 'react';
const LOCATION_OPTIONS = ['North Coast', 'New Cairo', 'Giza', 'Sheikh Zayed'];
const UNIT_TYPE_OPTIONS = [
  { label: 'Chalet', value: 'chalet' },
  { label: 'Penthouse', value: 'penthouse' },
  { label: 'Apartment', value: 'apartment' }
];

export const UnitSearchBar = ({ filters, onChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
        {['All', ...LOCATION_OPTIONS].map((location) => {
          const active = location === 'All' ? !filters.destination : filters.destination === location;

          return (
            <button
              key={location}
              type="button"
              onClick={() => onChange('destination', location === 'All' ? '' : location)}
              className={[
                'whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors',
                active
                  ? 'border-brand bg-brand text-white'
                  : 'border-slate-200 bg-white text-brand hover:border-brand/30 hover:bg-slate-50'
              ].join(' ')}
            >
              {location}
            </button>
          );
        })}

        <button
          type="button"
          className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand"
        >
          Filters
        </button>
      </div>

      <div className="surface-card grid gap-4 border border-slate-200 bg-white p-4 shadow-[0_18px_60px_rgba(40,63,94,0.08)] lg:grid-cols-[1.1fr_0.8fr_0.9fr_0.5fr]">
        <label className="grid gap-2 text-xs uppercase tracking-[0.18em] text-brand/70">
          Location
          <select
            value={filters.destination}
            onChange={(event) => onChange('destination', event.target.value)}
            className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-brand outline-none"
          >
            <option value="">Any location</option>
            {LOCATION_OPTIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-xs uppercase tracking-[0.18em] text-brand/70">
          Unit Type
          <select
            value={filters.unit_type}
            onChange={(event) => onChange('unit_type', event.target.value)}
            className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-brand outline-none"
          >
            <option value="">Any type</option>
            {UNIT_TYPE_OPTIONS.map((unitType) => (
              <option key={unitType.value} value={unitType.value}>
                {unitType.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-xs uppercase tracking-[0.18em] text-brand/70">
          Price Slider
          <div className="space-y-2">
            <input
              type="range"
              min="2500"
              max="20000"
              step="500"
              value={filters.max_price}
              onChange={(event) => onChange('max_price', event.target.value)}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200"
            />
            <div className="text-sm text-brand">Up to EGP {Number(filters.max_price || 0).toLocaleString()}</div>
          </div>
        </label>

        <button
          type="submit"
          className="rounded-md bg-brand px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90"
        >
          Search
        </button>
      </div>
    </form>
  );
};
