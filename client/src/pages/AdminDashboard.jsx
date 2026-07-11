import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Sidebar } from "../components/layout/Sidebar.jsx";
import { DashboardTopbar } from "../components/layout/DashboardTopbar.jsx";

const ADMIN_NAV_ITEMS = [
  ["Dashboard", "/admin/dashboard"],
  ["Units", "/admin/units"],
  ["Reservations", "/admin/reservations"],
  ["Schedule", "/admin/schedule"],
  ["Pricing", "/admin/pricing"],
  ["Commissions", "/admin/commissions"],
  ["Projects", "/admin/projects"],
  ["Promos", "/admin/promos"],
  ["Staff Accounts", "/admin/staff"],
];

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const roleLabel = user?.role ? user.role.replace('_', ' ') : '';

  if (user && user.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="admin-shell lg:flex">
      <Sidebar
        navItems={ADMIN_NAV_ITEMS}
        bgClassName="bg-[#102b5f]"
        brandTitle="Soul Hospitality"
        brandSubtitle="Property Management"
        profilePath="/admin/profile"
        user={user}
        logout={logout}
        roleLabel={roleLabel}
      />

      <section className="min-h-screen flex-1">
        <DashboardTopbar user={user} roleLabel={roleLabel} />

        <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <Outlet />
        </div>
      </section>
    </main>
  );
};
