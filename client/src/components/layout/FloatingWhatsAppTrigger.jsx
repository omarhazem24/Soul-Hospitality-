import React, { useEffect, useState } from 'react';
import { useLocation, useMatch } from 'react-router-dom';

const WHATSAPP_NUMBER = '201500009344';
const WHATSAPP_DISPLAY_NUMBER = '01500009344';

const shouldHideTrigger = (pathname) => {
  const hiddenPrefixes = ['/admin', '/sales', '/login', '/register', '/forgot-password', '/reset-password', '/change-password'];

  return hiddenPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

const buildDefaultHref = () => {
  const rawMessage = 'Hi, I have a problem.';
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(rawMessage)}`;
};

const buildUnitHref = () => {
  const unitUrl = typeof window !== 'undefined' ? window.location.href : '';
  const rawMessage = `${unitUrl}\nI have an inquiry about this unit`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(rawMessage)}`;
};

export const FloatingWhatsAppTrigger = () => {
  const location = useLocation();
  const unitDetailsMatch = useMatch('/units/:unitId');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const handleFiltersToggle = (event) => {
      setMobileFiltersOpen(Boolean(event.detail?.open));
    };

    window.addEventListener('properties-filters-toggle', handleFiltersToggle);

    return () => {
      window.removeEventListener('properties-filters-toggle', handleFiltersToggle);
    };
  }, []);

  if (shouldHideTrigger(location.pathname)) {
    return null;
  }

  const isPropertiesPage = location.pathname === '/units';
  const isUnitDetails = Boolean(unitDetailsMatch);
  const label = isUnitDetails ? 'Have an inquiry about this unit?' : 'Have a problem?';
  const href = isUnitDetails ? buildUnitHref() : buildDefaultHref();
  const hideForMobileFilters = isPropertiesPage && mobileFiltersOpen;

  return (
    <div
      className={[
        'fixed bottom-5 right-5 z-[70] sm:bottom-6 sm:right-6',
        hideForMobileFilters ? 'max-lg:hidden' : ''
      ].join(' ')}
    >
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex items-center gap-3 rounded-full border border-emerald-300/70 bg-emerald-500 px-4 py-3 text-white shadow-[0_18px_40px_rgba(4,120,87,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-[0_22px_50px_rgba(4,120,87,0.34)]"
        aria-label={label}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
            <path d="M20.52 3.48A11.83 11.83 0 0 0 12.06 0C5.61 0 .38 5.23.38 11.67c0 2.04.53 4.04 1.54 5.8L0 24l6.71-1.77a11.63 11.63 0 0 0 5.35 1.37h.01c6.44 0 11.67-5.23 11.67-11.67 0-3.12-1.21-6.05-3.22-8.45Zm-8.46 17.94h-.01a9.68 9.68 0 0 1-4.94-1.35l-.35-.2-3.98 1.05 1.06-3.88-.23-.4a9.62 9.62 0 0 1-1.48-5.13c0-5.33 4.34-9.67 9.68-9.67 2.58 0 5 .99 6.82 2.82a9.58 9.58 0 0 1 2.85 6.85c0 5.34-4.34 9.67-9.67 9.67Zm5.61-7.67c-.31-.16-1.82-.9-2.1-1s-.48-.16-.68.15-.78 1-.96 1.2-.35.23-.66.08a7.95 7.95 0 0 1-2.34-1.44 8.74 8.74 0 0 1-1.62-2c-.17-.3 0-.47.13-.62.13-.14.3-.36.45-.54.15-.19.2-.32.3-.54.1-.22.05-.4-.02-.56-.08-.16-.68-1.65-.94-2.26-.25-.6-.51-.52-.7-.53h-.6c-.21 0-.56.08-.85.4-.29.32-1.1 1.07-1.1 2.62 0 1.55 1.13 3.05 1.29 3.26.16.22 2.23 3.4 5.4 4.76.75.33 1.34.52 1.8.67.76.24 1.45.2 2 .12.61-.09 1.82-.74 2.08-1.47.26-.73.26-1.36.18-1.49-.08-.13-.28-.21-.59-.37Z" />
          </svg>
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75">WhatsApp</span>
          <span className="text-sm font-semibold sm:text-base">{label}</span>
        </span>
      </a>
    </div>
  );
};