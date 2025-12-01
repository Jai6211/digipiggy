// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

import LoginPage from "./pages/Login";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/Dashboard";
import ProfilePage from "./pages/Profile";
import TransactionsPage from "./pages/Transactions";
import GoalsPage from "./pages/Goals";
import BankLinkPage from "./pages/BankLink";
import KycPage from "./pages/Kyc";
import AnalyticsPage from "./pages/Analytics";
import SettingsPage from "./pages/Settings";
import NotificationsPage from "./pages/Notifications";
import "./App.css";

// Simple Home page (hero + buttons)
function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="dp-page">
      <section className="dp-hero">
        {/* LEFT SIDE */}
        <div className="dp-hero-left">
          <span className="dp-pill">Student Project · Fintech · DigiPiggy</span>

          <h1 className="dp-hero-title">
            Turn leftover change into <span>smart savings.</span>
          </h1>

          <p className="dp-hero-subtitle">
            DigiPiggy is your digital piggy bank. Round up small amounts, deposit
            spare change, set savings goals, and track your progress – all in one
            simple web app.
          </p>

          <div className="dp-hero-actions">
            <button
              className="dp-btn-primary"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </button>
            <button
              className="dp-btn-outline"
              onClick={() => navigate("/dashboard")}
            >
              View Dashboard
            </button>
          </div>

          <p className="dp-hero-note">
            Already have an account?{" "}
            <button
              className="dp-link-button"
              onClick={() => navigate("/login")}
            >
              Log in here
            </button>
          </p>
        </div>

        {/* RIGHT SIDE – FEATURE CARDS */}
        <div className="dp-hero-right">
          <div className="dp-feature-card">
            <div className="dp-feature-title-row">
              <span className="dp-feature-icon">🎯</span>
              <h3>Savings Goals</h3>
            </div>
            <p>
              Create small goals like <strong>“New shoes”</strong> or{" "}
              <strong>“Emergency fund”</strong> and track progress with a simple
              progress bar. Use the Dashboard to add $1 whenever you have spare
              change.
            </p>
          </div>

          <div className="dp-feature-card">
            <div className="dp-feature-title-row">
              <span className="dp-feature-icon">🏦</span>
              <h3>Bank Linking &amp; KYC</h3>
            </div>
            <p>
              Prototype screens for linking a bank and completing basic KYC.
              Great to explain how real payments and identity verification could
              be integrated in future versions.
            </p>
          </div>

          <div className="dp-feature-card">
            <div className="dp-feature-title-row">
              <span className="dp-feature-icon">📊</span>
              <h3>Analytics &amp; Notifications</h3>
            </div>
            <p>
              Simple analytics and a Notification Center concept for tips, alerts,
              and monthly summaries – perfect talking points in your project
              report.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function AppShell() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <>
      {/* CLEAN NAVBAR */}
      <div style={styles.navbar}>
        <span
          style={styles.navLogo}
          onClick={() => navigate("/")}
        >
          DigiPiggy
        </span>
        <div>
          <Link style={styles.navLink} to="/">
            Home
          </Link>

          {isLoggedIn ? (
            <>
              <Link style={styles.navLink} to="/dashboard">
                Dashboard
              </Link>
              <Link style={styles.navLink} to="/profile">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                style={styles.navButton}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link style={styles.navLink} to="/login">
                Login
              </Link>
              <Link style={styles.navLink} to="/signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* app pages still exist, just not all on navbar */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/bank" element={<BankLinkPage />} />
        <Route path="/kyc" element={<KycPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

const styles = {
  navbar: {
    height: "60px",
    backgroundColor: "#020617",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  navLogo: {
    fontWeight: 700,
    fontSize: "18px",
    cursor: "pointer",
  },
  navLink: {
    marginLeft: "16px",
    color: "#e5e7eb",
    textDecoration: "none",
    fontSize: "14px",
  },
  navButton: {
    marginLeft: "16px",
    background: "transparent",
    border: "1px solid #e5e7eb",
    borderRadius: "999px",
    padding: "4px 10px",
    color: "#e5e7eb",
    fontSize: "13px",
    cursor: "pointer",
  },
};

export default App;
