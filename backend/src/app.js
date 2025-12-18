require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth/authRoutes");

const app = express();

// ✅ CORS (allow frontend)
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

// ✅ AUTH ROUTES
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Backend alive");
});

module.exports = app;
