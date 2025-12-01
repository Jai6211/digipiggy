// src/Api.js
const API_BASE = "http://localhost:4000";

// Helper to get token
function getToken() {
  return localStorage.getItem("token");
}

// Generic GET with auth
async function authGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `GET ${path} failed`);
  }
  return res.json();
}

// Generic POST with auth
async function authPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `POST ${path} failed`);
  }
  return res.json();
}

// ---------------------------
// AUTH HELPERS (optional)
// ---------------------------

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
}

export async function registerUser(full_name, email, password) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Registration failed");
  }
  return data;
}

// ---------------------------
// USER
// ---------------------------

export async function fetchCurrentUser() {
  return authGet("/api/users/me");
}

// ---------------------------
// WALLET
// ---------------------------

export async function fetchMyWallet() {
  return authGet("/api/wallet/me");
}

export async function depositToWallet(amount) {
  return authPost("/api/wallet/deposit", { amount });
}

// ---------------------------
// TRANSACTIONS
// ---------------------------

export async function fetchMyTransactions() {
  return authGet("/api/transactions/mine");
}
