// leave_management.js
const express = require('express');
const router = express.Router();
const db = require('./db'); // make sure this is pool.promise()

router.get('/:PR_Emp_id', async (req, res) => {
  const { PR_Emp_id } = req.params;
  const year = new Date().getFullYear();

  try {
    // 1. Check if employee exists
    const [empRows] = await db.query(`SELECT * FROM pr_employees_master WHERE PR_Emp_id = ?`, [PR_Emp_id]);
    if (empRows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // 2. Check if leave record exists for this year
    const [leaveRows] = await db.query(`SELECT * FROM pr_leave_master WHERE PR_Emp_id = ? AND year = ?`, [PR_Emp_id, year]);

    if (leaveRows.length === 0) {
      // 3. Insert default leave record
      await db.query(`
        INSERT INTO pr_leave_master 
        (PR_Emp_id, year, pr_cl_balance, pr_pl_balance, pr_sl_balance, cl_taken, pl_taken, sl_taken, created_at, updated_at)
        VALUES (?, ?, 8, 24, 5, 0, 0, 0, NOW(), NOW())
      `, [PR_Emp_id, year]);

      // 4. Fetch the newly inserted record
      const [newLeaveRows] = await db.query(`SELECT * FROM pr_leave_master WHERE PR_Emp_id = ? AND year = ?`, [PR_Emp_id, year]);
      return res.json(newLeaveRows[0]);
    } else {
      // 5. Record exists — return it
      return res.json(leaveRows[0]);
    }

  } catch (error) {
    console.error('Error in fetching/inserting leave record:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;


router.post('/apply', async (req, res) => {

  console.log("📥 POST /apply hit");
  console.log("📥 Request body:", req.body);

  try {
    const { PR_Emp_id, leave_type, from_date, from_time, to_date, to_time, leave_reason } = req.body;

    if (!PR_Emp_id || !leave_type || !from_date || !to_date || !from_time || !to_time || !leave_reason) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // ✅ Check for existing 'Pending' leave
    const [pending] = await db.query(
      `SELECT * FROM pr_leave_transactions 
       WHERE PR_Emp_id = ? AND leave_status = 'Pending'`,
      [PR_Emp_id]
    );

    if (pending.length > 0) {
      return res.status(400).json({ message: 'You already have a pending leave request' });
    }

    // ✅ Check for existing 'Approved' leave for overlapping date
    const [approvedOverlap] = await db.query(
      `SELECT * FROM pr_leave_transactions 
       WHERE PR_Emp_id = ? AND leave_status = 'Approved'
       AND (
         (from_date <= ? AND to_date >= ?) OR
         (from_date <= ? AND to_date >= ?)
       )`,
      [PR_Emp_id, from_date, from_date, to_date, to_date]
    );

    if (approvedOverlap.length > 0) {
      return res.status(400).json({ message: 'You already have an approved leave for the selected date range' });
    }

    // ✅ Insert new leave request
    const leave_date = from_date;

    const insertQuery = `
  INSERT INTO pr_leave_transactions 
  (PR_Emp_id, leave_type, from_date, from_time, to_date, to_time, leave_date, leave_reason, leave_status, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
`;

    const [result] = await db.query(insertQuery, [
      PR_Emp_id, leave_type, from_date, from_time, to_date, to_time, leave_date, leave_reason
    ]);


    console.log("✅ Leave applied successfully:", result);
    return res.json({ message: 'Leave applied successfully and is pending approval' });

  } catch (error) {
    console.error("❌ Error applying leave:", error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

// 🔹 Reset Leave Balances (Manager Use)
router.post('/reset', async (req, res) => {
  const { PR_Emp_id, year } = req.body;
  if (!PR_Emp_id || !year) return res.status(400).json({ error: 'PR_Emp_id and year are required' });

  db.query(`UPDATE pr_leave_master 
            SET pr_cl_balance = 8, pr_pl_balance = 24, pr_sl_balance = 5,
                cl_taken = NULL, pl_taken = NULL, sl_taken = NULL,
                updated_at = NOW()
            WHERE PR_Emp_id = ? AND year = ?`,
    [PR_Emp_id, year],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Leave master record not found' });
      res.json({ message: 'Leave balances reset successfully' });
    }
  );
});

// 🔹 Manual Init Leave Balance (Optional)
router.post('/init', async (req, res) => {
  const { PR_Emp_id } = req.body;
  const year = new Date().getFullYear();
  if (!PR_Emp_id) return res.status(400).json({ error: 'PR_Emp_id is required' });

  db.query(`SELECT * FROM pr_leave_master WHERE PR_Emp_id = ? AND year = ?`, [PR_Emp_id, year], (err, leaveResult) => {
    if (err) return res.status(500).json({ error: err.message });
    if (leaveResult.length > 0) return res.status(400).json({ message: 'Leave already initialized for this year' });

    db.query(`INSERT INTO pr_leave_master (PR_Emp_id, year, pr_cl_balance, pr_pl_balance, pr_sl_balance, created_at, updated_at)
              VALUES (?, ?, 8, 24, 5, NOW(), NOW())`,
      [PR_Emp_id, year],
      (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ message: `Leave master initialized for PR_Emp_id: ${PR_Emp_id} for year ${year}` });
      }
    );
  });
});
// View all leaves taken by user
router.get('/history/:PR_Emp_id', async (req, res) => {
  const { PR_Emp_id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT * FROM pr_leave_transactions WHERE PR_Emp_id = ? ORDER BY created_at DESC`,
      [PR_Emp_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching leave history:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
