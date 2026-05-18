const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// A simple delay function to avoid hitting APIs too fast
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWikipediaSummary(query) {
  try {
    // 1. Search for the college
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.query.search || searchData.query.search.length === 0) {
      return null;
    }

    // Get the exact title of the first result
    const title = searchData.query.search[0].title;

    // 2. Fetch the summary for that title
    const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(title)}&format=json`;
    const extractRes = await fetch(extractUrl);
    const extractData = await extractRes.json();
    
    const pages = extractData.query.pages;
    const pageId = Object.keys(pages)[0];
    
    // Quick heuristic: If summary is too short or mentions "disambiguation", skip
    let summary = pages[pageId].extract;
    if (!summary || summary.length < 50 || summary.includes("may refer to")) {
      return null;
    }

    return summary;
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log("Starting College Enrichment process...");
  
  // 1. Get all unique colleges from cutoffs table
  const uniqueColleges = await prisma.cutoff.findMany({
    distinct: ["collegeCode"],
    select: { collegeCode: true, collegeName: true, place: true, district: true }
  });

  console.log(`Found ${uniqueColleges.length} unique colleges. Fetching data...`);

  // Process in small batches
  let count = 0;
  for (const college of uniqueColleges) {
    count++;
    
    // Check if already exists in CollegeProfile
    const existing = await prisma.collegeProfile.findUnique({
      where: { collegeCode: college.collegeCode }
    });

    if (existing) {
      console.log(`[${count}/${uniqueColleges.length}] Skipping ${college.collegeCode} - already enriched.`);
      continue;
    }

    // Try fetching from Wikipedia using Name + Place
    const searchQuery = `${college.collegeName} ${college.place}`;
    console.log(`[${count}/${uniqueColleges.length}] Fetching data for: ${searchQuery}`);
    
    let description = await fetchWikipediaSummary(searchQuery);
    
    // If not found, try just the Name
    if (!description) {
      description = await fetchWikipediaSummary(college.collegeName);
    }

    // Fallback description
    if (!description) {
      description = `${college.collegeName} is an engineering institution located in ${college.place}, ${college.district}. It offers various undergraduate programs in engineering and technology, participating in the TG EAPCET counseling process.`;
    }

    // Generic Website and Logo (Since we can't reliably scrape these without a paid API, we use placeholders or derivations)
    // We'll use clearbit logo API as a generic fallback using a sanitized domain name guess
    const shortName = college.collegeCode.toLowerCase();
    const websiteUrl = `https://www.${shortName}.ac.in`; // Guessed standard Indian college domain format
    const logoUrl = `https://ui-avatars.com/api/?name=${college.collegeCode}&background=0B1020&color=3B82F6&size=128`;

    // Save to database
    await prisma.collegeProfile.create({
      data: {
        collegeCode: college.collegeCode,
        collegeName: college.collegeName,
        description: description,
        websiteUrl: websiteUrl,
        logoUrl: logoUrl,
        establishedYear: 2000 + Math.floor(Math.random() * 20), // Mock established year for demo
        facilities: "Library, Computer Labs, Sports Ground, Cafeteria"
      }
    });

    // Wait slightly to not hammer Wikipedia
    await delay(200);
  }

  console.log("Enrichment complete!");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
