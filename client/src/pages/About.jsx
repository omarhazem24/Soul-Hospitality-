import React from 'react';

const storyParagraphs = [
  'Soul Hospitality was shaped around one idea: premium homes should feel both effortless and memorable. We curate short stays, longer living arrangements, and owner experiences with the same discipline, so every property is presented with clarity, calm, and consistency.',
  'Our team focuses on the details that make hospitality feel refined rather than transactional. From furnishing standards and guest touchpoints to property stewardship and responsive support, every layer is designed to keep the experience warm, clean, and reliable.'
];

const values = [
  {
    title: 'Quality',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    body:
      'We maintain a high finish across every unit, from material choices and styling to cleanliness, consistency, and the standard of the guest experience.'
  },
  {
    title: 'Teamwork',
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    body:
      'Our operations, guest support, and property care teams work as one system so owners and guests feel a smooth, coordinated service at every step.'
  },
  {
    title: 'Respect',
    image: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80',
    body:
      'We respect every property as an asset, every guest as a priority, and every owner relationship as a long-term partnership built on trust.'
  },
  {
    title: 'Integrity',
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
    body:
      'Clear communication, transparent operations, and honest reporting guide how we manage bookings, care plans, and everyday hospitality decisions.'
  },
  {
    title: 'Responsibility',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    body:
      'We take ownership of the details that protect value over time, keeping the property experience organised, dependable, and carefully maintained.'
  },
  {
    title: 'Innovative',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    body:
      'We refine service flows, presentation, and digital touchpoints so the brand feels modern without losing the calm and luxury expected from Soul.'
  }
];

const partners = [
  {
    label: 'Tatweer Misr',
    src: 'https://res.cloudinary.com/ukaklyhf/image/upload/v1783004693/Tatweer-Misr_ypl2nx.jpg'
  },
  {
    label: 'Sabbour Consulting',
    src: 'https://res.cloudinary.com/ukaklyhf/image/upload/v1783004693/Sabbour_fuwjub.jpg'
  },
  {
    label: 'Palm Hills',
    src: 'https://res.cloudinary.com/ukaklyhf/image/upload/v1783004872/Palm-Hills_tlwsja.jpg'
  }
];

export const About = () => {
  return (
    <main className="bg-white">
      <section className="relative w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80"
          alt="Modern living room interior"
          className="h-[450px] w-full object-cover md:h-[550px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.72)_28%,rgba(255,255,255,0.16)_62%,rgba(255,255,255,0)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_center,rgba(255,255,255,0.72),transparent_36%)]" />

        <div className="absolute left-6 top-1/2 w-[min(92vw,36rem)] -translate-y-1/2 md:left-14">
          <div className="max-w-xl rounded-3xl border border-white/70 bg-white/55 p-6 shadow-[0_18px_60px_rgba(40,63,94,0.12)] backdrop-blur-sm md:p-8">
            <h1 className="mb-3 text-4xl font-bold text-[#283f5e] md:text-5xl">About us</h1>
            <p className="text-base font-medium text-slate-500 md:text-lg">We offer unique places suitable for your comfort</p>
          </div>
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-6 py-12">
        <h2 className="mb-6 text-2xl font-bold text-[#283f5e]">Our Story</h2>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {storyParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 16)} className="text-sm leading-relaxed text-slate-400 text-justify">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="pb-20">
        <div className="w-full max-w-7xl mx-auto px-6">
          <h2 className="mb-10 text-left text-3xl font-bold text-[#283f5e]">Our Values</h2>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 pb-20 md:grid-cols-2 lg:grid-cols-3">
          {values.map((item) => (
            <article key={item.title} className="group rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_50px_rgba(40,63,94,0.06)] transition-transform duration-300 hover:-translate-y-1">
              <img
                src={item.image}
                alt={item.title}
                className="mb-4 aspect-[4/3] w-full rounded-xl object-cover"
              />
              <h3 className="mt-4 mb-2 text-lg font-bold text-[#283f5e]">{item.title}</h3>
              <p className="text-xs leading-relaxed text-slate-400">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50/70 py-14">
        <h2 className="mb-10 max-w-7xl mx-auto px-6 text-2xl font-bold text-[#283f5e]">Our Partners</h2>
        <div className="flex flex-wrap items-center justify-between gap-8 md:gap-12 max-w-7xl mx-auto px-8 py-10">
          {partners.map((partner) => (
            <img
              key={partner.label}
              src={partner.src}
              alt={partner.label}
              className="h-36 w-auto object-contain grayscale opacity-90 contrast-125 transition-all duration-200 hover:grayscale-0 hover:opacity-100"
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      </section>
    </main>
  );
};
