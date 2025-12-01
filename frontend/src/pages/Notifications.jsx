// src/pages/Notifications.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../Api";

function NotificationsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

  // Load user + settings + notifications from localStorage
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

        // Settings / preferences
        const storedPrefs = localStorage.getItem(`digipiggy_settings_${u.id}`);
        if (storedPrefs) {
          setPrefs(JSON.parse(storedPrefs));
        } else {
          setPrefs({
            currency: "USD",
            emailNotifications: true,
            dailyReminderEnabled: false,
            dailyReminderTime: "09:00",
          });
        }

        // Notifications
        const stored = localStorage.getItem(`digipiggy_notifications_${u.id}`);
        if (stored) {
          setNotifications(JSON.parse(stored));
        } else {
          // Seed with some demo notifications
          const seed = [
            {
              id: 1,
              title: "Welcome to DigiPiggy",
              body: "Your account has been created. Start saving your leftover change today.",
              type: "info",
              read: false,
              date: "2025-11-20",
            },
            {
              id: 2,
              title: "Quick save challenge",
              body: "Try adding $1 each day this week to see how fast your balance grows.",
              type: "tip",
              read: false,
              date: "2025-11-21",
            },
            {
              id: 3,
              title: "Security reminder",
              body: "Remember to enable KYC and link your bank account to unlock full features.",
              type: "security",
              read: true,
              date: "2025-11-22",
            },
          ];
          setNotifications(seed);
          localStorage.setItem(
            `digipiggy_notifications_${u.id}`,
            JSON.stringify(seed)
          );
        }
      } catch (err) {
        setError(err.message || "Failed to load notifications");
      } finally {
        setLoadingUser(false);
      }
    }

    load();
  }, [navigate]);

  // Save notifications whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        `digipiggy_notifications_${user.id}`,
        JSON.stringify(notifications)
      );
    }
  }, [notifications, user]);

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function badgeStyleForType(type) {
    switch (type) {
      case "tip":
        return { backgroundColor: "#e0f2fe", color: "#0369a1" };
      case "security":
        return { backgroundColor: "#fee2e2", color: "#b91c1c" };
      default:
        return { backgroundColor: "#e5e7eb", color: "#374151" };
    }
  }

  if (loadingUser) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.info}>Loading your notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>Notifications</h2>
          <p style={styles.error}>{error}</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Notifications</h2>
        <p style={styles.subtitle}>
          Updates, tips, and important messages related to your DigiPiggy
          account.
        </p>

        {/* Preferences summary */}
        {prefs && (
          <div style={styles.prefBanner}>
            <div>
              <div style={styles.prefTitle}>Notification settings</div>
              <div style={styles.prefText}>
                Email summaries:{" "}
                <strong>
                  {prefs.emailNotifications ? "Enabled" : "Disabled"}
                </strong>
                {prefs.dailyReminderEnabled && (
                  <>
                    {" "}
                    • Daily reminder at{" "}
                    <strong>{prefs.dailyReminderTime}</strong>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              style={styles.prefButton}
              onClick={() => navigate("/settings")}
            >
              Edit in Settings
            </button>
          </div>
        )}

        {/* Actions */}
        <div style={styles.actionsRow}>
          <span style={styles.info}>
            {unreadCount > 0
              ? `${unreadCount} unread notification${
                  unreadCount > 1 ? "s" : ""
                }`
              : "You are all caught up!"}
          </span>
          {unreadCount > 0 && (
            <button
              type="button"
              style={styles.markReadButton}
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications list */}
        {notifications.length === 0 ? (
          <p style={styles.info}>
            No notifications yet. As you use DigiPiggy, messages will appear
            here.
          </p>
        ) : (
          <div style={styles.list}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  ...styles.item,
                  backgroundColor: n.read ? "#f9fafb" : "#eef2ff",
                  borderColor: n.read ? "#e5e7eb" : "#c7d2fe",
                }}
              >
                <div style={styles.itemHeader}>
                  <div style={styles.itemTitleRow}>
                    <span style={styles.itemTitle}>{n.title}</span>
                    <span
                      style={{
                        ...styles.typeBadge,
                        ...badgeStyleForType(n.type),
                      }}
                    >
                      {n.type === "tip"
                        ? "Saving tip"
                        : n.type === "security"
                        ? "Security"
                        : "Info"}
                    </span>
                  </div>
                  <span style={styles.itemDate}>{n.date}</span>
                </div>
                <p style={styles.itemBody}>{n.body}</p>
                {!n.read && <span style={styles.unreadDot} />}
              </div>
            ))}
          </div>
        )}

        <div style={styles.footerNote}>
          For your project, you can describe this page as the central inbox for
          system messages, saving tips, and compliance alerts.
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
  prefBanner: {
    borderRadius: "12px",
    backgroundColor: "#f9fafb",
    padding: "10px 12px",
    marginBottom: "12px",
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    alignItems: "center",
  },
  prefTitle: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#111827",
  },
  prefText: {
    fontSize: "12px",
    color: "#4b5563",
  },
  prefButton: {
    borderRadius: "999px",
    border: "1px solid #d1d5db",
    padding: "5px 10px",
    fontSize: "12px",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },
  actionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  item: {
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "10px 12px",
    position: "relative",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "4px",
    gap: "6px",
  },
  itemTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  itemTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#111827",
  },
  typeBadge: {
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "999px",
    fontWeight: 600,
  },
  itemDate: {
    fontSize: "11px",
    color: "#9ca3af",
  },
  itemBody: {
    fontSize: "13px",
    color: "#4b5563",
    marginTop: "2px",
  },
  unreadDot: {
    position: "absolute",
    top: "12px",
    right: "10px",
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    backgroundColor: "#4f46e5",
  },
  info: {
    fontSize: "13px",
    color: "#6b7280",
  },
  error: {
    fontSize: "13px",
    color: "#b91c1c",
  },
  footerNote: {
    marginTop: "10px",
    fontSize: "12px",
    color: "#9ca3af",
  },
};

export default NotificationsPage;
