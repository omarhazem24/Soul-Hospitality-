import React from 'react';

export const MainHeader = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-md">
      <div className="page-container flex h-20 items-center justify-between gap-6">
        <a href="/" className="flex items-center gap-3 text-brand no-underline">
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">Soul Hospitality</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {['Soul Life', 'Stays', 'Blog', 'Contact'].map((item) => (
            <a
              key={item}
              href="/"
              className="text-sm font-semibold tracking-[0.08em] text-brand no-underline transition-opacity hover:opacity-70"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="rounded-md border border-line px-3 py-1 text-xs tracking-[0.12em] text-brand">
            Guest Access
          </span>
        </div>
      </div>
    </header>
  );
};
