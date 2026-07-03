import React from 'react';

export const HeroViewport = () => {
  return (
    <section className="relative overflow-hidden border-b border-line bg-white">
      <div className="page-container section-block relative">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="max-w-3xl pb-6 pt-12 lg:pt-20">
            <p className="brand-eyebrow mb-4">Premium stays in Egypt</p>
            <h1 className="heading-luxury max-w-3xl text-4xl leading-[0.95] md:text-6xl lg:text-7xl">
              Boutique hospitality, curated with clarity and restraint.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-brand/80 md:text-lg">
              Discover elevated homes, coastal escapes, and architected city stays shaped around space,
              light, and premium quietness.
            </p>
          </div>

          <div className="relative min-h-[460px] overflow-hidden rounded-lg border border-line bg-[linear-gradient(180deg,rgba(40,63,94,0.08),rgba(40,63,94,0.02))]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(40,63,94,0.18),transparent_42%),linear-gradient(180deg,rgba(40,63,94,0.06),rgba(255,255,255,0.02))]" />
            <div className="absolute inset-0 flex items-end p-6">
              <div className="surface-card max-w-sm p-5">
                <span className="brand-eyebrow block">Featured Collection</span>
                <p className="mt-3 text-sm leading-6 text-brand/80">
                  Minimal interfaces, precise composition, and a luxury-first visual cadence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
