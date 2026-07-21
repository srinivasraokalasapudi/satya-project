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

// Stable production domain (does not change between deployments).
const PRODUCTION_ORIGIN = "https://satya-project-six.vercel.app";

// Vercel gives every deployment (production + every preview build) its own
// unique hash-based URL, e.g.
//   https://satya-project-2zzr2o0rb-srinivasraokalasapudi-1696s-projects.vercel.app
//   https://satya-project-six-<hash>-srinivasraokalasapudi-1696s-projects.vercel.app
// Hardcoding one URL in CLIENT_URL breaks CORS on every new deployment, so
// we also accept any *.vercel.app subdomain that belongs to this project
// (starts with "satya-project" and ends with your Vercel team slug).
const vercelPreviewRegex =
  /^https:\/\/satya-project(-[a-z0-9]+)*-srinivasraokalasapudi-1696s-projects\.vercel\.app$/;

function isAllowedOrigin(origin) {
  return (
    origin === PRODUCTION_ORIGIN ||
    allowedOrigins.includes(origin) ||
    vercelPreviewRegex.test(origin)
  );
}

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (e.g. curl, mobile apps, server-to-server)
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      // IMPORTANT: never callback(new Error(...)) here. When the cors
      // middleware receives an error it forwards to Express's error
      // handler, which sends a response with NO Access-Control-Allow-Origin
      // header at all — the browser then reports it as a CORS failure
      // (and sometimes as a bare net::ERR_FAILED) even for legitimate,
      // simply-misconfigured origins, making it hard to tell "blocked on
      // purpose" apart from "server is down". Passing `false` instead
      // makes the cors package skip adding CORS headers for THIS origin
      // only, while still responding normally (204/200) to the preflight,
      // and logs it server-side so you can see exactly which origin to add.
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(null, false);
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

app.use(
  express.json({
    limit: "10mb",
    // Razorpay signs the *exact* raw bytes of the webhook body. If we
    // verify against JSON.stringify(req.body) instead, differences in
    // key order/whitespace/number formatting can make a legitimate
    // webhook fail signature verification. Stashing the raw buffer here
    // (cheap, happens for every request) lets the webhook handler check
    // against the real bytes without restructuring route order.
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
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

// AI-powered dish recommendations for the diner self-order screen
app.use("/api/recommendation", require("./routes/recommendationRoute"));

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