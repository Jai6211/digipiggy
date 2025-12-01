// src/pages/Transactions.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyTransactions } from "../Api";

function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function load() {
      try {
        const data = await fetchMyTransactions();
        setTransactions(data);
      } catch (err) {
        setError(err.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  function formatDate(d) {
    if (!d) return "-";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleString();
  }

  function formatMoney(v) {
    if (v == null) return "$0.00";
    return `$${Number(v).toFixed(2)}`;
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.info}>Loading your transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Transaction History</h2>
        <p style={styles.subtitle}>
          Recent deposits made into your DigiPiggy wallet.
        </p>

        {error && <p style={styles.error}>{error}</p>}

        {transactions.length === 0 ? (
          <p style={styles.info}>
            No transactions yet. Try adding $1 on the dashboard to see them
            appear here.
          </p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date &amp; Time</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td style={styles.td}>{formatDate(t.created_at)}</td>
                    <td style={styles.td}>
                      {t.type === "deposit" ? "Deposit" : t.type}
                    </td>
                    <td style={styles.td}>{formatMoney(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={styles.footerNote}>
          For your project report, you can mention that each deposit triggers a
          row in the <code>transactions</code> table linked to the wallet.
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 60px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f7fb",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "16px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "24px 22px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
    maxWidth: "800px",
    width: "100%",
  },
  title: {
    fontSize: "22px",
    fontWeight: 700,
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "18px",
  },
  info: {
    fontSize: "13px",
    color: "#6b7280",
  },
  error: {
    fontSize: "13px",
    color: "#b91c1c",
    marginBottom: "8px",
  },
  tableWrapper: {
    marginTop: "8px",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  th: {
    textAlign: "left",
    padding: "8px 10px",
    backgroundColor: "#eef2ff",
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: "8px 10px",
    borderBottom: "1px solid #e5e7eb",
  },
  footerNote: {
    marginTop: "10px",
    fontSize: "12px",
    color: "#9ca3af",
  },
};

export default TransactionsPage;
