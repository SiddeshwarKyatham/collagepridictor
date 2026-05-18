/**
 * predictionService.js
 * ─────────────────────────────────────────────────────────────
 * Core prediction engine for TG EAPCET college predictor.
 */

const prisma = require("../config/prisma");

const SAFE_FACTOR     = 0.90;   // rank <= 90% of cutoff -> Safe
const MODERATE_FACTOR = 1.15;   // rank <= 115% of cutoff -> Moderate
                                 // else Dream

function classify(userRank, closingRank) {
  if (userRank <= closingRank * SAFE_FACTOR)     return "Safe";
  if (userRank <= closingRank * MODERATE_FACTOR) return "Moderate";
  return "Dream";
}

async function predict(params) {
  const {
    rank,
    category,
    gender,
    branches   = [],
    phase      = "Final",
    district,
    collegeType,
  } = params;

  const where = {
    category: category.toUpperCase(),
    gender:   gender.toUpperCase(),
    phase,
    // PERFORMANCE OPTIMIZATION:
    // Filter out extreme 'Dream' colleges at the database level to reduce payload size.
    // If a college closed at 2,000 and user rank is 80,000, we don't need to fetch it.
    // We only fetch colleges where the cutoff is at least 1/3rd of the user's rank.
    closingRank: { gte: Math.floor(rank / 3) }
  };

  if (branches && branches.length > 0) {
    where.branchCode = { in: branches.map(b => b.toUpperCase()) };
  }

  if (district && district !== 'All') {
    where.district = { contains: district, mode: "insensitive" };
  }

  if (collegeType && collegeType !== 'All') {
    where.collegeType = { contains: collegeType, mode: "insensitive" };
  }

  // Fetch ALL matching cutoffs for this category/gender
  // Filtering in memory is fine because it's usually < 2000 records.
  const rawResults = await prisma.cutoff.findMany({
    where,
    // We don't order by closingRank asc here, because we want to sort by relevance
  });
  
  // Fetch profiles for the unique colleges returned
  const uniqueCollegeCodes = [...new Set(rawResults.map(r => r.collegeCode))];
  const profiles = await prisma.collegeProfile.findMany({
    where: { collegeCode: { in: uniqueCollegeCodes } }
  });
  const profileMap = {};
  profiles.forEach(p => profileMap[p.collegeCode] = p);

  const classified = [];
  
  for (const r of rawResults) {
    const profile = profileMap[r.collegeCode] || {};
    
    // Probability Logic:
    // If rank is equal to cutoff, chance is ~75%
    // If rank is 50% of cutoff (much better), chance is 99%
    // If rank is 120% of cutoff (worse), chance is very low
    let admissionChance = Math.round((r.closingRank / rank) * 75);
    // Cap at 99%
    admissionChance = Math.min(99, Math.max(1, admissionChance));

    // Determine badge color category based on percentage
    let prediction = "Dream";
    if (admissionChance >= 85) prediction = "Safe";
    else if (admissionChance >= 60) prediction = "Moderate";

    classified.push({
      id:          r.id,
      year:        r.year,
      phase:       r.phase,
      collegeCode: r.collegeCode,
      collegeName: r.collegeName,
      place:       r.place,
      district:    r.district,
      collegeType: r.collegeType,
      coEducation: r.coEducation,
      affiliatedTo:r.affiliatedTo,
      branchCode:  r.branchCode,
      branchName:  r.branchName,
      category:    r.category,
      gender:      r.gender,
      closingRank: r.closingRank,
      prediction,
      admissionChance,
      tuitionFee: profile.tuitionFee,
      averagePlacement: profile.averagePlacement,
      rankDiff: rank - r.closingRank
    });
  }

  // Sort by highest admission chance descending (Safest first)
  classified.sort((a, b) => b.admissionChance - a.admissionChance);

  // Return the single unified list
  return {
    meta: {
      inputRank:    rank,
      category,
      gender,
      phase,
      branches:     branches.length > 0 ? branches : "All",
      district:     district || "All",
      collegeType:  collegeType || "All",
      totalFetched: rawResults.length,
      totalShown:   classified.length,
    },
    results: classified,
  };
}

async function getColleges({ district, collegeType, phase, search } = {}) {
  const where = {};
  
  if (district && district !== 'All') {
    where.district = { contains: district, mode: "insensitive" };
  }
  
  if (collegeType && collegeType !== 'All') {
    where.collegeType = { contains: collegeType, mode: "insensitive" };
  }
  
  if (search) {
    where.OR = [
      { collegeName: { contains: search, mode: "insensitive" } },
      { collegeCode: { contains: search, mode: "insensitive" } },
      { place:       { contains: search, mode: "insensitive" } },
    ];
  }
  
  // PERFORMANCE: We query CollegeProfile (165 rows) instead of Cutoff (59,000 rows with distinct)
  return await prisma.collegeProfile.findMany({
    where,
    select: { 
      collegeCode: true, 
      collegeName: true, 
      place: true, 
      district: true, 
      collegeType: true, 
      coEducation: true, 
      affiliatedTo: true,
      logoUrl: true,
      latitude: true,
      longitude: true
    },
    orderBy: { collegeName: "asc" },
  });
}

async function getBranches({ search } = {}) {
  const where = search ? { OR: [ { branchName: { contains: search, mode: "insensitive" } }, { branchCode: { contains: search, mode: "insensitive" } } ] } : {};
  return await prisma.cutoff.findMany({
    where,
    distinct: ["branchCode"],
    select: { branchCode: true, branchName: true },
    orderBy: { branchName: "asc" },
  });
}

async function getDistricts() {
  const rows = await prisma.cutoff.findMany({
    distinct: ["district"],
    select: { district: true },
    orderBy: { district: "asc" },
  });
  return rows.map(r => r.district).filter(Boolean);
}

async function getCollegeDetail({ collegeCode, phase, year }) {
  const where = { collegeCode };
  if (phase) where.phase = phase;
  if (year)  where.year  = parseInt(year);

  // Fetch the Cutoff data for branches
  const cutoffs = await prisma.cutoff.findMany({
    where,
    orderBy: [{ branchCode: "asc" }, { category: "asc" }, { gender: "asc" }],
  });

  if (!cutoffs.length) return null;

  // Fetch the newly enriched CollegeProfile data
  const profile = await prisma.collegeProfile.findUnique({
    where: { collegeCode: collegeCode }
  });

  const grouped = {};
  for (const c of cutoffs) {
    if (!grouped[c.branchCode]) {
      grouped[c.branchCode] = { branchCode: c.branchCode, branchName: c.branchName, cutoffs: [] };
    }
    grouped[c.branchCode].cutoffs.push({ category: c.category, gender: c.gender, closingRank: c.closingRank });
  }

  return {
    collegeCode:  cutoffs[0].collegeCode,
    collegeName:  cutoffs[0].collegeName,
    place:        cutoffs[0].place,
    district:     cutoffs[0].district,
    collegeType:  cutoffs[0].collegeType,
    coEducation:  cutoffs[0].coEducation,
    affiliatedTo: cutoffs[0].affiliatedTo,
    year:         cutoffs[0].year,
    phase:        cutoffs[0].phase,
    
    // Attach profile data if available
    profile:      profile || null,
    
    branches:     Object.values(grouped),
  };
}

module.exports = { predict, getColleges, getBranches, getDistricts, getCollegeDetail };
