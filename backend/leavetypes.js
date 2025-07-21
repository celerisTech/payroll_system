const express = require('express');
const router = express.Router();
const db = require('./db');

// GET all leave types
router.get('/', (req, res) => {
  db.query('SELECT * FROM leave_types', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET leave type by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM leave_types WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// CREATE leave type
router.post('/', (req, res) => {
  const { name, max_days } = req.body;
  const sql = 'INSERT INTO leave_types (name, max_days) VALUES (?, ?)';
  db.query(sql, [name, max_days], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

// UPDATE leave type
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, max_days } = req.body;
  const sql = 'UPDATE leave_types SET name = ?, max_days = ? WHERE id = ?';
  db.query(sql, [name, max_days, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// DELETE leave type
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM leave_types WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
