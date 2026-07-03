import React from 'react';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navClass = ({ isActive }) =>
  [
    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
    isActive ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
  ].join(' ');

const SidebarIcon = ({ label }) => {
  const common = 'h-4 w-4';

  switch (label) {
    case 'Dashboard':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path d="M4 4h7v7H4V4Zm9 0h7v4h-7V4ZM4 13h7v7H4v-7Zm9 5h7v2h-7v-2Z" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
    case 'Units':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path d="M4 20V8l8-4 8 4v12H4Z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8 20v-6h8v6" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
    case 'Reservations':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path d="M6 4v3M18 4v3M4 8h16v12H4V8Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="m8 13 2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Schedule':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path d="M4 6h16v12H4V6Z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M4 10h16M9 6v12M15 6v12" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
    case 'Owner Statement':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path d="M7 4h6l4 4v12H7V4Z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M13 4v4h4" stroke="currentColor" strokeWidth="1.7" />
          <path d="M9 12h6M9 15h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'Tasks':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path d="M5 5h14v14H5V5Z" stroke="currentColor" strokeWidth="1.7" />
          <path d="m8 12 2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
  }
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (user && !['primary_admin', 'secondary_admin'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] lg:flex">
      <aside className="flex min-h-screen w-full flex-col justify-between bg-[#1a3a8f] p-5 text-white lg:w-64">
        <div>
          <div className="flex items-center gap-3 px-1 py-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M4 20V9l8-5 8 5v11" stroke="currentColor" strokeWidth="1.7" />
                <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.7" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold">Soul Hospitality</p>
              <p className="text-xs font-medium text-white/60">Property Management</p>
            </div>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-1.5">
            {[
              ['Dashboard', '/admin/dashboard'],
              ['Units', '/admin/units'],
              ['Reservations', '/admin/reservations'],
              ['Schedule', '/admin/schedule'],
              ['Owner Statement', '/admin/statement'],
              ['Tasks', '/admin/tasks']
            ].map(([label, path]) => (
              <NavLink key={label} to={path} className={navClass}>
                <SidebarIcon label={label} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="space-y-4 border-t border-white/10 pt-4">
          <NavLink to="/admin/profile" className={navClass}>
            <SidebarIcon label="Profile" />
            <span>Profile</span>
          </NavLink>

          <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f28c28] text-sm font-bold text-white">S</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name || 'Saif Magdy'}</p>
              <p className="text-xs text-white/60">Sales</p>
            </div>
          </div>

          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-[#ffb0a3] transition-colors hover:bg-white/10 hover:text-white">
            <span>⎋</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <section className="flex-1">
        <div className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 lg:min-w-[420px]">
              <span className="text-slate-400">⌕</span>
              <input type="search" placeholder="Search..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
            </div>

            <div className="flex items-center gap-4 self-end lg:self-auto">
              <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600">
                🔔
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">9+</span>
              </button>
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f28c28] text-xs font-bold text-white">S</div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-800">{user?.name || 'Saif Magdy'}</p>
                  <p className="text-xs text-slate-500">Sales</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 lg:px-8">
          <Outlet />
        </div>
      </section>
    </main>
  );
};
