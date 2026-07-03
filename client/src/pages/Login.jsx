import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ShieldIllustration = () => (
  <svg viewBox="0 0 520 520" className="h-[420px] w-[420px] max-w-full" aria-hidden="true">
    <defs>
      <linearGradient id="loginGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f4efe7" />
        <stop offset="100%" stopColor="#e8dfd2" />
      </linearGradient>
    </defs>
    <rect x="56" y="56" width="408" height="408" rx="200" fill="url(#loginGlow)" />
    <circle cx="260" cy="180" r="58" fill="none" stroke="#283f5e" strokeWidth="10" />
    <path d="M160 348c26-58 69-89 100-89s74 31 100 89" fill="none" stroke="#283f5e" strokeWidth="10" strokeLinecap="round" />
    <path d="M236 292h48" stroke="#283f5e" strokeWidth="10" strokeLinecap="round" />
    <rect x="356" y="176" width="54" height="110" rx="18" fill="#283f5e" opacity="0.92" />
    <rect x="370" y="194" width="26" height="50" rx="8" fill="#f6f1ea" />
    <path d="M176 112l54-28 54 28-54 28z" fill="#283f5e" opacity="0.16" />
    <path d="M118 390c30-22 68-32 102-32" stroke="#283f5e" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
  </svg>
);

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

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

    try {
      const nextState = await login(formState);

      if (['primary_admin', 'secondary_admin'].includes(nextState.user.role)) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(location.state?.from || '/units', { replace: true });
      }
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

      <section className="hidden md:flex h-screen w-full items-center justify-center bg-[#eae5df] px-10 relative overflow-hidden">
        <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-white/35 blur-2xl" />
        <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full bg-white/25 blur-3xl" />
        <div className="relative flex flex-col items-center text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.36em] text-[#283f5e]/80">LET&apos;S GET STARTED!</p>
          <ShieldIllustration />
        </div>
      </section>

      <section className="w-full h-full flex flex-col justify-center px-8 py-16 sm:px-16 lg:px-24 relative">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-2xl font-bold text-[#283f5e] mb-8 text-center">Log In</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3.5 pl-12 text-sm text-brand placeholder:text-slate-300 focus:outline-none focus:border-[#283f5e] transition-all"
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <LockIcon />
                </span>
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  value={formState.password}
                  onChange={(event) => handleChange('password', event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3.5 pl-12 pr-12 text-sm text-brand placeholder:text-slate-300 focus:outline-none focus:border-[#283f5e] transition-all"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-[#283f5e]"
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                >
                  {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>

            <a
              href="mailto:info@soulhospitality.co?subject=Password%20reset"
              className="mt-2 block w-full text-center text-xs text-slate-400 transition-colors hover:text-[#283f5e]"
            >
              Reset password
            </a>

            {error ? <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-brand/75">{error}</div> : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#283f5e] text-white font-semibold py-3.5 rounded-lg mt-6 text-sm transition-colors hover:bg-[#1e3047]"
            >
              {submitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#283f5e] transition-colors hover:text-[#1e3047]">
              Sign up now
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
    <path d="M4 6.5h16v11H4v-11Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="m5.5 8 6.5 5 6.5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
    <rect x="5.5" y="10" width="13" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M8.5 10V7.8a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M9.5 9.7A3 3 0 0 0 12 16a3 3 0 0 0 2.1-.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M5.5 7.5C3.9 8.9 2.9 10.4 2.5 12c.8 3.4 4.4 7.5 9.5 7.5 1 0 1.9-.1 2.8-.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M20.5 12c-.8-3.4-4.4-7.5-9.5-7.5-.9 0-1.8.1-2.6.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
