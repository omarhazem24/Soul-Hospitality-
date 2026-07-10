import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { changePasswordRequest } from '../api/http.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getPasswordRuleChecks, passwordRuleItems } from '../utils/passwordRules.js';

const PasswordField = ({ label, value, onChange, visible, onToggle, autoComplete, placeholder }) => (
  <label className="block space-y-2 text-sm font-semibold text-slate-700">
    {label}
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-12 text-sm text-slate-800 outline-none transition focus:border-[#283f5e] focus:ring-4 focus:ring-[#283f5e]/10"
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
      />
      <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#283f5e]" aria-label={visible ? 'Hide password' : 'Show password'}>
        {visible ? <EyeOff className="h-4 w-4" strokeWidth={2} /> : <Eye className="h-4 w-4" strokeWidth={2} />}
      </button>
    </div>
  </label>
);

const PasswordChecklist = ({ checks }) => (
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

export const ChangePassword = () => {
  const navigate = useNavigate();
  const { updateSessionUser, user } = useAuth();
  const [formState, setFormState] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [visibility, setVisibility] = useState({ currentPassword: false, newPassword: false, confirmPassword: false });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const passwordChecks = useMemo(() => getPasswordRuleChecks(formState.newPassword), [formState.newPassword]);
  const passwordsMatch = formState.newPassword === formState.confirmPassword;
  const canSubmit = Boolean(formState.currentPassword) && Object.values(passwordChecks).every(Boolean) && passwordsMatch && Boolean(formState.confirmPassword);

  const handleChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleToggle = (field) => {
    setVisibility((current) => ({ ...current, [field]: !current[field] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const payload = await changePasswordRequest({
        currentPassword: formState.currentPassword,
        newPassword: formState.newPassword,
      });
      updateSessionUser(payload);
      navigate(user?.role === 'Admin' ? '/admin/dashboard' : '/sales/dashboard', { replace: true });
    } catch (submitError) {
      setMessage(submitError.message || 'Unable to change password right now.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,white_45%,#e2e8f0)] px-4 py-8 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_36px_90px_rgba(15,23,42,0.14)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden bg-[linear-gradient(160deg,#102b5f,#283f5e_48%,#f28c28_150%)] p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">Security Update</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">Lock in a stronger password before continuing.</h1>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5" strokeWidth={1.8} />
                <p className="text-sm font-semibold">Password policy</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/75">Use at least 8 characters with both uppercase and lowercase letters. Your submit button stays locked until every requirement passes.</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10 xl:p-12">
            <div className="mx-auto max-w-xl">
              <div className="flex items-start gap-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#283f5e] text-white shadow-lg shadow-[#283f5e]/15">
                  <LockKeyhole className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Change Password</p>
                  <h2 className="mt-2 text-3xl font-bold text-[#283f5e]">Secure your account</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Update your credentials to continue into the portal. Every field stays readable on mobile and desktop.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <PasswordField
                  label="Current Password"
                  value={formState.currentPassword}
                  onChange={(event) => handleChange('currentPassword', event.target.value)}
                  visible={visibility.currentPassword}
                  onToggle={() => handleToggle('currentPassword')}
                  autoComplete="current-password"
                  placeholder="Enter your current password"
                />

                <div className="space-y-3">
                  <PasswordField
                    label="New Password"
                    value={formState.newPassword}
                    onChange={(event) => handleChange('newPassword', event.target.value)}
                    visible={visibility.newPassword}
                    onToggle={() => handleToggle('newPassword')}
                    autoComplete="new-password"
                    placeholder="Create a stronger password"
                  />
                  <PasswordChecklist checks={passwordChecks} />
                </div>

                <PasswordField
                  label="Confirm New Password"
                  value={formState.confirmPassword}
                  onChange={(event) => handleChange('confirmPassword', event.target.value)}
                  visible={visibility.confirmPassword}
                  onToggle={() => handleToggle('confirmPassword')}
                  autoComplete="new-password"
                  placeholder="Repeat your new password"
                />

                {formState.confirmPassword && !passwordsMatch ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Confirm New Password must match the new password exactly.</div> : null}
                {message ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div> : null}

                <button type="submit" disabled={!canSubmit || saving} className="w-full rounded-2xl bg-[#f28c28] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#de7f20] disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? 'Saving new password...' : 'Save new password'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
