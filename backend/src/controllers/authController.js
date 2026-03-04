const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const EMAIL_DOMAIN = "@pccoepune.org";

// LOGIN (ALL ROLES)
exports.login = async (req, res) => {
  let { email, password } = req.body;


  email = email.trim().toLowerCase();
  password = password.trim();

  if (!email.endsWith(EMAIL_DOMAIN)) {
    // If it's a super admin or special case, maybe bypass? But generally we enforce domain.
    // If the valid user has a different email, this blocks them.
    return res.status(403).json({ message: "Invalid email domain. Use @pccoepune.org" });
  }

  const result = await pool.query(
    "SELECT * FROM users WHERE LOWER(email) = $1",
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = result.rows[0];

  if (!user.is_active) {
    return res.status(403).json({ message: "Account disabled or deactivated" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      prn: user.prn || null,
      mobile: user.mobile || null,
      pan_card: user.pan_card || null
    },
  });
};


// FACULTY REGISTER
exports.registerFaculty = async (req, res) => {
  const { name, email, password, department, prn } = req.body;

  if (!email.endsWith(EMAIL_DOMAIN)) {
    return res.status(403).json({ message: "Only college email allowed" });
  }

  const exists = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (exists.rows.length > 0) {
    return res.status(409).json({ message: "User already exists" });
  }

  // Check if PRN is already taken
  if (prn) {
    const existingPRN = await pool.query(
      'SELECT id FROM users WHERE prn = $1',
      [prn]
    );
    if (existingPRN.rows.length > 0) {
      return res.status(409).json({ message: 'PRN already registered' });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO users (name, email, password, role, department, prn, has_set_password)
     VALUES ($1, $2, $3, 'FACULTY', $4, $5, true)`,
    [name, email, hashedPassword, department, prn]
  );

  res.status(201).json({ message: "Faculty registered successfully" });
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new passwords are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  }

  try {
    // Get current user
    const result = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, userId]
    );

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
};

// SET PASSWORD (for Google users who don't have a password)
exports.setPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPassword, confirmPassword } = req.body;

    // Validate input
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Get user details
    const result = await pool.query(
      "SELECT id, google_id FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // Check if user signed up with Google
    if (!user.google_id) {
      return res.status(400).json({ message: "This feature is only for Google sign-up users" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and set has_set_password flag
    await pool.query(
      "UPDATE users SET password = $1, has_set_password = true WHERE id = $2",
      [hashedPassword, userId]
    );

    res.json({ message: "Password set successfully. You can now login with email and password." });
  } catch (error) {
    console.error("Set password error:", error);
    res.status(500).json({ message: "Failed to set password" });
  }
};

// GET CURRENT USER FROM DATABASE (used by UI to always fetch fresh data)
exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, department, prn, mobile, pan_card FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};
