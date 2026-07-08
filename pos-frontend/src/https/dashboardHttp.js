// dashboardHttp.js
// Endpoints backing the "More" dashboard's live-status, recent-activity and
// quick-action widgets. Mirrors the pattern used in `reportHttp.js`:
// callers should try the real endpoint first and fall back to demo/neutral
// state if it 404s or the backend route isn't built yet — never show a fake
// "Connected" status when we don't actually know.

import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
});

// GET /api/health
// Expected shape: { posServer, kitchenPrinter, receiptPrinter, internet, database, paymentGateway }
// Each value is one of: "ok" | "degraded" | "down"
export const getSystemHealth = () => api.get("/health");

// GET /api/order/recent?limit=6
// Expected shape: [{ id, title, status: "In Progress" | "Ready" | "Completed", time }]
export const getRecentActivity = (limit = 6) =>
  api.get("/order/recent", { params: { limit } });

// Quick Action endpoints — each is a POST that kicks off a real operation.
// If the route doesn't exist yet, the caller shows a clear failure state
// instead of pretending the action succeeded.
export const generateDailyReport = () => api.post("/reports/daily/generate");
export const runDatabaseBackup = () => api.post("/system/backup");
export const syncMenu = () => api.post("/menu/sync");
