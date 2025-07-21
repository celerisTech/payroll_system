const express = require('express');
const router = express.Router();
const db = require('./db');

// GET all payroll settings
router.get('/', (req, res) => {
  db.query('SELECT * FROM payroll_settings', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET payroll setting by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM payroll_settings WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// CREATE payroll setting
router.post('/', (req, res) => {
  const { salary_day, overtime_rate, tax_enabled } = req.body;
  const sql = 'INSERT INTO payroll_settings (salary_day, overtime_rate, tax_enabled) VALUES (?, ?, ?)';
  db.query(sql, [salary_day, overtime_rate, tax_enabled], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

// UPDATE payroll setting
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { salary_day, overtime_rate, tax_enabled } = req.body;
  const sql = 'UPDATE payroll_settings SET salary_day = ?, overtime_rate = ?, tax_enabled = ? WHERE id = ?';
  db.query(sql, [salary_day, overtime_rate, tax_enabled, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// DELETE payroll setting
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM payroll_settings WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
