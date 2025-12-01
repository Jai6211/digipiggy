// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

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
            DigiPiggy is your digital piggy bank. Round up small amounts,
            deposit spare change, set savings goals, and track your progress –
            all in one simple web app.
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
              progress bar. Use the Dashboard to add $1, $5, or $10 whenever you
              have spare change.
            </p>
            <button
              className="dp-chip"
              onClick={() => navigate("/goals")}
            >
              Open Goals
            </button>
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
            <div className="dp-chip-row">
              <button
                className="dp-chip"
                onClick={() => navigate("/banking")}
              >
                Bank Linking
              </button>
              <button
                className="dp-chip"
                onClick={() => navigate("/kyc")}
              >
                KYC
              </button>
            </div>
          </div>

          <div className="dp-feature-card">
            <div className="dp-feature-title-row">
              <span className="dp-feature-icon">📊</span>
              <h3>Analytics &amp; Notifications</h3>
            </div>
            <p>
              Simple analytics page to show monthly savings trends and a
              Notification Center concept for tips, alerts, and monthly
              summaries – perfect talking points in your project report.
            </p>
            <div className="dp-chip-row">
              <button
                className="dp-chip"
                onClick={() => navigate("/analytics")}
              >
                Analytics
              </button>
              <button
                className="dp-chip"
                onClick={() => navigate("/notifications")}
              >
                Notifications
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
