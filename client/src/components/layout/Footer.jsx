import React from "react";
import { Link } from "react-router-dom";
import { BrandWordmark } from "./BrandWordmark.jsx";

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13.5 22v-8.2h2.75l.42-3.2H13.5V8.55c0-.93.26-1.56 1.63-1.56h1.74V4.13c-.3-.04-1.33-.13-2.53-.13-2.5 0-4.21 1.53-4.21 4.34v2.44H7.37v3.2h2.76V22h3.37Z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Zm6.1-8.05a1.12 1.12 0 1 0 0 2.24 1.12 1.12 0 0 0 0-2.24ZM12 2.2c3.2 0 3.58.01 4.84.07 1.25.06 2.1.26 2.9.58a4.92 4.92 0 0 1 1.78 1.16 4.92 4.92 0 0 1 1.16 1.78c.32.8.52 1.65.58 2.9.06 1.26.07 1.64.07 4.84s-.01 3.58-.07 4.84c-.06 1.25-.26 2.1-.58 2.9a4.92 4.92 0 0 1-1.16 1.78 4.92 4.92 0 0 1-1.78 1.16c-.8.32-1.65.52-2.9.58-1.26.06-1.64.07-4.84.07s-3.58-.01-4.84-.07c-1.25-.06-2.1-.26-2.9-.58a4.92 4.92 0 0 1-1.78-1.16A4.92 4.92 0 0 1 .32 18.37c-.32-.8-.52-1.65-.58-2.9C-.32 14.22-.33 13.84-.33 10.64s.01-3.58.07-4.84c.06-1.25.26-2.1.58-2.9A4.92 4.92 0 0 1 1.48 1.12 4.92 4.92 0 0 1 3.26-.04c.8-.32 1.65-.52 2.9-.58C7.42-.68 7.8-.69 11-.69h1Zm0 1.7c-3.16 0-3.5.01-4.75.07-1.11.05-1.71.24-2.11.39-.53.2-.91.45-1.31.85-.4.4-.65.78-.85 1.31-.15.4-.34 1-.39 2.11-.06 1.25-.07 1.59-.07 4.75s.01 3.5.07 4.75c.05 1.11.24 1.71.39 2.11.2.53.45.91.85 1.31.4.4.78.65 1.31.85.4.15 1 .34 2.11.39 1.25.06 1.59.07 4.75.07s3.5-.01 4.75-.07c1.11-.05 1.71-.24 2.11-.39.53-.2.91-.45 1.31-.85.4-.4.65-.78.85-1.31.15-.4.34-1 .39-2.11.06-1.25.07-1.59.07-4.75s-.01-3.5-.07-4.75c-.05-1.11-.24-1.71-.39-2.11-.2-.53-.45-.91-.85-1.31-.4-.4-.78-.65-1.31-.85-.4-.15-1-.34-2.11-.39-1.25-.06-1.59-.07-4.75-.07h-1Z" />
  </svg>
);

const FooterLink = ({ label, href }) => {
  return (
    <Link
      to={href}
      className="group relative inline-flex text-sm font-medium text-slate-400 transition-colors duration-300 hover:text-white"
    >
      {label}
      <span className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-[#283f5e] transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  );
};

export const Footer = () => {
  return (
    <footer className="mt-16 bg-[#172331] text-white">
      <div className="page-container py-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr_0.85fr_1fr]">
          <div className="space-y-4">
            <BrandWordmark inverse />
            <p className="max-w-md text-sm leading-7 text-white/75">
              Boutique hospitality curated with premium restraint, direct
              booking clarity, and a calm editorial luxury tone.
            </p>
            <div className="space-y-2 text-sm text-white/75">
              <p>New Cairo - Sadat Axis</p>
              <p>01500009344</p>
              <p>info@soulhospitality.co</p>
            </div>
            <Link
              to="/careers"
              className="inline-flex rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Work with us
            </Link>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              Soul Hospitality
            </p>
            <div className="flex flex-col gap-3">
              <FooterLink label="Properties" href="/units" />
              <FooterLink label="About Soul" href="/about-soul" />
              <FooterLink label="FAQ" href="/faq" />
              <FooterLink label="Become a Host" href="/become-a-host" />
              <FooterLink label="Contact" href="/contact" />
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              Support
            </p>
            <div className="space-y-3 text-sm text-white/75">
              <p>Calm premium support</p>
              <p>Direct booking guidance</p>
              <p>Owner and guest care</p>
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              Follow Us
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/shaheenzhospitality/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 hover:text-white"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/soulhospitalityy/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 hover:text-white"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.18em] text-white/55 md:flex-row md:items-center md:justify-between">
          <span>© 2026 Soul Hospitality. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};
