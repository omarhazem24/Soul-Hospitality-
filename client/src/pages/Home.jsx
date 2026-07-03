import React from 'react';
import { Link } from 'react-router-dom';
import { BrandWordmark } from '../components/layout/BrandWordmark.jsx';
import { SearchCapsule } from '../components/search/SearchCapsule.jsx';

const destinations = [
  {
    title: 'Gaia',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Fouka Bay',
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Marassi',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'North Coast',
    image:
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80'
  }
];

const occasionCards = [
  {
    title: 'Summer Luxury',
    eyebrow: 'North Coast',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80'
  },
  {
    title: 'Beach Escape',
    eyebrow: 'Ain Sokhna',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80'
  },
  {
    title: 'City Living',
    eyebrow: 'Down Town',
    image:
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80'
  }
];

export const Home = () => {
  return (
    <main className="bg-white">
      <section className="relative overflow-visible border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,252,0.72),rgba(255,255,255,1))]" />
        <div className="absolute inset-x-0 top-0 h-[72vh] bg-[radial-gradient(circle_at_top_left,rgba(40,63,94,0.14),transparent_28%),radial-gradient(circle_at_right,rgba(15,76,92,0.12),transparent_26%)]" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-30">
          <div className="lg:col-span-7 flex flex-col items-start gap-8">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-brand/70">Soul Hospitality</p>
            <div className="max-w-4xl space-y-5">
              <h1 className="text-4xl font-semibold leading-[1.05] tracking-[0.18em] text-brand md:text-6xl lg:text-7xl">
                From booking to your final stroll, Enjoy with Soul.
              </h1>
              <p className="max-w-2xl text-base font-medium leading-8 text-brand/78 md:text-lg">
                Unlock Your Dream Destination: Reserve Remarkable Rentals Today!
              </p>
            </div>

            <div className="relative flex h-[28rem] w-[28rem] items-center justify-center md:h-[34rem] md:w-[34rem]">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(40,63,94,0.18),rgba(40,63,94,0.04)_62%,rgba(255,255,255,0)_72%)]" />
              <div className="absolute inset-14 rounded-full border border-slate-200 bg-white shadow-[0_20px_50px_rgba(40,63,94,0.15)]" />
              <div className="relative text-center">
                <BrandWordmark className="h-32 w-auto md:h-40" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 w-full">
            <SearchCapsule />
          </div>
        </div>
      </section>

      <section className="page-container py-16 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-brand/65">EXPLORE SOUL</p>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.15] tracking-[0.14em] text-brand md:text-5xl">
            Discover Your Next Vacation - Handpicked premium destinations across Egypt
          </h2>
        </div>

        <div className="mt-10 flex gap-5 overflow-x-auto pb-2">
          {destinations.map((destination) => (
            <Link
              key={destination.title}
              to="/units"
              className="group relative min-w-[18rem] overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 no-underline shadow-[0_18px_70px_rgba(40,63,94,0.1)] md:min-w-[22rem]"
            >
              <img src={destination.image} alt={destination.title} className="h-[28rem] w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0)_35%,rgba(2,6,23,0.78)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-lg font-semibold uppercase tracking-[0.14em] text-white">{destination.title}</p>
                <span className="mt-2 inline-flex text-xs font-medium uppercase tracking-[0.18em] text-white/85">
                  Explore Stays →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="page-container grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex justify-center lg:justify-start">
            <div className="relative flex h-[24rem] w-[24rem] items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_20px_50px_rgba(40,63,94,0.15)] md:h-[30rem] md:w-[30rem]">
              <div className="absolute inset-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(40,63,94,0.14),transparent_64%)]" />
              <BrandWordmark className="relative h-32 w-auto md:h-40" />
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
              className="inline-flex rounded-full bg-[#283f5e] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white no-underline transition-all duration-300 ease-out hover:bg-[#1e3047] hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
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
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80"
              alt="Sea view escape"
              className="h-[34rem] w-full object-cover"
            />
            <div className="animate-float absolute left-5 top-5 rounded-2xl border border-white/30 bg-[#283f5e]/90 px-4 py-3 text-white shadow-xl backdrop-blur-sm">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/75">Featured Stay</p>
              <p className="mt-1 text-xl font-semibold uppercase tracking-[0.12em]">Sea View Escape</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/80">North Coast - Ain Sokhna</p>
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
              className="inline-flex rounded-full bg-[#283f5e] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white no-underline transition-all duration-300 ease-out hover:bg-[#1e3047] hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
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
              <div className="animate-float absolute left-5 top-5 rounded-2xl border border-white/25 bg-white/95 px-4 py-3 shadow-xl">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-brand/55">Summer Luxury</p>
                <p className="mt-1 text-xl font-semibold uppercase tracking-[0.14em] text-brand">North Coast</p>
              </div>
            </Link>

            <div className="grid gap-6">
              {occasionCards.slice(1).map((card) => (
                <Link key={card.title} to="/units" className="relative overflow-hidden rounded-3xl border border-slate-200 no-underline shadow-[0_18px_70px_rgba(40,63,94,0.08)] transition-transform duration-700 ease-out hover:scale-[1.03] hover:rotate-1">
                  <img src={card.image} alt={card.title} className="h-[17rem] w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03] hover:rotate-1" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.02)_26%,rgba(2,6,23,0.76)_100%)]" />
                  <div className="animate-float absolute left-5 top-5 rounded-2xl border border-white/25 bg-white/95 px-4 py-3 shadow-xl">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-brand/55">{card.title}</p>
                    <p className="mt-1 text-xl font-semibold uppercase tracking-[0.14em] text-brand">{card.eyebrow}</p>
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
            src="https://res.cloudinary.com/ukaklyhf/image/upload/v1783004693/Tatweer-Misr_ypl2nx.jpg"
            alt="Tatweer Misr"
            className="h-24 md:h-32 w-auto object-contain mix-blend-multiply filter contrast-125 transition-transform duration-300 hover:scale-105"
          />
          <img
            src="https://res.cloudinary.com/ukaklyhf/image/upload/v1783004693/Sabbour_fuwjub.jpg"
            alt="Sabbour"
            className="h-24 md:h-32 w-auto object-contain mix-blend-multiply filter contrast-125 transition-transform duration-300 hover:scale-105"
          />
          <img
            src="https://res.cloudinary.com/ukaklyhf/image/upload/v1783004872/Palm-Hills_tlwsja.jpg"
            alt="Palm Hills"
            className="h-24 md:h-32 w-auto object-contain mix-blend-multiply filter contrast-125 transition-transform duration-300 hover:scale-105"
          />
        </div>
      </section>
    </main>
  );
};
