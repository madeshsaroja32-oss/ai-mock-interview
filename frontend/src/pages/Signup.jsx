import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!agree) {
      setError("Please accept the Terms of service to continue.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await signup(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        {/* ─── LEFT PANEL ─── */}
        <div style={styles.leftPanel}>
          <div style={styles.illustration}>
            <svg
              viewBox="0 0 300 400"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              style={{ position: "absolute", inset: 0 }}
            >
              <defs>
                <radialGradient id="moon" cx="50%" cy="30%" r="50%">
                  <stop offset="0%" stopColor="#c8e6ff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0b2545" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="150" cy="100" r="60" fill="url(#moon)" />
              <circle cx="150" cy="100" r="22" fill="#e6f2ff" opacity="0.95" />
              <polygon points="60,280 90,200 120,280" fill="#0b1c33" />
              <polygon points="120,300 155,190 190,300" fill="#0a1a2e" />
              <polygon points="200,290 230,210 260,290" fill="#0b1c33" />
              <path d="M0,300 Q150,270 300,300 L300,400 L0,400 Z" fill="#0d2c4d" />
              <path d="M0,320 Q150,300 300,320 L300,400 L0,400 Z" fill="#113a63" />
            </svg>

            {Array.from({ length: 25 }).map((_, i) => (
              <span
                key={i}
                style={{
                  ...styles.snowflake,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  fontSize: `${6 + Math.random() * 6}px`,
                }}
              >
                ❄
              </span>
            ))}
          </div>

          <div style={styles.leftContent}>
            <h2 style={styles.welcomeTitle}>Welcome Page</h2>
            <p style={styles.welcomeText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam
              placerat lacus nec euismod ullamcorper. Integer placerat lectus.
            </p>
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div style={styles.rightPanel}>
          <div style={styles.tabs}>
            <Link to="/login" style={styles.tabInactive}>
              Sign in
            </Link>
            <span style={styles.tabActive}>Register</span>
          </div>

          <h1 style={styles.title}>Register</h1>

          {error && <p style={styles.error}>{error}</p>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>FULL NAME</label>
            <input
              style={styles.input}
              placeholder="Enter Your Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label style={styles.label}>EMAIL</label>
            <input
              style={styles.input}
              type="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label style={styles.label}>PASSWORD</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            <label style={styles.termsRow}>
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                style={styles.checkbox}
              />
              <span style={styles.termsText}>
                I agree to the{" "}
                <a href="#" style={styles.termsLink}>
                  Terms of service
                </a>
              </span>
            </label>

            <button
              type="submit"
              style={{ ...styles.button, opacity: busy ? 0.7 : 1 }}
              disabled={busy}
            >
              {busy ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p style={styles.footer}>
            Already have an account?{" "}
            <Link to="/login" style={styles.footerLink}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    background: "radial-gradient(circle at 20% 20%, #0b2545, #04121f 70%)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "960px",
    minHeight: "560px",
    display: "flex",
    flexWrap: "wrap",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
    background: "#ffffff",
  },

  /* LEFT PANEL */
  leftPanel: {
    position: "relative",
    flex: "1 1 340px",
    minWidth: "300px",
    background:
      "linear-gradient(160deg, #0f3a63 0%, #0b2545 55%, #04121f 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    color: "white",
    overflow: "hidden",
  },
  illustration: {
    position: "absolute",
    inset: 0,
  },
  snowflake: {
    position: "absolute",
    color: "rgba(220, 240, 255, 0.7)",
    animation: "floatSnow 6s ease-in-out infinite",
    pointerEvents: "none",
  },
  leftContent: {
    position: "relative",
    padding: "2rem 2rem 3rem",
    zIndex: 1,
  },
  welcomeTitle: {
    fontSize: "1.6rem",
    margin: 0,
    marginBottom: "0.75rem",
    letterSpacing: "0.3px",
  },
  welcomeText: {
    fontSize: "0.9rem",
    lineHeight: 1.6,
    color: "rgba(220, 235, 255, 0.85)",
    margin: 0,
  },

  /* RIGHT PANEL */
  rightPanel: {
    flex: "1 1 420px",
    minWidth: "320px",
    background: "#ffffff",
    color: "#1a2233",
    padding: "2rem 2.5rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  tabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
    alignSelf: "flex-end",
    fontSize: "0.85rem",
  },
  tabInactive: {
    padding: "0.3rem 0.9rem",
    color: "#6c7789",
    textDecoration: "none",
    borderRadius: "4px",
  },
  tabActive: {
    padding: "0.3rem 0.9rem",
    background: "#2f9cf0",
    color: "white",
    borderRadius: "4px",
    fontWeight: "600",
  },
  title: {
    fontSize: "1.8rem",
    margin: 0,
    marginBottom: "1.5rem",
    color: "#1a2233",
    fontWeight: 700,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  label: {
    fontSize: "0.7rem",
    letterSpacing: "1.2px",
    color: "#8b93a4",
    fontWeight: 600,
    marginTop: "0.6rem",
  },
  input: {
    padding: "0.55rem 0",
    border: "none",
    borderBottom: "1px solid #d5dbe3",
    outline: "none",
    fontSize: "0.95rem",
    color: "#1a2233",
    background: "transparent",
    transition: "border-color 0.2s",
  },
  termsRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginTop: "1rem",
    cursor: "pointer",
    userSelect: "none",
  },
  checkbox: { accentColor: "#2f9cf0", cursor: "pointer" },
  termsText: { fontSize: "0.8rem", color: "#6c7789" },
  termsLink: {
    color: "#2f9cf0",
    textDecoration: "none",
    fontWeight: 600,
  },
  button: {
    marginTop: "1.5rem",
    padding: "0.8rem",
    borderRadius: "6px",
    border: "none",
    background: "#2f9cf0",
    color: "white",
    fontWeight: 600,
    fontSize: "0.95rem",
    cursor: "pointer",
    letterSpacing: "0.5px",
    boxShadow: "0 8px 20px rgba(47, 156, 240, 0.35)",
  },
  error: {
    color: "#c0392b",
    background: "#fdecea",
    border: "1px solid #f5b7b1",
    padding: "0.5rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.85rem",
    margin: "0 0 0.5rem",
  },
  footer: {
    fontSize: "0.85rem",
    color: "#6c7789",
    textAlign: "center",
    marginTop: "1.25rem",
    marginBottom: 0,
  },
  footerLink: {
    color: "#2f9cf0",
    textDecoration: "none",
    fontWeight: 600,
  },
};