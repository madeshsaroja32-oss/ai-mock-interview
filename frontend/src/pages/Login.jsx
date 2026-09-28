import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.bg}>
      <div style={styles.overlay} />

      <div style={styles.card}>
        <div style={styles.logoCircle}>🔒</div>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Log in to continue to AI Mock Interview</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email */}
          <div style={styles.inputWrap}>
            <span style={styles.icon}>✉️</span>
            <input
              style={styles.input}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div style={styles.inputWrap}>
            <span style={styles.icon}>🔒</span>
            <input
              style={styles.input}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              style={styles.togglePassword}
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? "🙈" : "👁"}
            </span>
          </div>

          {/* Keep me logged in */}
          <div style={styles.optionsRow}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                style={styles.checkbox}
              />
              Keep Me Logged In
            </label>
            <a href="#" style={styles.link}>Forgot Password?</a>
          </div>

          <button
            type="submit"
            style={{ ...styles.button, opacity: busy ? 0.7 : 1 }}
            disabled={busy}
          >
            {busy ? "LOGGING IN..." : "LOG IN"}
          </button>
        </form>

        {/* Social logins (visual only, non-functional) */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>Or Log In Using</span>
          <span style={styles.dividerLine} />
        </div>

        <div style={styles.socialRow}>
          <button
            type="button"
            style={{ ...styles.socialBtn, background: "#1877F2" }}
            title="Facebook (coming soon)"
          >
            f
          </button>
          <button
            type="button"
            style={{ ...styles.socialBtn, background: "#1DA1F2" }}
            title="Twitter (coming soon)"
          >
            🐦
          </button>
          <button
            type="button"
            style={{ ...styles.socialBtn, background: "#DB4437" }}
            title="Google (coming soon)"
          >
            G
          </button>
        </div>

        <p style={styles.footer}>
          New User? <Link to="/signup" style={styles.link}>Register</Link>
        </p>
      </div>

      <p style={styles.copyright}>
        © 2026 AI Mock Interview · All rights reserved
      </p>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1920&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    padding: "2rem 1rem",
    fontFamily: "'Segoe UI', sans-serif",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(135deg, rgba(15,15,25,0.85), rgba(20,30,50,0.9))",
    zIndex: 0,
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "400px",
    padding: "2.5rem 2rem",
    background: "rgba(22, 27, 34, 0.85)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "14px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
    color: "#e6edf3",
  },
  logoCircle: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1f6feb, #238636)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
    fontSize: "1.8rem",
    boxShadow: "0 0 25px rgba(31, 111, 235, 0.6)",
  },
  title: {
    fontSize: "1.6rem",
    textAlign: "center",
    margin: 0,
    marginBottom: "0.25rem",
    letterSpacing: "0.5px",
  },
  subtitle: {
    textAlign: "center",
    color: "#8b949e",
    fontSize: "0.9rem",
    marginBottom: "1.5rem",
  },
  error: {
    background: "rgba(248, 81, 73, 0.15)",
    border: "1px solid rgba(248, 81, 73, 0.5)",
    color: "#f85149",
    padding: "0.6rem 0.9rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
    marginBottom: "1rem",
    textAlign: "center",
  },
  form: { display: "flex", flexDirection: "column", gap: "0.9rem" },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "rgba(13, 17, 23, 0.7)",
    border: "1px solid rgba(48, 54, 61, 0.9)",
    borderRadius: "8px",
    transition: "border 0.2s",
  },
  icon: {
    padding: "0 0.9rem",
    fontSize: "1rem",
    color: "#8b949e",
    borderRight: "1px solid rgba(48, 54, 61, 0.9)",
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: "0.85rem 0.9rem",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#e6edf3",
    fontSize: "0.95rem",
  },
  togglePassword: {
    padding: "0 0.9rem",
    cursor: "pointer",
    userSelect: "none",
    color: "#8b949e",
  },
  optionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.85rem",
    marginTop: "0.2rem",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    color: "#8b949e",
    cursor: "pointer",
  },
  checkbox: { accentColor: "#1f6feb", cursor: "pointer" },
  link: { color: "#79c0ff", textDecoration: "none" },
  button: {
    marginTop: "0.6rem",
    padding: "0.9rem",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #1f6feb, #238636)",
    color: "white",
    fontWeight: "bold",
    fontSize: "1rem",
    letterSpacing: "1px",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(31, 111, 235, 0.4)",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    margin: "1.5rem 0 1rem",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(139, 148, 158, 0.3)",
  },
  dividerText: {
    color: "#8b949e",
    fontSize: "0.8rem",
    whiteSpace: "nowrap",
  },
  socialRow: {
    display: "flex",
    justifyContent: "center",
    gap: "0.75rem",
  },
  socialBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "none",
    color: "white",
    fontSize: "1.1rem",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  },
  footer: {
    textAlign: "center",
    color: "#8b949e",
    fontSize: "0.9rem",
    marginTop: "1.5rem",
    marginBottom: 0,
  },
  copyright: {
    position: "relative",
    zIndex: 1,
    color: "rgba(230, 237, 243, 0.6)",
    fontSize: "0.75rem",
    marginTop: "1.5rem",
    textAlign: "center",
  },
};