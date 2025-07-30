const express = require('express');
const router = express.Router();
const db = require('./db');

// GET /api/attendance?date=YYYY-MM-DD
router.get('/', async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT 
        e.PR_Emp_id,
        e.PR_EMP_Full_Name,
        a.status
      FROM PR_Employees_Master e
      LEFT JOIN employee_attendance a 
        ON e.PR_Emp_id = a.PR_Emp_id AND a.date = ?
      WHERE e.PR_EMP_Is_Active = 1
      `,
      [date]
    );

    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching attendance:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
