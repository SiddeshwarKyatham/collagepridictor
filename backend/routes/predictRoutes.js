const express  = require("express");
const router   = express.Router();
const ctrl     = require("../controllers/predictController");

// ── Predict ───────────────────────────────────────────────────
// POST /api/predict
router.post("/predict", ctrl.predictColleges);

// ── Colleges ─────────────────────────────────────────────────
// GET /api/colleges
router.get("/colleges", ctrl.getColleges);

// GET /api/colleges/:code
router.get("/colleges/:code", ctrl.getCollegeDetail);

// ── Branches ─────────────────────────────────────────────────
// GET /api/branches
router.get("/branches", ctrl.getBranches);

// ── Districts ─────────────────────────────────────────────────
// GET /api/districts
router.get("/districts", ctrl.getDistricts);

module.exports = router;
