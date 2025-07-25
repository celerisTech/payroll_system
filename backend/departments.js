// routes/departments.js

const express = require('express');
const router = express.Router();
const db = require('./db'); // adjust path if needed

// GET all departments
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pr_dep_master');
    res.json(rows);
  } catch (err) {
    console.error('Departments fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST add department
router.post('/', async (req, res) => {
  const { PR_DEP_Name } = req.body;
  if (!PR_DEP_Name) {
    return res.status(400).json({ message: 'Department name is required.' });
  }

  try {
    await db.query('INSERT INTO pr_dep_master (PR_DEP_Name) VALUES (?)', [PR_DEP_Name]);
    res.json({ message: '✅ Department added successfully.' });
  } catch (err) {
    console.error('Add department error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
