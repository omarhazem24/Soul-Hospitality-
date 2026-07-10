import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Sidebar } from "../components/layout/Sidebar.jsx";
import { DashboardTopbar } from "../components/layout/DashboardTopbar.jsx";

const HR_NAV_ITEMS = [
  ["Dashboard", "/hr/dashboard"],
  ["Open Jobs", "/hr/jobs"],
  ["Applications", "/hr/applications"],
];

export const HRPanelLayout = () => {
  const { user, logout } = useAuth();
  const roleLabel = user?.role ? user.role.replace('_', ' ') : '';

  if (user && !["primary_admin", "secondary_admin", "hr"].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] lg:flex">
      <Sidebar
        navItems={HR_NAV_ITEMS}
        bgClassName="bg-[#24334a]"
        brandTitle="Soul Hospitality"
        brandSubtitle="HR Panel"
        user={user}
        logout={logout}
        roleLabel={roleLabel}
      />

      <section className="flex-1">
        <DashboardTopbar user={user} roleLabel={roleLabel} />

        <div className="px-6 py-6 lg:px-8">
          <Outlet />
        </div>
      </section>
    </main>
  );
};
