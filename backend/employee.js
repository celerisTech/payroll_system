// const express = require('express');
// const router = express.Router();
// const db = require('./db'); // Ensure db is properly configured

// // GET employee full details by PR_Emp_id
// // backend/routes/employee.js (or wherever your routes are)
// router.get('/details/:id', async (req, res) => {
//   const empId = req.params.id;

//   try {
//     const [rows] = await db.query(
//       'SELECT * FROM pr_employees_master WHERE PR_Emp_id = ?',
//       [empId]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ error: 'Employee not found' });
//     }

//     res.json(rows[0]);
//   } catch (err) {
//     console.error('Error fetching employee details:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// module.exports = router;