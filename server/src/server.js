const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "ResolveFlow API is running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "ResolveFlow backend is healthy"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ResolveFlow server running on port ${PORT}`);
});