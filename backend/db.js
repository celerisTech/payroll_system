const mysql = require('mysql2');

// ✅ Use pool + .promise() for async/await
const pool = mysql.createPool({
  host: 'localhost',              // or your DB IP
  user: 'root',                   // your DB username
  password: '',      // your DB password
  database: 'payroll_system',        // your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise(); // ✅ THIS is required
