// departments.js
const express = require('express');
const router = express.Router();
const db = require('./db'); 

// ✅ GET all departments
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pr_dep_master');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/add', async (req, res) => {
  const { PR_DEP_Name } = req.body;
  try {
    const [rows] = await db.query('INSERT INTO PR_Dep_Master (PR_DEP_Name) VALUES (?)', [PR_DEP_Name]);
    res.json({ message: 'Department added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
