import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const STORAGE_KEY = "soul-hospitality-auth";

let currentToken = null;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

const extractPayload = (response) => response?.data?.data ?? response?.data;

const readStoredAuth = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
};

export const getStoredAuth = () => readStoredAuth();

export const persistAuth = (authState) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
};

export const clearStoredAuth = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};

export const setAuthToken = (token) => {
  currentToken = token || null;

  if (currentToken) {
    api.defaults.headers.common.Authorization = `Bearer ${currentToken}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

api.interceptors.request.use((config) => {
  const nextConfig = { ...config };
  const headers = { ...(nextConfig.headers || {}) };
  const isFormData =
    typeof FormData !== "undefined" && nextConfig.data instanceof FormData;

  if (currentToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${currentToken}`;
  }

  if (isFormData) {
    delete headers["Content-Type"];
    delete headers["content-type"];
  } else if (
    nextConfig.data &&
    !headers["Content-Type"] &&
    !headers["content-type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  nextConfig.headers = headers;
  return nextConfig;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Request failed";
    return Promise.reject(new Error(message));
  },
);

export const apiGet = async (path, params = {}) => {
  const response = await api.get(path, { params });
  return extractPayload(response);
};

export const apiPost = async (path, body = {}, config = {}) => {
  const response = await api.post(path, body, config);
  return extractPayload(response);
};

export const apiPatch = async (path, body = {}, config = {}) => {
  const response = await api.patch(path, body, config);
  return extractPayload(response);
};

export const apiPut = async (path, body = {}, config = {}) => {
  const response = await api.put(path, body, config);
  return extractPayload(response);
};

export const apiDelete = async (path, config = {}) => {
  const response = await api.delete(path, config);
  return extractPayload(response);
};

export const fetchAvailableUnits = (params = {}) => apiGet("/units", params);
export const fetchUnitDetails = (unitId) => apiGet(`/units/${unitId}`);
export const fetchUnitReviews = (unitId) => apiGet(`/units/${unitId}/reviews`);
export const createUnitReview = (unitId, payload) => apiPost(`/reviews/unit/${unitId}`, payload);
export const fetchDashboardSummary = () => apiGet("/admin/dashboard/summary");
export const fetchAdminCommissionsSummary = () => apiGet('/admin/dashboard/commissions');
export const fetchSalesDashboardSummary = () => apiGet("/sales/dashboard");
export const fetchSalesReservations = () => apiGet("/sales/bookings");
export const fetchSalesSchedule = () => apiGet("/sales/schedule");
export const fetchSalesCommissions = () => apiGet("/sales/commissions");
export const fetchSalesNotifications = () => apiGet('/notifications/sales');
export const markSalesNotificationsRead = () => apiPatch('/notifications/sales/read', {});
export const updateSalesReservationStatus = (bookingId, status) =>
  apiPatch(`/sales/bookings/${bookingId}/status`, { status });
export const deleteSalesReservation = (bookingId) =>
  apiDelete(`/sales/bookings/${bookingId}`);
export const fetchRecruitmentSummary = () => apiGet("/recruitment/summary");
export const fetchAdminUnits = (params = {}) => apiGet("/admin/units", params);
export const fetchAdminSlideshows = () => apiGet("/admin/slideshow");
export const fetchJobs = () => apiGet("/recruitment/jobs");
export const submitJobApplication = (formData) =>
  apiPost("/recruitment/apply", formData);
export const fetchAdminJobs = () => apiGet("/admin/recruitment/jobs");
export const createAdminJob = (payload) =>
  apiPost("/admin/recruitment/jobs", payload);
export const deleteAdminJob = (jobId) =>
  apiDelete(`/admin/recruitment/jobs/${jobId}`);
export const fetchAdminApplications = () =>
  apiGet("/admin/recruitment/applications");
export const deleteAdminApplication = (applicationId) =>
  apiDelete(`/admin/recruitment/applications/${applicationId}`);
export const updateApplicationStatus = (applicationId, status) =>
  apiPatch(`/recruitment/applications/${applicationId}/status`, { status });
export const fetchAdminBookingRequests = (params = {}) =>
  apiGet("/admin/bookings/requests", params);
export const updateAdminBookingStatus = (bookingId, status) =>
  apiPatch(`/admin/bookings/${bookingId}/status`, { status });
export const deleteAdminBookingRequest = (bookingId) =>
  apiDelete(`/admin/bookings/${bookingId}`);
export const fetchProjectNames = () => apiGet("/projects");
export const fetchProjectCatalog = async () => {
  try {
    return await apiGet("/projects/catalog");
  } catch (error) {
    // Backward-compatible fallback when catalog endpoint is not available.
    const destinationList = await fetchProjectNames();
    const safeDestinations = Array.isArray(destinationList) ? destinationList : [];

    return {
      destinations: safeDestinations,
      projectsByDestination: safeDestinations.reduce((acc, destination) => {
        acc[destination] = [];
        return acc;
      }, {}),
    };
  }
};
export const createProjectName = (payload) => apiPost("/projects", payload);
export const createAdminBookingRequest = (payload) =>
  apiPost("/admin/bookings", payload);
export const createSalesBookingRequest = (payload, config = {}) =>
  apiPost("/sales/bookings", payload, config);
export const createBookingHold = (payload) => apiPost("/bookings/checkout", payload);
export const fetchPromoCodes = () => apiGet("/promo-codes/admin/promo-codes");
export const createPromoCode = (payload) => apiPost("/promo-codes/admin/promo-codes", payload);
export const deletePromoCode = (promoCodeId) => apiDelete(`/promo-codes/admin/promo-codes/${promoCodeId}`);
export const validatePromoCode = (payload) => apiPost("/promo-codes/validate", payload);
export const loginRequest = (payload) => apiPost("/auth/login", payload);
export const registerRequest = (payload) => apiPost("/auth/register", payload);
export const forgotPasswordRequest = (payload) => apiPost('/auth/forgot-password', payload);
export const resetPasswordRequest = (payload) => apiPost('/auth/reset-password', payload);
export const fetchCurrentUser = () => apiGet("/auth/me");
export const changePasswordRequest = (payload) => apiPatch("/auth/change-password", payload);
export const createAdminUnit = (formData) => apiPost("/admin/units", formData);
export const quickEditProperty = (unitId, payload) => apiPatch(`/properties/${unitId}/quick-edit`, payload);
export const createStaffMember = (payload) =>
  apiPost("/admin/create-staff", payload);
export const fetchStaffAccounts = () => apiGet('/admin/staff');
export const deleteStaffAccount = (staffId) => apiDelete(`/admin/staff/${staffId}`);
export const createAdminSlideshow = (formData) =>
  apiPost("/admin/slideshow", formData);
export const deleteAdminSlideshow = (slideId) =>
  apiDelete(`/admin/slideshow/${slideId}`);
