// src/pages/Analytics.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyWallet } from "../Api";

function AnalyticsPage() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fake monthly data for UI demo (in real app this comes from transactions)
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function loadData() {
      try {
        const w = await fetchMyWallet();
        setWallet(w);

        // Build 6-month demo data based on current balance
        const base = w.balance || 0;
        const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
        const values = months.map((m, idx) => {
          const factor = 0.4 + idx * 0.1; // just to show an increasing pattern
          return {
            month: m,
            saved: Number((base * factor * 0.2).toFixed(2)),
          };
        });
        setMonthlyData(values);
      } catch (err) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  function formatMoney(v) {
    if (v == null) return "$0.00";
    return `$${Number(v).toFixed(2)}`;
  }

  const totalSaved = monthlyData.reduce((sum, m) => sum + m.saved, 0);
  const avgPerMonth = monthlyData.length
    ? totalSaved / monthlyData.length
    : 0;
  const maxSaved = monthlyData.reduce(
    (max, m) => (m.saved > max ? m.saved : max),
    0
  );

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.info}>Loading your savings analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>Savings Analytics</h2>
          <p style={styles.error}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Savings Analytics</h2>
        <p style={styles.subtitle}>
          A simple overview of your DigiPiggy savings. This page is a prototype
          to demonstrate analytics and charts in your project.
        </p>

        {/* Top summary cards */}
        {wallet && (
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Current balance</div>
              <div style={styles.statValue}>{formatMoney(wallet.balance)}</div>
              <div style={styles.statHint}>Total saved in DigiPiggy</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statLabel}>This month saved</div>
              <div style={styles.statValue}>
                {formatMoney(wallet.monthly_saved)}
              </div>
              <div style={styles.statHint}>
                Based on recent deposits to your wallet
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statLabel}>Average / month</div>
              <div style={styles.statValue}>
                {formatMoney(avgPerMonth || 0)}
              </div>
              <div style={styles.statHint}>From the sample 6-month trend</div>
            </div>
          </div>
        )}

        {/* Simple bar chart */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>6-month savings trend (demo)</h3>
          {monthlyData.length === 0 ? (
            <p style={styles.info}>
              No data to show yet. Try adding some savings on the dashboard.
            </p>
          ) : (
            <div style={styles.chartArea}>
              {monthlyData.map((m) => {
                const heightPct =
                  maxSaved > 0 ? Math.max(10, (m.saved / maxSaved) * 100) : 10;
                return (
                  <div key={m.month} style={styles.barColumn}>
                    <div style={styles.barWrapper}>
                      <div
                        style={{
                          ...styles.bar,
                          height: `${heightPct}%`,
                        }}
                      />
                    </div>
                    <div style={styles.barLabel}>{m.month}</div>
                    <div style={styles.barValue}>${m.saved.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Insights text */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Insights (for report/demo)</h3>
          <ul style={styles.insightsList}>
            <li style={styles.insightItem}>
              This page illustrates how DigiPiggy could show monthly savings
              trends using your transaction data.
            </li>
            <li style={styles.insightItem}>
              In a production system, each bar would be calculated from actual
              deposits grouped by month.
            </li>
            <li style={styles.insightItem}>
              You can extend this with filters (weekly / monthly / yearly),
              comparisons to goals, and personalized suggestions.
            </li>
          </ul>
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
    maxWidth: "900px",
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
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "18px",
  },
  statCard: {
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    padding: "12px 14px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#111827",
  },
  statHint: {
    fontSize: "11px",
    color: "#9ca3af",
    marginTop: "2px",
  },
  section: {
    marginTop: "10px",
    paddingTop: "10px",
    borderTop: "1px solid #e5e7eb",
  },
  sectionTitle: {
    fontSize: "15px",
    fontWeight: 600,
    marginBottom: "6px",
  },
  chartArea: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    marginTop: "10px",
    padding: "10px 6px 4px",
    borderRadius: "12px",
    backgroundColor: "#f9fafb",
    minHeight: "180px",
  },
  barColumn: {
    flex: 1,
    textAlign: "center",
  },
  barWrapper: {
    height: "140px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  bar: {
    width: "60%",
    borderRadius: "999px 999px 0 0",
    backgroundColor: "#4f46e5",
    transition: "height 0.2s ease-out",
  },
  barLabel: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },
  barValue: {
    fontSize: "11px",
    color: "#4b5563",
  },
  insightsList: {
    paddingLeft: "18px",
    marginTop: "4px",
  },
  insightItem: {
    fontSize: "13px",
    color: "#4b5563",
    marginBottom: "4px",
  },
  info: {
    fontSize: "13px",
    color: "#6b7280",
  },
  error: {
    fontSize: "13px",
    color: "#b91c1c",
  },
};

export default AnalyticsPage;
