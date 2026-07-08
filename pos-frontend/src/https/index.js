import { axiosWrapper } from "./axiosWrapper";

// =========================
// Auth APIs
// =========================

export const login = (data) =>
  axiosWrapper.post("/api/user/login", data);

export const register = (data) =>
  axiosWrapper.post("/api/user/register", data);

export const getUserData = () =>
  axiosWrapper.get("/api/user");

export const getDashboardStats = () =>
  axiosWrapper.get("/api/dashboard");

export const logout = () =>
  axiosWrapper.post("/api/user/logout");

// =========================
// Table APIs
// =========================

export const addTable = (data) =>
  axiosWrapper.post("/api/table", data);

export const getTables = () =>
  axiosWrapper.get("/api/table");

export const updateTable = ({ tableId, ...tableData }) =>
  axiosWrapper.put(`/api/table/${tableId}`, tableData);

export const resetTable = (tableId) =>
  axiosWrapper.put(`/api/table/reset/${tableId}`);

// =========================
// Order APIs
// =========================

export const addOrder = (data) =>
  axiosWrapper.post("/api/order", data);

export const getOrders = () =>
  axiosWrapper.get("/api/order");

export const updateOrderStatus = ({ orderId, orderStatus }) =>
  axiosWrapper.put(`/api/order/${orderId}`, {
    orderStatus,
  });

// =========================
// Payment APIs
// =========================

export const createOrderRazorpay = (data) =>
  axiosWrapper.post("/api/payment/create-order", data);

export const verifyPaymentRazorpay = (data) =>
  axiosWrapper.post("/api/payment/verify-payment", data);

// =========================
// Reports APIs
// =========================

export const getReports = () =>
  axiosWrapper.get("/api/report");

// =========================
// Inventory APIs
// =========================

export const getInventory = () =>
  axiosWrapper.get("/api/inventory");

export const addInventory = (data) =>
  axiosWrapper.post("/api/inventory", data);

export const updateInventory = ({ id, ...data }) =>
  axiosWrapper.put(`/api/inventory/${id}`, data);

export const deleteInventory = (id) =>
  axiosWrapper.delete(`/api/inventory/${id}`);

// =========================
// Staff APIs
// =========================

export const getStaff = () =>
  axiosWrapper.get("/api/staff");

export const addStaff = (data) =>
  axiosWrapper.post("/api/staff", data);

export const updateStaff = ({ id, ...data }) =>
  axiosWrapper.put(`/api/staff/${id}`, data);

export const deleteStaff = (id) =>
  axiosWrapper.delete(`/api/staff/${id}`);

// =========================
// Customer APIs
// =========================

export const getCustomers = () =>
  axiosWrapper.get("/api/customer");

// =========================
// Payment History APIs
// =========================

export const getPayments = () =>
  axiosWrapper.get("/api/payment");

// =========================
// Settings APIs
// =========================

export const getSettings = () =>
  axiosWrapper.get("/api/settings");

export const updateSettings = (data) =>
  axiosWrapper.put("/api/settings", data);