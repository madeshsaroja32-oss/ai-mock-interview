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
    : null;
  const bestScore = completed.length
    ? Math.max(...completed.map((i) => i.average_score || 0))
    : null;

  return (
    <PageLayout
      title="Your Reports"
      subtitle="A history of all your mock interviews and performance."
    >
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{interviews.length}</div>
          <div style={styles.statLabel}>Total Interviews</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{overallAvg ?? "—"}</div>
          <div style={styles.statLabel}>Average Score</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{bestScore ?? "—"}</div>
          <div style={styles.statLabel}>Best Score</div>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {loading && <p style={styles.loading}>Loading interviews...</p>}

      {!loading && interviews.length === 0 && (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>You haven't taken any interviews yet.</p>
          <button style={styles.ctaButton} onClick={() => navigate("/interview/setup")}>
            Start Your First Interview
          </button>
        </div>
      )}

      {interviews.length > 0 && (
        <div style={styles.list}>
          {interviews.map((it) => {
            const done = it.average_score !== null;
            return (
              <div
                key={it.id}
                style={styles.row}
                onClick={() =>
                  navigate(done ? `/interview/${it.id}/report` : `/interview/${it.id}`)
                }
              >
                <div>
                  <div style={styles.rowRole}>{it.role}</div>
                  <div style={styles.rowMeta}>
                    {new Date(it.created_at).toLocaleString()} ·{" "}
                    {it.answers?.length || 0}/{it.questions?.length || 0} answered
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
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" },
  statCard: { background: "#161b22", padding: "1.5rem", borderRadius: "10px", border: "1px solid #30363d", textAlign: "center" },
  statValue: { fontSize: "2rem", fontWeight: 700, color: "#79c0ff", lineHeight: 1 },
  statLabel: { color: "#8b949e", marginTop: "0.5rem", fontSize: "0.85rem" },
  list: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#161b22", padding: "1rem 1.25rem", borderRadius: "10px", border: "1px solid #30363d", cursor: "pointer" },
  rowRole: { fontWeight: 600 },
  rowMeta: { color: "#8b949e", fontSize: "0.85rem", marginTop: "0.2rem" },
  rowRight: { display: "flex", alignItems: "center", gap: "0.75rem" },
  scoreBadge: { background: "#1f6feb33", color: "#79c0ff", padding: "0.3rem 0.75rem", borderRadius: "999px", fontSize: "0.9rem", fontWeight: 600 },
  inProgressBadge: { background: "#d2992233", color: "#d29922", padding: "0.3rem 0.75rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600 },
  arrow: { color: "#8b949e", fontSize: "1.2rem" },
  error: { color: "#f85149", padding: "0.75rem", background: "#3d1418", borderRadius: "8px" },
  loading: { color: "#8b949e" },
  emptyState: { background: "#161b22", padding: "2rem", borderRadius: "10px", border: "1px solid #30363d", textAlign: "center" },
  emptyText: { color: "#8b949e", marginBottom: "1rem" },
  ctaButton: { padding: "0.75rem 1.5rem", borderRadius: "8px", border: "none", background: "#238636", color: "white", fontWeight: 600, cursor: "pointer" },
};