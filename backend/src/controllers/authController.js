const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const EMAIL_DOMAIN = "@pccoepune.org";

// LOGIN (ALL ROLES)
exports.login = async (req, res) => {
  let { email, password } = req.body;

  // 🔒 Normalize input (THIS FIXES 90% CASES)
  email = email.trim().toLowerCase();
  password = password.trim();

  if (!email.endsWith(EMAIL_DOMAIN)) {
    return res.status(403).json({ message: "Invalid email domain" });
  }

  const result = await pool.query(
    "SELECT * FROM users WHERE LOWER(email) = $1 AND is_active = true",
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = result.rows[0];

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
      department: user.department
    },
  });
};


// FACULTY REGISTER
exports.registerFaculty = async (req, res) => {
  const { name, email, password, department } = req.body;

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

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO users (name, email, password, role, department)
     VALUES ($1, $2, $3, 'FACULTY', $4)`,
    [name, email, hashedPassword, department]
  );

  res.status(201).json({ message: "Faculty registered successfully" });
};
