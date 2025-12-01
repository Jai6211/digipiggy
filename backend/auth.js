// ---------------------------
// DigiPiggy Authentication Routes – FLEXIBLE VERSION
// ---------------------------

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");

const router = express.Router();
const SECRET = "digipiggy_secret";

// DB connection for auth
const mysql = require("mysql2");

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


db.connect((err) => {
  if (err) {
    console.error("❌ Auth DB connection failed:", err);
  } else {
    console.log("✅ Auth DB connected");
  }
});

// Ping
router.get("/ping", (req, res) => {
  res.json({ ok: true, from: "auth" });
});

// ---------------------------
// 1️⃣ REGISTER
// ---------------------------

router.post("/register", async (req, res) => {
  // Accept multiple possible field names from frontend
  const body = req.body || {};

  const full_name =
    body.full_name || body.fullName || body.name || body.username;
  const email = body.email || body.emailAddress || body.username;
  const password = body.password || body.pass || body.pwd;

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [full_name, email, hash, "user"],
      (err) => {
        if (err) {
          console.error("DB error on register:", err);
          return res.status(500).json({ error: "DB error during register" });
        }
        res.json({ message: "Registered successfully" });
      }
    );
  } catch (err) {
    console.error("Server error during registration:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// ---------------------------
// 2️⃣ LOGIN
// ---------------------------

router.post("/login", (req, res) => {
  const body = req.body || {};

  const email = body.email || body.emailAddress || body.username;
  const password = body.password || body.pass || body.pwd;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, rows) => {
    if (err) {
      console.error("DB error on login:", err);
      return res.status(500).json({ error: "DB error during login" });
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
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login success",
      token,
    });
  });
});

module.exports = router;
