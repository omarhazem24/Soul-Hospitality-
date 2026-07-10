import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const isChangePasswordRoute = location.pathname === '/change-password';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (['Sales', 'Admin'].includes(user?.role) && user?.isFirstLogin && !isChangePasswordRoute) {
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
