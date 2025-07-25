// leave_management.js
const express = require('express');
const router = express.Router();
const db = require('./db'); // make sure this is pool.promise()

router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const year = new Date().getFullYear();

  try {
    // 1. Check if employee exists
    const [empRows] = await db.query(`SELECT * FROM employees WHERE user_id = ?`, [user_id]);
    if (empRows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // 2. Check if leave record exists for this year
    const [leaveRows] = await db.query(`SELECT * FROM pr_leave_master WHERE user_id = ? AND year = ?`, [user_id, year]);

    if (leaveRows.length === 0) {
      // 3. Insert default leave record
      await db.query(`
        INSERT INTO pr_leave_master 
        (user_id, year, pr_cl_balance, pr_pl_balance, pr_sl_balance, cl_taken, pl_taken, sl_taken, created_at, updated_at)
        VALUES (?, ?, 8, 24, 5, 0, 0, 0, NOW(), NOW())
      `, [user_id, year]);

      // 4. Fetch the newly inserted record
      const [newLeaveRows] = await db.query(`SELECT * FROM pr_leave_master WHERE user_id = ? AND year = ?`, [user_id, year]);
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


// router.get('/:user_id', async (req, res) => {
//   const { user_id } = req.params;
//   const year = new Date().getFullYear();

//   // console.log(`Fetching leave balance for user_id: ${user_id}`);

//   try {
//     const [rows] = await db.query(
//       `SELECT * FROM pr_leave_master WHERE user_id = ? AND year = ?`,
//       [user_id, year]
//     );

//     // console.log(rows);

//     if (!rows.length) {
//       // If no leave record found, insert default record
//       await db.query(
//         `INSERT INTO pr_leave_master 
//         (user_id, year, pr_cl_balance, pr_pl_balance, pr_sl_balance, cl_taken, pl_taken, sl_taken, created_at, updated_at)
//         VALUES (?, ?, 8, 24, 5, 0, 0, 0, NOW(), NOW())`,
//         [user_id, year]
//       );

//       const [newRows] = await db.query(
//         `SELECT * FROM pr_leave_master WHERE user_id = ? AND year = ?`,
//         [user_id, year]
//       );

//       return res.json(newRows[0]);
//     } else {
//       return res.json(rows[0]);
//     }
//   } catch (err) {
//     console.error("Error fetching leave balance:", err.message);
//     return res.status(500).json({ error: err.message });
//   }
// });


// 🔹 Apply for Leave (Only if no pending)
// 🔹 Apply for Leave (Only if no pending or overlapping approved leaves)
router.post('/apply', async (req, res) => {
  console.log("📥 POST /apply hit");
  console.log("📥 Request body:", req.body);

  try {
    const { user_id, leave_type, from_date, from_time, to_date, to_time } = req.body;

    if (!user_id || !leave_type || !from_date || !to_date || !from_time || !to_time) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // ✅ Check for existing 'Pending' leave
    const [pending] = await db.query(
      `SELECT * FROM pr_leave_transactions 
       WHERE user_id = ? AND leave_status = 'Pending'`,
      [user_id]
    );

    if (pending.length > 0) {
      return res.status(400).json({ message: 'You already have a pending leave request' });
    }

    // ✅ Check for existing 'Approved' leave for overlapping date
    const [approvedOverlap] = await db.query(
      `SELECT * FROM pr_leave_transactions 
       WHERE user_id = ? AND leave_status = 'Approved'
       AND (
         (from_date <= ? AND to_date >= ?) OR
         (from_date <= ? AND to_date >= ?)
       )`,
      [user_id, from_date, from_date, to_date, to_date]
    );

    if (approvedOverlap.length > 0) {
      return res.status(400).json({ message: 'You already have an approved leave for the selected date range' });
    }

    // ✅ Insert new leave request
    const leave_date = from_date;

    const insertQuery = `
      INSERT INTO pr_leave_transactions 
      (user_id, leave_type, from_date, from_time, to_date, to_time, leave_date, leave_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
    `;

    const [result] = await db.query(insertQuery, [
      user_id, leave_type, from_date, from_time, to_date, to_time, leave_date
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
router.post('/reset',async (req, res) => {
  const { user_id, year } = req.body;
  if (!user_id || !year) return res.status(400).json({ error: 'user_id and year are required' });

  db.query(`UPDATE pr_leave_master 
            SET pr_cl_balance = 8, pr_pl_balance = 24, pr_sl_balance = 5,
                cl_taken = NULL, pl_taken = NULL, sl_taken = NULL,
                updated_at = NOW()
            WHERE user_id = ? AND year = ?`,
    [user_id, year],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Leave master record not found' });
      res.json({ message: 'Leave balances reset successfully' });
    }
  );
});

// 🔹 Manual Init Leave Balance (Optional)
router.post('/init', async(req, res) => {
  const { user_id } = req.body;
  const year = new Date().getFullYear();
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  db.query(`SELECT * FROM pr_leave_master WHERE user_id = ? AND year = ?`, [user_id, year], (err, leaveResult) => {
    if (err) return res.status(500).json({ error: err.message });
    if (leaveResult.length > 0) return res.status(400).json({ message: 'Leave already initialized for this year' });

    db.query(`INSERT INTO pr_leave_master (user_id, year, pr_cl_balance, pr_pl_balance, pr_sl_balance, created_at, updated_at)
              VALUES (?, ?, 8, 24, 5, NOW(), NOW())`,
      [user_id, year],
      (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ message: `Leave master initialized for user_id: ${user_id} for year ${year}` });
      }
    );
  });
});
// View all leaves taken by user
router.get('/history/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT * FROM pr_leave_transactions WHERE user_id = ? ORDER BY created_at DESC`,
      [user_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching leave history:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
