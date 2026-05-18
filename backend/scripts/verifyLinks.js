const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const http = require('http');
const https = require('https');

// Helper to verify a URL
function verifyUrl(url, timeoutMs = 5000) {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD', timeout: timeoutMs }, (res) => {
      // Allow 2xx and 3xx (redirects are fine)
      if (res.statusCode >= 200 && res.statusCode < 400) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function run() {
  console.log("Starting Link Verification...");
  const profiles = await prisma.collegeProfile.findMany();

  console.log(`Verifying links for ${profiles.length} colleges...`);
  
  let validWebsites = 0;

  for (let i = 0; i < profiles.length; i++) {
    const p = profiles[i];
    
    // We only verify the main website URL. 
    // Twitter/LinkedIn block automated HEAD requests (403 Forbidden), 
    // so we will just remove the guessed social links to prevent bad UX.
    const isWebsiteValid = await verifyUrl(p.websiteUrl);
    
    await prisma.collegeProfile.update({
      where: { collegeCode: p.collegeCode },
      data: {
        websiteUrl: isWebsiteValid ? p.websiteUrl : null,
        twitterUrl: null,   // Removing guessed links as requested/implied
        linkedinUrl: null,
        instagramUrl: null
      }
    });

    if (isWebsiteValid) validWebsites++;

    process.stdout.write(`\rProgress: ${i + 1}/${profiles.length} | Valid websites found: ${validWebsites}`);
  }

  console.log("\nVerification Complete!");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
