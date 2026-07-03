import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAvailableUnits } from '../api/http.js';
import { mockUnits } from '../data/mockUnits.js';

const propertyTypes = ['Chalet', 'Standalone Villa', 'Twinhouse', 'Penthouse', 'Townhouse', 'Duplex'];
const furnishingOptions = ['ALL FURNISHINGS', 'FURNISHED', 'SEMI FURNISHED'];
const facilityOptions = ['Kids Area', 'Private Beach', 'Swimming Pool'];
const amenityOptions = ['Nile View', 'Private Garden', 'Private Swimming Pool'];

const CheckItem = ({ label }) => (
  <label className="flex items-center gap-3 text-sm text-slate-600">
    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#134e5e] focus:ring-[#134e5e]" />
    <span>{label}</span>
  </label>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
    <path d="M12 21s5.5-5 5.5-10a5.5 5.5 0 1 0-11 0c0 5 5.5 10 5.5 10Z" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="12" cy="11" r="1.8" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const BedIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
    <path d="M4.5 10.5V7.8A1.8 1.8 0 0 1 6.3 6h11.4a1.8 1.8 0 0 1 1.8 1.8v2.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M4.5 10.5h15v5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M4.5 10.5V15.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const BathIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
    <path d="M7 11.5V8.8A2.8 2.8 0 0 1 9.8 6h4.4A2.8 2.8 0 0 1 17 8.8v2.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M5.5 11.5h13v4.8a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-4.8Z" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const AreaIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
    <path d="M5 5h14v14H5z" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const PropertyCard = ({ listing }) => (
  <Link
    to={`/units/${listing._id}`}
    state={{ unit: listing }}
    className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer no-underline"
  >
    <div className="relative w-full aspect-[4/3]">
      <img src={listing.image} alt={listing.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute top-3 left-3 bg-[#134e5e] text-white text-[10px] font-bold px-3 py-1 rounded-md">
        {listing.category}
      </div>
      <div className="absolute top-3 right-3 bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm text-slate-500">
        <MapPinIcon />
      </div>
    </div>

    <div className="p-5 flex flex-col flex-1">
      <a
        href={listing.location_link || '#'}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-slate-400 font-medium mb-1.5 transition-colors hover:text-[#283f5e]"
        onClick={(event) => event.stopPropagation()}
      >
        {listing.location}
      </a>
      <h3 className="text-base font-bold text-slate-800 leading-snug min-h-[44px] mb-3 line-clamp-2 transition-colors group-hover:text-[#283f5e]">
        {listing.title}
      </h3>

      <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mb-4 flex-wrap">
        <span className="flex items-center gap-1.5">
          <BedIcon />
          {listing.beds}
        </span>
        <span className="flex items-center gap-1.5">
          <BathIcon />
          {listing.bath}
        </span>
        <span className="flex items-center gap-1.5">
          <AreaIcon />
          {listing.area}
        </span>
      </div>

      <div className="bg-[#134e5e] text-white text-xs font-bold px-2 py-0.5 rounded flex items-center justify-center gap-1 w-fit mb-4">
        ★ {listing.rating}
      </div>

      <p className="text-base font-bold text-slate-800 border-t border-slate-50 pt-3 mt-auto">
        {listing.price} <span className="text-xs text-slate-400 font-normal">/ Per Night</span>
      </p>
    </div>
  </Link>
);

const normalizeUnits = (units) => {
  if (!Array.isArray(units) || units.length === 0) {
    return mockUnits.slice(0, 2).map((unit) => ({
      _id: unit._id,
      image: unit.photos?.[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
      category: unit.type ? unit.type : (unit.unit_type ? unit.unit_type.charAt(0).toUpperCase() + unit.unit_type.slice(1) : 'Apartment'),
      location: ['Egypt', unit.projectName || unit.location || 'Prime Location'].join(', '),
      location_link: unit.location_link || '#',
      title: unit.name || unit.title,
      beds: `${unit.bedrooms || unit.bedroom_count || 0} beds`,
      bath: `${unit.bathrooms || unit.bathroom_count || 0} bath`,
      area: `${unit.area || unit.area_m2 || 0} m²`,
      rating: 0,
      price: `${Number(unit.pricePerNight || unit.price || 0).toLocaleString()} EGP`
    }));
  }

  return units.map((unit, index) => {
    const normalizedLocation = unit.projectName || unit.location || unit.destination || 'Prime Location';
    const unitType = unit.type || unit.unit_type || 'Apartment';
    const primaryPhoto = unit.photos?.[0] || unit.images?.[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80';

    return {
      _id: unit._id || unit.id || `unit-${index}`,
      image: primaryPhoto,
      category: unitType.charAt(0).toUpperCase() + unitType.slice(1),
      location: `Egypt, ${normalizedLocation}`,
      location_link: unit.location_link || unit.locationLink || '#',
      title: unit.name || unit.title || 'Premium Property',
      beds: `${unit.bedrooms || unit.bedroom_count || 0} beds`,
      bath: `${unit.bathrooms || unit.bathroom_count || 0} bath`,
      area: `${unit.area || unit.area_m2 || 0} m²`,
      rating: 0,
      price: `${Number(unit.pricePerNight || unit.price || 0).toLocaleString()} EGP`
    };
  });
};

export const Properties = () => {
  const [priceRange, setPriceRange] = useState([100, 100000]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadUnits = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetchAvailableUnits();
        const payload = response?.data || response || [];
        const normalizedUnits = normalizeUnits(payload);

        if (mounted) {
          setListings(normalizedUnits.slice(0, 2));
        }
      } catch (loadError) {
        if (mounted) {
          setListings(normalizeUnits(mockUnits).slice(0, 2));
          setError(loadError.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUnits();

    return () => {
      mounted = false;
    };
  }, []);

  const displayListings = useMemo(() => listings.slice(0, 2), [listings]);

  return (
    <main className="bg-[#f8fafc]">
      <section className="page-container py-10 lg:py-12">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Home &gt; Properties In Egypt</p>
            <div className="flex flex-wrap items-baseline gap-2">
              <h1 className="text-3xl font-bold text-[#283f5e]">Property Listing</h1>
              <span className="ml-0 inline-block align-baseline text-sm text-slate-500">
                There are currently {displayListings.length || 2} properties.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="border border-slate-200 rounded-lg px-4 py-2 text-xs font-medium text-slate-600 bg-white">
              Show: 50
            </button>
            <button type="button" className="border border-slate-200 rounded-lg px-4 py-2 text-xs font-medium text-slate-600 bg-white inline-flex items-center gap-2">
              Sort by (Featured)
              <span aria-hidden="true">▾</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="w-full lg:w-[320px] bg-white border border-slate-100 rounded-[2rem] p-6 flex flex-col gap-6 self-start lg:sticky lg:top-6">
            <div>
              <h2 className="text-sm font-bold text-slate-800 mb-2">Property Type</h2>
              <div className="max-h-48 overflow-y-auto pr-3 space-y-3 thin-scrollbar">
                {propertyTypes.map((item) => (
                  <CheckItem key={item} label={item} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-800 mb-2">Furnishing</h2>
              <div className="space-y-3">
                {furnishingOptions.map((item) => (
                  <CheckItem key={item} label={item} />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="text-sm font-bold text-slate-800">Price Range</h2>
                <span className="text-xs font-semibold text-slate-700">EGP{priceRange[0].toLocaleString()} - EGP{priceRange[1].toLocaleString()}</span>
              </div>
              <div className="space-y-4">
                <input
                  type="range"
                  min="100"
                  max="100000"
                  value={priceRange[0]}
                  onChange={(event) => setPriceRange(([_, max]) => [Math.min(Number(event.target.value), max - 100), max])}
                  className="w-full accent-[#134e5e]"
                />
                <input
                  type="range"
                  min="100"
                  max="100000"
                  value={priceRange[1]}
                  onChange={(event) => setPriceRange(([min]) => [min, Math.max(Number(event.target.value), min + 100)])}
                  className="w-full accent-[#134e5e]"
                />
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-800 mb-2">Property Facility</h2>
              <div className="max-h-28 overflow-y-auto pr-3 space-y-3 thin-scrollbar">
                {facilityOptions.map((item) => (
                  <CheckItem key={item} label={item} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-800 mb-2">Property Amenity</h2>
              <div className="max-h-28 overflow-y-auto pr-3 space-y-3 thin-scrollbar">
                {amenityOptions.map((item) => (
                  <CheckItem key={item} label={item} />
                ))}
              </div>
            </div>

            <button type="button" className="w-full bg-[#134e5e] hover:bg-[#0f3e4b] text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 text-sm mt-4 shadow-sm transition-colors">
              Find Properties →
            </button>
          </aside>

          <section className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            {loading ? (
              <div className="rounded-3xl border border-slate-100 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading curated properties...</div>
            ) : null}

            {error ? <div className="rounded-3xl border border-slate-100 bg-white p-8 text-sm text-slate-500 shadow-sm">Using fallback inventory while the live feed resolves.</div> : null}

            {displayListings.map((listing) => (
              <PropertyCard key={listing._id} listing={listing} />
            ))}
          </section>
        </div>

        <div className="mt-10 flex items-center gap-4 text-xs uppercase tracking-[0.18em] text-brand/60">
          <span>2 curated stays</span>
          <span className="h-px w-12 bg-slate-200" />
          <Link to="/login" className="text-brand no-underline">
            Login for reservations
          </Link>
        </div>
      </section>

      <style>{`
        .thin-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .thin-scrollbar::-webkit-scrollbar-track {
          background: #e2e8f0;
          border-radius: 999px;
        }
        .thin-scrollbar::-webkit-scrollbar-thumb {
          background: #134e5e;
          border-radius: 999px;
        }
      `}</style>
    </main>
  );
};
