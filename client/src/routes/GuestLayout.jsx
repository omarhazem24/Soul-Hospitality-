import React from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from '../components/layout/Footer.jsx';
import { Navbar } from '../components/layout/Navbar.jsx';

export const GuestLayout = () => {
  return (
    <div className="min-h-screen bg-white text-brand">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};
