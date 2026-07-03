import React from 'react';

const inventory = [
  {
    title: 'North Coast Sea Villa',
    price: 'EGP 12,400',
    bedrooms: '4 Bedrooms',
    bathrooms: '3 Bathrooms',
    area: '280 sqm'
  },
  {
    title: 'Sheikh Zayed Courtyard Home',
    price: 'EGP 8,900',
    bedrooms: '3 Bedrooms',
    bathrooms: '2 Bathrooms',
    area: '185 sqm'
  },
  {
    title: 'New Cairo Penthouse',
    price: 'EGP 15,600',
    bedrooms: '5 Bedrooms',
    bathrooms: '4 Bathrooms',
    area: '340 sqm'
  }
];

export const PropertyGrid = () => {
  return (
    <section className="page-container section-block">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="brand-eyebrow mb-3">Property Inventory</p>
          <h2 className="heading-luxury text-2xl md:text-4xl">Curated stays with clear hierarchy.</h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {inventory.map((item) => (
          <article key={item.title} className="surface-card overflow-hidden">
            <div className="relative min-h-[280px] border-b border-line bg-[linear-gradient(180deg,rgba(40,63,94,0.08),rgba(255,255,255,0.95))]">
              <div className="absolute inset-0 flex items-end justify-between p-4">
                <div className="rounded-md border border-line bg-white/95 px-3 py-1 text-xs tracking-[0.12em] text-brand">
                  Image Carousel
                </div>
                <div className="rounded-md border border-line bg-white/95 px-3 py-1 text-xs tracking-[0.12em] text-brand">
                  Preview
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <h3 className="max-w-[14ch] text-lg font-semibold leading-7 text-brand">{item.title}</h3>
                <div className="text-right text-sm font-semibold text-brand">{item.price}</div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {[item.bedrooms, item.bathrooms, item.area].map((badge) => (
                  <span key={badge} className="rounded-md border border-line px-3 py-1 text-xs text-brand">
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-8 text-sm tracking-[0.08em] text-brand/80">
                Premium placement, minimal overlays, and refined visual spacing.
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
