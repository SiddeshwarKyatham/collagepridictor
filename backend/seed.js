/**
 * seed.js
 * ─────────────────────────────────────────────────────────────
 * Imports all_cutoffs.json into PostgreSQL via Prisma.
 * Run: node seed.js
 *
 * Features:
 *  - Clears old data before seeding (idempotent)
 *  - Batch inserts in chunks of 500 for speed
 *  - Progress reporting
 */

require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const fs   = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const DATA_FILE   = path.join(__dirname, "..", "datasets", "all_cutoffs.json");
const BATCH_SIZE  = 500;

async function main() {
  console.log("==============================================");
  console.log("  TG EAPCET Database Seeder");
  console.log("==============================================");

  // ── Load JSON ─────────────────────────────────────────────
  if (!fs.existsSync(DATA_FILE)) {
    console.error("[ERROR] File not found: " + DATA_FILE);
    console.error("        Run the Python cleaner first: python data-cleaner/clean.py");
    process.exit(1);
  }

  console.log("[1/4] Reading all_cutoffs.json ...");
  const raw     = fs.readFileSync(DATA_FILE, "utf-8");
  const records = JSON.parse(raw);
  console.log("      Loaded " + records.length.toLocaleString() + " records");

  // ── Clear existing data ───────────────────────────────────
  console.log("[2/4] Clearing existing data ...");
  const deleted = await prisma.cutoff.deleteMany();
  console.log("      Deleted " + deleted.count.toLocaleString() + " old records");

  // ── Batch insert ──────────────────────────────────────────
  console.log("[3/4] Seeding database in batches of " + BATCH_SIZE + " ...");
  const totalBatches = Math.ceil(records.length / BATCH_SIZE);
  let   inserted     = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch     = records.slice(i, i + BATCH_SIZE);
    const batchNum  = Math.floor(i / BATCH_SIZE) + 1;

    // Map JSON fields to Prisma model fields
    const data = batch.map(r => ({
      year:        r.year        || 2025,
      phase:       r.phase       || "Final",
      collegeCode: r.collegeCode || "",
      collegeName: r.collegeName || "",
      place:       r.place       || "",
      district:    r.district    || "",
      collegeType: r.collegeType || "",
      coEducation: r.coEducation || "",
      affiliatedTo:r.affiliatedTo|| "",
      branchCode:  r.branchCode  || "",
      branchName:  r.branchName  || "",
      category:    r.category    || "",
      gender:      r.gender      || "",
      closingRank: r.closingRank || 0,
    }));

    await prisma.cutoff.createMany({ data, skipDuplicates: true });

    inserted += batch.length;
    const pct = ((inserted / records.length) * 100).toFixed(1);
    process.stdout.write("\r      Progress: " + pct + "% (" + inserted.toLocaleString() + " / " + records.length.toLocaleString() + ")");
  }

  console.log("\n");

  // ── Verify ────────────────────────────────────────────────
  console.log("[4/4] Verifying ...");
  const total     = await prisma.cutoff.count();
  const colleges  = await prisma.cutoff.groupBy({ by: ["collegeCode"] });
  const branches  = await prisma.cutoff.groupBy({ by: ["branchCode"] });
  const districts = await prisma.cutoff.groupBy({ by: ["district"] });
  const phases    = await prisma.cutoff.groupBy({ by: ["phase"] });

  console.log("");
  console.log("==============================================");
  console.log("  SEED COMPLETE!");
  console.log("  Total records   : " + total.toLocaleString());
  console.log("  Colleges        : " + colleges.length);
  console.log("  Branches        : " + branches.length);
  console.log("  Districts       : " + districts.length);
  console.log("  Phases          : " + phases.map(p => p.phase).join(", "));
  console.log("==============================================");
}

main()
  .catch(err => {
    console.error("\n[SEED ERROR]", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
