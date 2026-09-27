import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listInterviews } from "../api/client";

export default function Reports() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listInterviews()
      .then((data) => setInterviews(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Compute stats
  const completed = interviews.filter((i) => i.average_score !== null);
  const overallAvg = completed.length
    ? Math.round(
        (completed.reduce((sum, i) => sum + (i.average_score || 0), 0) /
          completed.length) * 10
      ) / 10
    : null;

  const bestScore = completed.length
    ? Math.max(...completed.map((i) => i.average_score || 0))
    : null;

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <h1 style={styles.logo}>AI Mock Interview</h1>
        <button style={styles.back} onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </header>

      <main style={styles.main}>
        <h2 style={styles.title}>Your Reports</h2>
        <p style={styles.sub}>
          A history of all your mock interviews and performance.
        </p>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{interviews.length}</div>
            <div style={styles.statLabel}>Total Interviews</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>
              {overallAvg ?? "—"}
            </div>
            <div style={styles.statLabel}>Average Score</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{bestScore ?? "—"}</div>
            <div style={styles.statLabel}>Best Score</div>
          </div>
        </div>

        {/* Errors / Loading */}
        {error && <p style={styles.error}>{error}</p>}
        {loading && <p style={styles.loading}>Loading interviews...</p>}

        {/* Empty state */}
        {!loading && interviews.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>You haven't taken any interviews yet.</p>
            <button
              style={styles.ctaButton}
              onClick={() => navigate("/interview/setup")}
            >
              Start Your First Interview
            </button>
          </div>
        )}

        {/* Interview list */}
        {interviews.length > 0 && (
          <div style={styles.list}>
            {interviews.map((it) => {
              const done = it.average_score !== null;
              return (
                <div
                  key={it.id}
                  style={styles.row}
                  onClick={() =>
                    navigate(
                      done
                        ? `/interview/${it.id}/report`
                        : `/interview/${it.id}`
                    )
                  }
                >
                  <div style={styles.rowMain}>
                    <div style={styles.rowRole}>{it.role}</div>
                    <div style={styles.rowMeta}>
                      {new Date(it.created_at).toLocaleString()} ·{" "}
                      {it.answers?.length || 0}/{it.questions?.length || 0}{" "}
                      answered
                    </div>
                  </div>

                  <div style={styles.rowRight}>
                    {done ? (
                      <span style={styles.scoreBadge}>
                        {it.average_score}/10
                      </span>
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
  back: {
    padding: "0.4rem 0.9rem",
    background: "#21262d",
    color: "#e6edf3",
    border: "1px solid #30363d",
    borderRadius: "6px",
    cursor: "pointer",
  },
  main: { padding: "2rem", maxWidth: "820px", margin: "0 auto" },
  title: { fontSize: "1.6rem", marginBottom: "0.25rem" },
  sub: { color: "#8b949e", marginBottom: "1.5rem" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  statCard: {
    background: "#161b22",
    padding: "1.25rem",
    borderRadius: "8px",
    border: "1px solid #30363d",
    textAlign: "center",
  },
  statValue: {
    fontSize: "2.2rem",
    fontWeight: "bold",
    color: "#79c0ff",
    lineHeight: 1,
  },
  statLabel: { color: "#8b949e", marginTop: "0.5rem", fontSize: "0.85rem" },
  error: { color: "#f85149", padding: "0.75rem", background: "#3d1418", borderRadius: "6px" },
  loading: { color: "#8b949e", padding: "1rem" },
  emptyState: {
    background: "#161b22",
    padding: "2rem",
    borderRadius: "8px",
    border: "1px solid #30363d",
    textAlign: "center",
  },
  emptyText: { color: "#8b949e", marginBottom: "1rem" },
  ctaButton: {
    padding: "0.75rem 1.5rem",
    borderRadius: "6px",
    border: "none",
    background: "#238636",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "1rem",
  },
  list: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#161b22",
    padding: "1rem 1.25rem",
    borderRadius: "8px",
    border: "1px solid #30363d",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  rowMain: { display: "flex", flexDirection: "column", gap: "0.25rem" },
  rowRole: { fontWeight: "bold" },
  rowMeta: { color: "#8b949e", fontSize: "0.85rem" },
  rowRight: { display: "flex", alignItems: "center", gap: "0.75rem" },
  scoreBadge: {
    background: "#1f6feb33",
    color: "#79c0ff",
    padding: "0.3rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.9rem",
    fontWeight: "bold",
  },
  inProgressBadge: {
    background: "#d2992233",
    color: "#d29922",
    padding: "0.3rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  arrow: { color: "#8b949e", fontSize: "1.2rem" },
};