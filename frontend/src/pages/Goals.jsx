// src/pages/Goals.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../Api";

function GoalsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);

  // Load current user first
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function loadUser() {
      try {
        const u = await fetchCurrentUser();
        setUser(u);

        const stored = localStorage.getItem(`digipiggy_goals_${u.id}`);
        if (stored) {
          setGoals(JSON.parse(stored));
        }
      } catch (err) {
        setError(err.message || "Failed to load user");
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, [navigate]);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        `digipiggy_goals_${user.id}`,
        JSON.stringify(goals)
      );
    }
  }, [goals, user]);

  function handleAddGoal(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Goal name is required");
      return;
    }
    const targetNum = Number(target);
    if (!targetNum || targetNum <= 0) {
      setError("Target amount must be greater than 0");
      return;
    }

    const newGoal = {
      id: Date.now(),
      name: name.trim(),
      target: targetNum,
      saved: 0,
    };

    setGoals((prev) => [...prev, newGoal]);
    setName("");
    setTarget("");
  }

  function handleAddToGoal(goalId, amount) {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;

    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, saved: g.saved + amt }
          : g
      )
    );
  }

  function handleDeleteGoal(goalId) {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }

  if (loadingUser) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.info}>Loading your savings goals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>Savings Goals</h2>
          <p style={styles.error}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Savings Goals</h2>
        <p style={styles.subtitle}>
          Create small goals and track progress inside your DigiPiggy wallet.
        </p>

        {/* Add Goal Form */}
        <form style={styles.form} onSubmit={handleAddGoal}>
          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Goal name</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Ex: New shoes, emergency fund…"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div style={styles.formField}>
              <label style={styles.label}>Target amount ($)</label>
              <input
                type="number"
                style={styles.input}
                placeholder="Ex: 100"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.addButton}>
            Add Goal
          </button>
        </form>

        {/* Goals List */}
        {goals.length === 0 ? (
          <p style={styles.info}>
            You don’t have any goals yet. Start by adding your first savings goal above.
          </p>
        ) : (
          <div style={styles.goalsList}>
            {goals.map((goal) => {
              const pct =
                goal.target > 0
                  ? Math.min(100, (goal.saved / goal.target) * 100)
                  : 0;

              return (
                <div key={goal.id} style={styles.goalCard}>
                  <div style={styles.goalHeader}>
                    <div>
                      <div style={styles.goalName}>{goal.name}</div>
                      <div style={styles.goalAmounts}>
                        Saved:{" "}
                        <strong>${goal.saved.toFixed(2)}</strong> &nbsp; / &nbsp;
                        Target:{" "}
                        <strong>${goal.target.toFixed(2)}</strong>
                      </div>
                    </div>
                    <button
                      style={styles.deleteButton}
                      type="button"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div style={styles.progressBarOuter}>
                    <div
                      style={{
                        ...styles.progressBarInner,
                        width: `${pct}%`,
                      }}
                    />
                  </div>
                  <div style={styles.progressText}>
                    {pct.toFixed(0)}% toward your goal
                  </div>

                  {/* Quick add buttons */}
                  <div style={styles.quickRow}>
                    <span style={styles.smallLabel}>Quick add:</span>
                    <button
                      type="button"
                      style={styles.smallButton}
                      onClick={() => handleAddToGoal(goal.id, 1)}
                    >
                      +$1
                    </button>
                    <button
                      type="button"
                      style={styles.smallButton}
                      onClick={() => handleAddToGoal(goal.id, 5)}
                    >
                      +$5
                    </button>
                    <button
                      type="button"
                      style={styles.smallButton}
                      onClick={() => handleAddToGoal(goal.id, 10)}
                    >
                      +$10
                    </button>
                  </div>
                </div>
              );
            })}
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
    minWidth: "180px",
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
  goalsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  goalCard: {
    borderRadius: "12px",
    backgroundColor: "#f9fafb",
    padding: "12px 12px 10px",
  },
  goalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "6px",
  },
  goalName: {
    fontSize: "15px",
    fontWeight: 600,
  },
  goalAmounts: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "2px",
  },
  deleteButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    color: "#9ca3af",
  },
  progressBarOuter: {
    width: "100%",
    height: "8px",
    borderRadius: "999px",
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
    marginTop: "4px",
  },
  progressBarInner: {
    height: "100%",
    backgroundColor: "#4f46e5",
    borderRadius: "999px",
    transition: "width 0.2s ease-out",
  },
  progressText: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },
  quickRow: {
    marginTop: "6px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
  },
  smallLabel: {
    fontSize: "12px",
    color: "#6b7280",
  },
  smallButton: {
    borderRadius: "999px",
    border: "1px solid #d1d5db",
    padding: "4px 10px",
    fontSize: "12px",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },
  info: {
    fontSize: "13px",
    color: "#6b7280",
  },
  error: {
    fontSize: "13px",
    color: "#b91c1c",
    marginTop: "4px",
  },
};

export default GoalsPage;
