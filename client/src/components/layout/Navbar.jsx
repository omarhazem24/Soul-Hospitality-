import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { BrandWordmark } from './BrandWordmark.jsx';

const navLinkClass = ({ isActive }) =>
  [
    'text-sm font-semibold uppercase tracking-[0.2em] transition-colors duration-150 hover:text-[#283f5e]',
    isActive ? 'text-[#283f5e]' : 'text-brand/70'
  ].join(' ');

const actionButtonClass =
  'rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand no-underline transition-all duration-300 ease-out hover:bg-[#283f5e] hover:text-white hover:border-[#283f5e] hover:shadow-lg hover:shadow-slate-900/15 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.16em]';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const headerElement = headerRef.current;

    if (!headerElement) {
      return undefined;
    }

    const updateHeight = () => {
      setHeaderHeight(headerElement.offsetHeight);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(headerElement);
    window.addEventListener('resize', updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [isScrolled, isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md transition-shadow duration-300"
      >
        <div
          className={[
            'page-container flex items-center justify-between gap-3 transition-all duration-300 ease-out sm:gap-5 lg:gap-8',
            isScrolled ? 'min-h-12 py-2 lg:min-h-16 lg:py-2' : 'min-h-14 py-2 sm:py-3 lg:min-h-20 lg:py-4'
          ].join(' ')}
        >
          <Link to="/" className="no-underline flex shrink-0 items-center">
            <BrandWordmark className={isScrolled ? 'h-20' : 'h-24'} />
          </Link>

          <nav
            className={[
              'hidden items-center transition-all duration-300 ease-out lg:flex xl:gap-10',
              isScrolled ? 'gap-6' : 'gap-8'
            ].join(' ')}
          >
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

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className={`${actionButtonClass} lg:hidden`}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile navigation"
            >
              {isMobileMenuOpen ? 'Close' : 'Menu'}
            </button>

            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className={actionButtonClass}
              >
                Login
              </Link>
            ) : (
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs tracking-[0.12em] text-brand md:flex">
                <span className="font-semibold uppercase">{user?.name || user?.email}</span>
                <button type="button" onClick={logout} className="ml-2 uppercase tracking-[0.16em] text-brand/70">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {isMobileMenuOpen ? (
          <>
            <button
              type="button"
              aria-label="Close mobile navigation"
              className="fixed inset-0 z-40 bg-slate-900/25 lg:hidden"
              onClick={closeMobileMenu}
            />
            <div className="page-container relative z-50 pb-4 lg:hidden">
              <nav className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10">
                <div className="flex flex-col gap-3">
                  <NavLink to="/" end className={navLinkClass} onClick={closeMobileMenu}>
                    Home
                  </NavLink>
                  <NavLink to="/units" className={navLinkClass} onClick={closeMobileMenu}>
                    Properties
                  </NavLink>
                  <NavLink to="/about-soul" className={navLinkClass} onClick={closeMobileMenu}>
                    About Soul
                  </NavLink>
                  <NavLink to="/faq" className={navLinkClass} onClick={closeMobileMenu}>
                    FAQ
                  </NavLink>
                  <NavLink to="/become-a-host" className={navLinkClass} onClick={closeMobileMenu}>
                    Become a Host
                  </NavLink>

                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="mt-2 rounded-full border border-slate-200 px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.16em] text-brand"
                    >
                      Logout
                    </button>
                  ) : null}
                </div>
              </nav>
            </div>
          </>
        ) : null}
      </header>

      <div
        aria-hidden="true"
        className="transition-[height] duration-300 ease-out"
        style={{ height: headerHeight }}
      />
    </>
  );
};