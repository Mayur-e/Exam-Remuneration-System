const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  

  console.log("LOGIN ATTEMPT:", email);

const result = await pool.query(
  "SELECT * FROM users WHERE email = $1 AND is_active = true",
  [email]
);

console.log("DB RESULT:", result.rows);

if (result.rows.length === 0) {
  return res.status(401).json({ message: "User not found" });
}

const user = result.rows[0];

const isMatch = await bcrypt.compare(password, user.password);
console.log("PASSWORD MATCH:", isMatch);


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
      role: user.role
    }
  });
};

exports.registerFaculty = async (req, res) => {
  const { name, email, password, department } = req.body;

  if (!email.endsWith("@pccoepune.org")) {
    return res.status(403).json({ message: "Only college email allowed" });
  }

  const existing = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existing.rows.length > 0) {
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
