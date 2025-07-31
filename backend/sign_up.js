// backend/sign_up.js
const express = require("express");
const router = express.Router();
const db = require("./db");
const bcrypt = require("bcrypt");

// 🔹 Send OTP
router.post("/send-otp", async (req, res) => {
  const { PR_phoneNumber, PR_Emp_id } = req.body;

  if (!PR_phoneNumber || !PR_Emp_id)
    return res.status(400).json({ message: "phone and User ID required" });

  try {
    const [rows] = await db.query(
      "SELECT * FROM pr_employees_master WHERE PR_phoneNumber = ? AND PR_Emp_id = ?",
      [PR_phoneNumber, PR_Emp_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Phone/User ID mismatch or not found" });
    }

    // Simulate OTP send
    console.log(`📨 OTP sent to ${PR_phoneNumber} for PR_Emp_id ${PR_Emp_id}`);

    return res.json({ message: "OTP sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Verify OTP
router.post("/verify-otp", async (req, res) => {
  // Placeholder
  return res.json({ message: "OTP verified" });
});

// 🔹 Set password
router.post("/set-password", async (req, res) => {
  const { PR_phoneNumber, PR_EMP_Password } = req.body;

  if (!PR_phoneNumber || !PR_EMP_Password) return res.status(400).json({ message: "Missing data" });

  try {
    const hashedPassword = await bcrypt.hash(PR_EMP_Password, 10);
    await db.query("UPDATE pr_employees_master SET PR_EMP_Password = ? WHERE PR_phoneNumber = ?", [hashedPassword, PR_phoneNumber]);
    return res.json({ message: "Password updated" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating password" });
  }
});

module.exports = router;
