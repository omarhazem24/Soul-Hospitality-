import React from 'react';
import { Link } from 'react-router-dom';

const formatPrice = (price) => {
  if (typeof price === 'string') {
    return price;
  }

  if (typeof price === 'number') {
    return `EGP ${price.toLocaleString()} / night`;
  }

  return 'EGP 0 / night';
};

const formatUnitType = (unitType = '') =>
  unitType ? unitType.charAt(0).toUpperCase() + unitType.slice(1) : 'Stay';

const toGalleryItems = (photos = []) =>
  photos.length > 0
    ? photos
    : [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80'
      ];

export const UnitCard = ({ unit }) => {
  const galleryItems = toGalleryItems(unit.photos);
  const unitId = unit._id || unit.id || unit.slug;
  const priceText = `EGP ${Number(unit.price || 0).toLocaleString()} / Per Night`;
  const averageRating = Number(unit.averageRating || unit.rating || 0);
  const reviewCount = Number(unit.reviewCount || unit.reviewsCount || 0);
  const locationChain = ['Egypt', unit.location || unit.destination || 'Prime Location', 'Boutique Stay']
    .filter(Boolean)
    .join(', ');

  return (
    <article className="overflow-hidden border border-slate-200 bg-white shadow-[0_18px_60px_rgba(40,63,94,0.08)]">
      <Link to={`/units/${unitId}`} state={{ unit }} className="block no-underline">
        <div className="relative min-h-[340px] border-b border-slate-200 bg-slate-50">
          <div className="flex snap-x snap-mandatory gap-0 overflow-x-auto">
            {galleryItems.map((photo, index) => (
              <div key={`${photo}-${index}`} className="min-w-full snap-center">
                <img src={photo} alt={unit.title} className="h-[340px] w-full object-cover" />
              </div>
            ))}
          </div>

          <div className="absolute left-4 top-4 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            {formatUnitType(unit.unit_type)}
          </div>

          <div className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Location {unit.location || unit.destination || 'Prime'}
          </div>

          <div className="absolute bottom-4 left-4 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand shadow-sm">
            {priceText}
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-brand/55">{locationChain}</p>
            <h3 className="text-xl font-semibold leading-8 text-brand">{unit.title}</h3>
            <p className="text-sm leading-7 text-brand/70">
              {unit.description || 'Modern luxury living with premium natural light, crisp detailing, and elevated quietness.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-brand/75">
            <span className="rounded-md border border-slate-200 px-3 py-2">Beds {unit.bedroom_count || 0}</span>
            <span className="rounded-md border border-slate-200 px-3 py-2">Baths {unit.bathroom_count || 0}</span>
            {reviewCount > 0 ? (
              <>
                <span className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-amber-700">★ {averageRating.toFixed(1)}</span>
                <span className="normal-case tracking-normal text-slate-500">({reviewCount} reviews)</span>
              </>
            ) : (
              <>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-400">★ —</span>
                <span className="normal-case italic tracking-normal text-slate-400">No reviews yet</span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">{priceText}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-brand/60">Reservation-ready</p>
          </div>
        </div>
      </Link>
    </article>
  );
};
