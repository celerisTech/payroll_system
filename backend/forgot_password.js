const express = require("express");
const router = express.Router();
const db = require("./db");
const bcrypt = require("bcrypt");

// 🔹 Send OTP for Forgot Password
router.post("/send-otp", async (req, res) => {
  const { PR_phoneNumber, PR_Emp_id } = req.body;

  if (!PR_phoneNumber || !PR_Emp_id) {
    return res.status(400).json({ message: "Phone and User ID required" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM pr_employees_master WHERE PR_phoneNumber = ? AND PR_Emp_id = ?",
      [PR_phoneNumber, PR_Emp_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No matching user found" });
    }

    // Simulate sending OTP
    console.log(`📨 [FORGOT] OTP sent to ${PR_phoneNumber}`);

    return res.json({ message: "OTP sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Verify OTP
router.post("/verify-otp", async (req, res) => {
  // Replace this with actual OTP validation logic
  return res.json({ message: "OTP verified" });
});

// 🔹 Reset Password (UPDATE only)
router.post("/reset-password", async (req, res) => {
  const { PR_phoneNumber, PR_EMP_Password } = req.body;

  if (!PR_phoneNumber || !PR_EMP_Password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(PR_EMP_Password, 10);

    await db.query(
      "UPDATE pr_employees_master SET PR_EMP_Password = ? WHERE PR_phoneNumber = ?",
      [hashedPassword, PR_phoneNumber]
    );

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error resetting password" });
  }
});

module.exports = router;
