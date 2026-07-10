import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { GuestLayout } from "./routes/GuestLayout.jsx";
import { GuestAccessRoute } from "./routes/GuestAccessRoute.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";
import { Home } from "./pages/Home.jsx";
import { Properties } from "./pages/Properties.jsx";
import { About } from "./pages/About.jsx";
import { UnitDetails } from "./pages/UnitDetails.jsx";
import { Login } from "./pages/Login.jsx";
import { Register } from "./pages/Register.jsx";
import { ForgotPassword } from "./pages/ForgotPassword.jsx";
import { Faq } from "./pages/Faq.jsx";
import { ResetPassword } from "./pages/ResetPassword.jsx";
import { BecomeHost } from "./pages/BecomeHost.jsx";
import { Careers } from "./pages/Careers.jsx";
import { Contact } from "./pages/Contact.jsx";
import { AdminDashboard } from "./pages/AdminDashboard.jsx";
import { AdminOverview } from "./pages/AdminOverview.jsx";
import { AdminUnits } from "./pages/AdminUnits.jsx";
import { AdminReservations } from "./pages/AdminReservations.jsx";
import { AdminSchedule } from "./pages/AdminSchedule.jsx";
import { AdminProfile } from "./pages/AdminProfile.jsx";
import { AdminPromoManagement } from "./pages/AdminPromoManagement.jsx";
import { AdminRecruitment } from "./pages/AdminRecruitment.jsx";
import { AdminProjects } from "./pages/AdminProjects.jsx";
import { AdminCommissions } from "./pages/AdminCommissions.jsx";
import { AdminStaffForm } from "./pages/AdminStaffForm.jsx";
import { AdminSlideshow } from "./pages/AdminSlideshow.jsx";
import { SalesPortalLayout } from "./pages/SalesPortalLayout.jsx";
import { SalesDashboard } from "./pages/SalesDashboard.jsx";
import { SalesReservations } from "./pages/SalesReservations.jsx";
import { SalesSchedule } from "./pages/SalesSchedule.jsx";
import { ChangePassword } from "./pages/ChangePassword.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import { FloatingWhatsAppTrigger } from "./components/layout/FloatingWhatsAppTrigger.jsx";

export default function App() {
  return (
    <div className="mx-auto w-full max-w-[1920px]">
      <FloatingWhatsAppTrigger />
      <Routes>
        <Route
          element={
            <GuestAccessRoute>
              <GuestLayout />
            </GuestAccessRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/units" element={<Properties />} />
          <Route path="/stays" element={<Navigate to="/units" replace />} />
          <Route path="/units/:unitId" element={<UnitDetails />} />
          <Route
            path="/stays/:unitId"
            element={<Navigate to="/units" replace />}
          />
          <Route path="/about-soul" element={<About />} />
          <Route
            path="/soul-life"
            element={<Navigate to="/about-soul" replace />}
          />
          <Route path="/faq" element={<Faq />} />
          <Route path="/become-a-host" element={<BecomeHost />} />
          <Route path="contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/checkout/payment" element={<PaymentPage />} />
          <Route path="/checkout/payment/callback" element={<PaymentPage />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute allowedRoles={["Sales", "Admin"]}>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminOverview />} />
          <Route path="units" element={<AdminUnits />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="schedule" element={<AdminSchedule />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="commissions" element={<AdminCommissions />} />
          <Route path="promos" element={<AdminPromoManagement />} />
          <Route path="recruitment" element={<AdminRecruitment />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="staff" element={<AdminStaffForm />} />
          <Route path="slideshow" element={<AdminSlideshow />} />
        </Route>

        <Route
          path="/sales"
          element={
            <ProtectedRoute allowedRoles={["Sales"]}>
              <SalesPortalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/sales/dashboard" replace />} />
          <Route path="dashboard" element={<SalesDashboard />} />
          <Route path="reservations" element={<SalesReservations />} />
          <Route path="schedule" element={<SalesSchedule />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
