const express = require('express');
const router = express.Router();
const db = require('./db');

// GET all work locations
router.get('/', (req, res) => {
  db.query('SELECT * FROM work_locations', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET work location by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM work_locations WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// CREATE work location
router.post('/', (req, res) => {
  const { name, address } = req.body;
  const sql = 'INSERT INTO work_locations (name, address) VALUES (?, ?)';
  db.query(sql, [name, address], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

// UPDATE work location
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, address } = req.body;
  const sql = 'UPDATE work_locations SET name = ?, address = ? WHERE id = ?';
  db.query(sql, [name, address, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// DELETE work location
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM work_locations WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
