const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function run() {
  const csvPath = path.join(__dirname, "../../datasets/college_data_filled.csv");
  console.log(`Reading CSV from ${csvPath}...`);
  
  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  
  // Skip header
  const dataLines = lines.slice(1);

  console.log(`Found ${dataLines.length} college records. Updating database...`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    
    // Simple comma split since there are no quotes or nested commas in this specific file
    // Format: Code, Name, Place, District, Fee, Placement, Lat, Lon
    // Wait, let's reverse match to be safe in case a name has a comma. 
    // The last 4 are numbers. 
    const parts = line.split(',');
    
    if (parts.length < 8) {
      console.warn(`Line ${i+2} is malformed: ${line}`);
      continue;
    }

    const collegeCode = parts[0].trim();
    
    // We know the last 4 are the metrics
    const latStr = parts[parts.length - 1].trim();
    const lonStr = parts[parts.length - 2].trim();
    const placementStr = parts[parts.length - 3].trim();
    const feeStr = parts[parts.length - 4].trim();

    const tuitionFee = feeStr && feeStr !== '' ? parseInt(parseFloat(feeStr)) : null;
    const averagePlacement = placementStr && placementStr !== '' ? parseFloat(placementStr) : null;
    const latitude = latStr && latStr !== '' ? parseFloat(lonStr) : null; // Wait, lat is index 6, lon is index 7
    const longitude = lonStr && lonStr !== '' ? parseFloat(latStr) : null; 
    
    // Fix:
    const lon = latStr && latStr !== '' ? parseFloat(latStr) : null;
    const lat = lonStr && lonStr !== '' ? parseFloat(lonStr) : null;
    // Wait: 
    // Index 4: Fee
    // Index 5: Placement
    // Index 6: Latitude
    // Index 7: Longitude
    const actualFee = parts[4].trim() ? parseInt(parseFloat(parts[4])) : null;
    const actualPlacement = parts[5].trim() ? parseFloat(parts[5]) : null;
    const actualLat = parts[6].trim() ? parseFloat(parts[6]) : null;
    const actualLon = parts[7].trim() ? parseFloat(parts[7]) : null;

    try {
      await prisma.collegeProfile.update({
        where: { collegeCode: collegeCode },
        data: {
          tuitionFee: actualFee,
          averagePlacement: actualPlacement,
          latitude: actualLat,
          longitude: actualLon
        }
      });
      successCount++;
    } catch (e) {
      console.error(`Error updating college ${collegeCode}: ${e.message}`);
      errorCount++;
    }
  }

  console.log(`\nImport Complete!`);
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
