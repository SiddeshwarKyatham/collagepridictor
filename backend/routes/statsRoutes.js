const express = require('express');
const router = express.Router();
const statsService = require('../services/statsService');

router.get('/stats', (req, res) => {
  try {
    const stats = statsService.getStats();
    res.json({ success: true, ...stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/stats/increment', (req, res) => {
  try {
    const stats = statsService.incrementStats();
    res.json({ success: true, ...stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
