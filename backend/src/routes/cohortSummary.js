const express = require('express');
const { getDatabase } = require('../db/database');
const { requireAuth, requireCoordinator, requirePasswordChanged } = require('../middleware/auth');

const router = express.Router();

// GET /api/v1/cohort-summary - coordinator-only summary stats
router.get('/', requireAuth, requirePasswordChanged, requireCoordinator, (req, res) => {
  try {
    const db = getDatabase();

    const learnerCount = db.prepare('SELECT COUNT(*) AS count FROM learners').get().count;
    const assignmentCount = db.prepare('SELECT COUNT(*) AS count FROM assignments').get().count;
    const completedCount = db.prepare(
      "SELECT COUNT(*) AS count FROM assignments WHERE status = 'Completed'"
    ).get().count;

    return res.status(200).json({
      learnerCount,
      assignmentCount,
      completedCount,
    });
  } catch (err) {
    console.error('Cohort summary error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
