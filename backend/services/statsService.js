const prisma = require('../config/prisma');

/**
 * Retrieves system statistics (visitor count) from PostgreSQL.
 */
async function getStats() {
  try {
    const stat = await prisma.systemStats.findUnique({
      where: { key: 'visitorCount' }
    });
    return { visitorCount: stat ? stat.value : 0 };
  } catch (error) {
    console.error('Error fetching stats from DB:', error);
    return { visitorCount: 0 };
  }
}

/**
 * Increments the visitor count inside PostgreSQL.
 */
async function incrementStats() {
  try {
    const stat = await prisma.systemStats.upsert({
      where: { key: 'visitorCount' },
      update: { value: { increment: 1 } },
      create: { key: 'visitorCount', value: 1 }
    });
    return { visitorCount: stat.value };
  } catch (error) {
    console.error('Error incrementing stats in DB:', error);
    return { visitorCount: 0 };
  }
}

module.exports = {
  getStats,
  incrementStats
};
