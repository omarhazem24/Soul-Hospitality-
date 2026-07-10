import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Briefcase,
  BadgePercent,
  Building2,
  CalendarCheck2,
  CalendarDays,
  FileUser,
  LayoutDashboard,
  UserCircle2
} from 'lucide-react';

const navClass = ({ isActive }) =>
  [
    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
    isActive ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
  ].join(' ');

const SidebarIcon = ({ label }) => {
  const common = 'h-4 w-4';

  switch (label) {
    case 'Dashboard':
      return <LayoutDashboard className={common} strokeWidth={1.5} aria-hidden="true" />;
    case 'Units':
      return <Building2 className={common} strokeWidth={1.5} aria-hidden="true" />;
    case 'Reservations':
      return <CalendarCheck2 className={common} strokeWidth={1.5} aria-hidden="true" />;
    case 'Schedule':
      return <CalendarDays className={common} strokeWidth={1.5} aria-hidden="true" />;
    case 'Promos':
      return <BadgePercent className={common} strokeWidth={1.5} aria-hidden="true" />;
    case 'Recruitment':
    case 'Open Jobs':
      return <Briefcase className={common} strokeWidth={1.5} aria-hidden="true" />;
    case 'Applications':
      return <FileUser className={common} strokeWidth={1.5} aria-hidden="true" />;
    case 'Profile':
      return <UserCircle2 className={common} strokeWidth={1.5} aria-hidden="true" />;
    default:
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
  }
};

export const Sidebar = ({
  navItems,
  bgClassName = 'bg-[#1a3a8f]',
  brandTitle = 'Soul Hospitality',
  brandSubtitle = 'Property Management',
  profilePath,
  user,
  logout,
  roleLabel = ''
}) => {
  const displayName = user?.name || user?.email || 'Account';
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className={`flex min-h-screen w-full flex-col justify-between p-5 text-white shadow-2xl lg:w-64 ${bgClassName}`}>
      <div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white shadow-sm">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="M4 20V9l8-5 8 5v11" stroke="currentColor" strokeWidth="1.7" />
              <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold leading-tight">{brandTitle}</p>
            <p className="text-xs font-medium text-white/60">{brandSubtitle}</p>
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1.5">
          {navItems.map(([label, path]) => (
            <NavLink key={label} to={path} className={navClass}>
              <SidebarIcon label={label} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-4 border-t border-white/10 pt-4">
        {profilePath ? (
          <NavLink to={profilePath} className={navClass}>
            <SidebarIcon label="Profile" />
            <span>Profile</span>
          </NavLink>
        ) : null}

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f28c28] text-sm font-bold text-white shadow-sm">
            {displayInitial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="text-xs text-white/60">{roleLabel || user?.role || ''}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-[#ffb0a3] transition-colors hover:bg-white/10 hover:text-white"
        >
          <span>⎋</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
