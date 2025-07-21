const express = require('express');
const router = express.Router();
const db = require('./db');

// ✅ GET designations by department id
router.get('/by-department/:depId', async (req, res) => {
  const { depId } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM PR_Desig_Master WHERE PR_DESIG_DEP_ID = ?',
      [depId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
