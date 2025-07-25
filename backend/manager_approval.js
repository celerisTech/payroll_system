// manager_approval.js
const express = require('express');
const router = express.Router();
const db = require('./db'); // mysql2/promise pool

// ✅ Get All Pending Leave Requests
router.get('/leave-requests', async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT * FROM pr_leave_transactions WHERE leave_status = 'Pending'`
    );
    console.log("📥 GET /api/manager/leave-requests");
    res.json(result);
  } catch (err) {
    console.error('❌ Error fetching leaves:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Approve or Reject Leave
router.post('/leave-approve', async (req, res) => {
  const { transaction_id, action } = req.body;

  if (!transaction_id || !['Approved', 'Rejected'].includes(action)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    // 🔹 1. Get the leave transaction details
    const [leaveRows] = await db.query(
      `SELECT * FROM pr_leave_transactions WHERE transaction_id = ?`,
      [transaction_id]
    );

    if (leaveRows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const leave = leaveRows[0];
    const { user_id, leave_type } = leave;
    const year = new Date().getFullYear();

    // 🔹 2. Update the leave status (removed updated_at)
    const [updateResult] = await db.query(
      `UPDATE pr_leave_transactions SET leave_status = ? WHERE transaction_id = ?`,
      [action, transaction_id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Leave update failed' });
    }

    // 🔹 3. If Approved → Update balances
    if (action === 'Approved') {
      let balanceCol, takenCol;

      if (leave_type === 'PL') {
        balanceCol = 'pr_pl_balance';
        takenCol = 'pl_taken';
      } else if (leave_type === 'CL') {
        balanceCol = 'pr_cl_balance';
        takenCol = 'cl_taken';
      } else if (leave_type === 'SL') {
        balanceCol = 'pr_sl_balance';
        takenCol = 'sl_taken';
      } else {
        return res.status(400).json({ error: 'Invalid leave type' });
      }

      // 🔹 4. Decrement balance and increment taken
      await db.query(
        `UPDATE pr_leave_master
         SET ${balanceCol} = ${balanceCol} - 1,
             ${takenCol} = ${takenCol} + 1
         WHERE user_id = ? AND year = ?`,
        [user_id, year]
      );
    }

    console.log(`✅ Leave ${action.toLowerCase()} for transaction ID ${transaction_id}`);
    res.json({ message: `Leave ${action.toLowerCase()} successfully` });

  } catch (err) {
    console.error('❌ Error approving leave:', err.message);
    res.status(500).json({ error: err.message });
  }
});
// ✅ Get Leave History for a Specific User
router.get('/leave-history/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const [history] = await db.query(
      `SELECT transaction_id, leave_type, from_date, from_time, to_date, to_time, leave_status
       FROM pr_leave_transactions
       WHERE user_id = ?
       ORDER BY from_date DESC`,
      [user_id]
    );

    if (history.length === 0) {
      return res.status(404).json({ message: 'No leave history found for this user' });
    }

    console.log(`📥 GET /api/manager/leave-history/${user_id}`);
    res.json(history);

  } catch (err) {
    console.error('❌ Error fetching leave history:', err.message);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;