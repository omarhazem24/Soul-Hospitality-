import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bath, BedDouble, ChevronLeft, ChevronRight, MapPin, Users } from 'lucide-react';
import { fetchAvailableUnits } from '../api/http.js';
import { BrandWordmark } from '../components/layout/BrandWordmark.jsx';
import { SearchCapsule } from '../components/search/SearchCapsule.jsx';

const FEATURED_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80';

const HERO_BACKGROUND_IMAGE =
  'https://res.cloudinary.com/zqhyzmvl/image/upload/v1783598439/egypt_Alamein_min_94ac5d1ba1_udlv2p_y4qxtj.jpg';

const normalizePrice = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const numericValue = Number(value.replace(/[^0-9.]/g, ''));
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  return 0;
};

const destinations = [
  {
    title: 'Gaia',
    image:
      'https://res.cloudinary.com/zqhyzmvl/image/upload/v1783598436/images_7_hrp0i0_irwb5q.jpg'
  },
  {
    title: 'Fouka Bay',
    image:
      'https://res.cloudinary.com/zqhyzmvl/image/upload/v1783598349/Fouka-Bay-North-Coast-Sales-Number_hstdjw_lwipn1.jpg'
  },
  {
    title: 'Marassi',
    image:
      'https://res.cloudinary.com/zqhyzmvl/image/upload/v1783598434/573800842_ogt6bf_y7bfjh.jpg'
  },
  {
    title: 'North Coast',
    image:
      'https://res.cloudinary.com/zqhyzmvl/image/upload/v1783598439/getimage_vfm9cs_n65a6n.jpg'
  },
  {
    title: 'Ain Sokhna',
    image:
      'https://res.cloudinary.com/zqhyzmvl/image/upload/v1783598437/porto-sokhna-beach-resort-servicios-12e06d36_ofqyg1_kaq1yt.jpg'
  },
  {
    title: 'Cairo',
    image:
      'https://res.cloudinary.com/zqhyzmvl/image/upload/v1783598436/caption_cs2of8_t2joik.jpg'
  },
  {
    title: 'Gouna',
    image:
      'https://res.cloudinary.com/zqhyzmvl/image/upload/v1783598436/istockphoto-2215303116-612x612_q3pimv_tj5qtd.jpg'
  }
];

const occasionCards = [
  {
    title: 'Summer Luxury',
    eyebrow: 'North Coast',
    image:
      'https://res.cloudinary.com/zqhyzmvl/image/upload/v1783598356/photo-chalet-for-rent-fouka-bay-ras-el-hikma-fukah-1_smjdx7_eax36v.jpg'
  },
  {
    title: 'Beach Escape',
    eyebrow: 'Ain Sokhna',
    image:
      'https://res.cloudinary.com/zqhyzmvl/image/upload/v1783598352/caption_1_agfags_f9thxc.jpg'
  },
  {
    title: 'City Living',
    eyebrow: 'Down Town',
    image:
      'https://res.cloudinary.com/zqhyzmvl/image/upload/v1783598355/kumoe2eogmkbqlgv0849_zlzb9v.jpg'
  }
];

export const Home = () => {
  const [units, setUnits] = useState([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [visibleFeaturedCards, setVisibleFeaturedCards] = useState(3);

  useEffect(() => {
    let mounted = true;

    const loadFeaturedUnits = async () => {
      try {
        const response = await fetchAvailableUnits({ sort: 'featured' });
        const payload = response?.data || response || [];

        if (mounted) {
          setUnits(Array.isArray(payload) ? payload : []);
        }
      } catch {
        if (mounted) {
          setUnits([]);
        }
      }
    };

    loadFeaturedUnits();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const updateVisibleCards = () => {
      if (window.innerWidth >= 1024) {
        setVisibleFeaturedCards(3);
        return;
      }

      if (window.innerWidth >= 768) {
        setVisibleFeaturedCards(2);
        return;
      }

      setVisibleFeaturedCards(1);
    };

    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);

    return () => {
      window.removeEventListener('resize', updateVisibleCards);
    };
  }, []);

  const featuredDestinationSlides = useMemo(() => {
    const byProjectName = new Map();

    units.forEach((unit) => {
      const projectName = String(unit?.projectName || '').trim();

      if (!projectName) {
        return;
      }

      const projectKey = projectName.toLowerCase();

      if (!byProjectName.has(projectKey)) {
        byProjectName.set(projectKey, {
          projectName,
          units: []
        });
      }

      byProjectName.get(projectKey).units.push(unit);
    });

    return Array.from(byProjectName.entries()).map(([projectKey, projectBucket]) => {
      const randomUnit =
        projectBucket.units[Math.floor(Math.random() * projectBucket.units.length)];

      return {
        id: randomUnit?._id || `${projectKey}-slide`,
        title: randomUnit?.name || randomUnit?.title || projectBucket.projectName,
        destination: projectBucket.projectName,
        viewType: randomUnit?.view || randomUnit?.viewType || 'Premium View',
        image:
          randomUnit?.photos?.[0] ||
          randomUnit?.images?.[0] ||
          FEATURED_FALLBACK_IMAGE,
        rate: normalizePrice(randomUnit?.pricePerNight ?? randomUnit?.price),
        bedrooms: Number(randomUnit?.bedrooms || randomUnit?.bedroom_count || 0),
        bathrooms: Number(randomUnit?.bathrooms || randomUnit?.bathroom_count || 0),
        guests: Number(randomUnit?.maxGuests || randomUnit?.guests || randomUnit?.capacity || 0),
      };
    });
  }, [units]);

  useEffect(() => {
    if (featuredDestinationSlides.length <= 1) {
      setFeaturedIndex(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setFeaturedIndex((current) => (current + 1) % featuredDestinationSlides.length);
    }, 7000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [featuredDestinationSlides]);

  useEffect(() => {
    if (featuredDestinationSlides.length <= 1) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      const target = event.target;
      const targetTag = target?.tagName?.toLowerCase?.();

      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
        return;
      }

      if (event.key === 'ArrowLeft') {
        handlePrevFeatured();
      }

      if (event.key === 'ArrowRight') {
        handleNextFeatured();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [featuredDestinationSlides.length]);

  const handleNextFeatured = () => {
    if (featuredDestinationSlides.length === 0) {
      return;
    }

    setFeaturedIndex((current) => (current + 1) % featuredDestinationSlides.length);
  };

  const handlePrevFeatured = () => {
    if (featuredDestinationSlides.length === 0) {
      return;
    }

    setFeaturedIndex(
      (current) =>
        (current - 1 + featuredDestinationSlides.length) %
        featuredDestinationSlides.length,
    );
  };

  const featuredTrackCards = useMemo(() => {
    if (featuredDestinationSlides.length === 0) {
      return [];
    }

    const slots = Math.min(visibleFeaturedCards, featuredDestinationSlides.length);

    return Array.from({ length: slots }, (_, offset) => {
      const nextIndex = (featuredIndex + offset) % featuredDestinationSlides.length;
      return featuredDestinationSlides[nextIndex];
    });
  }, [featuredDestinationSlides, featuredIndex, visibleFeaturedCards]);

  return (
    <main className="bg-white">
      <section className="relative isolate overflow-visible border-b border-slate-200 min-h-[78vh] md:min-h-[500px] lg:h-[55vh] lg:min-h-[500px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BACKGROUND_IMAGE})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/28 to-black/12" aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.35))]" aria-hidden="true" />

        <div className="relative z-30 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-8 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-10 lg:pb-10 lg:pt-10 2xl:gap-12">
          <div className="flex w-full flex-col items-start gap-6 md:w-1/2 md:gap-8">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white">Soul Hospitality</p>
            <div className="max-w-3xl space-y-4">
              <h1 className="text-[2rem] font-semibold leading-[1.08] tracking-[0.1em] text-white sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl">
                Discover Your Next Vacation.
              </h1>
              <p className="max-w-2xl text-sm font-medium leading-6 text-white sm:text-base md:text-lg md:leading-7 2xl:text-xl 2xl:leading-8">
                Reserve elevated homes, coastal escapes, and signature city stays with a frictionless search flow built for confident planning.
              </p>
            </div>
          </div>

          <div className="w-full md:ml-auto md:w-[460px] md:max-w-[460px] md:flex-shrink-0 md:translate-x-10 lg:translate-x-12">
            <SearchCapsule />
          </div>
        </div>

      </section>

      <section className="page-container py-14 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-brand/65">EXPLORE SOUL</p>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.15] tracking-[0.14em] text-brand md:text-5xl">
            Find Your SOUL
          </h2>
        </div>

        <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:gap-5">
          {destinations.map((destination) => (
            <Link
              key={destination.title}
              to="/units"
              className="group relative min-w-[15rem] snap-start overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 no-underline shadow-[0_18px_70px_rgba(40,63,94,0.1)] md:min-w-[22rem]"
            >
              <img src={destination.image} alt={destination.title} className="h-[22rem] w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:h-[28rem]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0)_35%,rgba(2,6,23,0.78)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                <p className="text-base font-semibold uppercase tracking-[0.14em] text-white sm:text-lg">{destination.title}</p>
                <span className="mt-2 inline-flex text-xs font-medium uppercase tracking-[0.18em] text-white/85">
                  Explore Stays →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-14 w-full overflow-hidden">
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-brand/65 2xl:text-sm">Premium Featured Slideshow</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevFeatured}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-brand transition hover:border-brand/35 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283f5e]/45"
                aria-label="Previous featured cards"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextFeatured}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-brand transition hover:border-brand/35 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283f5e]/45"
                aria-label="Next featured cards"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex w-full flex-wrap gap-3 2xl:gap-5">
            {featuredTrackCards.length === 0 ? (
              <div className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center text-sm font-medium tracking-[0.08em] text-brand/65 2xl:text-base">
                No featured units with a project name are available right now.
              </div>
            ) : featuredTrackCards.map((card) => {
              const priceLabel = card.rate > 0
                ? `EGP ${card.rate.toLocaleString()} /night`
                : 'Price on request';

              return (
              <article
                key={card.id}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] rounded-3xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(40,63,94,0.08)]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-3xl">
                  <img src={card.image} alt={card.destination} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0)_30%,rgba(2,6,23,0.78)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 bg-slate-950/45 px-3 py-2 backdrop-blur-sm">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-white">Nightly Rate</p>
                    <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                      {priceLabel}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 p-3">
                  <div className="space-y-2">
                    <p className="text-base font-semibold leading-tight tracking-[0.06em] text-brand 2xl:text-lg">{card.title}</p>
                    <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brand/60 2xl:text-xs">
                      <MapPin className="h-3.5 w-3.5" />
                      {card.destination} | {card.viewType}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-brand/70">
                    <span className="inline-flex items-center gap-1.5">
                      <BedDouble className="h-3.5 w-3.5" />
                      {card.bedrooms || 0} Bed
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Bath className="h-3.5 w-3.5" />
                      {card.bathrooms || 0} Bath
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {card.guests || 0} Guests
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      to="/units"
                      className="inline-flex items-center justify-center rounded-full bg-[#283f5e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white no-underline transition-all duration-300 ease-out hover:bg-[#1e3047] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283f5e]/45"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="page-container grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative flex h-[22rem] items-center justify-center overflow-hidden md:h-[28rem]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(40,63,94,0.12),transparent_64%)]" />
            <div className="animate-float relative px-5 py-6">
              <BrandWordmark className="h-72 max-w-full w-auto opacity-100 md:h-80" />
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-brand/65">Who We Are?</p>
              <p className="max-w-2xl text-sm font-semibold uppercase tracking-[0.22em] text-brand/75 md:text-base">
                Soul Hospitality - A Modern Hospitality & Apartment Living Brand
              </p>
              <p className="max-w-3xl text-base leading-9 text-brand/75 md:text-lg">
                Soul Hospitality specializes in offering fully furnished, well-designed apartments tailored for business, leisure, and long-term stays. With a focus on prime locations, modern interiors, and dependable service, we provide guests with a seamless home-away-from-home experience.
              </p>
            </div>

            <Link
              to="/about-soul"
              className="inline-flex items-center justify-center rounded-full bg-[#283f5e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white no-underline transition-all duration-300 ease-out hover:bg-[#1e3047] hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283f5e]/45 active:translate-y-0 active:scale-[0.98]"
            >
              More Information
            </Link>
          </div>
        </div>
      </section>

      <section className="page-container py-16 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-brand/65">Our Top Pick</p>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.15] tracking-[0.14em] text-brand md:text-5xl">
            Step Inside Our Exclusive Collection of Unforgettable Stays
          </h2>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-[0_18px_70px_rgba(40,63,94,0.08)] transition-transform duration-700 ease-out hover:scale-[1.03] hover:rotate-1">
            <img
              src="https://res.cloudinary.com/zqhyzmvl/image/upload/v1783598439/getimage_vfm9cs_n65a6n.jpg"
              alt="Sea view escape"
              className="h-[34rem] w-full object-cover"
            />
            <div className="animate-float absolute left-5 top-5 rounded-2xl border border-white/30 bg-[#283f5e]/90 px-4 py-3 text-white shadow-xl backdrop-blur-sm">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/75">Featured Stay</p>
              <p className="mt-1 text-xl font-semibold uppercase tracking-[0.12em]">Sea View Escape</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/80">North Coast</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-brand/65">Book With Us Today</p>
              <h3 className="text-3xl font-semibold leading-[1.18] tracking-[0.14em] text-brand md:text-5xl">
                Seize the Moment. Secure Your Dream Stay.
              </h3>
              <p className="max-w-2xl text-base leading-9 text-brand/75 md:text-lg">
                Our coastal rentals are curated for effortless resets, elegant group travel, and memorable weekends shaped by calm interiors, private service, and reliable booking clarity.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['12+', 'Destinations'],
                ['550+', 'Luxury Units'],
                ['20K', 'Members']
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_50px_rgba(40,63,94,0.06)]">
                  <p className="text-2xl font-semibold text-brand">{value}</p>
                  <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-brand/60">{label}</p>
                </div>
              ))}
            </div>

            <Link
              to="/units"
              className="inline-flex items-center justify-center rounded-full bg-[#283f5e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white no-underline transition-all duration-300 ease-out hover:bg-[#1e3047] hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283f5e]/45 active:translate-y-0 active:scale-[0.98]"
            >
              Explore Rentals →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="page-container">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-brand/65">STAY YOUR WAY</p>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.15] tracking-[0.14em] text-brand md:text-5xl">
              Find the Perfect Rental for Any Occasion or Need
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
            <Link to="/units" className="relative overflow-hidden rounded-3xl border border-slate-200 no-underline shadow-[0_18px_70px_rgba(40,63,94,0.08)]">
              <img
                src={occasionCards[0].image}
                alt={occasionCards[0].title}
                className="h-[36rem] w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03] hover:rotate-1"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.02)_20%,rgba(2,6,23,0.78)_100%)]" />
              <div className="animate-float absolute left-5 top-5 rounded-2xl border border-white/70 bg-black/20 px-4 py-3 shadow-xl backdrop-blur-sm">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white">Summer Luxury</p>
                <p className="mt-1 text-xl font-semibold uppercase tracking-[0.14em] text-white">North Coast</p>
              </div>
            </Link>

            <div className="grid gap-6">
              {occasionCards.slice(1).map((card) => (
                <Link key={card.title} to="/units" className="relative overflow-hidden rounded-3xl border border-slate-200 no-underline shadow-[0_18px_70px_rgba(40,63,94,0.08)] transition-transform duration-700 ease-out hover:scale-[1.03] hover:rotate-1">
                  <img src={card.image} alt={card.title} className="h-[17rem] w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03] hover:rotate-1" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.02)_26%,rgba(2,6,23,0.76)_100%)]" />
                  <div className="animate-float absolute left-5 top-5 rounded-2xl border border-white/70 bg-black/20 px-4 py-3 shadow-xl backdrop-blur-sm">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white">{card.title}</p>
                    <p className="mt-1 text-xl font-semibold uppercase tracking-[0.14em] text-white">{card.eyebrow}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-16 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-brand/65">Our Partners</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-16 md:gap-28 mt-12 mb-16 px-6 w-full">
          <img
            src="https://res.cloudinary.com/zqhyzmvl/image/upload/v1783598502/Tatweer-Misr_hsef4n.jpg"
            alt="Tatweer Misr"
            className="h-24 md:h-32 w-auto object-contain mix-blend-multiply filter contrast-125 transition-transform duration-300 hover:scale-105"
          />
          <img
            src="https://res.cloudinary.com/zqhyzmvl/image/upload/v1783599010/Sabbour_vltdyo_qhonjk.jpg"
            alt="Sabbour"
            className="h-24 md:h-32 w-auto object-contain mix-blend-multiply filter contrast-125 transition-transform duration-300 hover:scale-105"
          />
          <img
            src="https://res.cloudinary.com/zqhyzmvl/image/upload/v1783599010/Palm-Hills_xzxavy_svyitt.jpg"
            alt="Palm Hills"
            className="h-24 md:h-32 w-auto object-contain mix-blend-multiply filter contrast-125 transition-transform duration-300 hover:scale-105"
          />
          <img
            src="https://res.cloudinary.com/zqhyzmvl/image/upload/v1783598501/images_2_ykgdfp.jpg"
            alt="Mountain View"
            className="h-24 md:h-32 w-auto object-contain mix-blend-multiply filter contrast-125 transition-transform duration-300 hover:scale-105"
          />
          <img
            src="https://res.cloudinary.com/zqhyzmvl/image/upload/v1783598502/Emaar-Properties_rbhrww.png"
            alt="Emaar"
            className="h-24 md:h-32 w-auto object-contain mix-blend-multiply filter contrast-125 transition-transform duration-300 hover:scale-105"
          />
        </div>
      </section>
    </main>
  );
};
