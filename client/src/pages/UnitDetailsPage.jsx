import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Bath, Bed, Building2, Calendar, Check, ChevronLeft, ChevronRight, LoaderCircle, MapPin, Maximize2 } from 'lucide-react';
import { createUnitReview, fetchUnitDetails, fetchUnitReviews } from '../api/http.js';
import BookingDrawer from '../components/booking/BookingDrawer.jsx';
import AddReviewForm from '../components/reviews/AddReviewForm.jsx';
import UnitReviewsDisplay from '../components/reviews/UnitReviewsDisplay.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { BOOKING_POLICIES } from '../constants/bookingPolicies.js';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80';

const toList = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  return [];
};

const formatPrice = (value) => `EGP ${Number(value || 0).toLocaleString()}`;

const getDynamicHousekeepingFee = (unit) => {
  const propertyType = String(unit?.propertyType || unit?.type || '').trim().toLowerCase();
  return propertyType === 'villa' ? 2500 : 1500;
};

const getBeachAccessDays = (unit) => {
  const rawValue = Number(unit?.beachAccessDays ?? unit?.beach_access_days ?? 7);
  return Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 7;
};

const getConfiguredBeachAccessPrice = (unit) => Number(
  unit?.beachAccessPricePerPersonPerWeek ??
  unit?.beachAccessPricePerPerson ??
  unit?.beach_access_price_per_person_per_week ??
  unit?.beach_access_price_per_person ??
  unit?.beachAccessPrice ??
  500
);

const isGaiaUnit = (unit) => String(
  unit?.projectName ??
  unit?.destination ??
  unit?.location ??
  ''
).trim().toLowerCase() === 'gaia';

const getBeachAccessPrice = (unit) => {
  const beachAccessDays = getBeachAccessDays(unit);

  if (isGaiaUnit(unit) && beachAccessDays > 3) {
    return 3500;
  }

  return getConfiguredBeachAccessPrice(unit);
};

const getBeachAccessExtraGuestPrice = (unit, fallbackPrice) => Number(
  unit?.beachAccessExtraGuestPricePerPerson ??
  unit?.beach_access_extra_guest_price_per_person ??
  fallbackPrice
);

const getFormattedMapUrl = (url) => {
  if (!url) return '#';

  const cleanUrl = String(url).trim();

  if (/^https?:\/\//i.test(cleanUrl)) {
    return cleanUrl;
  }

  return `https://${cleanUrl}`;
};

const MetadataItem = ({ icon: Icon, label, value }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
    <Icon className="h-4 w-4 text-[#283f5e]" strokeWidth={1.8} aria-hidden="true" />
    <span className="font-medium text-slate-500">{label}:</span>
    <span className="font-semibold text-slate-800">{value}</span>
  </div>
);

const formatBeachAccessSummary = (basePrice, extraGuestPrice) => {
  if (Number(extraGuestPrice) > 0 && Number(extraGuestPrice) !== Number(basePrice)) {
    return `${formatPrice(basePrice)} base, ${formatPrice(extraGuestPrice)} extra guest`;
  }

  return `${formatPrice(basePrice)} per guest`;
};

const TokenGrid = ({ items, icon: Icon }) => (
  <div className="grid gap-3 sm:grid-cols-2">
    {items.map((item) => (
      <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#283f5e]/10 text-[#283f5e]">
          <Icon className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <span className="text-sm leading-6 text-slate-600">{item}</span>
      </div>
    ))}
  </div>
);

export default function UnitDetailsPage() {
  const location = useLocation();
  const { unitId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [unit, setUnit] = useState(location.state?.unit || null);
  const [loading, setLoading] = useState(!location.state?.unit);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [fullscreenPhotoOpen, setFullscreenPhotoOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadUnit = async () => {
      if (!unitId) {
        setError('Unit identifier is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const payload = await fetchUnitDetails(unitId);

        if (mounted) {
          setUnit(payload);
        }
      } catch (fetchError) {
        if (mounted) {
          setError(fetchError.message);
          setUnit(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUnit();

    return () => {
      mounted = false;
    };
  }, [unitId]);

  useEffect(() => {
    let mounted = true;

    const loadReviews = async () => {
      if (!unitId) {
        return;
      }

      setReviewsLoading(true);
      setReviewsError('');

      try {
        const payload = await fetchUnitReviews(unitId);

        if (mounted) {
          setReviews(Array.isArray(payload) ? payload : []);
        }
      } catch (fetchError) {
        if (mounted) {
          setReviews([]);
          setReviewsError(fetchError.message || 'Unable to load reviews right now.');
        }
      } finally {
        if (mounted) {
          setReviewsLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      mounted = false;
    };
  }, [unitId]);

  const normalizedUnit = useMemo(() => unit || {}, [unit]);
  const title = normalizedUnit.name || normalizedUnit.title || 'Premium Residence';
  const projectName = normalizedUnit.projectName || normalizedUnit.location || 'Prime Location';
  const photos = toList(normalizedUnit.photos);
  const gallery = photos.length > 0 ? photos : [DEFAULT_IMAGE];
  const amenities = toList(normalizedUnit.amenities);
  const facilities = toList(normalizedUnit.facilities);
  const bedrooms = normalizedUnit.bedrooms ?? normalizedUnit.bedroom_count ?? 0;
  const bathrooms = normalizedUnit.bathrooms ?? normalizedUnit.bathroom_count ?? 0;
  const area = normalizedUnit.area ?? normalizedUnit.area_m2 ?? 0;
  const pricePerNight = normalizedUnit.pricePerNight ?? normalizedUnit.price ?? 0;
  const housekeepingMandatoryPrice = getDynamicHousekeepingFee(normalizedUnit);
  const rawBeachAccessPrice = getBeachAccessPrice(normalizedUnit);
  const beachAccessPricePerPersonPerWeek = rawBeachAccessPrice > 0 ? rawBeachAccessPrice : 500;
  const beachAccessDays = getBeachAccessDays(normalizedUnit);
  const beachAccessExtraGuestPricePerPerson = getBeachAccessExtraGuestPrice(normalizedUnit, getConfiguredBeachAccessPrice(normalizedUnit));
  const beachAccessGuestPricingSummary = formatBeachAccessSummary(
    beachAccessPricePerPersonPerWeek,
    beachAccessExtraGuestPricePerPerson
  );
  const locationLink = normalizedUnit.location_link || normalizedUnit.locationUrl || normalizedUnit.location_url || normalizedUnit.locationLink || '#';
  const openMaps = () => {
    const mapUrl = getFormattedMapUrl(locationLink);

    if (mapUrl && mapUrl !== '#') {
      window.open(mapUrl, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    setActivePhotoIndex(0);
    setFullscreenPhotoOpen(false);
  }, [gallery.length]);

  useEffect(() => {
    if (!fullscreenPhotoOpen) {
      return undefined;
    }

    const showPrevPhoto = () => {
      setActivePhotoIndex((current) => (
        (current - 1 + gallery.length) % gallery.length
      ));
    };

    const showNextPhoto = () => {
      setActivePhotoIndex((current) => (
        (current + 1) % gallery.length
      ));
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setFullscreenPhotoOpen(false);
        return;
      }

      if (gallery.length <= 1) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        showPrevPhoto();
      }

      if (event.key === 'ArrowRight') {
        showNextPhoto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenPhotoOpen, gallery.length]);

  const activePhoto = gallery[activePhotoIndex] || gallery[0] || DEFAULT_IMAGE;

  const handleReviewSubmit = async ({ rating, comment }) => {
    if (!unitId || !isAuthenticated) {
      return false;
    }

    setReviewSubmitting(true);
    setReviewsError('');

    try {
      const createdReview = await createUnitReview(unitId, {
        rating,
        comment,
        guestName: user?.name
      });

      setReviews((current) => [createdReview, ...current]);
      setUnit((current) => {
        if (!current) {
          return current;
        }

        const previousCount = Number(current.reviewCount || 0);
        const previousAverage = Number(current.averageRating || 0);
        const nextCount = previousCount + 1;
        const nextAverage = ((previousAverage * previousCount) + Number(rating || 0)) / nextCount;

        return {
          ...current,
          reviewCount: nextCount,
          averageRating: Number(nextAverage.toFixed(2))
        };
      });

      return true;
    } catch (submitError) {
      setReviewsError(submitError.message || 'Could not submit your review. Please try again.');
      return false;
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="page-container py-16">
        <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.8} aria-hidden="true" />
            Loading premium residence details...
          </div>
        </div>
      </main>
    );
  }

  if (error || !unit) {
    return (
      <main className="page-container py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          {error || 'This property could not be found.'}
        </div>
      </main>
    );
  }

  return (
    <main className="page-container py-12 lg:py-16 2xl:py-20">
      <section className="space-y-10">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-start 2xl:gap-14">
          <div className="space-y-8">
            <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-slate-100 shadow-xl">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFullscreenPhotoOpen(true)}
                  className="block w-full cursor-zoom-in"
                  aria-label="Open photo fullscreen"
                >
                  <img src={activePhoto} alt={`${title} slide ${activePhotoIndex + 1}`} className="relative z-0 h-[520px] w-full object-cover" />
                </button>

                {gallery.length > 1 ? (
                  <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-950/50 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                    <span>{activePhotoIndex + 1}</span>
                    <span className="opacity-60">/</span>
                    <span>{gallery.length}</span>
                  </div>
                ) : null}
              </div>

              {gallery.length > 1 ? (
                <div className="grid gap-3 border-t border-white/70 bg-white/85 p-4 sm:grid-cols-5">
                  {gallery.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActivePhotoIndex(index)}
                      className={`overflow-hidden rounded-2xl border-2 transition-all ${
                        index === activePhotoIndex ? 'border-[#283f5e] shadow-lg' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                      aria-label={`Show photo ${index + 1}`}
                    >
                      <img src={image || DEFAULT_IMAGE} alt={`${title} thumbnail ${index + 1}`} className="h-20 w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-5">
              <div className="space-y-3">
                <h1 className="font-serif text-3xl font-bold text-slate-900 lg:text-4xl 2xl:text-6xl">{title}</h1>
                <div className="flex flex-wrap gap-3">
                  <MetadataItem icon={Bed} label="Bedrooms" value={bedrooms} />
                  <MetadataItem icon={Bath} label="Bathrooms" value={bathrooms} />
                  <MetadataItem icon={Maximize2} label="Area Size (Sqm)" value={area} />
                  <MetadataItem icon={Building2} label="Beach Access" value={beachAccessGuestPricingSummary} />
                  <MetadataItem icon={Calendar} label="Beach Access Period" value={`${beachAccessDays} ${beachAccessDays === 1 ? 'day' : 'days'}`} />
                </div>
                <button
                  type="button"
                  onClick={openMaps}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#283f5e] shadow-sm transition-all duration-300 ease-out hover:border-[#283f5e] hover:bg-[#283f5e] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283f5e]/35 active:scale-[0.98] group sm:w-auto"
                >
                  <MapPin className="h-4 w-4 text-[#283f5e] group-hover:text-white transition-colors duration-200" strokeWidth={2.5} aria-hidden="true" />
                  <span>View on Google Maps</span>
                </button>
              </div>

              <div className="space-y-4">
                <p className="font-sans text-sm leading-relaxed text-slate-600 2xl:text-base 2xl:leading-8">{normalizedUnit.description || 'A premium residence designed for refined stays, quiet luxury, and a balanced reservation experience.'}</p>

                <div className="space-y-3">
                  <h2 className="font-serif text-2xl font-bold text-slate-900 2xl:text-3xl">Amenities</h2>
                  {amenities.length > 0 ? (
                    <TokenGrid items={amenities} icon={Check} />
                  ) : (
                    <p className="text-sm text-slate-500">No amenities have been listed for this residence.</p>
                  )}
                </div>

                <div className="space-y-3">
                  <h2 className="font-serif text-2xl font-bold text-slate-900 2xl:text-3xl">Facilities</h2>
                  {facilities.length > 0 ? (
                    <TokenGrid items={facilities} icon={Building2} />
                  ) : (
                    <p className="text-sm text-slate-500">No facilities have been listed for this residence.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="sticky top-28 flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl 2xl:p-8">
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Reservation</p>
              <div className="text-3xl font-bold text-slate-900 2xl:text-4xl">{formatPrice(pricePerNight)}</div>
              <p className="text-sm text-slate-500 2xl:text-base">Housekeeping Fee: {formatPrice(housekeepingMandatoryPrice)} (mandatory)</p>
              <p className="text-sm text-slate-500 2xl:text-base">Beach Access: {beachAccessGuestPricingSummary} / {beachAccessDays} {beachAccessDays === 1 ? 'day' : 'days'}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-bold text-slate-900 2xl:text-base">Booking Policies</h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-600 2xl:text-sm">
                {BOOKING_POLICIES.map((policy) => (
                  <li key={policy} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#283f5e]" />
                    <span>{policy}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setBookingDrawerOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-[#283f5e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-all duration-300 ease-out hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283f5e]/45"
            >
              Reserve this unit
            </button>
          </aside>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            {isAuthenticated ? (
              <AddReviewForm onSubmit={handleReviewSubmit} submitting={reviewSubmitting} />
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
                Please sign in to submit a review for this unit.
              </div>
            )}
          </div>

          <UnitReviewsDisplay
            reviews={reviews}
            loading={reviewsLoading}
            error={reviewsError}
            unitAverageRating={normalizedUnit.averageRating}
            unitReviewCount={normalizedUnit.reviewCount}
          />
        </div>
      </section>
      <BookingDrawer open={bookingDrawerOpen} onClose={() => setBookingDrawerOpen(false)} unit={normalizedUnit} />
      {fullscreenPhotoOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/95 px-4 py-8 backdrop-blur-sm">
          <button
            type="button"
            className="absolute inset-0 cursor-zoom-out"
            onClick={() => setFullscreenPhotoOpen(false)}
            aria-label="Close fullscreen photo"
          />

          <div className="relative z-[61] flex max-h-full max-w-7xl flex-col gap-4">
            <div className="flex items-center justify-between gap-4 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Photo Viewer</p>
                <h3 className="mt-1 font-serif text-2xl font-bold">{title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setFullscreenPhotoOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Close fullscreen photo"
              >
                <Maximize2 className="h-5 w-5 rotate-45" strokeWidth={2.2} aria-hidden="true" />
              </button>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl">
              <img src={activePhoto} alt={`${title} fullscreen slide ${activePhotoIndex + 1}`} className="max-h-[82vh] w-full object-contain" />

              {gallery.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setActivePhotoIndex((current) => ((current - 1 + gallery.length) % gallery.length))}
                    className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition-colors hover:bg-black/55"
                    aria-label="Show previous photo"
                  >
                    <ChevronLeft className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePhotoIndex((current) => ((current + 1) % gallery.length))}
                    className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition-colors hover:bg-black/55"
                    aria-label="Show next photo"
                  >
                    <ChevronRight className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
                  </button>
                </>
              ) : null}
            </div>

            {gallery.length > 1 ? (
              <div className="grid gap-3 sm:grid-cols-5">
                {gallery.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActivePhotoIndex(index)}
                    className={`overflow-hidden rounded-2xl border-2 transition-all ${
                      index === activePhotoIndex ? 'border-white shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`Show fullscreen photo ${index + 1}`}
                  >
                    <img src={image || DEFAULT_IMAGE} alt={`${title} fullscreen thumbnail ${index + 1}`} className="h-20 w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
