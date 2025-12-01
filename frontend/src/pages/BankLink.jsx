// src/pages/BankLink.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../Api";

function BankLinkPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [bankName, setBankName] = useState("");
  const [nickname, setNickname] = useState("");
  const [last4, setLast4] = useState("");
  const [error, setError] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);

  // Load user + stored accounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function load() {
      try {
        const u = await fetchCurrentUser();
        setUser(u);

        const stored = localStorage.getItem(`digipiggy_banks_${u.id}`);
        if (stored) {
          setAccounts(JSON.parse(stored));
        }
      } catch (err) {
        setError(err.message || "Failed to load user");
      } finally {
        setLoadingUser(false);
      }
    }

    load();
  }, [navigate]);

  // Save to localStorage whenever accounts change
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        `digipiggy_banks_${user.id}`,
        JSON.stringify(accounts)
      );
    }
  }, [accounts, user]);

  function handleAddBank(e) {
    e.preventDefault();
    setError("");

    if (!bankName.trim()) {
      setError("Bank name is required");
      return;
    }
    if (!nickname.trim()) {
      setError("Account nickname is required");
      return;
    }
    if (!/^\d{4}$/.test(last4)) {
      setError("Last 4 digits must be exactly 4 numbers");
      return;
    }

    const newAccount = {
      id: Date.now(),
      bankName: bankName.trim(),
      nickname: nickname.trim(),
      last4,
      status: "Pending verification", // static for now
    };

    setAccounts((prev) => [...prev, newAccount]);
    setBankName("");
    setNickname("");
    setLast4("");
  }

  function handleRemove(id) {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }

  if (loadingUser) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.info}>Loading bank linking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>Bank Linking</h2>
          <p style={styles.error}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Bank Linking</h2>
        <p style={styles.subtitle}>
          Connect a bank account so your spare change can move automatically
          into DigiPiggy. This is a prototype UI – no real bank connection yet.
        </p>

        {/* Add Bank Form */}
        <form style={styles.form} onSubmit={handleAddBank}>
          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Bank name</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Ex: Chase, Bank of America"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Account nickname</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Ex: Main checking, Savings"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formFieldSmall}>
              <label style={styles.label}>Last 4 digits</label>
              <input
                type="text"
                style={styles.input}
                placeholder="1234"
                maxLength={4}
                value={last4}
                onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.addButton}>
            Add Bank
          </button>
        </form>

        {/* Linked Accounts List */}
        {accounts.length === 0 ? (
          <p style={styles.info}>
            You haven&apos;t linked any bank accounts yet. Add one above to see how
            a real integration could look.
          </p>
        ) : (
          <div style={styles.list}>
            {accounts.map((acc) => (
              <div key={acc.id} style={styles.accountCard}>
                <div style={styles.accountHeader}>
                  <div>
                    <div style={styles.bankName}>{acc.bankName}</div>
                    <div style={styles.accountLine}>
                      {acc.nickname} &bull; **** {acc.last4}
                    </div>
                    <div style={styles.statusRow}>
                      <span style={styles.statusLabel}>Status:</span>
                      <span style={styles.statusPill}>{acc.status}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    style={styles.removeButton}
                    onClick={() => handleRemove(acc.id)}
                  >
                    Remove
                  </button>
                </div>
                <p style={styles.smallInfo}>
                  In a production app, this would be connected via a provider
                  like Plaid, and verification would update this status.
                </p>
              </div>
            ))}
          </div>
        )}
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
  form: {
    marginBottom: "18px",
    paddingBottom: "14px",
    borderBottom: "1px solid #e5e7eb",
  },
  formRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
  },
  formField: {
    flex: 1,
    minWidth: "220px",
  },
  formFieldSmall: {
    width: "140px",
  },
  label: {
    fontSize: "13px",
    color: "#374151",
    marginBottom: "4px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
  },
  addButton: {
    marginTop: "10px",
    padding: "8px 16px",
    borderRadius: "999px",
    border: "none",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "14px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  accountCard: {
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    padding: "12px 12px 10px",
  },
  accountHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
  },
  bankName: {
    fontSize: "15px",
    fontWeight: 600,
  },
  accountLine: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "2px",
  },
  statusRow: {
    marginTop: "4px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  statusLabel: {
    fontSize: "12px",
    color: "#6b7280",
  },
  statusPill: {
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "999px",
    backgroundColor: "#fef3c7",
    color: "#92400e",
    fontWeight: 600,
  },
  removeButton: {
    alignSelf: "flex-start",
    border: "none",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: "12px",
    cursor: "pointer",
  },
  info: {
    fontSize: "13px",
    color: "#6b7280",
  },
  smallInfo: {
    fontSize: "11px",
    color: "#9ca3af",
    marginTop: "4px",
  },
  error: {
    fontSize: "13px",
    color: "#b91c1c",
    marginTop: "4px",
  },
};

export default BankLinkPage;
