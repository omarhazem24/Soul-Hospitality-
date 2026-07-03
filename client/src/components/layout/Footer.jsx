import React from 'react';
import { BrandWordmark } from './BrandWordmark.jsx';

export const Footer = () => {
  return (
    <footer className="mt-16 bg-[#172331] text-white">
      <div className="page-container py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div className="space-y-4">
            <BrandWordmark inverse />
            <p className="max-w-md text-sm leading-7 text-white/75">
              Boutique hospitality curated with premium restraint, direct booking clarity, and a calm editorial luxury tone.
            </p>
            <div className="space-y-2 text-sm text-white/75">
              <p>New Cairo - Sadat Axis</p>
              <p>01500009344</p>
              <p>info@soulhospitality.co</p>
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Soul Hospitality</p>
            <div className="space-y-3 text-sm text-white/75">
              <p>Properties</p>
              <p>About Soul</p>
              <p>FAQ</p>
              <p>Become a Host</p>
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Support</p>
            <div className="space-y-3 text-sm text-white/75">
              <p>Contact</p>
              <p>Terms Of Use</p>
              <p>Privacy Policy</p>
              <p>Reservations</p>
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Newsletter</p>
            <div className="flex overflow-hidden rounded-md border border-white/15 bg-white/5">
              <input
                type="email"
                placeholder="Email address"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/45"
              />
              <button type="button" className="px-4 text-sm text-white/80">
                Submit
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.18em] text-white/55 md:flex-row md:items-center md:justify-between">
          <span>© 2026 Soul Hospitality. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <span>Terms Of Use</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
