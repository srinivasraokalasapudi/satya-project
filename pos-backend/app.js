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
// Allow both local dev and deployed frontend origins.
// process.env.CLIENT_URL can hold a single URL or a comma-separated list.
const allowedOrigins = [
  "http://localhost:5173",
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((u) => u.trim()) : []),
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (e.g. curl, mobile apps, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io);

// =========================
// Connect Database
// =========================
connectDB();

// =========================
// Middlewares
// =========================
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =========================
// Health Check
// =========================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VASU 5-Star Hotel POS API Running Successfully 🚀",
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

// Customer self-service auth (sign up / login to order for yourself)
app.use("/api/customer-auth", require("./routes/customerAuthRoute"));

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
  console.log("🚀 VASU 5-Star Hotel POS Backend");
  console.log(`🌐 Server Running : http://localhost:${PORT}`);
  console.log("=======================================");
});