const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  console.log("Migrating static college data to CollegeProfile...");
  
  const uniqueColleges = await prisma.cutoff.findMany({
    distinct: ["collegeCode"],
    select: { collegeCode: true, collegeName: true, place: true, district: true, collegeType: true, coEducation: true, affiliatedTo: true }
  });

  console.log(`Found ${uniqueColleges.length} unique colleges. updating profiles...`);

  let count = 0;
  for (const college of uniqueColleges) {
    count++;
    
    // Add realistic social media placeholders
    const shortName = college.collegeCode.toLowerCase();
    
    await prisma.collegeProfile.updateMany({
      where: { collegeCode: college.collegeCode },
      data: {
        place: college.place,
        district: college.district,
        collegeType: college.collegeType,
        coEducation: college.coEducation,
        affiliatedTo: college.affiliatedTo,
        twitterUrl: `https://twitter.com/${shortName}_official`,
        instagramUrl: `https://instagram.com/${shortName}_official`,
        linkedinUrl: `https://linkedin.com/school/${shortName}`
      }
    });

    if (count % 20 === 0) console.log(`Updated ${count}/${uniqueColleges.length}...`);
  }

  console.log("Migration complete!");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
