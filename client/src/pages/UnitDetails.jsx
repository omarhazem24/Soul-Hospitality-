import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { mockUnits } from '../data/mockUnits.js';

const resolveUnit = (locationState, unitId) => {
  if (locationState?.unit) {
    return locationState.unit;
  }

  return mockUnits.find((unit) => unit._id === unitId) || mockUnits[0];
};

export const UnitDetails = () => {
  const location = useLocation();
  const { unitId } = useParams();
  const unit = resolveUnit(location.state, unitId);
  const gallery = unit.photos?.length > 0 ? unit.photos : mockUnits[0].photos;
  const price = Number(unit.pricePerNight || unit.price || 0).toLocaleString();
  const locationLink = unit.location_link || unit.locationLink || '#';
  const title = unit.name || unit.title;
  const markdownCopy = `# ${title}\n\n${unit.description || 'A premium residence designed for quiet luxury, generous spacing, and a refined reservation experience.'}\n\n### Property Features\n- ${unit.bedrooms || unit.bedroom_count || 0} bedrooms\n- ${unit.bathrooms || unit.bathroom_count || 0} bathrooms\n- ${unit.area || unit.area_m2 || 0} m² living area\n- ${unit.capacity || 0} guest capacity\n\n### Nearby Attractions\n- Premium neighborhood access\n- Fine dining and boutique retail\n- Private leisure and shoreline routes\n\n### Why Guests Love This Apartment\n- Crisp luxury layout\n- Clear booking flow\n- Quiet, modern interiors`;

  return (
    <main className="page-container py-12 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <img src={gallery[0]} alt={title} className="h-[420px] w-full object-cover" />
            <div className="grid gap-4">
              <img src={gallery[1] || gallery[0]} alt={title} className="h-[198px] w-full object-cover" />
              <img src={gallery[2] || gallery[0]} alt={title} className="h-[198px] w-full object-cover" />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand/70">Details</p>
            <h1 className="text-4xl font-semibold uppercase tracking-[0.18em] text-brand">{title}</h1>
            <a href={locationLink} target="_blank" rel="noreferrer" className="text-sm uppercase tracking-[0.18em] text-brand/70 transition-colors hover:text-[#283f5e]">
              {unit.projectName || unit.location}
            </a>
            <p className="text-sm leading-7 text-brand/75">{unit.description}</p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-brand/75 whitespace-pre-line">
              {markdownCopy}
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-28 lg:self-start space-y-6">
          <div className="space-y-5 border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(40,63,94,0.08)]">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand/70">Reservation Panel</p>
              <div className="text-2xl font-semibold uppercase tracking-[0.16em] text-brand">EGP {price} for 1 nights</div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-xs uppercase tracking-[0.18em] text-brand/70">
                Check-In
                <input type="date" className="rounded-md border border-slate-200 px-4 py-3 text-sm text-brand outline-none" />
              </label>
              <label className="grid gap-2 text-xs uppercase tracking-[0.18em] text-brand/70">
                Check-Out
                <input type="date" className="rounded-md border border-slate-200 px-4 py-3 text-sm text-brand outline-none" />
              </label>
            </div>

            <label className="grid gap-2 text-xs uppercase tracking-[0.18em] text-brand/70">
              Guests
              <input type="number" min="1" defaultValue="2" className="rounded-md border border-slate-200 px-4 py-3 text-sm text-brand outline-none" />
            </label>

            <button type="button" className="w-full rounded-md bg-[#0f4c5c] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              Reserve
            </button>
          </div>

          <div className="grid gap-3 text-sm text-brand/75">
            {['Secure Booking', 'Best Price Guarantee', 'Easy Booking Process', 'Available Support 24/7'].map((item) => (
              <div key={item} className="flex items-center gap-3 border border-slate-200 bg-white px-4 py-3">
                <span className="rounded-full border border-slate-200 px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand">
                  {item.split(' ')[0]}
                </span>
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
};
