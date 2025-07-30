const express = require('express');
const router = express.Router();
const db = require('./db');

// ✅ Get all active employees (full data)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM PR_Employees_Master WHERE PR_EMP_Is_Active = 1');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching active PR_Employees_Master:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all employees (active + inactive)
router.get('/all', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM PR_Employees_Master');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching all employees:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get only active employees (for dropdowns)
router.get('/active', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT PR_EMP_Full_Name, PR_Emp_id FROM PR_Employees_Master WHERE PR_EMP_STATUS = "Active"'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching active employees:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add new employee (auto-create user if not exists)
router.post('/', async (req, res) => {
  const {
    PR_Emp_id,
    PR_EMP_Full_Name,
    PR_EMP_Email,
    PR_phoneNumber,
    PR_EMP_DOB,
    PR_EMP_Gender,
    PR_EMP_Department_ID,
    PR_EMP_Designation_ID,
    PR_EMP_DOJ,
    PR_EMP_Work_Location_Name,
    PR_EMP_STATUS = 'Active'
  } = req.body;

  if (
    !PR_Emp_id || !PR_EMP_Full_Name || !PR_EMP_Email || !PR_phoneNumber ||
    !PR_EMP_DOB || !PR_EMP_Gender || !PR_EMP_Department_ID ||
    !PR_EMP_Designation_ID || !PR_EMP_DOJ || !PR_EMP_Work_Location_Name
  ) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Create user if not exists
    const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [PR_Emp_id]);

    if (userRows.length === 0) {
      const defaultUsername = `user_${PR_Emp_id}`;
      const defaultPassword = 'default123';
      const defaultRole = 'Employee';

      await db.query(
        'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)',
        [PR_Emp_id, defaultUsername, defaultPassword, defaultRole]
      );
    }

    const sql = `
      INSERT INTO PR_Employees_Master (
        PR_Emp_id, PR_EMP_Full_Name, PR_EMP_Email, PR_phoneNumber, PR_EMP_DOB,
        PR_EMP_Gender, PR_EMP_Department_ID, PR_EMP_Designation_ID,
        PR_EMP_DOJ, PR_EMP_Work_Location_Name, PR_EMP_STATUS, PR_EMP_Is_Active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

    const values = [
      PR_Emp_id,
      PR_EMP_Full_Name,
      PR_EMP_Email,
      PR_phoneNumber,
      PR_EMP_DOB,
      PR_EMP_Gender,
      PR_EMP_Department_ID,
      PR_EMP_Designation_ID,
      PR_EMP_DOJ,
      PR_EMP_Work_Location_Name,
      PR_EMP_STATUS
    ];

    await db.query(sql, values);
    res.json({ message: '✅ Employee (and user) added successfully.' });

  } catch (err) {
    console.error('Employee POST error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Deactivate employee
router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE PR_Employees_Master SET PR_EMP_Is_Active = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: '✅ Employee deactivated.' });
  } catch (err) {
    console.error('Error deactivating employee:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Reactivate employee
router.put('/reactivate/:id', async (req, res) => {
  try {
    await db.query('UPDATE PR_Employees_Master SET PR_EMP_Is_Active = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: '✅ Employee reactivated.' });
  } catch (err) {
    console.error('Error reactivating employee:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ NEW: Get full employee history by PR_Emp_id
router.get('/history/:PR_Emp_id', async (req, res) => {
  const PR_Emp_id = req.params.PR_Emp_id;

  try {
    // 1. Basic Info
    const [basicInfo] = await db.query(
      'SELECT * FROM PR_Employees_Master WHERE PR_Emp_id = ?',
      [PR_Emp_id]
    );

    // 2. Attendance History
    const [attendance] = await db.query(
      'SELECT date, status, check_in, check_out FROM employee_attendance WHERE PR_Emp_id = ? ORDER BY date DESC',
      [PR_Emp_id]
    );

    // 3. Leave Transactions
    const [leaves] = await db.query(
      `SELECT leave_type, from_date, to_date, leave_status, created_at 
       FROM pr_leave_transactions 
       WHERE PR_Emp_id = ? ORDER BY created_at DESC`,
      [PR_Emp_id]
    );

    // 4. Salary Transactions
    const [salary] = await db.query(
      `SELECT PR_ST_Month_Year, PR_ST_Basic, PR_ST_HRA, PR_ST_Other_Allow, 
              PR_ST_Deductions, PR_ST_Gross_Salary, PR_ST_Net_Salary 
       FROM pr_salary_transactions 
       WHERE PR_ST_Employee_ID = ? ORDER BY PR_ST_Month_Year DESC`,
      [PR_Emp_id]
    );

    res.json({
      basic: basicInfo[0] || null,
      attendance,
      leaves,
      salary,
    });

  } catch (err) {
    console.error('❌ Error fetching employee history:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
