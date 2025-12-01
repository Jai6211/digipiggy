// src/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../Api";

function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [prefs, setPrefs] = useState({
    currency: "USD",
    emailNotifications: true,
    dailyReminderEnabled: false,
    dailyReminderTime: "09:00",
  });

  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  // Load user + prefs from localStorage
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

        const stored = localStorage.getItem(`digipiggy_settings_${u.id}`);
        if (stored) {
          setPrefs(JSON.parse(stored));
        }
      } catch (err) {
        setError(err.message || "Failed to load user");
      } finally {
        setLoadingUser(false);
      }
    }

    load();
  }, [navigate]);

  // Save prefs whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        `digipiggy_settings_${user.id}`,
        JSON.stringify(prefs)
      );
    }
  }, [prefs, user]);

  function handleChange(e) {
    const { name, type, checked, value } = e.target;
    setPrefs((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setSavedMessage(""); // clear old message
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSavedMessage("Settings saved locally for this user.");
  }

  if (loadingUser) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.info}>Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>Settings</h2>
          <p style={styles.error}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Settings & Preferences</h2>
        <p style={styles.subtitle}>
          Customize how DigiPiggy works for you. These preferences are stored
          locally per user for this prototype.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Currency */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Currency</h3>
            <p style={styles.info}>
              Choose your preferred display currency. (Backend is still in USD –
              this is for UI demonstration.)
            </p>

            <div style={styles.row}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="currency"
                  value="USD"
                  checked={prefs.currency === "USD"}
                  onChange={handleChange}
                  style={styles.radio}
                />
                USD ($)
              </label>

              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="currency"
                  value="INR"
                  checked={prefs.currency === "INR"}
                  onChange={handleChange}
                  style={styles.radio}
                />
                INR (₹)
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Notifications</h3>
            <div style={styles.row}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={prefs.emailNotifications}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                Email me monthly savings summary
              </label>
            </div>
            <p style={styles.smallInfo}>
              In a real system, this would trigger background jobs / email
              service. Here it shows how preferences could be configured.
            </p>
          </div>

          {/* Daily reminder */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Daily saving reminder</h3>
            <div style={styles.row}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="dailyReminderEnabled"
                  checked={prefs.dailyReminderEnabled}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                Enable a daily reminder to save
              </label>
            </div>

            {prefs.dailyReminderEnabled && (
              <div style={styles.row}>
                <div style={styles.fieldSmall}>
                  <label style={styles.label}>Reminder time</label>
                  <input
                    type="time"
                    name="dailyReminderTime"
                    value={prefs.dailyReminderTime}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>
            )}

            <p style={styles.smallInfo}>
              You can mention in your report that this could later connect to
              push notifications, emails, or SMS reminders.
            </p>
          </div>

          {/* Save button */}
          {error && <p style={styles.error}>{error}</p>}
          {savedMessage && <p style={styles.success}>{savedMessage}</p>}

          <button type="submit" style={styles.saveButton}>
            Save Settings
          </button>
        </form>

        <div style={styles.footerNote}>
          For your project, you can describe this page as the central place
          where users manage personalization and notification settings.
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
  section: {
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid #e5e7eb",
  },
  sectionTitle: {
    fontSize: "15px",
    fontWeight: 600,
    marginBottom: "6px",
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center",
    marginTop: "6px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "14px",
    color: "#111827",
  },
  radio: {
    marginRight: "4px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    color: "#111827",
  },
  checkbox: {
    marginRight: "4px",
  },
  fieldSmall: {
    minWidth: "150px",
  },
  label: {
    fontSize: "13px",
    color: "#374151",
    marginBottom: "4px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
  },
  saveButton: {
    marginTop: "8px",
    padding: "8px 18px",
    borderRadius: "999px",
    border: "none",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "14px",
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
  success: {
    fontSize: "13px",
    color: "#065f46",
    marginTop: "4px",
  },
  footerNote: {
    marginTop: "10px",
    fontSize: "12px",
    color: "#9ca3af",
  },
};

export default SettingsPage;
