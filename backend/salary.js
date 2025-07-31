const express = require('express');
const router = express.Router();
const db = require('./db');

console.log("✅ salary.js loaded");

// ✅ 1. Generate salary for all active employees
router.post('/generate', async (req, res) => {
  const { monthYear } = req.body;

  if (!monthYear) {
    return res.status(400).json({ error: "monthYear is required." });
  }

  try {
    const [employees] = await db.query(`
      SELECT 
        E.PR_Emp_id AS PR_Emp_ID,
        S.PR_SS_Basic,
        S.PR_SS_HRA,
        S.PR_SS_Other_Allow
      FROM PR_Employees_Master E
      JOIN PR_Salary_Structures S ON E.PR_Emp_id = S.PR_SS_Employee_ID
      WHERE E.PR_EMP_Is_Active = 1
    `);

    console.log("📥 Generating salary for month:", monthYear);
    console.log("👥 Total employees fetched:", employees.length);

    if (employees.length === 0) {
      return res.status(404).json({ message: "No active employees with salary structure found." });
    }

    for (const emp of employees) {
      const [existing] = await db.query(`
        SELECT * FROM PR_Salary_Transactions 
        WHERE PR_ST_Employee_ID = ? AND PR_ST_Month_Year = ?
      `, [emp.PR_Emp_ID, monthYear]);

      if (existing.length > 0) {
        console.log(`⏭️ Skipping salary generation for Employee ID ${emp.PR_Emp_ID} (already exists)`);
        continue;
      }

      const basic = parseFloat(emp.PR_SS_Basic) || 0;
      const hra = parseFloat(emp.PR_SS_HRA) || 0;
      const other = parseFloat(emp.PR_SS_Other_Allow) || 0;
      const gross = basic + hra + other;
      const deductions = 0;
      const net = gross - deductions;

      await db.query(`
        INSERT INTO PR_Salary_Transactions 
        (PR_ST_Employee_ID, PR_ST_Month_Year, PR_ST_Basic, PR_ST_HRA, PR_ST_Other_Allow, 
         PR_ST_Gross_Salary, PR_ST_Deductions, PR_ST_Net_Salary, PR_ST_Status, PR_ST_Created_At) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [emp.PR_Emp_ID, monthYear, basic, hra, other, gross, deductions, net, 'Generated']);
    }

    res.status(200).json({ message: "✅ Salary generated successfully." });

  } catch (error) {
    console.error("❌ Error generating salary:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// ✅ 2. Define or update salary structure
router.post('/structure', async (req, res) => {
  const { employee_id, basic, hra, other_allow } = req.body;

  if (!employee_id || basic == null || hra == null || other_allow == null) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (isNaN(basic) || isNaN(hra) || isNaN(other_allow)) {
    return res.status(400).json({ message: 'Basic, HRA, and Other Allowance must be valid numbers.' });
  }

  try {
    const [existing] = await db.query(`
      SELECT * FROM PR_Salary_Structures WHERE PR_SS_Employee_ID = ?
    `, [employee_id]);

    if (existing.length > 0) {
      await db.query(`
        UPDATE PR_Salary_Structures 
        SET PR_SS_Basic = ?, PR_SS_HRA = ?, PR_SS_Other_Allow = ? 
        WHERE PR_SS_Employee_ID = ?
      `, [basic, hra, other_allow, employee_id]);
      return res.status(200).json({ message: '✅ Salary structure updated.' });
    } else {
      await db.query(`
        INSERT INTO PR_Salary_Structures 
        (PR_SS_Employee_ID, PR_SS_Basic, PR_SS_HRA, PR_SS_Other_Allow)
        VALUES (?, ?, ?, ?)
      `, [employee_id, basic, hra, other_allow]);
      return res.status(200).json({ message: '✅ Salary structure created.' });
    }
  } catch (err) {
    console.error('❌ Error saving structure:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// ✅ 3. Get salary history for an employee
router.get('/history/:PR_Emp_id', async (req, res) => {
  const { PR_Emp_id } = req.params;

  try {
    const [history] = await db.query(`
      SELECT * FROM PR_Salary_Transactions 
      WHERE PR_ST_Employee_ID = ? 
      ORDER BY PR_ST_Month_Year DESC
    `, [PR_Emp_id]);

    if (!history || history.length === 0) {
      return res.status(404).json({ message: "No salary history found for this employee." });
    }

    res.status(200).json({ data: history });

  } catch (error) {
    console.error("❌ Error fetching salary history:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ 4. Get employees who have salary history
router.get('/history-employees', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT DISTINCT E.PR_Emp_id, E.PR_EMP_Full_Name
      FROM PR_Employees_Master E
      INNER JOIN PR_Salary_Transactions S ON E.PR_Emp_id = S.PR_ST_Employee_ID
    `);
    res.status(200).json({ data: results });
  } catch (err) {
    console.error("❌ Error fetching employees with salary history:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ 5. Get employees who have a salary structure defined
router.get('/structure-employees', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT E.PR_Emp_id, E.PR_EMP_Full_Name 
      FROM PR_Employees_Master E
      JOIN PR_Salary_Structures S ON E.PR_Emp_id = S.PR_SS_Employee_ID
      WHERE E.PR_EMP_STATUS = 'Active'
    `);
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error("❌ Error fetching employees with salary structure:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ 6. Get total payroll for the current month (used in AdminDashboard.js)
router.get('/dashboard/monthly-payroll', async (req, res) => {
  try {
    const current = new Date();
    const month = (current.getMonth() + 1).toString().padStart(2, '0');
    const year = current.getFullYear();
    const monthYear = `${month}-${year}`; // Format: "07-2025"

    const [result] = await db.query(`
      SELECT SUM(PR_ST_Net_Salary) AS total 
      FROM PR_Salary_Transactions 
      WHERE PR_ST_Month_Year = ?
    `, [monthYear]);

    const total = result[0].total || 0;
    res.status(200).json({ total });

  } catch (err) {
    console.error("❌ Error in /dashboard/monthly-payroll:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
