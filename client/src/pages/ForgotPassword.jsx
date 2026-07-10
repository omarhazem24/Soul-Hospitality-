import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordRequest } from '../api/http.js';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const payload = await forgotPasswordRequest({ email });
      setMessage(payload?.message || 'If an account with that email exists, a password reset link has been sent.');
    } catch (submitError) {
      setError(submitError.message || 'Unable to send reset email right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fafc,white_55%,#e2e8f0)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.10)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden bg-[#102b5f] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">Account Recovery</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">Reset access without leaving your inbox.</h1>
            </div>
            <p className="max-w-sm text-sm leading-7 text-white/72">We will email you a secure reset link that expires in one hour.</p>
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Forgot Password</p>
              <h2 className="mt-3 text-3xl font-bold text-[#283f5e]">Get a reset link</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Enter the email address registered to your account and we will send a recovery link.</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <label className="block space-y-2 text-sm font-semibold text-slate-700">
                  Email address
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-[#283f5e] focus:ring-4 focus:ring-[#283f5e]/10"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </label>

                {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
                {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-[#283f5e] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1e3047] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Sending reset link...' : 'Send reset link'}
                </button>
              </form>

              <p className="mt-6 text-sm text-slate-500">
                Remembered your password? <Link to="/login" className="font-semibold text-[#283f5e] hover:text-[#1e3047]">Back to login</Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};