import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { resetPasswordRequest } from '../api/http.js';
import { getPasswordRuleChecks, passwordRuleItems } from '../utils/passwordRules.js';

const RuleChecklist = ({ checks }) => (
  <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
    {passwordRuleItems.map((rule) => {
      const passed = checks[rule.key];
      return (
        <div key={rule.key} className={`flex items-center gap-2 text-sm ${passed ? 'text-emerald-700' : 'text-slate-500'}`}>
          <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs ${passed ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
            {passed ? '✓' : '×'}
          </span>
          <span>{rule.label}</span>
        </div>
      );
    })}
  </div>
);

const PasswordField = ({ label, value, onChange, visible, onToggle, autoComplete }) => (
  <label className="block space-y-2 text-sm font-semibold text-slate-700">
    {label}
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-12 text-sm text-slate-800 outline-none transition focus:border-[#283f5e] focus:ring-4 focus:ring-[#283f5e]/10"
        autoComplete={autoComplete}
        required
      />
      <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#283f5e]" aria-label={visible ? 'Hide password' : 'Show password'}>
        {visible ? <EyeOff className="h-4 w-4" strokeWidth={2} /> : <Eye className="h-4 w-4" strokeWidth={2} />}
      </button>
    </div>
  </label>
);

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const checks = useMemo(() => getPasswordRuleChecks(newPassword), [newPassword]);
  const canSubmit = token && Object.values(checks).every(Boolean) && newPassword === confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const payload = await resetPasswordRequest({ token, newPassword });
      setMessage(payload?.message || 'Password reset successfully. Redirecting to login...');
      window.setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (submitError) {
      setError(submitError.message || 'Unable to reset password right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#eff6ff,white_55%,#e2e8f0)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <section className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.10)] sm:p-10">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#283f5e] text-white">
              <LockKeyhole className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Reset Password</p>
              <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">Choose a new password</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">Use a secure password that satisfies all policy rules before submitting.</p>
            </div>
          </div>

          {!token ? <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">This reset link is missing a valid token.</div> : null}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <PasswordField
              label="New Password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              visible={showNewPassword}
              onToggle={() => setShowNewPassword((current) => !current)}
              autoComplete="new-password"
            />

            <RuleChecklist checks={checks} />

            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((current) => !current)}
              autoComplete="new-password"
            />

            {confirmPassword && newPassword !== confirmPassword ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Passwords do not match.</div> : null}
            {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <button type="submit" disabled={!canSubmit || submitting} className="w-full rounded-2xl bg-[#283f5e] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1e3047] disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? 'Resetting password...' : 'Reset password'}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">Need the link again? <Link to="/forgot-password" className="font-semibold text-[#283f5e] hover:text-[#1e3047]">Request another reset email</Link></p>
        </section>
      </div>
    </main>
  );
};