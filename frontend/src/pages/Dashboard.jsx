import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <h1 style={styles.logo}>AI Mock Interview</h1>
        <div>
          <span style={styles.user}>{user?.name}</span>
          <button style={styles.logout} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <h2 style={styles.welcome}>Welcome, {user?.name} 👋</h2>
        <p style={styles.sub}>
          This is your dashboard. Next up: resume upload, AI interview, and reports.
        </p>

        <div style={styles.grid}>
          <div
            style={{ ...styles.card, cursor: "pointer" }}
            onClick={() => navigate("/upload-resume")}
          >
            <h3 style={styles.cardTitle}>📄 Upload Resume</h3>
            <p style={styles.cardText}>Click to upload</p>
          </div>

          <div
            style={{ ...styles.card, cursor: "pointer" }}
            onClick={() => navigate("/interview/setup")}
          >
            <h3 style={styles.cardTitle}>🎤 Mock Interview</h3>
            <p style={styles.cardText}>Click to start</p>
          </div>

          <div
            style={{ ...styles.card, cursor: "pointer" }}
            onClick={() => navigate("/reports")}
          >
            <h3 style={styles.cardTitle}>📊 Reports</h3>
            <p style={styles.cardText}>View your history</p>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  wrap: { minHeight: "100vh", background: "#0d1117", color: "#e6edf3" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    borderBottom: "1px solid #30363d",
  },
  logo: { margin: 0, fontSize: "1.2rem" },
  user: { marginRight: "1rem", color: "#8b949e" },
  logout: {
    padding: "0.4rem 0.9rem",
    background: "#21262d",
    color: "#e6edf3",
    border: "1px solid #30363d",
    borderRadius: "6px",
    cursor: "pointer",
  },
  main: { padding: "2rem" },
  welcome: { fontSize: "1.6rem", marginBottom: "0.25rem" },
  sub: { color: "#8b949e", marginBottom: "2rem" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
  },
  card: {
    background: "#161b22",
    padding: "1.5rem",
    borderRadius: "8px",
    border: "1px solid #30363d",
  },
  cardTitle: { margin: 0, marginBottom: "0.5rem" },
  cardText: { color: "#8b949e", margin: 0 },
};