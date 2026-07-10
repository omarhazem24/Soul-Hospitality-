import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { DashboardTopbar } from '../components/layout/DashboardTopbar.jsx';

const SALES_NAV_ITEMS = [
  ['Dashboard', '/sales/dashboard'],
  ['Reservations', '/sales/reservations'],
  ['Schedule', '/sales/schedule'],
];

const isSalesRole = (role) => role === 'Sales';

export const SalesPortalLayout = () => {
  const { user, logout } = useAuth();

  if (user && !isSalesRole(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="admin-shell lg:flex">
      <Sidebar
        navItems={SALES_NAV_ITEMS}
        bgClassName="bg-[#24334a]"
        brandTitle="Soul Hospitality"
        brandSubtitle="Sales Portal"
        profilePath="/change-password"
        user={user}
        logout={logout}
        roleLabel="Sales"
      />

      <section className="min-h-screen flex-1">
        <DashboardTopbar user={user} roleLabel="Sales" />
        <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <Outlet />
        </div>
      </section>
    </main>
  );
};