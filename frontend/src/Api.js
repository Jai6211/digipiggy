// frontend/src/Api.js
import axios from "axios";

// Make sure baseURL ALWAYS ends with /api
const baseURL =
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/$/, "") // remove trailing slash
    : "http://localhost:4000") + "/api";

console.log("📡 Using API baseURL:", baseURL);

// IMPORTANT:
// ❌ No withCredentials here – we are NOT using cookies.
// This avoids the CORS error you saw.
const api = axios.create({
  baseURL,
});

// ---------- AUTH ----------
export async function signup(payload) {
  const res = await api.post("/auth/signup", payload);
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
/**
 * This is just to keep Vercel build happy and show some example data
 * on the Transactions page. Later we can connect it to a real backend
 * route if you want.
 */
export async function fetchMyTransactions() {
  // Example mock data
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
