// reportHttp.js
// Report API calls. Mirrors the pattern used by the rest of `src/https`
// (cookie-based session auth via withCredentials).
//
// If your project already has a shared axios instance exported from
// `src/https/index.js`, feel free to delete this file and import that
// instance here instead - the important part is the four endpoints below.

import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
});

// GET /api/reports/live
// Expected shape: { revenue, orders, activeTables, avgPrepTime, goal, growth, chart: [{label,value}], topItems }
export const getLiveReport = () => api.get("/reports/live");
export const getDashboardReport = () => api.get("/report/dashboard");

// GET /api/reports/daily?days=7
// Expected shape: { revenue, orders, bestDay, goal, growth, chart: [{label,value}], topItems }
export const getDailyReport = (days = 7) =>
  api.get("/report/daily", { params: { days } });

// GET /api/reports/weekly?weeks=6
// Expected shape: { revenue, orders, goal, growth, chart: [{label,value}], topItems }
export const getWeeklyReport = (weeks = 6) =>
  api.get("/report/weekly", { params: { weeks } });

// GET /api/reports/monthly?months=6
// Expected shape: { revenue, orders, goal, growth, chart: [{label,value}], topItems }
export const getMonthlyReport = (months = 6) =>
  api.get("/report/monthly", { params: { months } });

export const REPORT_FETCHERS = {
  live: getLiveReport,
  daily: getDailyReport,
  weekly: getWeeklyReport,
  monthly: getMonthlyReport,
};
