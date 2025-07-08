// src/api/api.js
import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: "https://newzzy-ynxa.onrender.com/api",
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("AccessToken");
    if (token) {
      // Add token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Clear local storage on unauthorized or refresh token expired
      localStorage.removeItem("user");
      localStorage.removeItem("AccessToken");

      // Show toast notification for session expiry
      if (error.response.status === 403) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Authentication failed. Please log in again.");
      }

      // Dispatch custom event to notify auth context
      window.dispatchEvent(new CustomEvent("auth-logout"));

      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Optional: Request Interceptor
// api.interceptors.request.use(
//   (config) => {
//     // Example: Add auth token from localStorage
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Optional: Response Interceptor
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Handle unauthorized errors globally
//       console.error("Unauthorized! Redirect to login.");
//     }
//     return Promise.reject(error);
//   }
// );
