import axios from "axios";

const defaultHeader = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const axiosWrapper = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: { ...defaultHeader },
});

// Cookies set cross-domain (frontend on Vercel, backend on Render) are
// blocked as "third-party" by several mobile browsers even with
// SameSite=None; Secure. As a reliable fallback across all devices, we
// also send the token explicitly via the Authorization header whenever
// we have one stored locally.
axiosWrapper.interceptors.request.use((config) => {
  const isCustomerSelfServiceRoute =
    config.url?.startsWith("/api/customer-auth") ||
    config.url?.startsWith("/api/order/self") ||
    config.url?.startsWith("/api/order/mine");

  const token = isCustomerSelfServiceRoute
    ? localStorage.getItem("customerAccessToken")
    : localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
