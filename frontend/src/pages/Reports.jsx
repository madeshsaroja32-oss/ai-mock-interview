import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listInterviews } from "../api/client";
import PageLayout from "../components/PageLayout";

export default function Reports() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listInterviews()
      .then(setInterviews)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const completed = interviews.filter((i) => i.average_score !== null);
  const overallAvg = completed.length
    ? Math.round(
        (completed.reduce((s, i) => s + (i.average_score || 0), 0) /
          completed.length) * 10
      ) / 10
    : 0;
  const bestScore = completed.length
    ? Math.max(...completed.map((i) => i.average_score || 0))
    : 0;

  const stats = [
    {
      label: "Total Interviews",
      value: interviews.length,
      accent: "#8b5cf6",
      icon: "🎤",
    },
    {
      label: "Average Score",
      value: overallAvg || "—",
      accent: "#22d3ee",
      icon: "⭐",
    },
    {
      label: "Best Score",
      value: bestScore || "—",
      accent: "#ec4899",
      icon: "🏆",
    },
    {
      label: "Completed",
      value: completed.length,
      accent: "#10b981",
      icon: "✅",
    },
  ];

  return (
    <PageLayout
      title="Your Reports"
      subtitle="A history of all your mock interviews and performance."
    >
      <div style={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: `${s.accent}22`,
                border: `1px solid ${s.accent}55`,
              }}
            >
              {s.icon}
            </div>
            <div style={{ ...styles.statValue, color: s.accent }}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {loading && <p style={styles.muted}>Loading interviews...</p>}

      {!loading && interviews.length === 0 && (
        <div style={styles.emptyState}>
          <p style={styles.muted}>You haven't taken any interviews yet.</p>
          <button
            style={styles.ctaButton}
            onClick={() => navigate("/interview/setup")}
          >
            Start Your First Interview
          </button>
        </div>
      )}

      {interviews.length > 0 && (
        <div style={styles.list}>
          {interviews.map((it) => {
            const done = it.average_score !== null;
            const pct = done ? it.average_score * 10 : 0;
            return (
              <div
                key={it.id}
                style={styles.row}
                onClick={() =>
                  navigate(done ? `/interview/${it.id}/report` : `/interview/${it.id}`)
                }
              >
                <div style={styles.rowMain}>
                  <div style={styles.rowRole}>{it.role}</div>
                  <div style={styles.rowMeta}>
                    {new Date(it.created_at).toLocaleString()} ·{" "}
                    {it.answers?.length || 0}/{it.questions?.length || 0} answered
                  </div>
                  <div style={styles.barWrap}>
                    <div
                      style={{
                        ...styles.bar,
                        width: `${pct}%`,
                        background: done
                          ? "linear-gradient(90deg, #8b5cf6, #ec4899)"
                          : "#6b7280",
                      }}
                    />
                  </div>
                </div>
                <div style={styles.rowRight}>
                  {done ? (
                    <span style={styles.scoreBadge}>{it.average_score}/10</span>
                  ) : (
                    <span style={styles.inProgressBadge}>In Progress</span>
                  )}
                  <span style={styles.arrow}>→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}

const styles = {
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
  },
  statCard: {
    background: "rgba(30, 27, 58, 0.55)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    borderRadius: "14px",
    padding: "1.25rem",
    textAlign: "center",
  },
  statIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.05rem",
    marginBottom: "0.75rem",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: 800,
    lineHeight: 1,
    marginBottom: "0.35rem",
  },
  statLabel: { color: "#a5a0c2", fontSize: "0.85rem" },

  list: { display: "flex", flexDirection: "column", gap: "0.85rem" },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    background: "rgba(30, 27, 58, 0.55)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    borderRadius: "14px",
    padding: "1.15rem 1.25rem",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  rowMain: { flex: 1, minWidth: 0 },
  rowRole: { fontWeight: 600, color: "#f5f3ff" },
  rowMeta: {
    color: "#a5a0c2",
    fontSize: "0.82rem",
    marginTop: "0.25rem",
  },
  barWrap: {
    marginTop: "0.65rem",
    height: "6px",
    background: "rgba(139, 92, 246, 0.12)",
    borderRadius: "999px",
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: "999px",
    transition: "width 0.3s",
  },
  rowRight: { display: "flex", alignItems: "center", gap: "0.75rem" },
  scoreBadge: {
    background: "rgba(139, 92, 246, 0.2)",
    color: "#c4b5fd",
    padding: "0.3rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  inProgressBadge: {
    background: "rgba(217, 153, 34, 0.2)",
    color: "#fbbf24",
    padding: "0.3rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: 600,
  },
  arrow: { color: "#a5a0c2", fontSize: "1.2rem" },

  error: {
    color: "#f87171",
    padding: "0.75rem",
    background: "rgba(248, 113, 113, 0.1)",
    borderRadius: "8px",
  },
  muted: { color: "#a5a0c2" },
  emptyState: {
    background: "rgba(30, 27, 58, 0.55)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    borderRadius: "14px",
    padding: "2rem",
    textAlign: "center",
  },
  ctaButton: {
    marginTop: "0.75rem",
    padding: "0.75rem 1.5rem",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(139, 92, 246, 0.5)",
  },
};