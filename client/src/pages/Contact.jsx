import React from 'react';
import { Mail, MapPin, MessageCircle } from 'lucide-react';

export const Contact = () => {
  const channels = [
    {
      label: 'Email',
      description: 'Send the team a direct message',
      href: 'mailto:info@soulhospitality.co',
      target: undefined,
      rel: undefined,
      icon: Mail
    },
    {
      label: 'WhatsApp',
      description: 'Open a secure chat window',
      href: 'https://wa.me/201500009344',
      target: '_blank',
      rel: 'noopener noreferrer',
      icon: MessageCircle
    },
    {
      label: 'Location',
      description: 'Open the office location in Maps',
      href: 'https://maps.app.goo.gl/faiBKHKQtouzMC6q7',
      target: '_blank',
      rel: 'noopener noreferrer',
      icon: MapPin
    }
  ];

  return (
    <main className="bg-slate-50">
      <section className="page-container py-12 lg:py-16 2xl:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] 2xl:gap-14">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Contact</p>
            <h1 className="text-4xl font-bold text-[#283f5e] 2xl:text-6xl">Speak to the Soul Hospitality team</h1>
            <p className="max-w-xl text-sm leading-7 text-slate-600 2xl:text-base 2xl:leading-8">
              Ask about stays, partnerships, hosting, or recruitment. We respond with the same calm and premium service standards we bring to every property.
            </p>

            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Head Office</p>
              <p className="text-sm text-slate-600">New Cairo - Sadat Axis</p>
              <p className="text-sm text-slate-600">01500009344</p>
              <p className="text-sm text-slate-600">info@soulhospitality.co</p>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8 2xl:p-10">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Direct Channels</p>
              <h2 className="font-serif text-2xl font-bold text-slate-900 2xl:text-4xl">Choose your preferred contact path</h2>
              <p className="text-sm leading-7 text-slate-600 2xl:text-base 2xl:leading-8">Each option opens a clean external action so you can reach the team without a form submission step.</p>
            </div>

            <div className="space-y-3">
              {channels.map(({ label, description, href, target, rel, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={target}
                  rel={rel}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[#283f5e] transition-all hover:border-[#283f5e] hover:bg-slate-50"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[#283f5e] transition-colors group-hover:border-[#283f5e] group-hover:bg-[#283f5e] group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{label}</span>
                    <span className="block text-sm text-slate-500">{description}</span>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 transition-colors group-hover:text-[#283f5e]">
                    Open
                  </span>
                </a>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm text-slate-500">
              <p className="font-semibold text-slate-700">Head Office</p>
              <p>New Cairo - Sadat Axis</p>
              <p>01500009344</p>
              <p>info@soulhospitality.co</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};