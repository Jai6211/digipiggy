// ---------------------------
// DigiPiggy Backend Prototype with RBAC
// ---------------------------

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const authRoutes = require("./auth"); // Import authentication routes

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "digipiggy_secret"; // same as in auth.js

// ---------------------------
// MySQL Connection
// ---------------------------
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "digipiggy"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL Database");
  }
});

// ---------------------------
// Health Check
// ---------------------------
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ---------------------------
// AUTH ROUTES (Register + Login)
// ---------------------------
app.use("/api/auth", authRoutes);

// ---------------------------
// Auth Middlewares
// ---------------------------
function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, SECRET); // decode { id, email, role }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}

// ---------------------------
// USERS CRUD (5 API endpoints)
// ---------------------------

// 1️⃣ Get all users (public for demo)
app.get("/api/users", (req, res) => {
  db.query("SELECT id, full_name, email, role FROM users ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});

// 2️⃣ Get one user (requires login)
app.get("/api/users/:id", verifyToken, (req, res) => {
  db.query("SELECT id, full_name, email, role FROM users WHERE id = ?", [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  });
});

// 3️⃣ Create a new user (requires login)
app.post("/api/users", verifyToken, (req, res) => {
  const { full_name, email, password_hash } = req.body;
  if (!full_name || !email || !password_hash) {
    return res.status(400).json({ error: "full_name, email, password_hash are required" });
  }

  db.query(
    "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'user')",
    [full_name, email, password_hash],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: "User created", id: result.insertId });
    }
  );
});

// 4️⃣ Update user (requires login)
app.put("/api/users/:id", verifyToken, (req, res) => {
  const { full_name } = req.body;
  if (!full_name) return res.status(400).json({ error: "full_name is required" });

  db.query(
    "UPDATE users SET full_name = ? WHERE id = ?",
    [full_name, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
      res.json({ message: "User updated" });
    }
  );
});

// 5️⃣ Delete user (ADMIN ONLY)
app.delete("/api/users/:id", verifyToken, allowRoles("admin"), (req, res) => {
  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted by admin" });
  });
});

// ---------------------------
// WALLET ACCOUNTS (optional)
// ---------------------------
app.get("/api/wallets", verifyToken, (req, res) => {
  db.query("SELECT * FROM wallet_accounts ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});

// ---------------------------
// START SERVER
// ---------------------------
const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
