const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const { apiLimiter } = require("./middleware/rateLimit");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Trust proxy (Render, Heroku, etc.) so req.protocol is correct for HTTPS URLs
app.set("trust proxy", 1);

// Connect to MongoDB
connectDB();

function isAllowedOrigin(origin) {
  if (!origin) return true;
  const allowed = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  if (allowed.includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    if (hostname === "didostati.store" || hostname === "www.didostati.store") {
      return true;
    }
    // Vercel production + preview URLs for this project
    if (
      hostname.endsWith(".vercel.app") &&
      (hostname.startsWith("didostati-frontend") ||
        hostname.includes("giorgiilarianis-projects"))
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

// Middleware - CORS, parsing, logging, rate limiting
const corsOrigin =
  process.env.NODE_ENV === "production"
    ? (origin, callback) => {
        if (isAllowedOrigin(origin)) callback(null, true);
        else callback(new Error("Not allowed by CORS"));
      }
    : true;
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Visitor-Id",
      "x-visitor-id",
    ],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve uploaded files (advertisement media, etc.)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Global API rate limiter
app.use("/api", apiLimiter);

// API Routes
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/otp", require("./routes/otpRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/advertisements", require("./routes/advertisementRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/support", require("./routes/supportRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "Didostati API is running!",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Didostati API server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
