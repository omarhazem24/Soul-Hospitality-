import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { BrandWordmark } from './BrandWordmark.jsx';

const navLinkClass = ({ isActive }) =>
  [
    'text-sm font-semibold uppercase tracking-[0.2em] transition-colors duration-150 hover:text-[#283f5e]',
    isActive ? 'text-[#283f5e]' : 'text-brand/70'
  ].join(' ');

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="page-container flex min-h-28 items-center justify-between gap-8 py-6">
        <Link to="/" className="no-underline">
          <BrandWordmark />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex xl:gap-10">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/units" className={navLinkClass}>
            Properties
          </NavLink>
          <NavLink to="/about-soul" className={navLinkClass}>
              About Soul
          </NavLink>
          <NavLink to="/faq" className={navLinkClass}>
            FAQ
          </NavLink>
          <NavLink to="/become-a-host" className={navLinkClass}>
            Become a Host
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.16em] text-brand no-underline transition-all duration-300 ease-out hover:bg-[#283f5e] hover:text-white hover:border-[#283f5e] hover:shadow-lg hover:shadow-slate-900/15 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
            >
              Login
            </Link>
          ) : (
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm tracking-[0.12em] text-brand md:flex">
              <span className="font-semibold uppercase">{user?.name || user?.email}</span>
              <button type="button" onClick={logout} className="ml-2 uppercase tracking-[0.16em] text-brand/70">
                Logout
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
