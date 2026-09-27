import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
    <div style={styles.wrap}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Log In</h1>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button style={styles.button} disabled={busy}>{busy ? "Logging in..." : "Log In"}</button>
        <p style={styles.footer}>No account? <Link to="/signup">Sign up</Link></p>
      </form>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0d1117" },
  card: { background: "#161b22", padding: "2rem", borderRadius: "8px", width: "360px", display: "flex", flexDirection: "column", gap: "0.75rem", border: "1px solid #30363d" },
  title: { color: "#e6edf3", margin: 0, marginBottom: "0.5rem", fontSize: "1.5rem", textAlign: "center" },
  input: { padding: "0.7rem", borderRadius: "6px", border: "1px solid #30363d", background: "#0d1117", color: "#e6edf3", fontSize: "0.95rem" },
  button: { padding: "0.75rem", borderRadius: "6px", border: "none", background: "#1f6feb", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "1rem" },
  error: { color: "#f85149", background: "#3d1418", padding: "0.5rem", borderRadius: "6px", margin: 0, fontSize: "0.9rem" },
  footer: { color: "#8b949e", fontSize: "0.9rem", textAlign: "center", margin: 0, marginTop: "0.5rem" },
};