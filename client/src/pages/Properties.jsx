import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Minus, Plus, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
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
  <label className="flex items-center gap-3 py-1.5 text-[15px] text-slate-600 sm:text-sm cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={onChange} className="h-5 w-5 sm:h-4 sm:w-4 rounded border-slate-300 text-[#134e5e] focus:ring-[#134e5e]" />
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

// Floating WhatsApp Component (Static & Toggles with Mobile Filters)
const WhatsAppButton = ({ hideOnMobile }) => {
  return (
    <div className={`fixed bottom-5 right-5 z-50 select-none transition-all duration-200 ${hideOnMobile ? 'hidden lg:flex' : 'flex'}`}>
      <a
        href="https://wa.me/201000000000" // Replace with actual company phone number
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:bg-[#20ba5a] hover:scale-105 active:scale-95 transition-transform"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.516 2.266 2.27 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.59-4.846c1.62.963 3.42 1.47 5.258 1.471 5.589 0 10.134-4.542 10.137-10.13.002-2.707-1.048-5.253-2.957-7.163C17.118 1.43 14.57 0.38 11.86 0.38c-5.59 0-10.134 4.542-10.137 10.13a10.09 10.09 0 0 0 1.508 5.218L2.083 22.03l6.43-1.686z" />
        </svg>
      </a>
    </div>
  );
};

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
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
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

  useEffect(() => {
    document.body.style.overflow = isMobileFiltersOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFiltersOpen]);

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
    setIsMobileFiltersOpen(false);
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
    setIsMobileFiltersOpen(false);
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
      {/* Dynamic visibility control pass down based on panel state */}
      <WhatsAppButton hideOnMobile={isMobileFiltersOpen} />
      
      <section className="page-container py-6 lg:py-12 2xl:py-16 px-4 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1.5">
            <p className="text-xs text-slate-400">Home &gt; Properties In Egypt</p>
            <div className="flex flex-wrap items-baseline gap-2">
              <h1 className="text-xl font-bold text-[#283f5e] 2xl:text-3xl">Property Listing</h1>
              <span className="inline-block text-sm text-slate-500 2xl:text-base">
                ({displayListings.length} available)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 lg:hidden shadow-sm active:bg-slate-50"
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              Filters
            </button>
            
            <div className="grid grid-cols-2 gap-2 w-full lg:flex lg:w-auto">
              <label className="border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-600 bg-white inline-flex items-center justify-between lg:justify-start gap-2 shadow-sm">
                <span>Show:</span>
                <select
                  value={showLimit}
                  onChange={(event) => setShowLimit(Number(event.target.value))}
                  className="bg-transparent outline-none font-bold text-slate-800"
                  aria-label="Show number of properties"
                >
                  {showOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-600 bg-white inline-flex items-center justify-between lg:justify-start gap-2 shadow-sm">
                <span>Sort:</span>
                <select
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value)}
                  className="bg-transparent outline-none font-bold text-slate-800 max-w-[100px] sm:max-w-none truncate"
                  aria-label="Sort properties"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        {/* Backdrop overlay for mobile drawer */}
        {isMobileFiltersOpen && (
          <div 
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
        )}

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start 2xl:gap-10">
          {/* Main Sidebar Wrapper */}
          <aside
            className={[
              // Mobile View (Bottom Drawer Layering)
              isMobileFiltersOpen
                ? 'fixed inset-x-0 bottom-0 top-16 z-50 flex flex-col bg-white rounded-t-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300'
                : 'hidden',
              // Desktop View (Reset position flow)
              'lg:sticky lg:top-6 lg:z-auto lg:flex lg:flex-col lg:w-[320px] xl:w-[360px] lg:h-auto lg:bg-white lg:border lg:border-slate-100 lg:rounded-[2rem] lg:shadow-none lg:overflow-visible'
            ].join(' ')}
          >
            {/* Mobile Header fixed at top of drawer */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 lg:hidden bg-white shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-slate-800" />
                <h2 className="text-base font-bold text-slate-800">Filters</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1 rounded-full bg-slate-100 text-slate-500 active:bg-slate-200"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Container for Filters */}
            <div className="flex-1 overflow-y-auto px-6 py-5 lg:p-6 space-y-6 pb-28 lg:pb-6 thin-scrollbar">
              {/* Property Type */}
              <div>
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 sm:text-sm">Property Type</h3>
                <div className="max-h-48 overflow-y-auto pr-2 space-y-1 thin-scrollbar">
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

              {/* Project Name */}
              <div>
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 sm:text-sm">Project Name</h3>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-500 bg-slate-50/50">
                  <Search className="h-4 w-4 text-slate-400" strokeWidth={1.5} aria-hidden="true" />
                  <input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Search project name" className="w-full bg-transparent outline-none placeholder:text-slate-400 text-slate-800" />
                </label>
              </div>

              {/* Destination */}
              <div>
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 sm:text-sm">Destination</h3>
                <select
                  value={selectedDestination}
                  onChange={(event) => setSelectedDestination(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
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

              {/* Bedrooms counter */}
              <div>
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 sm:text-sm">Bedrooms</h3>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
                  <button
                    type="button"
                    onClick={() => setBedrooms((current) => Math.max(0, Number(current) - 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#134e5e] hover:text-[#134e5e] disabled:cursor-not-allowed disabled:opacity-30 active:bg-slate-50"
                    disabled={bedrooms <= 0}
                    aria-label="Decrease bedrooms"
                  >
                    <Minus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-[14px] font-bold text-slate-800">{bedrooms > 0 ? `${bedrooms} Bedrooms` : 'Any Bedrooms'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBedrooms((current) => Number(current) + 1)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#134e5e] hover:text-[#134e5e] active:bg-slate-50"
                    aria-label="Increase bedrooms"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 sm:text-sm">Price Range</h3>
                  <span className="text-[12px] font-bold text-right text-[#134e5e]">EGP {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}</span>
                </div>
                <div className="space-y-4">
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    value={priceRange[0]}
                    onChange={(event) => setPriceRange(([_, max]) => [Math.min(Number(event.target.value), max - 100), max])}
                    className="w-full accent-[#134e5e] h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    value={priceRange[1]}
                    onChange={(event) => setPriceRange(([min]) => [min, Math.max(Number(event.target.value), min + 100)])}
                    className="w-full accent-[#134e5e] h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <label className="grid gap-1 text-[11px] font-semibold text-slate-500">
                      Min Price
                      <input
                        type="number"
                        min={PRICE_MIN}
                        max={priceRange[1] - 100}
                        value={priceRange[0] === PRICE_MIN ? '' : priceRange[0]}
                        onChange={(event) => handleMinPriceInput(event.target.value)}
                        placeholder="Min"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#134e5e]"
                      />
                    </label>
                    <label className="grid gap-1 text-[11px] font-semibold text-slate-500">
                      Max Price
                      <input
                        type="number"
                        min={priceRange[0] + 100}
                        max={PRICE_MAX}
                        value={priceRange[1] === PRICE_MAX ? '' : priceRange[1]}
                        onChange={(event) => handleMaxPriceInput(event.target.value)}
                        placeholder="Max"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#134e5e]"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* View Type */}
              <div>
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 sm:text-sm">View Type</h3>
                <div className="max-h-36 overflow-y-auto pr-2 space-y-1 thin-scrollbar">
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
            </div>

            {/* Actions Panel - Styled to layout normally on desktop and pin securely on mobile */}
            <div className="fixed bottom-0 inset-x-0 bg-white p-4 border-t border-slate-100 flex gap-3 shrink-0 z-10 lg:static lg:border-t-0 lg:p-6 lg:bg-transparent">
              <button 
                type="button" 
                onClick={applyFilters} 
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#134e5e] px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white shadow-md active:bg-[#0f3e4b] transition-colors h-11"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
                Find Stays
              </button>
              <button 
                type="button" 
                onClick={resetFilters} 
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-slate-600 active:bg-slate-50 transition-colors h-11"
                aria-label="Clear property filters"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
                Clear
              </button>
            </div>
          </aside>

          {/* Properties Grid */}
          <section className="flex-1 grid grid-cols-1 gap-6 items-start md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 2xl:gap-8">
            {loading ? (
              <div className="col-span-full rounded-3xl border border-slate-100 bg-white p-8 text-sm text-slate-500 shadow-sm text-center">Loading curated properties...</div>
            ) : null}

            {error ? <div className="col-span-full rounded-3xl border border-slate-100 bg-white p-8 text-sm text-slate-500 shadow-sm text-center">{error}</div> : null}

            {!loading && displayListings.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-slate-100 bg-white p-12 text-sm text-slate-500 shadow-sm text-center">
                No properties match your current filter settings.
              </div>
            ) : null}

            {displayListings.map((listing) => (
              <PropertyCard key={listing._id} listing={listing} />
            ))}
          </section>
        </div>

        <div className="mt-10 flex items-center justify-between sm:justify-start gap-4 text-xs uppercase tracking-[0.18em] text-brand/60">
          <span>{displayListings.length} curated stays</span>
          <span className="hidden sm:inline-block h-px w-12 bg-slate-200" />
          <Link to="/login" className="text-brand no-underline font-bold">
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