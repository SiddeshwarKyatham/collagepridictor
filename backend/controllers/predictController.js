const predictionService = require("../services/predictionService");

/**
 * POST /api/predict
 * Body: { rank, category, gender, branches, phase, district, collegeType, limit }
 */
async function predictColleges(req, res) {
  try {
    const { rank, category, gender, branches, phase, district, collegeType, limit } = req.body;

    // ── Validation ───────────────────────────────────────────
    const errors = [];

    if (!rank || isNaN(rank) || rank <= 0) {
      errors.push("rank must be a positive number");
    }

    const validCategories = ["OC","BC_A","BC_B","BC_C","BC_D","BC_E","SC_I","SC_II","SC_III","ST","EWS"];
    if (!category || !validCategories.includes(category.toUpperCase())) {
      errors.push(`category must be one of: ${validCategories.join(", ")}`);
    }

    if (!gender || !["BOYS","GIRLS"].includes(gender.toUpperCase())) {
      errors.push("gender must be BOYS or GIRLS");
    }

    const validPhases = ["First", "Second", "Final"];
    if (phase && !validPhases.includes(phase)) {
      errors.push(`phase must be one of: ${validPhases.join(", ")}`);
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // ── Call service ──────────────────────────────────────────
    const result = await predictionService.predict({
      rank:        parseInt(rank),
      category:    category.toUpperCase(),
      gender:      gender.toUpperCase(),
      branches:    Array.isArray(branches) ? branches : (branches ? [branches] : []),
      phase:       phase || "Final",
      district,
      collegeType,
      limit:       limit ? parseInt(limit) : 200,
    });

    return res.json({ success: true, ...result });

  } catch (err) {
    console.error("[predictColleges] Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

/**
 * GET /api/colleges
 * Query: ?district=HYD&collegeType=PVT&phase=Final&search=...
 */
async function getColleges(req, res) {
  try {
    const { district, collegeType, phase, search } = req.query;
    const colleges = await predictionService.getColleges({ district, collegeType, phase, search });
    return res.json({ success: true, total: colleges.length, colleges });
  } catch (err) {
    console.error("[getColleges] Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

/**
 * GET /api/colleges/:code
 * Params: code (college code), Query: phase, year
 */
async function getCollegeDetail(req, res) {
  try {
    const { code } = req.params;
    const { phase, year } = req.query;
    const detail = await predictionService.getCollegeDetail({
      collegeCode: code.toUpperCase(),
      phase,
      year,
    });

    if (!detail) {
      return res.status(404).json({ success: false, error: "College not found" });
    }

    return res.json({ success: true, college: detail });
  } catch (err) {
    console.error("[getCollegeDetail] Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

/**
 * GET /api/branches
 * Query: ?search=computer
 */
async function getBranches(req, res) {
  try {
    const { search } = req.query;
    const branches = await predictionService.getBranches({ search });
    return res.json({ success: true, total: branches.length, branches });
  } catch (err) {
    console.error("[getBranches] Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

/**
 * GET /api/districts
 */
async function getDistricts(req, res) {
  try {
    const districts = await predictionService.getDistricts();
    return res.json({ success: true, total: districts.length, districts });
  } catch (err) {
    console.error("[getDistricts] Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = { predictColleges, getColleges, getCollegeDetail, getBranches, getDistricts };
