// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyWallet, depositToWallet, fetchCurrentUser } from "../Api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [depositLoading, setDepositLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function load() {
      try {
        const [userData, walletData] = await Promise.all([
          fetchCurrentUser(),
          fetchMyWallet(),
        ]);
        setUser(userData);
        setWallet(walletData);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  async function handleDeposit(amount) {
    try {
      setDepositLoading(true);
      const updated = await depositToWallet(amount);
      setWallet(updated);
    } catch (err) {
      setError(err.message || "Deposit failed");
    } finally {
      setDepositLoading(false);
    }
  }

  function formatMoney(v) {
    if (v == null) return "$0.00";
    return `$${Number(v).toFixed(2)}`;
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>Loading your dashboard…</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.layout}>
        {/* LEFT COLUMN: SUMMARY */}
        <div style={styles.leftCol}>
          <div style={styles.card}>
            <h2 style={styles.title}>DigiPiggy Dashboard</h2>
            {user && (
              <p style={styles.subtitle}>
                Welcome, <strong>{user.full_name}</strong> ({user.email})
              </p>
            )}

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.statsRow}>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Total Balance</span>
                <span style={styles.statValue}>
                  {wallet ? formatMoney(wallet.balance) : "$0.00"}
                </span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>This Month Saved</span>
                <span style={styles.statValue}>
                  {wallet ? formatMoney(wallet.monthly_saved) : "$0.00"}
                </span>
              </div>
            </div>

            <div style={styles.depositBox}>
              <h3 style={styles.sectionTitle}>Quick Save</h3>
              <p style={styles.sectionText}>
                Use spare change from your daily spending to grow your DigiPiggy
                balance. For example, if your bill is $9.20, you could add $0.80
                here.
              </p>
              <div style={styles.depositButtons}>
                {[1, 2, 5].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleDeposit(amt)}
                    disabled={depositLoading}
                    style={styles.depositButton}
                  >
                    +${amt}
                  </button>
                ))}
              </div>
              <p style={styles.helperText}>
                Each deposit updates your wallet and creates a row in the
                <code> transactions </code> table for your project demo.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK LINKS */}
        <div style={styles.rightCol}>
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Quick Links</h3>
            <p style={styles.sectionText}>
              Access all other features of the prototype from here without
              cluttering the top navigation.
            </p>

            <div style={styles.linkGrid}>
              <button
                style={styles.linkTile}
                onClick={() => navigate("/transactions")}
              >
                <span style={styles.tileEmoji}>🧾</span>
                <span style={styles.tileTitle}>Transactions</span>
                <span style={styles.tileText}>
                  View history of all your deposits.
                </span>
              </button>

              <button
                style={styles.linkTile}
                onClick={() => navigate("/goals")}
              >
                <span style={styles.tileEmoji}>🎯</span>
                <span style={styles.tileTitle}>Savings Goals</span>
                <span style={styles.tileText}>
                  Prototype goals like “New phone” or “Emergency fund”.
                </span>
              </button>

              <button
                style={styles.linkTile}
                onClick={() => navigate("/bank")}
              >
                <span style={styles.tileEmoji}>🏦</span>
                <span style={styles.tileTitle}>Bank Linking</span>
                <span style={styles.tileText}>
                  Concept screen for connecting a real bank.
                </span>
              </button>

              <button
                style={styles.linkTile}
                onClick={() => navigate("/kyc")}
              >
                <span style={styles.tileEmoji}>🪪</span>
                <span style={styles.tileTitle}>KYC</span>
                <span style={styles.tileText}>
                  Know Your Customer verification flow (prototype).
                </span>
              </button>

              <button
                style={styles.linkTile}
                onClick={() => navigate("/analytics")}
              >
                <span style={styles.tileEmoji}>📊</span>
                <span style={styles.tileTitle}>Analytics</span>
                <span style={styles.tileText}>
                  Monthly savings trends and future insights.
                </span>
              </button>

              <button
                style={styles.linkTile}
                onClick={() => navigate("/notifications")}
              >
                <span style={styles.tileEmoji}>🔔</span>
                <span style={styles.tileTitle}>Notifications</span>
                <span style={styles.tileText}>
                  Notification center prototype for tips and alerts.
                </span>
              </button>

              <button
                style={styles.linkTile}
                onClick={() => navigate("/settings")}
              >
                <span style={styles.tileEmoji}>⚙️</span>
                <span style={styles.tileTitle}>Settings</span>
                <span style={styles.tileText}>
                  Placeholder for preferences & security options.
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 60px)",
    backgroundColor: "#f5f7fb",
    padding: "20px 16px",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  layout: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
    gap: "20px",
  },
  leftCol: {},
  rightCol: {},
  card: {
    backgroundColor: "#ffffff",
    padding: "22px 20px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
  },
  title: {
    fontSize: "22px",
    fontWeight: 700,
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "16px",
  },
  error: {
    fontSize: "13px",
    color: "#b91c1c",
    marginBottom: "10px",
  },
  statsRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  statBox: {
    flex: "1 1 140px",
    backgroundColor: "#eef2ff",
    borderRadius: "12px",
    padding: "10px 12px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#4b5563",
  },
  statValue: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
  },
  depositBox: {
    marginTop: "12px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "4px",
  },
  sectionText: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "10px",
  },
  depositButtons: {
    display: "flex",
    gap: "8px",
    marginBottom: "6px",
  },
  depositButton: {
    borderRadius: "999px",
    border: "none",
    padding: "8px 14px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
  },
  helperText: {
    fontSize: "11px",
    color: "#9ca3af",
  },
  linkGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "10px",
    marginTop: "12px",
  },
  linkTile: {
    textAlign: "left",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "10px 10px",
    backgroundColor: "#f9fafb",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  tileEmoji: {
    fontSize: "18px",
  },
  tileTitle: {
    fontSize: "13px",
    fontWeight: 600,
  },
  tileText: {
    fontSize: "11px",
    color: "#6b7280",
  },
};
