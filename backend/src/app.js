require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth/authRoutes");
const facultyRoutes = require("./routes/faculty/facultyRoutes");

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";

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

// Health check
app.get("/", (req, res) => {
  res.send("Exam Remuneration API running");
});

module.exports = app;
