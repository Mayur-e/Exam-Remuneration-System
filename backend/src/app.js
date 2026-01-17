require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth/authRoutes");
const facultyRoutes = require("./routes/faculty/facultyRoutes");
const externalRoutes = require("./routes/faculty/external.routes");
const accountantroutes = require("./routes/accountant/accountantRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";

// Security: Helmet - sets various HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now to avoid breaking the app
  crossOriginEmbedderPolicy: false
}));

// Security: Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all API routes
app.use("/api/", limiter);

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"]
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/external", externalRoutes);
app.use("/api/accountant", accountantroutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/", (req, res) => {
  res.send("Exam Remuneration API running");
});

module.exports = app;
