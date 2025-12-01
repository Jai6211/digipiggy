// src/pages/Kyc.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../Api";

function KycPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    address: "",
    country: "",
    idType: "passport",
    idLast4: "",
  });

  const [status, setStatus] = useState("not_started"); // not_started | pending | verified | rejected
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);

  // Load user + KYC data from localStorage
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

        const stored = localStorage.getItem(`digipiggy_kyc_${u.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setForm(parsed.form || form);
          setStatus(parsed.status || "not_started");
          setNotes(parsed.notes || "");
        }
      } catch (err) {
        setError(err.message || "Failed to load user");
      } finally {
        setLoadingUser(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Save to localStorage whenever form/status/notes change
  useEffect(() => {
    if (user) {
      const data = { form, status, notes };
      localStorage.setItem(`digipiggy_kyc_${user.id}`, JSON.stringify(data));
    }
  }, [user, form, status, notes]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!form.dob) {
      setError("Date of birth is required");
      return;
    }
    if (!form.address.trim()) {
      setError("Address is required");
      return;
    }
    if (!form.country.trim()) {
      setError("Country is required");
      return;
    }
    if (!/^\d{4}$/.test(form.idLast4)) {
      setError("ID last 4 digits must be exactly 4 numbers");
      return;
    }

    // For now, just mark as pending
    setStatus("pending");
    setNotes(
      "Submitted for review. In a real system, compliance team or automated checks would verify your identity."
    );
  }

  function getStatusLabel() {
    switch (status) {
      case "pending":
        return "Pending verification";
      case "verified":
        return "Verified";
      case "rejected":
        return "Rejected";
      default:
        return "Not started";
    }
  }

  function getStatusStyle() {
    switch (status) {
      case "verified":
        return { backgroundColor: "#d1fae5", color: "#065f46" };
      case "pending":
        return { backgroundColor: "#fef3c7", color: "#92400e" };
      case "rejected":
        return { backgroundColor: "#fee2e2", color: "#b91c1c" };
      default:
        return { backgroundColor: "#e5e7eb", color: "#374151" };
    }
  }

  if (loadingUser) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.info}>Loading KYC information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>KYC Verification</h2>
          <p style={styles.error}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>KYC Verification</h2>
        <p style={styles.subtitle}>
          Provide your identity details so DigiPiggy can comply with KYC/AML
          regulations. This page is a prototype UI for your project.
        </p>

        {/* Status badge */}
        <div style={styles.statusRow}>
          <span style={styles.statusLabel}>Current status:</span>
          <span style={{ ...styles.statusBadge, ...getStatusStyle() }}>
            {getStatusLabel()}
          </span>
        </div>

        {notes && <p style={styles.smallInfo}>{notes}</p>}

        {/* Form */}
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.formRow}>
            <div style={styles.field}>
              <label style={styles.label}>Full legal name</label>
              <input
                type="text"
                name="fullName"
                style={styles.input}
                placeholder="As shown on passport or ID"
                value={form.fullName}
                onChange={handleChange}
              />
            </div>

            <div style={styles.fieldSmall}>
              <label style={styles.label}>Date of birth</label>
              <input
                type="date"
                name="dob"
                style={styles.input}
                value={form.dob}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.field}>
              <label style={styles.label}>Address</label>
              <input
                type="text"
                name="address"
                style={styles.input}
                placeholder="Street, city, state, ZIP"
                value={form.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.fieldSmall}>
              <label style={styles.label}>Country</label>
              <input
                type="text"
                name="country"
                style={styles.input}
                placeholder="Ex: United States"
                value={form.country}
                onChange={handleChange}
              />
            </div>

            <div style={styles.fieldSmall}>
              <label style={styles.label}>ID type</label>
              <select
                name="idType"
                style={styles.select}
                value={form.idType}
                onChange={handleChange}
              >
                <option value="passport">Passport</option>
                <option value="driver_license">Driver&apos;s license</option>
                <option value="national_id">National ID</option>
              </select>
            </div>

            <div style={styles.fieldSmall}>
              <label style={styles.label}>ID last 4 digits</label>
              <input
                type="text"
                name="idLast4"
                style={styles.input}
                placeholder="1234"
                maxLength={4}
                value={form.idLast4}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "idLast4",
                      value: e.target.value.replace(/\D/g, ""),
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Fake upload (UI only) */}
          <div style={styles.formRow}>
            <div style={styles.field}>
              <label style={styles.label}>Upload ID document (demo only)</label>
              <input
                type="file"
                style={styles.input}
                onChange={() => {
                  // Just for UI. In real app, we'd upload to backend/cloud.
                }}
              />
              <p style={styles.smallInfo}>
                This upload is not sent anywhere in this prototype – it just
                shows how the UI would look.
              </p>
            </div>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.submitButton}>
            Submit for verification
          </button>
        </form>

        <div style={styles.footerNote}>
          For your project report, you can explain how this page would connect
          to a real KYC provider (e.g., Onfido, Jumio, or manual review portal)
          in production.
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
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
  },
  statusLabel: {
    fontSize: "13px",
    color: "#4b5563",
  },
  statusBadge: {
    fontSize: "12px",
    padding: "3px 10px",
    borderRadius: "999px",
    fontWeight: 600,
  },
  form: {
    marginTop: "8px",
  },
  formRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "10px",
  },
  field: {
    flex: 1,
    minWidth: "220px",
  },
  fieldSmall: {
    minWidth: "160px",
    flex: 1,
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
  select: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    backgroundColor: "#ffffff",
  },
  submitButton: {
    marginTop: "10px",
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
  footerNote: {
    marginTop: "10px",
    fontSize: "12px",
    color: "#9ca3af",
  },
};

export default KycPage;
