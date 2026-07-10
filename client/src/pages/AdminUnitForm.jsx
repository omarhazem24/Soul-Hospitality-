import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createAdminUnit, fetchProjectCatalog } from '../api/http.js';
import { Check, ChevronDown, Search, X } from 'lucide-react';

const buildInitialState = (values = {}) => ({
  name: values.name || '',
  uniqueId: values.uniqueId || '',
  destination: values.destination || '',
  projectName: values.projectName || values.location || values.destination || '',
  type: values.type || 'Apartment',
  bedrooms: values.bedrooms || '',
  bathrooms: values.bathrooms || '',
  area: values.area || '',
  floor: values.floor || '',
  pricePerNight: values.pricePerNight || '',
  beachAccessPricePerPersonPerWeek: values.beachAccessPricePerPersonPerWeek ?? '',
  beachAccessExtraGuestPricePerPerson: values.beachAccessExtraGuestPricePerPerson ?? '',
  beachAccessDays: values.beachAccessDays ?? '',
  capacity: values.capacity || '',
  status: values.status || 'Available',
  view: values.view || '',
  description: values.description || '',
  location_link: values.location_link || '',
  amenities: Array.isArray(values.amenities) ? values.amenities : typeof values.amenities === 'string' && values.amenities.trim() ? values.amenities.split(',').map((item) => item.trim()).filter(Boolean) : [],
  facilities: Array.isArray(values.facilities) ? values.facilities : typeof values.facilities === 'string' && values.facilities.trim() ? values.facilities.split(',').map((item) => item.trim()).filter(Boolean) : []
});

const UNIT_TYPE_OPTIONS = ['Apartment', 'Studio', 'Villa', 'Townhouse', 'Penthouse', 'Chalet', 'Hotel Room'];
const AMENITY_SUGGESTIONS = [
  'In-unit washer and dryer', 'Smart thermostat (e.g., Nest)', 'Private balcony or patio', 'Walk-in closets',
  'Stainless steel appliances', 'Dishwasher', 'Hardwood or LVP flooring', 'Keyless smart lock entry',
  'Granite or quartz countertops', 'Central air conditioning', 'Floor-to-ceiling windows', 'Built-in wine cooler',
  'USB wall outlets', 'Kitchen island', 'Deep soaking tub', 'Fully equipped fitness center', 'Rooftop swimming pool',
  'Hot tub / Jacuzzi', 'Yoga or Pilates studio', 'Sauna or steam room', 'Tennis or pickleball courts',
  'Indoor basketball court', 'Community clubhouse or lounge', 'Private movie theater/media room',
  'Game room (billiards, arcade, ping pong)', 'Outdoor BBQ grilling stations', 'Fire pit lounge area',
  'Community kitchen for hosting events', 'Electric Vehicle (EV) charging stations', 'Secure underground parking garage',
  'Reserved covered parking spaces', 'High-speed fiber-optic internet connection', 'Storage units/lockers for rent',
  'Secure bicycle storage room', 'Bike repair station', 'Passenger and freight elevators', 'Trash valet service (doorstep pickup)',
  'On-site recycling center', '24/7 concierge or doorman', 'Gated community entrance', 'On-site 24/7 maintenance team',
  'Co-working spaces / business center', 'Private conference rooms', 'Fenced-in dog park', 'Pet washing station',
  'Landscaped community gardens', 'Children’s playground', 'Walking or jogging trails', 'Air Conditioning',
  'Laundry', 'Microwave', 'Swimming Pool', 'TV Cable', 'Wi-Fi'
];
const FACILITY_SUGGESTIONS = [
  'On-site ATM / Bank branch', 'Dry cleaning service', 'Hair salon and spa', 'Bakery / Coffee shop',
  'Restaurants and food court', 'Medical clinic / First-aid station', 'Gated guardhouse entry',
  'CCTV surveillance control room', 'Emergency fire response station', 'Full-size soccer/football pitch', 'Skatepark',
  'Outdoor fitness equipment gym', 'Pet agility park', 'Shuttle bus stop', 'Guest parking lot'
];

const ProfessionalTagInput = ({ label, placeholder, suggestions, selectedTags, onTagsChange }) => {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag) => {
    const cleaned = tag.trim();
    if (cleaned && !selectedTags.includes(cleaned)) {
      onTagsChange([...selectedTags, cleaned]);
    }
    setInput('');
    setIsOpen(false);
  };

  const filteredSuggestions = suggestions.filter(
    (item) => item.toLowerCase().includes(input.toLowerCase()) && !selectedTags.includes(item)
  );

  return (
    <div ref={containerRef} className="relative flex w-full flex-col gap-2 font-sans">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
      <div
        onClick={() => setIsOpen(true)}
        className="relative flex min-h-[50px] cursor-text flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 pr-10 transition-all duration-200 focus-within:border-[#283f5e] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#283f5e]"
      >
        {selectedTags.map((tag) => (
          <span key={tag} className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1 pl-2.5 pr-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-[#283f5e]">
            {tag}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onTagsChange(selectedTags.filter((item) => item !== tag));
              }}
              className="rounded p-0.5 text-slate-400 transition-colors hover:text-rose-600 inline-flex items-center justify-center"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setInput(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              if (input.trim()) {
                addTag(filteredSuggestions.length > 0 ? filteredSuggestions[0] : input);
              }
            }
          }}
          className="min-w-[150px] flex-1 bg-transparent py-0.5 text-sm text-slate-700 outline-none"
        />
        <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-slate-400">
          {input ? <Search className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />}
        </div>
      </div>
      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-100 bg-white py-1 shadow-xl transition-all">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  addTag(suggestion);
                  setIsOpen(false);
                }}
                className="group flex w-full items-center justify-between px-4 py-2 text-left text-sm font-sans text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#283f5e]"
              >
                <span>{suggestion}</span>
                <Check className="h-3.5 w-3.5 text-[#283f5e] opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={3} aria-hidden="true" />
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-xs italic text-slate-400 font-sans">
              {input ? `Press Enter to add custom tag "${input}"` : 'Begin typing to search categories...'}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export const AdminUnitForm = ({ initialValues, onCancel, onSaved }) => {
  const [formState, setFormState] = useState(() => buildInitialState(initialValues));
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [destinationOptions, setDestinationOptions] = useState([]);
  const [projectsByDestination, setProjectsByDestination] = useState({});

  useEffect(() => {
    let mounted = true;

    const loadCatalog = async () => {
      try {
        const payload = await fetchProjectCatalog();
        const nextDestinations = Array.isArray(payload?.destinations) ? payload.destinations : [];
        const nextProjectsByDestination = payload?.projectsByDestination && typeof payload.projectsByDestination === 'object'
          ? payload.projectsByDestination
          : {};

        if (mounted) {
          setDestinationOptions(nextDestinations);
          setProjectsByDestination(nextProjectsByDestination);
        }
      } catch {
        if (mounted) {
          setDestinationOptions([]);
          setProjectsByDestination({});
        }
      }
    };

    loadCatalog();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleTagsChange = (field, tags) => {
    setFormState((current) => ({ ...current, [field]: tags }));
  };

  const projectNameOptions = useMemo(() => {
    const selectedDestination = String(formState.destination || '').trim();
    const scopedProjects = Array.isArray(projectsByDestination[selectedDestination]) ? projectsByDestination[selectedDestination] : [];

    const merged = new Set([
      ...scopedProjects,
      String(formState.projectName || '').trim()
    ].filter(Boolean));

    return Array.from(merged).sort((left, right) => left.localeCompare(right));
  }, [projectsByDestination, formState.destination, formState.projectName]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    const locationLink = String(formState.location_link || '').trim();
    const selectedDestination = String(formState.destination || '').trim();
    const selectedProjectName = String(formState.projectName || '').trim();

    if (!files.length) {
      setMessage('Please add at least one photo for the unit.');
      setSubmitting(false);
      return;
    }

    if (!locationLink) {
      setMessage('Please add a location link for the unit.');
      setSubmitting(false);
      return;
    }

    if (!selectedDestination || !selectedProjectName) {
      setMessage('Destination and project name are mandatory. Add/select both before creating a unit.');
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', formState.name);
      formData.append('uniqueId', formState.uniqueId);
      formData.append('destination', selectedDestination);
      formData.append('projectName', selectedProjectName);
      formData.append('type', formState.type);
      formData.append('bedrooms', String(Number(formState.bedrooms || 0)));
      formData.append('bathrooms', String(Number(formState.bathrooms || 0)));
      formData.append('area', String(Number(formState.area || 0)));
      formData.append('floor', formState.floor);
      formData.append('pricePerNight', String(Number(formState.pricePerNight || 0)));
      formData.append('beachAccessPricePerPersonPerWeek', String(Number(formState.beachAccessPricePerPersonPerWeek || 0)));
      formData.append('beachAccessExtraGuestPricePerPerson', String(Number(formState.beachAccessExtraGuestPricePerPerson || 0)));
      formData.append('beachAccessDays', String(Number(formState.beachAccessDays || 7)));
      formData.append('capacity', String(formState.capacity || Math.max(1, Number(formState.bedrooms || 0) * 2 || 1)));
      formData.append('status', formState.status);
      formData.append('view', formState.view);
      formData.append('description', formState.description || '');
      formData.append('location_link', locationLink ? locationLink.trim() : '');
      formData.append('amenities', JSON.stringify(formState.amenities || []));
      formData.append('facilities', JSON.stringify(formState.facilities || []));

      Array.from(files).forEach((file) => {
        formData.append('photos', file);
      });

      await createAdminUnit(formData);
      setMessage('Unit created successfully.');
      if (onSaved) {
        await onSaved();
      }
      setFiles([]);
      if (!initialValues) {
        setFormState(buildInitialState());
      }
    } catch (submitError) {
      setMessage(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-sans text-slate-700 outline-none transition-all focus:border-[#283f5e]';


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['name', 'Name', 'text'],
          ['uniqueId', 'Unit ID', 'text'],
          ['bedrooms', 'Bedrooms', 'number'],
          ['bathrooms', 'Bathrooms', 'number'],
          ['area', 'Area (m²)', 'number'],
          ['floor', 'Floor', 'text'],
          ['pricePerNight', 'Price Per Night', 'number'],
          ['beachAccessPricePerPersonPerWeek', 'Beach Access / Person', 'number'],
          ['beachAccessExtraGuestPricePerPerson', 'Beach Access / Extra Guest', 'number'],
          ['beachAccessDays', 'Beach Access Period (Days)', 'number'],
          ['capacity', 'Capacity', 'number'],
          ['location_link', 'Location Link', 'url']
        ].map(([field, label, type]) => (
          <label key={field} className="grid gap-2 text-xs font-sans font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
            <input
              type={type}
              value={formState[field]}
              onChange={(event) => handleChange(field, event.target.value)}
              className={fieldClass}
              required={['name', 'bedrooms', 'bathrooms', 'area', 'floor', 'pricePerNight', 'location_link'].includes(field)}
            />
          </label>
        ))}

        <div>
          <label className="mb-2 block text-xs font-sans font-semibold uppercase tracking-[0.16em] text-slate-500">
            Destination
          </label>
          <div className="space-y-2">
            <select
              name="destination"
              value={formState.destination}
              onChange={(event) => {
                const nextDestination = event.target.value;
                const scopedProjects = Array.isArray(projectsByDestination[nextDestination]) ? projectsByDestination[nextDestination] : [];

                setFormState((current) => ({
                  ...current,
                  destination: nextDestination,
                  projectName: scopedProjects.includes(current.projectName) ? current.projectName : ''
                }));
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-sans text-sm text-slate-700 transition-all cursor-pointer focus:border-[#283f5e] outline-none"
              required
            >
              <option value="" disabled>Select Destination</option>
              {destinationOptions.map((destination) => (
                <option key={destination} value={destination}>
                  {destination}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-xs font-sans font-semibold uppercase tracking-[0.16em] text-slate-500">
              Project Name
            </label>
            <select
              name="projectName"
              value={formState.projectName}
              onChange={(event) => handleChange('projectName', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-sans text-sm text-slate-700 transition-all cursor-pointer focus:border-[#283f5e] outline-none"
              required
            >
              <option value="" disabled>Select Project Name</option>
              {projectNameOptions.map((projectName) => (
                <option key={projectName} value={projectName}>
                  {projectName}
                </option>
              ))}
            </select>

            <p className="text-xs text-slate-500">
              Manage destination and project options from{' '}
              <Link to="/admin/projects" className="font-semibold text-[#283f5e] hover:underline">
                Admin Projects
              </Link>
              .
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 tracking-wider uppercase font-sans block mb-2">
            Property View
          </label>
          <select
            name="view"
            value={formState.view}
            onChange={(event) => handleChange('view', event.target.value)}
            className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#283f5e] focus:ring-1 focus:ring-[#283f5e] font-sans text-slate-700 transition-all cursor-pointer"
            required
          >
            <option value="">Select View Type</option>
            <option value="Sea view">Sea view</option>
            <option value="Pool view">Pool view</option>
            <option value="Double view (Sea and Pool)">Double view (Sea and Pool)</option>
            <option value="Side view">Side view</option>
            <option value="Street view">Street view</option>
            <option value="Back view">Back view</option>
            <option value="Garden view">Garden view</option>
            <option value="Lagoon view">Lagoon view</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-sans font-semibold uppercase tracking-[0.16em] text-slate-500">
            Property Type
          </label>
          <select
            name="type"
            value={formState.type}
            onChange={(event) => handleChange('type', event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-sans text-sm text-slate-700 transition-all cursor-pointer focus:border-[#283f5e] outline-none"
            required
          >
            <option value="">Select Type</option>
            {UNIT_TYPE_OPTIONS.map((unitType) => (
              <option key={unitType} value={unitType}>
                {unitType}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-xs font-sans font-semibold uppercase tracking-[0.16em] text-slate-500">
          Status
          <select value={formState.status} onChange={(event) => handleChange('status', event.target.value)} className={fieldClass}>
            <option>Available</option>
            <option>Occupied</option>
            <option>Maintenance</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ProfessionalTagInput
          label="Amenities"
          placeholder="Type or choose amenities"
          suggestions={AMENITY_SUGGESTIONS}
          selectedTags={formState.amenities}
          onTagsChange={(tags) => handleTagsChange('amenities', tags)}
        />

        <ProfessionalTagInput
          label="Facilities"
          placeholder="Type or choose facilities"
          suggestions={FACILITY_SUGGESTIONS}
          selectedTags={formState.facilities}
          onTagsChange={(tags) => handleTagsChange('facilities', tags)}
        />
      </div>

      <label className="grid gap-2 text-xs font-sans font-semibold uppercase tracking-[0.16em] text-slate-500">
        Description
        <textarea value={formState.description} onChange={(event) => handleChange('description', event.target.value)} rows={5} className={fieldClass} required />
      </label>

      <p className="text-xs font-sans text-slate-400 italic mt-2">
        Note: Enter a manual Unit ID such as e.g. B12-Chalet. The system will save it exactly as entered.
      </p>

      <label className="grid gap-2 text-xs font-sans font-semibold uppercase tracking-[0.16em] text-slate-500">
        Photos
        <input type="file" multiple accept="image/*" onChange={(event) => setFiles(event.target.files || [])} className={fieldClass} required />
      </label>

      {message ? <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{message}</div> : null}

      <div className="flex justify-end gap-3">
        {onCancel ? (
          <button type="button" onClick={onCancel} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
            Cancel
          </button>
        ) : null}
        <button type="submit" disabled={submitting} className="rounded-full bg-[#283f5e] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e3047] disabled:opacity-70">
          {submitting ? 'Creating...' : 'Create Unit'}
        </button>
      </div>
    </form>
  );
};