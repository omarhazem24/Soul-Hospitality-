import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const STORAGE_KEY = 'soul-hospitality-auth';

let currentToken = null;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000
});

const extractPayload = (response) => response?.data?.data ?? response?.data;

const readStoredAuth = () => {
  if (typeof window === 'undefined') {
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
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
};

export const clearStoredAuth = () => {
  if (typeof window === 'undefined') {
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
  const isFormData = typeof FormData !== 'undefined' && nextConfig.data instanceof FormData;

  if (currentToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${currentToken}`;
  }

  if (isFormData) {
    delete headers['Content-Type'];
    delete headers['content-type'];
  } else if (nextConfig.data && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  nextConfig.headers = headers;
  return nextConfig;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
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

export const fetchAvailableUnits = (params = {}) => apiGet('/units', params);
export const fetchDashboardSummary = () => apiGet('/admin/dashboard/summary');
export const fetchAdminUnits = (params = {}) => apiGet('/admin/units', params);
export const fetchAdminStaff = () => apiGet('/admin/recruitment');
export const fetchAdminSlideshows = () => apiGet('/admin/slideshow');
export const fetchAdminBookingRequests = (params = {}) => apiGet('/admin/bookings/requests', params);
export const createAdminBookingRequest = (payload) => apiPost('/admin/bookings', payload);
export const loginRequest = (payload) => apiPost('/auth/login', payload);
export const registerRequest = (payload) => apiPost('/auth/register', payload);
export const createAdminUnit = (formData) => apiPost('/admin/units', formData);
export const createStaffMember = (payload) => apiPost('/admin/create-staff', payload);
export const createAdminSlideshow = (formData) => apiPost('/admin/slideshow', formData);
export const deleteAdminSlideshow = (slideId) => apiDelete(`/admin/slideshow/${slideId}`);
