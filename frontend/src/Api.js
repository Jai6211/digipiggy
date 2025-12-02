// frontend/src/Api.js
import axios from "axios";

// Make sure baseURL ALWAYS ends with /api
const baseURL =
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/$/, "") // remove trailing slash
    : "http://localhost:4000") + "/api";

console.log("📡 Using API baseURL:", baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// ---------- AUTH ----------
export async function signup(payload) {
  const res = await api.post("/auth/register", payload);  // ✅ use /register
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
