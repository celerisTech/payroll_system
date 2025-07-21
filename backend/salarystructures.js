const express = require('express');
const router = express.Router();
const db = require('./db');

// GET all salary structures
router.get('/', (req, res) => {
  db.query('SELECT * FROM salary_structures', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET salary structure by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM salary_structures WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// CREATE salary structure
router.post('/', (req, res) => {
  const { employee_id, basic, hra, bonus, deductions } = req.body;
  const sql = 'INSERT INTO salary_structures (employee_id, basic, hra, bonus, deductions) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [employee_id, basic, hra, bonus, deductions], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

// UPDATE salary structure
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { employee_id, basic, hra, bonus, deductions } = req.body;
  const sql = 'UPDATE salary_structures SET employee_id = ?, basic = ?, hra = ?, bonus = ?, deductions = ? WHERE id = ?';
  db.query(sql, [employee_id, basic, hra, bonus, deductions, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// DELETE salary structure
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM salary_structures WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
