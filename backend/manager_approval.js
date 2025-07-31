// manager_approval.js
const express = require('express');
const router = express.Router();
const db = require('./db'); // mysql2/promise pool

// ✅ Get All Pending Leave Requests
router.get('/leave-requests', async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT transaction_id, PR_Emp_id, leave_type, from_date, from_time, to_date, to_time, leave_status, leave_reason
        FROM pr_leave_transactions
        WHERE leave_status = 'Pending'`
    );
   // console.log("📥 GET /api/manager/leave-requests");
    res.json(result);
  } catch (err) {
    console.error('❌ Error fetching leaves:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Approve or Reject Leave
router.post('/leave-approve', async (req, res) => {
  const { transaction_id, action, leave_type } = req.body;

  if (!transaction_id || !['Approved', 'Rejected'].includes(action) || !leave_type) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const [leaveRows] = await db.query(
      `SELECT * FROM pr_leave_transactions WHERE transaction_id = ?`,
      [transaction_id]
    );

    if (leaveRows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const leave = leaveRows[0];
    const PR_Emp_id = leave.PR_Emp_id;

    // ✅ Use manager-selected updated leave_type
    const updatedLeaveType = leave_type;

    const year = new Date().getFullYear();

    // 🔄 Update leave type if changed
    await db.query(`UPDATE pr_leave_transactions SET leave_type = ?, leave_status = ? WHERE transaction_id = ?`, [leave_type, action, transaction_id]);

    if (action === 'Approved') {
      let balanceCol, takenCol;

      if (updatedLeaveType === 'PL') {
        balanceCol = 'pr_pl_balance';
        takenCol = 'pl_taken';
      } else if (updatedLeaveType === 'CL') {
        balanceCol = 'pr_cl_balance';
        takenCol = 'cl_taken';
      } else if (updatedLeaveType === 'SL') {
        balanceCol = 'pr_sl_balance';
        takenCol = 'sl_taken';
      } else {
        return res.status(400).json({ error: 'Invalid leave type' });
      }

      await db.query(
        `UPDATE pr_leave_master
     SET ${balanceCol} = ${balanceCol} - 1,
         ${takenCol} = ${takenCol} + 1
     WHERE PR_Emp_id = ? AND year = ?`,
        [PR_Emp_id, year]
      );
    }

    res.json({ message: `Leave ${action.toLowerCase()} successfully` });

  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Leave History for a Specific User
router.get('/leave-history/:PR_Emp_id', async (req, res) => {
  const { PR_Emp_id } = req.params;

  try {
    const [history] = await db.query(
      `SELECT transaction_id, leave_type, from_date, from_time, to_date, to_time, leave_status
        FROM pr_leave_transactions
        WHERE PR_Emp_id = ?
        ORDER BY from_date DESC`,
      [PR_Emp_id]
    );

    if (history.length === 0) {
      return res.status(404).json({ message: 'No leave history found for this user' });
    }

    console.log(`📥 GET /api/manager/leave-history/${PR_Emp_id}`);
    res.json(history);

  } catch (err) {
    console.error('❌ Error fetching leave history:', err.message);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;