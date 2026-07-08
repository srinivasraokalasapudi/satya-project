const express = require("express");
const connectDB = require("./config/database");
const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const io = new Server(server, {
  cors: {
    origin: clientUrl,
    credentials: true,
  },
});

app.set("io", io);

// =========================
// Connect Database
// =========================
connectDB();

// =========================
// Middlewares
// =========================
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =========================
// Health Check
// =========================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Satya 5-Star Hotel POS API Running Successfully 🚀",
    version: "1.0.0",
    timestamp: new Date(),
  });
});

io.on("connection", (socket) => {
  socket.emit("dashboard:connected", {
    connected: true,
    timestamp: new Date(),
  });
});

// =========================
// API Routes
// =========================

// Authentication
app.use("/api/user", require("./routes/userRoute"));

// Orders
app.use("/api/order", require("./routes/orderRoute"));

// Tables
app.use("/api/table", require("./routes/tableRoute"));

// Payments
app.use("/api/payment", require("./routes/paymentRoute"));

// Customers
app.use("/api/customer", require("./routes/customerRoute"));

// Dashboard
app.use("/api/dashboard", require("./routes/dashboardRoute"));

// Reports
app.use("/api/report", require("./routes/reportRoutes"));

// Inventory
app.use("/api/inventory", require("./routes/inventoryRoutes"));

// Staff
app.use("/api/staff", require("./routes/staffRoutes"));

// Settings
app.use("/api/settings", require("./routes/settingsRoutes"));

// =========================
// 404 Route Handler
// =========================
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// =========================
// Global Error Handler
// =========================
app.use(globalErrorHandler);

// =========================
// Start Server
// =========================
const PORT = config.port || process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("=======================================");
  console.log("🚀 Satya 5-Star Hotel POS Backend");
  console.log(`🌐 Server Running : http://localhost:${PORT}`);
  console.log("✅ Database Connected");
  console.log("=======================================");
});
