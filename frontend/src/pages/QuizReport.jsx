import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInterview } from "../api/client";
import PageLayout from "../components/PageLayout";

export default function QuizReport() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getInterview(id).then(setQuiz).catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <PageLayout title="Quiz Report">
        <p style={{ color: "#fca5a5" }}>{error}</p>
      </PageLayout>
    );
  }
  if (!quiz) {
    return (
      <PageLayout title="Quiz Report">
        <p style={{ color: "#a5a0c2" }}>Loading...</p>
      </PageLayout>
    );
  }

  const total = quiz.questions.length;
  const correct = quiz.answers.filter((a) => a.is_correct).length;
  const wrong = quiz.answers.length - correct;
  const pct = total ? Math.round((correct / total) * 100) : 0;

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <PageLayout title="Quiz Report" subtitle={`Topic: ${quiz.topic || quiz.role}`}>
      <div style={styles.scoreCard}>
        <div style={styles.bigScore}>{pct}%</div>
        <div style={styles.scoreLabel}>
          {correct} correct out of {total}
        </div>

        <div style={styles.breakdownRow}>
          <div style={styles.breakdownItem}>
            <div style={{ ...styles.breakdownVal, color: "#6ee7b7" }}>
              {correct}
            </div>
            <div style={styles.breakdownLabel}>Correct</div>
          </div>
          <div style={styles.breakdownItem}>
            <div style={{ ...styles.breakdownVal, color: "#fca5a5" }}>
              {wrong}
            </div>
            <div style={styles.breakdownLabel}>Wrong</div>
          </div>
          <div style={styles.breakdownItem}>
            <div style={styles.breakdownVal}>{total}</div>
            <div style={styles.breakdownLabel}>Total</div>
          </div>
        </div>
      </div>

      {quiz.final_report && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📋 Overall Feedback</h3>
          <p style={styles.reportText}>{quiz.final_report}</p>
        </div>
      )}

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📝 Question Breakdown</h3>

        {quiz.answers.map((a, i) => (
          <div
            key={i}
            style={{
              ...styles.qaCard,
              borderColor: a.is_correct
                ? "rgba(16, 185, 129, 0.4)"
                : "rgba(248, 113, 113, 0.4)",
            }}
          >
            <div style={styles.qaHeader}>
              <strong style={styles.qaQuestion}>
                Q{i + 1}: {a.question}
              </strong>
              <span
                style={{
                  ...styles.badge,
                  background: a.is_correct
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(248, 113, 113, 0.15)",
                  color: a.is_correct ? "#6ee7b7" : "#fca5a5",
                }}
              >
                {a.is_correct ? "✅ Correct" : "❌ Wrong"}
              </span>
            </div>

            <div style={styles.optionsList}>
              {a.options.map((opt, j) => {
                const isCorrect = j === a.correct_index;
                const isPick = j === a.selected_index;
                return (
                  <div
                    key={j}
                    style={{
                      ...styles.optionRow,
                      background: isCorrect
                        ? "rgba(16, 185, 129, 0.1)"
                        : isPick
                        ? "rgba(248, 113, 113, 0.1)"
                        : "transparent",
                      border: isCorrect
                        ? "1px solid rgba(16, 185, 129, 0.4)"
                        : isPick
                        ? "1px solid rgba(248, 113, 113, 0.4)"
                        : "1px solid rgba(139, 92, 246, 0.1)",
                    }}
                  >
                    <span style={styles.optionLetter}>{optionLabels[j]}</span>
                    <span style={styles.optionText}>{opt}</span>
                    {isCorrect && <span>✅</span>}
                    {isPick && !isCorrect && <span>❌</span>}
                  </div>
                );
              })}
            </div>

            {a.explanation && (
              <p style={styles.explanation}>💡 {a.explanation}</p>
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

const styles = {
  scoreCard: {
    background: "rgba(30, 27, 58, 0.55)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(139, 92, 246, 0.25)",
    borderRadius: "16px",
    padding: "2rem",
    textAlign: "center",
  },
  bigScore: {
    fontSize: "4rem",
    fontWeight: 800,
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    lineHeight: 1,
  },
  scoreLabel: {
    color: "#a5a0c2",
    marginTop: "0.5rem",
    fontSize: "0.95rem",
  },
  breakdownRow: {
    display: "flex",
    justifyContent: "center",
    gap: "2rem",
    marginTop: "1.5rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid rgba(139, 92, 246, 0.15)",
    flexWrap: "wrap",
  },
  breakdownItem: { textAlign: "center" },
  breakdownVal: {
    fontSize: "1.6rem",
    fontWeight: 800,
    color: "#f5f3ff",
    lineHeight: 1,
  },
  breakdownLabel: {
    color: "#a5a0c2",
    fontSize: "0.8rem",
    marginTop: "0.35rem",
  },
  section: {
    background: "rgba(30, 27, 58, 0.55)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    borderRadius: "16px",
    padding: "1.5rem",
  },
  sectionTitle: { marginTop: 0, marginBottom: "1rem", color: "#f5f3ff" },
  reportText: { color: "#d8d4ec", lineHeight: 1.7, margin: 0 },
  qaCard: {
    background: "rgba(15, 10, 35, 0.6)",
    padding: "1.25rem",
    borderRadius: "12px",
    border: "1px solid",
    marginBottom: "1rem",
  },
  qaHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1rem",
  },
  qaQuestion: { color: "#f5f3ff", lineHeight: 1.5, flex: 1 },
  badge: {
    padding: "0.25rem 0.7rem",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  optionsList: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    padding: "0.65rem 0.9rem",
    borderRadius: "8px",
    color: "#d8d4ec",
    fontSize: "0.88rem",
  },
  optionLetter: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "rgba(139, 92, 246, 0.25)",
    color: "#c4b5fd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: 700,
    flexShrink: 0,
  },
  optionText: { flex: 1 },
  explanation: {
    color: "#c4b5fd",
    fontSize: "0.85rem",
    marginTop: "1rem",
    marginBottom: 0,
    lineHeight: 1.5,
  },
};