const express = require('express');
const router = express.Router();
const statsService = require('../services/statsService');

router.get('/stats', async (req, res) => {
  try {
    const stats = await statsService.getStats();
    res.json({ success: true, ...stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/stats/increment', async (req, res) => {
  try {
    const stats = await statsService.incrementStats();
    res.json({ success: true, ...stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
