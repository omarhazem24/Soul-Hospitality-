import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const FieldIcon = ({ type }) => {
  if (type === 'user') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M12 12.2a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4.5 20c1.8-3.2 4.3-4.8 7.5-4.8S17.7 16.8 19.5 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'mail') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M4 6.5h16v11H4v-11Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="m5.5 8 6.5 5 6.5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'phone') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M7.5 4.8h3l1.2 3.8-1.8 1.4c1 1.9 2.7 3.6 4.6 4.6l1.4-1.8 3.8 1.2v3c0 1-0.8 1.8-1.8 1.8C10.2 18.8 5.2 13.8 5.2 7.6c0-1 .8-1.8 1.8-1.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M6.5 10V8.2a5.5 5.5 0 1 1 11 0V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <rect x="5.5" y="10" width="13" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
};

export const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();
  const [formState, setFormState] = useState({ name: '', email: '', phone_number: '', password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && ['primary_admin', 'secondary_admin'].includes(user?.role)) {
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    if (isAuthenticated) {
      navigate('/units', { replace: true });
    }
  }, [isAuthenticated, navigate, user?.role]);

  const handleChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    if (formState.password !== formState.confirmPassword) {
      setError('Passwords do not match');
      setSubmitting(false);
      return;
    }

    try {
      await register({
        name: formState.name,
        email: formState.email,
        phone_number: formState.phone_number,
        password: formState.password
      });

      navigate('/units', { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      <Link
        to="/"
        aria-label="Close authentication"
        className="fixed right-6 top-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-[#283f5e] shadow-[0_10px_30px_rgba(40,63,94,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#283f5e] hover:bg-[#283f5e] hover:text-white"
      >
        ✕
      </Link>

      <section className="hidden md:block w-full h-screen relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80"
          alt="Bright warm living room interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(40,63,94,0.08),rgba(40,63,94,0.18))]" />
        <div className="absolute left-8 bottom-8 rounded-3xl bg-white/80 px-6 py-5 shadow-[0_18px_50px_rgba(40,63,94,0.16)] backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#283f5e]/70">Soul Hospitality</p>
          <p className="mt-2 text-2xl font-bold text-[#283f5e]">Register</p>
        </div>
      </section>

      <section className="w-full h-full flex flex-col justify-center px-8 py-16 sm:px-16 lg:px-24 relative">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold text-[#283f5e] mb-8 self-start">Register</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Name</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <FieldIcon type="user" />
                </span>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-[#283f5e] transition-all placeholder:text-slate-300"
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <FieldIcon type="mail" />
                </span>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-[#283f5e] transition-all placeholder:text-slate-300"
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Phone</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <FieldIcon type="phone" />
                </span>
                <input
                  type="tel"
                  value={formState.phone_number}
                  onChange={(event) => handleChange('phone_number', event.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-[#283f5e] transition-all placeholder:text-slate-300"
                  placeholder="01xxxxxxxxx"
                  autoComplete="tel"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <FieldIcon type="lock" />
                </span>
                <input
                  type="password"
                  value={formState.password}
                  onChange={(event) => handleChange('password', event.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-[#283f5e] transition-all placeholder:text-slate-300"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Confirm Password</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <FieldIcon type="lock" />
                </span>
                <input
                  type="password"
                  value={formState.confirmPassword}
                  onChange={(event) => handleChange('confirmPassword', event.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-[#283f5e] transition-all placeholder:text-slate-300"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </label>

            {error ? <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-brand/75">{error}</div> : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#283f5e] text-white font-semibold py-4 rounded-full mt-6 text-sm hover:bg-[#1e3047] transition-all duration-300 shadow-md"
            >
              {submitting ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don’t you have an account?{' '}
            <Link to="/login" className="font-semibold text-[#283f5e] transition-colors hover:text-[#1e3047]">
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};