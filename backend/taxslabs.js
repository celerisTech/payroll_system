const express = require('express');
const router = express.Router();
const db = require('./db');

// GET all tax slabs
router.get('/', (req, res) => {
  db.query('SELECT * FROM tax_slabs', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET tax slab by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM tax_slabs WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// CREATE tax slab
router.post('/', (req, res) => {
  const { from_salary, to_salary, tax_percentage } = req.body;
  const sql = 'INSERT INTO tax_slabs (from_salary, to_salary, tax_percentage) VALUES (?, ?, ?)';
  db.query(sql, [from_salary, to_salary, tax_percentage], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

// UPDATE tax slab
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { from_salary, to_salary, tax_percentage } = req.body;
  const sql = 'UPDATE tax_slabs SET from_salary = ?, to_salary = ?, tax_percentage = ? WHERE id = ?';
  db.query(sql, [from_salary, to_salary, tax_percentage, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// DELETE tax slab
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tax_slabs WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
