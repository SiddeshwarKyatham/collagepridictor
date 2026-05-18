const fs = require('fs');
const path = require('path');

const statsFilePath = path.join(__dirname, '../data/stats.json');

// Ensure data folder and stats file exist with a baseline count
function ensureStatsFile() {
  const dirPath = path.dirname(statsFilePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  if (!fs.existsSync(statsFilePath)) {
    // Starting with a genuine baseline of 0
    const defaultStats = { visitorCount: 0 };
    fs.writeFileSync(statsFilePath, JSON.stringify(defaultStats, null, 2), 'utf-8');
  }
}

function getStats() {
  ensureStatsFile();
  try {
    const data = fs.readFileSync(statsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading stats file:', error);
    return { visitorCount: 0 };
  }
}

function incrementStats() {
  ensureStatsFile();
  try {
    const current = getStats();
    current.visitorCount += 1;
    fs.writeFileSync(statsFilePath, JSON.stringify(current, null, 2), 'utf-8');
    return current;
  } catch (error) {
    console.error('Error writing stats file:', error);
    return { visitorCount: 0 };
  }
}

module.exports = {
  getStats,
  incrementStats
};
