// ---------------------------
// DigiPiggy Backend – CLEAN VERSION
// ---------------------------

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");

const authRoutes = require("./auth"); // ./auth.js

const app = express();

// IMPORTANT: these must be before all routes
app.use(cors());
app.use(express.json());

const SECRET = "digipiggy_secret";

// ---------------------------
// MySQL Connection
// ---------------------------
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "admin123",
  database: process.env.DB_NAME || "digipiggy",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL Database");
  }
});

// Make db available to other modules if needed
app.set("db", db);

// ---------------------------
// Health Check
// ---------------------------
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ---------------------------
// Auth routes (register + login)
// ---------------------------
app.use("/api/auth", authRoutes);

// ---------------------------
// Auth middlewares
// ---------------------------
function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, SECRET);
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
// USERS
// ---------------------------

// current user
app.get("/api/users/me", verifyToken, (req, res) => {
  db.query(
    "SELECT id, full_name, email, role FROM users WHERE id = ?",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      if (rows.length === 0)
        return res.status(404).json({ error: "User not found" });
      res.json(rows[0]);
    }
  );
});

// all users (demo)
app.get("/api/users", (req, res) => {
  db.query(
    "SELECT id, full_name, email, role FROM users ORDER BY id DESC",
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    }
  );
});

// ---------------------------
// WALLET HELPERS
// ---------------------------
function getOrCreateWallet(dbConn, userId, cb) {
  dbConn.query(
    "SELECT * FROM wallet_accounts WHERE user_id = ?",
    [userId],
    (err, rows) => {
      if (err) return cb(err);
      if (rows.length === 0) {
        dbConn.query(
          "INSERT INTO wallet_accounts (user_id, balance, monthly_saved) VALUES (?, 0, 0)",
          [userId],
          (err2, result) => {
            if (err2) return cb(err2);
            dbConn.query(
              "SELECT * FROM wallet_accounts WHERE id = ?",
              [result.insertId],
              (err3, rows2) => {
                if (err3) return cb(err3);
                cb(null, rows2[0]);
              }
            );
          }
        );
      } else {
        cb(null, rows[0]);
      }
    }
  );
}

// get my wallet
app.get("/api/wallet/me", verifyToken, (req, res) => {
  getOrCreateWallet(db, req.user.id, (err, wallet) => {
    if (err) return res.status(500).json({ error: err });
    res.json(wallet);
  });
});

// deposit + create transaction
app.post("/api/wallet/deposit", verifyToken, (req, res) => {
  const { amount } = req.body;
  const value = Number(amount);
  if (!value || value <= 0)
    return res.status(400).json({ error: "Amount must be > 0" });

  getOrCreateWallet(db, req.user.id, (err, wallet) => {
    if (err) return res.status(500).json({ error: err });

    const newBalance = Number(wallet.balance) + value;
    const newMonthly = Number(wallet.monthly_saved) + value;

    db.query(
      "UPDATE wallet_accounts SET balance = ?, monthly_saved = ? WHERE id = ?",
      [newBalance, newMonthly, wallet.id],
      (err2) => {
        if (err2) return res.status(500).json({ error: err2 });

        db.query(
          "INSERT INTO transactions (user_id, wallet_id, amount, type) VALUES (?, ?, ?, 'deposit')",
          [req.user.id, wallet.id, value],
          (err3) => {
            if (err3) return res.status(500).json({ error: err3 });

            db.query(
              "SELECT * FROM wallet_accounts WHERE id = ?",
              [wallet.id],
              (err4, rows2) => {
                if (err4) return res.status(500).json({ error: err4 });
                res.json(rows2[0]);
              }
            );
          }
        );
      }
    );
  });
});

// my transactions
app.get("/api/transactions/mine", verifyToken, (req, res) => {
  db.query(
    "SELECT id, amount, type, created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    }
  );
});

// ---------------------------
// START SERVER
// ---------------------------
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});
