const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function run() {
  console.log("Fetching colleges...");
  const profiles = await prisma.collegeProfile.findMany({
    orderBy: { collegeCode: "asc" }
  });

  // 1. Generate CSV
  const csvPath = path.join(__dirname, "../../datasets/college_data_collection.csv");
  
  // CSV Header
  let csvContent = "College Code,College Name,Place,District,Tuition Fee (Int),Average Placement (Float),Latitude (Float),Longitude (Float)\n";

  for (const p of profiles) {
    // Escape commas in names
    const safeName = `"${p.collegeName}"`;
    const safePlace = `"${p.place}"`;
    const safeDistrict = `"${p.district}"`;
    
    csvContent += `${p.collegeCode},${safeName},${safePlace},${safeDistrict},,,,\n`;
  }

  fs.writeFileSync(csvPath, csvContent);
  console.log(`✅ CSV File successfully generated at: ${csvPath}`);

  // 2. Wipe the mock data from the DB to prevent false information
  console.log("Wiping mock data (Fees, Placements, Coordinates) from the database...");
  await prisma.collegeProfile.updateMany({
    data: {
      tuitionFee: null,
      averagePlacement: null,
      latitude: null,
      longitude: null
    }
  });

  console.log("✅ Mock data wiped from database. UI will automatically hide these sections until genuine data is provided.");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
