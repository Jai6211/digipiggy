import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function loadProfile() {
      try {
        const res = await axios.get("http://localhost:4000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>Loading profile…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, color: "#b91c1c" }}>{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>No user info found.</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Profile</h2>
        <p style={styles.subtitle}>
          Basic information about your DigiPiggy account.
        </p>

        <div style={styles.row}>
          <span style={styles.label}>Full Name</span>
          <span style={styles.value}>{user.full_name}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Email</span>
          <span style={styles.value}>{user.email}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Role</span>
          <span style={styles.value}>{user.role}</span>
        </div>

        <p style={styles.helpText}>
          This is just a simple profile view for the prototype. In a real app
          you could allow editing name, adding phone number, address, etc.
        </p>
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
    maxWidth: "520px",
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
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  label: {
    fontSize: "14px",
    color: "#6b7280",
  },
  value: {
    fontSize: "14px",
    fontWeight: 500,
  },
  helpText: {
    marginTop: "16px",
    fontSize: "12px",
    color: "#9ca3af",
  },
};
