// frontend/src/Api.js
import axios from "axios";

// Make sure baseURL ALWAYS ends with /api
const baseURL =
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/$/, "") // remove trailing slash
    : "http://localhost:4000") + "/api";

console.log("📡 Using API baseURL:", baseURL);

// No withCredentials – we are not using cookies
const api = axios.create({
  baseURL,
});

// ---------- AUTH ----------
export async function signup(payload) {
  // ⬇️ IMPORTANT: use /auth/register (matches backend)
  const res = await api.post("/auth/register", payload);
  return res.data;
}

export async function login(payload) {
  const res = await api.post("/auth/login", payload);
  return res.data;
}

export async function logout() {
  const res = await api.post("/auth/logout");
  return res.data;
}

export async function fetchCurrentUser() {
  const res = await api.get("/auth/me");
  return res.data;
}

// ---------- WALLET ----------
export async function fetchMyWallet() {
  const res = await api.get("/wallet/me");
  return res.data;
}

export async function depositToWallet(amountCents) {
  const res = await api.post("/wallet/deposit", { amount_cents: amountCents });
  return res.data;
}

// ---------- TRANSACTIONS (demo data for now) ----------
export async function fetchMyTransactions() {
  return [
    {
      id: 1,
      type: "roundup",
      amount_cents: 75,
      created_at: "2025-12-01 10:15:00",
      memo: "Coffee round-up",
    },
    {
      id: 2,
      type: "deposit",
      amount_cents: 500,
      created_at: "2025-12-01 15:30:00",
      memo: "Manual deposit",
    },
  ];
}
