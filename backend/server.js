const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// --- Sample API endpoints ---

// 1️⃣ Users
app.get("/api/users", (req, res) => {
  res.json([
    { id: 1, name: "Jagadishwar Reddy", role: "Admin" },
    { id: 2, name: "Devendra Namani", role: "Merchant" },
    { id: 3, name: "Ahmed Azzam", role: "User" },
  ]);
});

// 2️⃣ Wallet Accounts
app.get("/api/wallets", (req, res) => {
  res.json([
    { id: 1, user: "Jagadishwar", balance: 1250 },
    { id: 2, user: "Devendra", balance: 980 },
  ]);
});

// 3️⃣ Transactions
app.get("/api/transactions", (req, res) => {
  res.json([
    { id: 101, type: "deposit", amount: 50, currency: "USD" },
    { id: 102, type: "withdrawal", amount: 20, currency: "USD" },
  ]);
});

// 4️⃣ Savings Goals
app.get("/api/goals", (req, res) => {
  res.json([
    { id: 1, title: "Buy a Laptop", target: 1200, saved: 600 },
    { id: 2, title: "Emergency Fund", target: 1000, saved: 250 },
  ]);
});

const PORT = 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));