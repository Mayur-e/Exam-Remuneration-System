import axios from "axios";

const api = axios.create({
  // Use VITE_API_URL from .env, or fallback to relative /api if served together
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for 401 (Unauthorized) or specific 403 (Deactivated)
    if (error.response) {
      const isDeactivated = error.response.status === 403 &&
        (error.response.data?.message?.includes("deactivated") ||
          error.response.data?.message?.includes("disabled"));

      if (error.response.status === 401 || isDeactivated) {
        // Clear auth data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to login if not already there
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
