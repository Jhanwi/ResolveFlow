require("dotenv").config();
const express = require("express");
const cors = require("cors");

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const agentRoutes = require("./routes/agentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const slaRoutes = require("./routes/slaRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "ResolveFlow API is running"
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "ok",
      message: "ResolveFlow backend is healthy",
      database: "connected",
      time: result.rows[0].now
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed"
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/sla", slaRoutes);
app.use(
  "/api/notifications",
  notificationRoutes
);
app.use(
  "/api/customer",
  reviewRoutes
);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ResolveFlow server running on port ${PORT}`);
});