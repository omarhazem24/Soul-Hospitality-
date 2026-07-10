import React, { useEffect, useMemo, useState } from 'react';
import { BadgePercent, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { createPromoCode, deletePromoCode, fetchPromoCodes } from '../api/http.js';

const formatDate = (value) => new Date(value).toLocaleDateString();

export const AdminPromoManagement = () => {
  const [formState, setFormState] = useState({ code: '', percentage: '' });
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadPromoCodes = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = await fetchPromoCodes();
      setPromoCodes(Array.isArray(payload) ? payload : []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const activePromoCodes = useMemo(() => promoCodes.filter((promoCode) => promoCode.active !== false), [promoCodes]);

  const handleChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      await createPromoCode({
        code: formState.code,
        percentage: Number(formState.percentage)
      });

      setFormState({ code: '', percentage: '' });
      setMessage('Promo code created successfully.');
      await loadPromoCodes();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (promoCodeId) => {
    const confirmed = window.confirm('Delete this promo code?');

    if (!confirmed) {
      return;
    }

    try {
      await deletePromoCode(promoCodeId);
      await loadPromoCodes();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Promos</p>
        <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">Promo code control deck</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#283f5e]/10 text-[#283f5e]">
              <BadgePercent className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Create promo code</h2>
              <p className="text-sm text-slate-500">Configure a coupon string and discount percentage.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Code
              <input
                value={formState.code}
                onChange={(event) => handleChange('code', event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#283f5e]"
                placeholder="SUMMER20"
                required
              />
            </label>

            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Percentage
              <input
                type="number"
                min="1"
                max="100"
                value={formState.percentage}
                onChange={(event) => handleChange('percentage', event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#283f5e]"
                placeholder="20"
                required
              />
            </label>

            {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#283f5e] px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-slate-800 disabled:opacity-70"
            >
              <Plus className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              {submitting ? 'Saving...' : 'Create Promo'}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Active promo codes</h2>
              <p className="text-sm text-slate-500">Currently available discount codes.</p>
            </div>
            <button
              type="button"
              onClick={loadPromoCodes}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-600 transition-colors hover:border-[#283f5e] hover:text-[#283f5e]"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              Refresh
            </button>
          </div>

          {loading ? <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">Loading promo codes...</div> : null}

          <div className="space-y-3">
            {activePromoCodes.map((promoCode) => (
              <article key={promoCode._id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">{promoCode.code}</p>
                  <p className="text-xs text-slate-500">{promoCode.percentage}% off · Created {formatDate(promoCode.createdAt)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(promoCode._id)}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                  Delete
                </button>
              </article>
            ))}

            {!loading && activePromoCodes.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No promo codes available yet.</div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
};