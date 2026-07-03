import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const adminRoles = ['primary_admin', 'secondary_admin'];

export const GuestAccessRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isAuthenticated && adminRoles.includes(user?.role)) {
    return <Navigate to="/admin/dashboard" replace state={{ from: location.pathname }} />;
  }

  return children;
};
