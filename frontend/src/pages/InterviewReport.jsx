import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInterview } from "../api/client";
import PageLayout from "../components/PageLayout";

export default function InterviewReport() {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getInterview(id).then(setInterview).catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <PageLayout title="Report">
        <p style={{ color: "#f85149" }}>{error}</p>
      </PageLayout>
    );
  }
  if (!interview) {
    return (
      <PageLayout title="Report">
        <p style={{ color: "#8b949e" }}>Loading...</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Final Report" subtitle={`Role: ${interview.role}`}>
      <div style={styles.scoreCard}>
        <div style={styles.bigScore}>{interview.average_score ?? "—"}</div>
        <div style={styles.scoreLabel}>Average Score (out of 10)</div>
      </div>

      {interview.final_report && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📋 Overall Feedback</h3>
          <p style={styles.reportText}>{interview.final_report}</p>
        </div>
      )}

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📝 Question Breakdown</h3>
        {interview.answers.map((a, i) => (
          <div key={i} style={styles.qaCard}>
            <div style={styles.qaHeader}>
              <strong>Q{i + 1}: {a.question}</strong>
              <span style={styles.scoreBadge}>{a.score}/10</span>
            </div>
            <p style={styles.answerText}><strong>Your answer:</strong> {a.answer}</p>
            <p style={styles.feedbackText}><strong>Feedback:</strong> {a.feedback}</p>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

const styles = {
  scoreCard: { background: "#161b22", padding: "2rem", borderRadius: "10px", border: "1px solid #238636", textAlign: "center" },
  bigScore: { fontSize: "4rem", fontWeight: 800, color: "#79c0ff", lineHeight: 1 },
  scoreLabel: { color: "#8b949e", marginTop: "0.5rem" },
  section: { background: "#161b22", padding: "1.5rem", borderRadius: "10px", border: "1px solid #30363d" },
  sectionTitle: { marginTop: 0, marginBottom: "1rem" },
  reportText: { color: "#c9d1d9", lineHeight: 1.7, margin: 0 },
  qaCard: { background: "#0d1117", padding: "1rem", borderRadius: "8px", border: "1px solid #30363d", marginBottom: "0.75rem" },
  qaHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", gap: "1rem" },
  scoreBadge: { background: "#1f6feb33", color: "#79c0ff", padding: "0.25rem 0.6rem", borderRadius: "999px", fontSize: "0.85rem", whiteSpace: "nowrap" },
  answerText: { color: "#8b949e", fontSize: "0.9rem", margin: "0.5rem 0" },
  feedbackText: { color: "#c9d1d9", fontSize: "0.9rem", margin: "0.5rem 0 0" },
};