const express = require('express');
const router = express.Router();
const db = require('./db'); // adjust path if needed

// ✅ GET all designations
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pr_desig_master');
    res.json(rows);
  } catch (err) {
    console.error('Designations fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET designations by department
router.get('/by-department/:depId', async (req, res) => {
  const depId = req.params.depId;
  try {
    const [rows] = await db.query(
      'SELECT * FROM pr_desig_master WHERE PR_DESIG_DEP_ID = ?',
      [depId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Designations by department fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST add designation
router.post('/', async (req, res) => {
  const { PR_DESIG_Name, PR_DESIG_DEP_ID } = req.body;
  if (!PR_DESIG_Name || !PR_DESIG_DEP_ID) {
    return res.status(400).json({ message: 'Designation name and department ID are required.' });
  }

  try {
    await db.query(
      'INSERT INTO pr_desig_master (PR_DESIG_Name, PR_DESIG_DEP_ID) VALUES (?, ?)',
      [PR_DESIG_Name, PR_DESIG_DEP_ID]
    );
    res.json({ message: '✅ Designation added successfully.' });
  } catch (err) {
    console.error('Add designation error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
