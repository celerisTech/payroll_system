const express = require('express');
const router = express.Router();
const db = require('./db'); // adjust if your db file path differs

// ✅ Get all active employees (full data)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees WHERE is_active = 1');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching active employees:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all employees (active + inactive)
router.get('/all', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching all employees:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get only active employees (minimal for attendance)
// ✅ Get only active employees with user_id for salary module
router.get('/active', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT name, user_id FROM employees WHERE PR_EMP_STATUS = "Active"');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching active employees:', err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ Add new employee (auto-create user if not exists)
router.post('/', async (req, res) => {
  const {
    user_id, name, email, phone, dob, gender,
    department_id, designation_id, doj, work_location_id,
    PR_EMP_STATUS = 'Active' // ✅ default if not sent
  } = req.body;

  // ✅ Validation
  if (
    !user_id || !name || !email || !phone || !dob || !gender ||
    !department_id || !designation_id || !doj || !work_location_id
  ) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // ✅ Check if user exists
    const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [user_id]);

    if (userRows.length === 0) {
      // ✅ Insert default user
      const defaultUsername = `user_${user_id}`;
      const defaultPassword = 'default123';
      const defaultRole = 'Employee';

      await db.query(
        'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)',
        [user_id, defaultUsername, defaultPassword, defaultRole]
      );
    }

    // ✅ Insert employee with PR_EMP_STATUS
    const sql = `
      INSERT INTO employees (
        user_id, name, email, phone, dob, gender,
        department_id, designation_id, doj, work_location_id, is_active, PR_EMP_STATUS
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `;

    await db.query(sql, [
      user_id, name, email, phone, dob, gender,
      department_id, designation_id, doj, work_location_id, PR_EMP_STATUS
    ]);

    res.json({ message: '✅ Employee (and user) added successfully.' });

  } catch (err) {
    console.error('Employee POST error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Deactivate employee (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE employees SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: '✅ Employee deactivated.' });
  } catch (err) {
    console.error('Error deactivating employee:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Reactivate employee
router.put('/reactivate/:id', async (req, res) => {
  try {
    await db.query('UPDATE employees SET is_active = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: '✅ Employee reactivated.' });
  } catch (err) {
    console.error('Error reactivating employee:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
