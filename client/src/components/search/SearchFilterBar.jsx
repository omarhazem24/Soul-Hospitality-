import React from 'react';
import { fetchProjectNames } from '../../api/http.js';

const unitTypes = ['Chalet', 'Penthouse', 'Apartment'];

export const SearchFilterBar = () => {
  const [destinations, setDestinations] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;

    const loadProjects = async () => {
      try {
        const payload = await fetchProjectNames();
        const nextProjects = Array.isArray(payload) ? payload : [];

        if (mounted) {
          setDestinations(nextProjects);
        }
      } catch {
        if (mounted) {
          setDestinations([]);
        }
      }
    };

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page-container relative -mt-10 pb-4">
      <div className="surface-card grid gap-4 p-4 shadow-luxury lg:grid-cols-[1.2fr_1fr_0.8fr_0.6fr] lg:items-end">
        <label className="grid gap-2 text-sm text-brand">
          <span className="brand-eyebrow">Destination / Location</span>
          <select className="rounded-md border border-line bg-white px-4 py-3 text-sm text-brand outline-none">
            <option value="">Select location</option>
            {destinations.map((item) => (
              <option key={item} value={item.toLowerCase()}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm text-brand">
          <span className="brand-eyebrow">Unit Type</span>
          <select className="rounded-md border border-line bg-white px-4 py-3 text-sm text-brand outline-none">
            <option value="">Select type</option>
            {unitTypes.map((item) => (
              <option key={item} value={item.toLowerCase()}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm text-brand">
          <span className="brand-eyebrow">Price Limits</span>
          <input
            type="text"
            placeholder="Min - Max"
            className="rounded-md border border-line bg-white px-4 py-3 text-sm text-brand outline-none"
          />
        </label>

        <button
          type="button"
          className="rounded-md bg-brand px-5 py-3 text-sm font-semibold tracking-[0.08em] text-white transition-opacity hover:opacity-90"
        >
          Search
        </button>
      </div>
    </div>
  );
};
