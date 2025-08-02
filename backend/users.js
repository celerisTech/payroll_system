const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcrypt');
// ✅ GET all users
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM users');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET user by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    res.json(results[0] || null);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ CREATE user
router.post('/', async (req, res) => {
  const { user_id, password, role } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO users (user_id, password, role) VALUES (?, ?, ?)',
      [user_id, password, role]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, password, role } = req.body;
  try {
    await db.query(
      'UPDATE users SET user_id = ?, password = ?, role = ? WHERE id = ?',
      [user_id, password, role, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  console.log("🔐 Login attempt:", req.body);

  try {
    // 1️⃣ Admin / Payroll Officer login via 'users' table
    const [userMatch] = await db.query(
      'SELECT id, username, role, password FROM users WHERE username = ?',
      [identifier]
    );

    if (userMatch.length > 0 && userMatch[0].password === password) {
      return res.json({
        success: true,
        userId: userMatch[0].id,
        role: userMatch[0].role,
        source: 'users',
      });
    }

    // 2️⃣ Employee login via 'pr_employees_master' table
    const [empMatch] = await db.query(
      'SELECT id, PR_Emp_id, PR_EMP_Password FROM pr_employees_master WHERE PR_Emp_id = ?',
      [identifier]
    );

    if (
      empMatch.length > 0 &&
      await bcrypt.compare(password, empMatch[0].PR_EMP_Password)
    ) {
      return res.json({
        success: true,
        userId: empMatch[0].PR_Emp_id,
        role: 'Employee',
        source: 'pr_employees_master',
      });
    }

    // 3️⃣ Invalid Credentials
    res.status(401).json({ success: false, error: 'Invalid credentials' });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
