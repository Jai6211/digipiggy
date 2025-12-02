import { useState } from "react";
import { signup as signupApi } from "../Api";   // ✅ use shared API client

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // ✅ This automatically calls:
      // https://digipiggy.onrender.com/api/auth/signup
      await signupApi({
        full_name: fullName,
        email,
        password,
      });

      alert("Signup successful! Please login.");
      window.location.href = "/login";
    } catch (err) {
      console.error("Signup error:", err);
      setError(err?.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "40px",
      }}
    >
      <form
        onSubmit={handleSignup}
        style={{
          width: "400px",
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Create your DigiPiggy account</h2>

        <label>Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        {error && (
          <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "#4f46e5",
            color: "white",
            borderRadius: "8px",
            border: "none",
          }}
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
