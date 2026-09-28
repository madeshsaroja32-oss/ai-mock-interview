import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLayout from "../components/PageLayout";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      icon: "📄",
      title: "Upload Resume",
      subtitle: "Click to upload",
      path: "/upload-resume",
      accent: "#1f6feb",
    },
    {
      icon: "🎤",
      title: "Mock Interview",
      subtitle: "Click to start",
      path: "/interview/setup",
      accent: "#238636",
    },
    {
      icon: "📊",
      title: "Reports",
      subtitle: "View your history",
      path: "/reports",
      accent: "#8957e5",
    },
  ];

  return (
    <PageLayout>
      <div>
        <h2 style={styles.welcome}>Welcome, {user?.name} 👋</h2>
        <p style={styles.sub}>
          This is your dashboard. Pick an action to get started.
        </p>
      </div>

      <div style={styles.stack}>
        {cards.map((card) => (
          <button
            key={card.path}
            style={styles.card}
            onClick={() => navigate(card.path)}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = card.accent;
              e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#30363d";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <span style={styles.cardIcon}>{card.icon}</span>
            <div style={styles.cardText}>
              <div style={styles.cardTitle}>{card.title}</div>
              <div style={styles.cardSubtitle}>{card.subtitle}</div>
            </div>
            <span style={{ ...styles.cardArrow, color: card.accent }}>→</span>
          </button>
        ))}
      </div>
    </PageLayout>
  );
}

const styles = {
  welcome: {
    fontSize: "1.7rem",
    margin: 0,
    marginBottom: "0.25rem",
    fontWeight: 700,
  },
  sub: {
    color: "#8b949e",
    margin: 0,
    marginBottom: "2rem",
    fontSize: "0.95rem",
  },
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
    maxWidth: "560px",
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1.15rem 1.25rem",
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "10px",
    cursor: "pointer",
    color: "#e6edf3",
    textAlign: "left",
    fontFamily: "inherit",
    fontSize: "1rem",
    transition: "border-color 0.2s, transform 0.2s",
  },
  cardIcon: {
    fontSize: "1.6rem",
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0d1117",
    borderRadius: "8px",
    border: "1px solid #30363d",
    flexShrink: 0,
  },
  cardText: { flex: 1, display: "flex", flexDirection: "column", gap: "0.15rem" },
  cardTitle: { fontWeight: 600, fontSize: "1rem" },
  cardSubtitle: { color: "#8b949e", fontSize: "0.85rem" },
  cardArrow: { fontSize: "1.2rem", opacity: 0.8 },
};