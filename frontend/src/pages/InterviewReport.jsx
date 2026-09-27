import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getInterview } from "../api/client";

export default function InterviewReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getInterview(id).then(setInterview).catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return <div style={styles.wrap}><p style={styles.error}>{error}</p></div>;
  }
  if (!interview) {
    return <div style={styles.wrap}><p style={styles.loading}>Loading...</p></div>;
  }

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <h1 style={styles.logo}>AI Mock Interview</h1>
        <button style={styles.back} onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </header>

      <main style={styles.main}>
        <h2 style={styles.title}>Final Report</h2>
        <p style={styles.sub}>Role: {interview.role}</p>

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
      </main>
    </div>
  );
}

const styles = {
  wrap: { minHeight: "100vh", background: "#0d1117", color: "#e6edf3" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem", borderBottom: "1px solid #30363d" },
  logo: { margin: 0, fontSize: "1.2rem" },
  back: { padding: "0.4rem 0.9rem", background: "#21262d", color: "#e6edf3", border: "1px solid #30363d", borderRadius: "6px", cursor: "pointer" },
  main: { padding: "2rem", maxWidth: "820px", margin: "0 auto" },
  title: { fontSize: "1.6rem", marginBottom: "0.25rem" },
  sub: { color: "#8b949e", marginBottom: "1.5rem" },
  scoreCard: { background: "#161b22", padding: "2rem", borderRadius: "8px", border: "1px solid #238636", textAlign: "center", marginBottom: "1.5rem" },
  bigScore: { fontSize: "4rem", fontWeight: "bold", color: "#79c0ff", lineHeight: 1 },
  scoreLabel: { color: "#8b949e", marginTop: "0.5rem" },
  section: { background: "#161b22", padding: "1.5rem", borderRadius: "8px", border: "1px solid #30363d", marginBottom: "1.5rem" },
  sectionTitle: { marginTop: 0, marginBottom: "1rem" },
  reportText: { color: "#c9d1d9", lineHeight: 1.7 },
  qaCard: { background: "#0d1117", padding: "1rem", borderRadius: "6px", border: "1px solid #30363d", marginBottom: "0.75rem" },
  qaHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", gap: "1rem" },
  scoreBadge: { background: "#1f6feb33", color: "#79c0ff", padding: "0.25rem 0.6rem", borderRadius: "999px", fontSize: "0.85rem", whiteSpace: "nowrap" },
  answerText: { color: "#8b949e", fontSize: "0.9rem", margin: "0.5rem 0" },
  feedbackText: { color: "#c9d1d9", fontSize: "0.9rem", margin: "0.5rem 0 0 0" },
  error: { padding: "2rem", color: "#f85149" },
  loading: { padding: "2rem", color: "#8b949e" },
};