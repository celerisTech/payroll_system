const express = require('express');
const router = express.Router();
const db = require('./db');

// GET all pay components
router.get('/', (req, res) => {
  db.query('SELECT * FROM pay_components', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET pay component by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM pay_components WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// CREATE pay component
router.post('/', (req, res) => {
  const { employee_id, name, amount, type } = req.body;
  const sql = 'INSERT INTO pay_components (employee_id, name, amount, type) VALUES (?, ?, ?, ?)';
  db.query(sql, [employee_id, name, amount, type], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

// UPDATE pay component
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { employee_id, name, amount, type } = req.body;
  const sql = 'UPDATE pay_components SET employee_id = ?, name = ?, amount = ?, type = ? WHERE id = ?';
  db.query(sql, [employee_id, name, amount, type, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// DELETE pay component
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM pay_components WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
