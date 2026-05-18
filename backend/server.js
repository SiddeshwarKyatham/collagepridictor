require("dotenv").config();

const express = require("express");
const cors    = require("cors");

const predictRoutes = require("./routes/predictRoutes");
const statsRoutes   = require("./routes/statsRoutes");

// ─────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map(s => s.trim())
  : ["http://localhost:5173"];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return cb(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(null, true); // Permissive for now; tighten after confirming deployment URL
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger (dev only) ─────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log("[%s] %s %s", new Date().toISOString(), req.method, req.path);
    next();
  });
}

// ── Health check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    service: "TG EAPCET College Predictor API",
    version: "1.0.0",
    status:  "running",
    endpoints: {
      predict:        "POST /api/predict",
      colleges:       "GET  /api/colleges",
      collegeDetail:  "GET  /api/colleges/:code",
      branches:       "GET  /api/branches",
      districts:      "GET  /api/districts",
      stats:          "GET  /api/stats",
      incrementStats: "POST /api/stats/increment"
    },
  });
});

// ── API Routes ─────────────────────────────────────────────────
app.use("/api", predictRoutes);
app.use("/api", statsRoutes);

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("==============================================");
  console.log("  TG EAPCET Predictor API");
  console.log("  Running on: http://localhost:" + PORT);
  console.log("  Environment: " + (process.env.NODE_ENV || "development"));
  console.log("==============================================");
});
