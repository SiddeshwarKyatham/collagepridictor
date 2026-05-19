const cron = require('node-cron');
const prisma = require('../config/prisma'); // If you need database access

/**
 * Initializes all background cron jobs for the application.
 */
function initCronJobs() {
  console.log('[Cron] Initializing scheduled background jobs...');

  // ── Job 1: Nightly Maintenance ──────────────────────────────
  // Runs every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Executing nightly maintenance task at', new Date().toISOString());
    try {
      // Add your scheduled database cleanup, log archiving, or email logic here!
      // Example: await prisma.someModel.deleteMany({ where: { createdAt: { lt: new Date(...) } } });
      
      console.log('[Cron] Nightly maintenance completed successfully.');
    } catch (error) {
      console.error('[Cron Error] Failed during nightly maintenance:', error);
    }
  });

  // ── Job 2: Heartbeat (Optional) ─────────────────────────────
  // Runs every 15 minutes just to log a heartbeat or keep connections warm
  cron.schedule('*/15 * * * *', () => {
    console.log('[Cron] 15-minute heartbeat tick:', new Date().toISOString());
  });
}

module.exports = { initCronJobs };
