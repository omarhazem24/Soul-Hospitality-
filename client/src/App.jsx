import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { GuestLayout } from './routes/GuestLayout.jsx';
import { GuestAccessRoute } from './routes/GuestAccessRoute.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { Home } from './pages/Home.jsx';
import { Properties } from './pages/Properties.jsx';
import { About } from './pages/About.jsx';
import { UnitDetails } from './pages/UnitDetails.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Faq } from './pages/Faq.jsx';
import { BecomeHost } from './pages/BecomeHost.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { AdminOverview } from './pages/AdminOverview.jsx';
import { AdminUnits } from './pages/AdminUnits.jsx';
import { AdminReservations } from './pages/AdminReservations.jsx';
import { AdminSchedule } from './pages/AdminSchedule.jsx';
import { AdminOwnerStatement } from './pages/AdminOwnerStatement.jsx';
import { AdminTasks } from './pages/AdminTasks.jsx';
import { AdminProfile } from './pages/AdminProfile.jsx';
import { AdminStaffForm } from './pages/AdminStaffForm.jsx';
import { AdminSlideshow } from './pages/AdminSlideshow.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<GuestAccessRoute><GuestLayout /></GuestAccessRoute>}>
        <Route path="/" element={<Home />} />
        <Route path="/units" element={<Properties />} />
        <Route path="/stays" element={<Navigate to="/units" replace />} />
        <Route path="/units/:unitId" element={<UnitDetails />} />
        <Route path="/stays/:unitId" element={<Navigate to="/units" replace />} />
        <Route path="/about-soul" element={<About />} />
        <Route path="/soul-life" element={<Navigate to="/about-soul" replace />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/become-a-host" element={<BecomeHost />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['primary_admin', 'secondary_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminOverview />} />
        <Route path="units" element={<AdminUnits />} />
        <Route path="reservations" element={<AdminReservations />} />
        <Route path="schedule" element={<AdminSchedule />} />
        <Route path="statement" element={<AdminOwnerStatement />} />
        <Route path="tasks" element={<AdminTasks />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="staff" element={<AdminStaffForm />} />
        <Route path="slideshow" element={<AdminSlideshow />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
