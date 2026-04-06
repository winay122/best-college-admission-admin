import axios from 'axios';

// Centralized backend configuration
// In Vite projects, environment variables must be prefixed with VITE_ to be exposed to the client bundle.
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const ASSET_URL = import.meta.env.VITE_ASSET_URL || 'http://localhost:5000';

// Create a globally configured Axios instance
const api = axios.create({
  baseURL: BASE_URL, // Maps perfectly to our Express router
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach the JWT token dynamically to every outbound request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to detect 401/403 and force logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns 401 (Unauth) or 403 (Forbidden), the token is likely stale or invalid
    if (error.response && [401, 403].includes(error.response.status)) {
      console.warn('Authentication token expired or insufficient permissions. Evicting session.');
      
      // Purge local storage to clear stale session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login (forces a full reload which resets the AuthContext)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
