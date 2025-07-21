// backend/dashboard.js
const express = require('express');
const router = express.Router();
const db = require('./db');

// Total active employees
router.get('/total-employees', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM employees WHERE is_active = 1");
    res.json({ total: rows[0].total });
  } catch (err) {
    console.error("Error fetching total employees:", err);
    res.status(500).json({ error: "Error fetching total employees" });
  }
});

// Present today among active employees
router.get('/present-today', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS count
      FROM employee_attendance a
      JOIN employees e ON a.user_id = e.user_id
      WHERE a.date = CURDATE() AND a.status = 'Present' AND e.is_active = 1
    `);
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error("Error fetching present count:", err);
    res.status(500).json({ error: "Error fetching present count" });
  }
});

// Absent today among active employees
router.get('/absent-today', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS count
      FROM employees e
      WHERE e.is_active = 1
      AND e.user_id NOT IN (
        SELECT user_id FROM employee_attendance
        WHERE date = CURDATE() AND status = 'Present'
      )
    `);
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error("Error fetching absent count:", err);
    res.status(500).json({ error: "Error fetching absent count" });
  }
});

// Dummy payroll (optional)
router.get('/monthly-payroll', async (req, res) => {
  try {
    res.json({ total: 500000 }); // Replace with real logic later
  } catch (err) {
    res.status(500).json({ error: "Payroll error" });
  }
});

module.exports = router;
