import React from 'react';

export const Faq = () => {
  return (
    <main className="page-container py-16">
      <section className="mx-auto max-w-4xl space-y-6 border border-slate-200 bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand/70">FAQ</p>
        <h1 className="text-4xl font-semibold uppercase tracking-[0.18em] text-brand">Frequently Asked Questions</h1>
        <div className="space-y-4 text-sm leading-7 text-brand/75">
          <p>We curate premium stays with a direct, minimal reservation flow.</p>
          <p>Guest support, host onboarding, and booking inquiries are handled through the Soul Hospitality console.</p>
        </div>
      </section>
    </main>
  );
};