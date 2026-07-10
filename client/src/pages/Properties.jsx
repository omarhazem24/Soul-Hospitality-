import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Minus, Plus, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { fetchAvailableUnits, fetchProjectNames } from '../api/http.js';

const propertyTypes = ['Apartment', 'Studio', 'Villa', 'Townhouse', 'Penthouse', 'Chalet', 'Hotel Room'];
const viewOptions = ['Sea view', 'Pool view', 'Double view (Sea and Pool)', 'Side view', 'Street view', 'Back view', 'Garden view', 'Lagoon view'];
const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_high_low', label: 'Price high to low' },
  { value: 'price_low_high', label: 'Price low to high' },
  { value: 'bedrooms_asc', label: 'Bedrooms ascending' },
  { value: 'bedrooms_desc', label: 'Bedrooms descending' },
  { value: 'rating_high_low', label: 'Rating high to low' },
  { value: 'rating_low_high', label: 'Rating low to high' }
];
const showOptions = [50, 30, 10];

const PRICE_MIN = 100;
const PRICE_MAX = 100000;
const defaultPriceRange = [PRICE_MIN, PRICE_MAX];
const defaultBedrooms = 0;
const defaultAppliedFilters = {};

const CheckItem = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2.5 text-[15px] text-slate-600 sm:text-sm">
    <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-[#134e5e] focus:ring-[#134e5e]" />
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
    className="group h-full bg-white rounded-[1.7rem] border border-slate-100 overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer no-underline"
  >
    <div className="relative w-full h-[14rem] md:h-[16rem]">
      <img src={listing.image} alt={listing.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute top-4 left-4 bg-[#134e5e] text-white text-[11px] font-bold px-3.5 py-1.5 rounded-md">
        {listing.category}
      </div>
      <div className="absolute top-4 right-4 bg-white w-9 h-9 rounded-full flex items-center justify-center shadow-sm text-slate-500">
        <MapPinIcon />
      </div>
    </div>

    <div className="p-5 flex flex-col flex-1">
      <button
        type="button"
        className="text-left text-[13px] text-slate-400 font-medium mb-1.5 transition-colors hover:text-[#283f5e]"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();

          const targetUrl = listing.location_link || '#';
          if (targetUrl && targetUrl !== '#') {
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
          }
        }}
      >
        {listing.location}
      </button>
      <h3 className="text-[1.2rem] font-bold text-slate-800 leading-snug min-h-[44px] mb-2.5 line-clamp-2 transition-colors group-hover:text-[#283f5e]">
        {listing.title}
      </h3>

      <div className="flex items-center gap-4 text-[12px] font-medium text-slate-400 mb-3.5 flex-wrap">
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

      <div className="mb-3 flex items-center gap-2">
        {Number(listing.reviewCount || 0) > 0 ? (
          <>
            <span className="rounded-md border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
              ★ {Number(listing.rating || 0).toFixed(1)}
            </span>
            <span className="text-xs font-medium text-slate-500">({listing.reviewCount} reviews)</span>
          </>
        ) : (
          <>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-400">★ —</span>
            <span className="text-xs italic text-slate-400">No reviews yet</span>
          </>
        )}
      </div>

      <p className="text-[1.15rem] font-bold text-slate-800 border-t border-slate-50 pt-2.5 mt-auto">
        {listing.price} <span className="text-xs text-slate-400 font-normal">/ Per Night</span>
      </p>
    </div>
  </Link>
);

const normalizeUnits = (units) => {
  if (!Array.isArray(units) || units.length === 0) {
    return [];
  }

  return units.map((unit, index) => {
    const normalizedLocation = unit.projectName || unit.location || unit.destination || 'Prime Location';
    const unitType = unit.type || unit.unit_type || 'Apartment';
    const primaryPhoto = unit.photos?.[0] || unit.images?.[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80';

    return {
      _id: unit._id || unit.id || `unit-${index}`,
      destination: unit.destination || '',
      capacity: Number(unit.capacity || 0),
      image: primaryPhoto,
      category: unitType.charAt(0).toUpperCase() + unitType.slice(1),
      location: `Egypt, ${normalizedLocation}`,
      location_link: unit.location_link || unit.locationLink || '#',
      title: unit.name || unit.title || 'Premium Property',
      beds: `${unit.bedrooms || unit.bedroom_count || 0} beds`,
      bath: `${unit.bathrooms || unit.bathroom_count || 0} bath`,
      area: `${unit.area || unit.area_m2 || 0} m²`,
      rating: Number(unit.averageRating || unit.rating || 0),
      reviewCount: Number(unit.reviewCount || unit.reviewsCount || 0),
      price: `${Number(unit.pricePerNight || unit.price || 0).toLocaleString()} EGP`
    };
  });
};

export const Properties = () => {
  const location = useLocation();
  const [priceRange, setPriceRange] = useState(defaultPriceRange);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedViews, setSelectedViews] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [bedrooms, setBedrooms] = useState(defaultBedrooms);
  const [showLimit, setShowLimit] = useState(50);
  const [sortOption, setSortOption] = useState('featured');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [projectOptions, setProjectOptions] = useState([]);
  const [searchGuests, setSearchGuests] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState(defaultAppliedFilters);

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

  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const destinationFromQuery = params.get('destination') || '';
    const guestsFromQuery = Number(params.get('guests') || 0);

    setSelectedDestination(destinationFromQuery);
    setSearchGuests(Number.isFinite(guestsFromQuery) && guestsFromQuery > 0 ? guestsFromQuery : 0);
    setAppliedFilters((current) => ({
      ...current,
      destination: destinationFromQuery
    }));
  }, [location.search]);

  useEffect(() => {
    let mounted = true;

    const loadUnits = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetchAvailableUnits({ ...appliedFilters, sort: sortOption });
        const payload = response?.data || response || [];
        const normalizedUnits = normalizeUnits(payload);

        if (mounted) {
          setListings(normalizedUnits);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message);
          setListings([]);
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
  }, [appliedFilters, sortOption]);

  const toggleListValue = (setter, value) => {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const handleMinPriceInput = (value) => {
    if (value === '') {
      setPriceRange(([_, currentMax]) => [PRICE_MIN, currentMax]);
      return;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return;
    }

    setPriceRange(([_, currentMax]) => {
      const nextMin = Math.max(PRICE_MIN, Math.min(parsed, currentMax - 100));
      return [nextMin, currentMax];
    });
  };

  const handleMaxPriceInput = (value) => {
    if (value === '') {
      setPriceRange(([currentMin]) => [currentMin, PRICE_MAX]);
      return;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return;
    }

    setPriceRange(([currentMin]) => {
      const nextMax = Math.min(PRICE_MAX, Math.max(parsed, currentMin + 100));
      return [currentMin, nextMax];
    });
  };

  const applyFilters = () => {
    setAppliedFilters({
      type: selectedTypes.join(','),
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      view: selectedViews.join(','),
      destination: selectedDestination,
      projectName,
      bedrooms: bedrooms > 0 ? String(bedrooms) : ''
    });
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedViews([]);
    setProjectName('');
    setBedrooms(defaultBedrooms);
    setShowLimit(50);
    setSortOption('featured');
    setSelectedDestination('');
    setSearchGuests(0);
    setPriceRange(defaultPriceRange);
    setAppliedFilters(defaultAppliedFilters);
  };

  const filteredListings = useMemo(() => {
    let nextListings = listings;

    if (selectedDestination) {
      nextListings = nextListings.filter((unit) => unit.destination === selectedDestination);
    }

    if (searchGuests > 0) {
      nextListings = nextListings.filter((unit) => Number(unit.capacity || 0) >= searchGuests);
    }

    return nextListings;
  }, [listings, selectedDestination, searchGuests]);

  const displayListings = useMemo(() => filteredListings.slice(0, showLimit), [filteredListings, showLimit]);

  return (
    <main className="bg-[#f8fafc]">
      <section className="page-container py-10 lg:py-12 2xl:py-16">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Home &gt; Properties In Egypt</p>
            <div className="flex flex-wrap items-baseline gap-2">
              <h1 className="text-xl font-bold text-[#283f5e] 2xl:text-3xl">Property Listing</h1>
              <span className="ml-0 inline-block align-baseline text-sm text-slate-500 2xl:text-base">
                There are currently {displayListings.length} properties.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="border border-slate-200 rounded-lg px-4 py-2 text-xs font-medium text-slate-600 bg-white inline-flex items-center gap-2">
              <span>Show:</span>
              <select
                value={showLimit}
                onChange={(event) => setShowLimit(Number(event.target.value))}
                className="bg-transparent outline-none"
                aria-label="Show number of properties"
              >
                {showOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="border border-slate-200 rounded-lg px-4 py-2 text-xs font-medium text-slate-600 bg-white inline-flex items-center gap-2">
              <span>Sort by</span>
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value)}
                className="bg-transparent outline-none"
                aria-label="Sort properties"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="border border-slate-200 rounded-lg px-4 py-2 text-xs font-medium text-slate-600 bg-white inline-flex items-center gap-2">
              <span>Destination</span>
              <select
                value={selectedDestination}
                onChange={(event) => setSelectedDestination(event.target.value)}
                className="bg-transparent outline-none"
                aria-label="Filter by destination"
              >
                <option value="">All Destinations</option>
                {projectOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start 2xl:gap-10">
          <aside className="w-full lg:w-[380px] bg-white border border-slate-100 rounded-3xl p-4 sm:p-5 lg:rounded-[2rem] lg:p-6 flex flex-col items-center gap-4 sm:gap-5 lg:gap-6 self-start lg:sticky lg:top-6 [&>div]:w-full [&>div]:max-w-[340px]">
            <div>
              <h2 className="mb-2 text-xs font-bold text-slate-800 sm:text-sm">Property Type</h2>
              <div className="max-h-48 overflow-y-auto pr-3 space-y-3 thin-scrollbar">
                {propertyTypes.map((item) => (
                  <CheckItem
                    key={item}
                    label={item}
                    checked={selectedTypes.includes(item)}
                    onChange={() => toggleListValue(setSelectedTypes, item)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-xs font-bold text-slate-800 sm:text-sm">Project Name</h2>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-500 sm:px-4 sm:py-3">
                <Search className="h-4 w-4 text-slate-400" strokeWidth={1.5} aria-hidden="true" />
                <input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Search project name" className="w-full bg-transparent outline-none placeholder:text-slate-400" />
              </label>
            </div>

            <div>
              <h2 className="mb-2 text-xs font-bold text-slate-800 sm:text-sm">Destination</h2>
              <select
                value={selectedDestination}
                onChange={(event) => setSelectedDestination(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-600 outline-none sm:px-4 sm:py-3"
                aria-label="Filter by destination"
              >
                <option value="">All Destinations</option>
                {projectOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h2 className="mb-2 text-xs font-bold text-slate-800 sm:text-sm">Bedrooms</h2>
              <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-600 sm:gap-3 sm:px-4 sm:py-3">
                <button
                  type="button"
                  onClick={() => setBedrooms((current) => Math.max(0, Number(current) - 1))}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-[#134e5e] hover:text-[#134e5e] disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8"
                  disabled={bedrooms <= 0}
                  aria-label="Decrease bedrooms"
                >
                  <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.8} aria-hidden="true" />
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:text-xs sm:tracking-[0.18em]">Bedrooms</span>
                  <span className="text-sm font-bold text-slate-800 sm:text-base">{bedrooms > 0 ? bedrooms : 'All'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBedrooms((current) => Number(current) + 1)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-[#134e5e] hover:text-[#134e5e] sm:h-8 sm:w-8"
                  aria-label="Increase bedrooms"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="text-xs font-bold text-slate-800 sm:text-sm">Price Range</h2>
                <span className="text-[11px] font-semibold text-right text-slate-700 sm:text-xs">EGP{priceRange[0].toLocaleString()} - EGP{priceRange[1].toLocaleString()}</span>
              </div>
              <div className="space-y-4">
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  value={priceRange[0]}
                  onChange={(event) => setPriceRange(([_, max]) => [Math.min(Number(event.target.value), max - 100), max])}
                  className="w-full accent-[#134e5e]"
                />
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  value={priceRange[1]}
                  onChange={(event) => setPriceRange(([min]) => [min, Math.max(Number(event.target.value), min + 100)])}
                  className="w-full accent-[#134e5e]"
                />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-xs">
                    Min Price
                    <input
                      type="number"
                      min={PRICE_MIN}
                      max={priceRange[1] - 100}
                      value={priceRange[0] === PRICE_MIN ? '' : priceRange[0]}
                      onChange={(event) => handleMinPriceInput(event.target.value)}
                      placeholder="Min"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#134e5e]"
                    />
                  </label>
                  <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-xs">
                    Max Price
                    <input
                      type="number"
                      min={priceRange[0] + 100}
                      max={PRICE_MAX}
                      value={priceRange[1] === PRICE_MAX ? '' : priceRange[1]}
                      onChange={(event) => handleMaxPriceInput(event.target.value)}
                      placeholder="Max"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#134e5e]"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-xs font-bold text-slate-800 sm:text-sm">View Type</h2>
              <div className="max-h-32 overflow-y-auto pr-3 space-y-3 thin-scrollbar">
                {viewOptions.map((item) => (
                  <CheckItem
                    key={item}
                    label={item}
                    checked={selectedViews.includes(item)}
                    onChange={() => toggleListValue(setSelectedViews, item)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-2.5 sm:mt-4 sm:flex-row sm:gap-3">
              <button type="button" onClick={applyFilters} className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#134e5e] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-sm transition-all duration-300 ease-out hover:bg-[#0f3e4b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#134e5e]/45 sm:px-6 sm:py-3 sm:text-sm sm:tracking-[0.16em]">
                <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                Find Properties
              </button>
              <button type="button" onClick={resetFilters} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 transition-all duration-300 ease-out hover:border-[#134e5e] hover:text-[#134e5e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#134e5e]/35 sm:px-6 sm:py-3 sm:text-sm sm:tracking-[0.16em]" aria-label="Clear property filters">
                <RotateCcw className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                Clear
              </button>
            </div>
          </aside>

          <section className="flex-1 grid grid-cols-1 gap-8 items-stretch md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 2xl:gap-10">
            {loading ? (
              <div className="rounded-3xl border border-slate-100 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading curated properties...</div>
            ) : null}

            {error ? <div className="rounded-3xl border border-slate-100 bg-white p-8 text-sm text-slate-500 shadow-sm">{error}</div> : null}

            {displayListings.map((listing) => (
              <PropertyCard key={listing._id} listing={listing} />
            ))}
          </section>
        </div>

        <div className="mt-10 flex items-center gap-4 text-xs uppercase tracking-[0.18em] text-brand/60">
          <span>{displayListings.length} curated stays</span>
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
