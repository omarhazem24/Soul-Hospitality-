import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const isAdminRole = (role) => ["Admin", "primary_admin", "secondary_admin"].includes(role);
const isSalesRole = (role) => role === "Sales";

export const GuestAccessRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isAuthenticated && isAdminRole(user?.role)) {
    return (
      <Navigate
        to="/admin/dashboard"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (isAuthenticated && isSalesRole(user?.role) && user?.isFirstLogin) {
    return (
      <Navigate
        to="/change-password"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (isAuthenticated && isSalesRole(user?.role)) {
    return (
      <Navigate
        to="/sales/dashboard"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
};
