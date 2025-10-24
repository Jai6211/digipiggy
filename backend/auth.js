// ---------------------------
// DigiPiggy Authentication Routes
// ---------------------------

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");

const router = express.Router();
const SECRET = "digipiggy_secret"; // secret key for JWT tokens

// ---------------------------
// MySQL Connection
// ---------------------------
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "digipiggy"
});

// ---------------------------
// Test route (Ping)
// ---------------------------
router.get("/ping", (req, res) => {
  res.json({ ok: true, from: "auth" });
});

// ---------------------------
// 1️⃣ Register new user
// ---------------------------
// Example body:
// {
//   "full_name": "Admin User",
//   "email": "admin@dp.com",
//   "password": "Admin@123",
//   "role": "admin"
// }
router.post("/register", async (req, res) => {
  const { full_name, email, password, role } = req.body;
  if (!full_name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const hash = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [full_name, email, hash, role === "admin" ? "admin" : "user"],
      (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Registered successfully" });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Server error during registration" });
  }
});

// ---------------------------
// 2️⃣ Login existing user
// ---------------------------
// Example body:
// {
//   "email": "admin@dp.com",
//   "password": "Admin@123"
// }
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (rows.length === 0) return res.status(401).json({ error: "Invalid email" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login success",
      token
    });
  });
});

// ---------------------------
// Export Router
// ---------------------------
module.exports = router;

    