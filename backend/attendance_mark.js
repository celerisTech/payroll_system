const express = require('express');
const router = express.Router();
const db = require('./db');

// POST /api/attendance/mark
router.post('/mark', async (req, res) => {
  const { date, attendance } = req.body;

  if (!date || !Array.isArray(attendance)) {
    return res.status(400).json({ error: 'Date and attendance array are required.' });
  }

  try {
    const conn = await db.getConnection();

    for (const emp of attendance) {
      const [result] = await conn.query(
        'UPDATE employee_attendance SET status = ? WHERE user_id = ? AND date = ?',
        [emp.status, emp.user_id, date]
      );

      if (result.affectedRows === 0) {
        await conn.query(
          'INSERT INTO employee_attendance (user_id, status, date) VALUES (?, ?, ?)',
          [emp.user_id, emp.status, date]
        );
      }
    }

    conn.release();
    res.json({ message: 'Attendance marked/updated successfully.' });
  } catch (err) {
    console.error('❌ Error marking attendance:', err);
    res.status(500).json({ error: 'Server error while marking attendance.' });
  }
});

module.exports = router;
