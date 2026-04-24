require("dotenv").config();
const express = require("express");
const helmet = require("helmet");

// Import security middleware
const { createCorsMiddleware, corsDebugMiddleware } = require("./middleware/corsMiddleware");
const {
  globalLimiter,
  loginLimiter,
  userAwareLimiter,
  sensitiveOperationLimiter
} = require("./middleware/rateLimitingMiddleware");
const {
  createAuthMiddleware,
  verifyJwtSecretConfigured,
  authorize
} = require("./middleware/enhancedAuthMiddleware");

// Import routes
const authRoutes = require("./routes/auth/authRoutes");
const facultyRoutes = require("./routes/faculty/facultyRoutes");
const externalRoutes = require("./routes/faculty/external.routes");
const accountantroutes = require("./routes/accountant/accountantRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");
const pdfRoutes = require("./routes/pdf.routes");
const queryRoutes = require("./routes/query.routes");
const coordinatorRoutes = require("./routes/coordinator.routes");
const staffDirectoryRoutes = require("./routes/staff_directory.routes");

// ============================================
// SECURITY VERIFICATION
// ============================================
// Verify JWT_SECRET is configured (fail fast on startup)
try {
  verifyJwtSecretConfigured();
} catch (err) {
  console.error("❌ FATAL SECURITY ERROR:", err.message);
  process.exit(1);
}

const app = express();

// ============================================
// SECURITY MIDDLEWARE - HEADERS
// ============================================
// Helmet sets various HTTP security headers
app.use(helmet({
  contentSecurityPolicy: false, // Can be enabled after frontend is updated
  crossOriginEmbedderPolicy: false,
  // Enable security headers
  xssFilter: true,
  frameguard: { action: "deny" }, // Prevent clickjacking
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  },
  noSniff: true // Prevent MIME type sniffing
}));

// ============================================
// SECURITY MIDDLEWARE - CORS
// ============================================
// Apply CORS with strict configuration
app.use(createCorsMiddleware({ requireAuth: false, allowCredentials: true }));

// Debug CORS issues (optional, enable with DEBUG_CORS=true)
app.use(corsDebugMiddleware);

// ============================================
// SECURITY MIDDLEWARE - REQUEST PARSING
// ============================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ============================================
// SECURITY MIDDLEWARE - RATE LIMITING (GLOBAL)
// ============================================
// Apply global rate limiter to all /api routes
app.use("/api/", globalLimiter);

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
// Create authentication middleware (will be applied selectively to protected routes)
const authenticate = createAuthMiddleware({
  allowQueryToken: true, // Allow token in query params for file downloads
  auditLog: true // Log authentication events
});

// ============================================
// PUBLIC ROUTES (NO AUTHENTICATION REQUIRED)
// ============================================

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Exam Remuneration System API",
    timestamp: new Date().toISOString()
  });
});

// Public configuration endpoint
app.get("/api/config", (req, res) => {
  res.json({
    googleFormUrl: process.env.GOOGLE_FORM_URL || null,
    googleFormTokenFieldId: process.env.GOOGLE_FORM_TOKEN_FIELD_ID || null,
  });
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================
// Auth routes handle their own middleware (including login rate limiting)
app.use("/api/auth", authRoutes);

// ============================================
// PROTECTED ROUTES (AUTHENTICATION REQUIRED)
// ============================================
// NOTE: Routes below handle authentication internally via their own middleware
// DO NOT apply authenticate/authorize at app level - routes already implement it

// Faculty Routes - Protected internally (requires FACULTY role)
app.use("/api/faculty", facultyRoutes);

// External Routes - Partially public (for external examiners with token), partially protected
// Note: Some routes are public (token-based), others are protected internally
app.use("/api/external", externalRoutes);

// Accountant Routes - Protected internally (requires BILLING_INCHARGE role)
app.use("/api/accountant", accountantroutes);

// Admin Routes - Protected internally (requires ADMIN role)
app.use("/api/admin", adminRoutes);

// PDF Routes - Protected internally (requires authentication)
app.use("/api/pdf", pdfRoutes);

// Query Routes - Protected internally (requires authentication)
app.use("/api", queryRoutes);

// Coordinator Routes - Protected internally (requires authentication)
app.use("/api/coordinator", coordinatorRoutes);

// Staff Directory Routes - Protected internally (requires authentication)
app.use("/api/staff-directory", staffDirectoryRoutes);

// ============================================
// STATIC FILE SERVING
// ============================================
// Serve uploaded files with appropriate headers
app.use("/uploads", (req, res, next) => {
  // Set security headers for uploaded files
  res.set("X-Content-Type-Options", "nosniff");
  res.set("X-Frame-Options", "DENY");
  next();
}, express.static("uploads"));

// ============================================
// ERROR HANDLING
// ============================================

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.path,
    method: req.method,
    code: "NOT_FOUND"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  // Log error for debugging
  console.error("[ERROR]", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress
  });

  // Handle specific error types
  if (err.message === "CORS: Origin required for this endpoint") {
    return res.status(403).json({
      success: false,
      message: "CORS policy violation",
      code: "CORS_ERROR"
    });
  }

  if (err.message && err.message.includes("CORS:")) {
    return res.status(403).json({
      success: false,
      message: err.message,
      code: "CORS_ERROR"
    });
  }

  // Default error response
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
    code: "INTERNAL_ERROR"
  });
});

module.exports = app;
