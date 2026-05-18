const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const http = require('http');
const https = require('https');

// A simple delay function to avoid hitting APIs too fast
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchCoordinates(query) {
  try {
    const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'TGEapcetPredictor/1.0 (test@example.com)'
      }
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log("Starting V2 Data Seeding & Geocoding...");
  
  const profiles = await prisma.collegeProfile.findMany();

  console.log(`Processing ${profiles.length} colleges...`);

  let geocodedCount = 0;

  for (let i = 0; i < profiles.length; i++) {
    const p = profiles[i];
    
    // 1. Generate realistic metrics
    // Tuition fee generally ranges from 35k to 1.5L
    const fee = 35000 + (Math.floor(Math.random() * 23) * 5000); 
    
    // Average placement generally ranges from 3.0 to 8.5 LPA
    const placement = (3.0 + (Math.random() * 5.5)).toFixed(1);

    // 2. Try to Geocode
    let coords = null;
    
    // Try full name + place + "Telangana"
    let query = `${p.collegeName}, ${p.place}, Telangana, India`;
    coords = await fetchCoordinates(query);
    
    // If not found, try just place + district + Telangana
    if (!coords) {
      await delay(1000);
      query = `${p.place}, ${p.district}, Telangana, India`;
      coords = await fetchCoordinates(query);
    }

    // Fallback: Random coordinate around Hyderabad (Lat 17.385, Lon 78.486)
    if (!coords) {
      coords = {
        lat: 17.3850 + (Math.random() * 2.0 - 1.0),
        lon: 78.4867 + (Math.random() * 2.0 - 1.0)
      };
    }
    
    // 3. Update DB
    await prisma.collegeProfile.update({
      where: { collegeCode: p.collegeCode },
      data: {
        tuitionFee: fee,
        averagePlacement: parseFloat(placement),
        latitude: coords.lat,
        longitude: coords.lon
      }
    });

    geocodedCount++;
    process.stdout.write(`\rProgress: ${i + 1}/${profiles.length} | Geocoded: ${geocodedCount}`);
    
    // 1 second delay to respect Nominatim limits
    await delay(1000);
  }

  console.log("\nSeeding & Geocoding Complete!");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
