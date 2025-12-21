require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth/authRoutes");

const app = express();

// CORS – frontend access
app.use(
  cors({
    origin: "http://localhost:5173",
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"]
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Exam Remuneration API running");
});

module.exports = app;
