import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const isAdminRole = (role) => ["Admin", "primary_admin", "secondary_admin"].includes(role);
const isSalesRole = (role) => role === "Sales";

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated && ["Admin", "Sales"].includes(user?.role) && user?.isFirstLogin) {
      navigate("/change-password", { replace: true });
      return;
    }

    if (
      isAuthenticated &&
      isAdminRole(user?.role)
    ) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    if (isAuthenticated && isSalesRole(user?.role)) {
      navigate("/sales/dashboard", { replace: true });
      return;
    }

    if (isAuthenticated) {
      navigate("/units", { replace: true });
    }
  }, [isAuthenticated, navigate, user?.isFirstLogin, user?.role]);

  const handleChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const nextState = await login(formState);

      if (nextState.user.forcePasswordChange || (nextState.user.role === "Sales" && nextState.user.isFirstLogin)) {
        navigate("/change-password", { replace: true });
      } else if (isAdminRole(nextState.user.role)) {
        navigate("/admin/dashboard", { replace: true });
      } else if (isSalesRole(nextState.user.role)) {
        navigate("/sales/dashboard", { replace: true });
      } else {
        navigate(location.state?.from || "/units", { replace: true });
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

      <section className="relative hidden h-screen w-full overflow-hidden bg-slate-950 md:flex">
        <img
          src="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80"
          alt="Egyptian resort coastline"
          className="absolute inset-0 h-full w-full select-none object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />
        <div className="relative z-10 flex h-full w-full items-end px-10 pb-12 lg:px-14 lg:pb-14">
          <div className="max-w-xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.36em] text-white/80">
              LET&apos;S GET STARTED!
            </p>
            <h2 className="text-4xl font-bold leading-tight text-white lg:text-5xl">
              Find Your Next Coastal Getaway
            </h2>
          </div>
        </div>
      </section>

      <section className="w-full h-full flex flex-col justify-center px-8 py-16 sm:px-16 lg:px-24 relative">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-2xl font-bold text-[#283f5e] mb-8 text-center">
            Log In
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(event) =>
                    handleChange("email", event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-3.5 pl-12 text-sm text-brand placeholder:text-slate-300 focus:outline-none focus:border-[#283f5e] transition-all"
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <LockIcon />
                </span>
                <input
                  type={passwordVisible ? "text" : "password"}
                  value={formState.password}
                  onChange={(event) =>
                    handleChange("password", event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-3.5 pl-12 pr-12 text-sm text-brand placeholder:text-slate-300 focus:outline-none focus:border-[#283f5e] transition-all"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-[#283f5e]"
                  aria-label={
                    passwordVisible ? "Hide password" : "Show password"
                  }
                >
                  {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>

            <Link
              to="/forgot-password"
              className="mt-2 block w-full text-center text-xs text-slate-400 transition-colors hover:text-[#283f5e]"
            >
              Reset password
            </Link>

            {error ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-brand/75">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#283f5e] text-white font-semibold py-3.5 rounded-lg mt-6 text-sm transition-colors hover:bg-[#1e3047]"
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#283f5e] transition-colors hover:text-[#1e3047]"
            >
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
    <path
      d="M4 6.5h16v11H4v-11Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="m5.5 8 6.5 5 6.5-5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
    <rect
      x="5.5"
      y="10"
      width="13"
      height="9.5"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M8.5 10V7.8a3.5 3.5 0 0 1 7 0V10"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
    <path
      d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
    <path
      d="M3 3l18 18"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M9.5 9.7A3 3 0 0 0 12 16a3 3 0 0 0 2.1-.9"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M5.5 7.5C3.9 8.9 2.9 10.4 2.5 12c.8 3.4 4.4 7.5 9.5 7.5 1 0 1.9-.1 2.8-.4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M20.5 12c-.8-3.4-4.4-7.5-9.5-7.5-.9 0-1.8.1-2.6.3"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);
