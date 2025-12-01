// ---------------------------
// DigiPiggy Auth Routes
// ---------------------------

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");

const router = express.Router();

// Use the same secret as server.js
const SECRET = "digipiggy_secret";

// ---------------------------
// MySQL Connection for Auth
// ---------------------------
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "admin123",
  database: process.env.DB_NAME || "digipiggy",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Auth DB connection failed:", err);
  } else {
    console.log("✅ Auth DB connected");
  }
});

// ---------------------------
// POST /api/auth/register
// ---------------------------
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // check if user already exists
    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, rows) => {
        if (err) {
          console.error("DB error on register:", err);
          return res.status(500).json({ error: "Database error" });
        }

        if (rows.length > 0) {
          return res
            .status(409)
            .json({ error: "User with this email already exists" });
        }

        const hash = await bcrypt.hash(password, 10);

        db.query(
          "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'user')",
          [full_name, email, hash],
          (err2, result) => {
            if (err2) {
              console.error("Insert error on register:", err2);
              return res.status(500).json({ error: "Database error" });
            }

            const userId = result.insertId;
            const token = jwt.sign(
              { id: userId, email, role: "user" },
              SECRET,
              { expiresIn: "7d" }
            );

            res.status(201).json({
              id: userId,
              full_name,
              email,
              role: "user",
              token,
            });
          }
        );
      }
    );
  } catch (e) {
    console.error("Register error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------------
// POST /api/auth/login
// ---------------------------
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  db.query(
    "SELECT id, full_name, email, password_hash, role FROM users WHERE email = ?",
    [email],
    async (err, rows) => {
      if (err) {
        console.error("DB error on login:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (rows.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const user = rows[0];

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        token,
      });
    }
  );
});

// ---------------------------
// Export router
// ---------------------------
module.exports = router;
