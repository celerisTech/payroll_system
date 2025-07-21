const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes
const employees = require('./employees');
const users = require('./users');
const departments = require('./departments');
const designations = require('./designations');
const salarystructures = require('./salarystructures');
const paycomponents = require('./paycomponents');
const taxslabs = require('./taxslabs');
const leavetypes = require('./leavetypes');
const bankdetails = require('./bankdetails');
const worklocations = require('./worklocations');
const payrollsettings = require('./payrollsettings');
const dashboardRoutes = require('./dashboard');
const attendanceRoutes = require('./attendance');         // GET
const attendanceMarkRoutes = require('./attendance_mark'); // POST


// ✅ Mount APIs
app.use('/api/employees', employees);
app.use('/api/users', users);
app.use('/api/departments', departments);
app.use('/api/designations', designations);
app.use('/api/salarystructures', salarystructures);
app.use('/api/paycomponents', paycomponents);
app.use('/api/taxslabs', taxslabs);
app.use('/api/leavetypes', leavetypes);
app.use('/api/bankdetails', bankdetails);
app.use('/api/worklocations', worklocations);
app.use('/api/payrollsettings', payrollsettings);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);        // GET
app.use('/api/attendance', attendanceMarkRoutes);    // POST

// ✅ Health check
app.get('/', (req, res) => {
  res.json({ message: "Welcome to Payroll API" });
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
