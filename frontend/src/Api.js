import axios from "axios";

// Axios client – talks to your Render backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------- AUTH -----------

export async function loginUser(email, password) {
  const res = await api.post("/api/auth/login", { email, password });
  return res.data; // { token, user }
}

export async function registerUser(payload) {
  // payload = { full_name, email, password, ... }
  const res = await api.post("/api/auth/register", payload);
  return res.data;
}

// current logged-in user
export async function fetchCurrentUser() {
  const res = await api.get("/api/users/me");
  return res.data;
}

// ----------- WALLET -----------

export async function fetchMyWallet() {
  const res = await api.get("/api/wallet/me");
  return res.data;
}

export async function depositToWallet(amount) {
  const res = await api.post("/api/wallet/deposit", { amount });
  return res.data;
}

// ----------- TRANSACTIONS -----------

export async function fetchMyTransactions() {
  const res = await api.get("/api/transactions/mine");
  return res.data;
}

// default export in case some files use `import api from "../Api"`
export default api;
