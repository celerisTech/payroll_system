const express = require('express');
const router = express.Router();
const db = require('./db');

// GET all bank details
router.get('/', (req, res) => {
  db.query('SELECT * FROM bank_details', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET bank detail by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM bank_details WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// CREATE bank detail
router.post('/', (req, res) => {
  const { employee_id, bank_name, account_number, ifsc_code } = req.body;
  const sql = 'INSERT INTO bank_details (employee_id, bank_name, account_number, ifsc_code) VALUES (?, ?, ?, ?)';
  db.query(sql, [employee_id, bank_name, account_number, ifsc_code], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

// UPDATE bank detail
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { employee_id, bank_name, account_number, ifsc_code } = req.body;
  const sql = 'UPDATE bank_details SET employee_id = ?, bank_name = ?, account_number = ?, ifsc_code = ? WHERE id = ?';
  db.query(sql, [employee_id, bank_name, account_number, ifsc_code, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// DELETE bank detail
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM bank_details WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
