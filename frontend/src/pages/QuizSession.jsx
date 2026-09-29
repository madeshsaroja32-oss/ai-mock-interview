import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { finishInterview, getInterview, submitQuizAnswer } from "../api/client";
import PageLayout from "../components/PageLayout";

export default function QuizSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getInterview(id)
      .then((data) => {
        setQuiz(data);
        setCurrent(data.answers.length);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  async function handleSubmit() {
    if (selected === null) return;
    setError("");
    setBusy(true);
    try {
      const data = await submitQuizAnswer(quiz.id, current, selected);
      setQuiz(data);
      setResult(data.answers[data.answers.length - 1]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleNext() {
    setResult(null);
    setSelected(null);
    const next = current + 1;
    if (next >= quiz.questions.length) {
      setBusy(true);
      try {
        const data = await finishInterview(quiz.id);
        navigate(`/quiz/${data.id}/report`);
      } catch (err) {
        setError(err.message);
      } finally {
        setBusy(false);
      }
    } else {
      setCurrent(next);
    }
  }

  if (!quiz) {
    return (
      <PageLayout title="Quiz">
        <p style={{ color: "#a5a0c2" }}>{error || "Loading..."}</p>
      </PageLayout>
    );
  }

  const total = quiz.questions.length;
  const q = quiz.questions[current];
  const isLast = current === total - 1;
  const progressPct = Math.round(((current + (result ? 1 : 0)) / total) * 100);
  const correctSoFar = quiz.answers.filter((a) => a.is_correct).length;
  const wrongSoFar = quiz.answers.length - correctSoFar;
  const optionLabels = ["A", "B", "C", "D"];

  return (
    <PageLayout>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div>
          <div style={styles.qCounter}>
            Question <span style={styles.qBig}>{current + 1}</span>{" "}
            <span style={styles.qSlash}>/ {total}</span>
          </div>
          <div style={styles.roleLabel}>Topic: {quiz.topic || quiz.role}</div>
        </div>

        <div style={styles.progressWrap}>
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${progressPct}%`,
              }}
            />
          </div>
          <div style={styles.progressLabel}>{progressPct}% complete</div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Question card */}
        <div style={styles.card}>
          <div style={styles.qBadge}>Q{current + 1}</div>
          <h2 style={styles.question}>{q.question}</h2>

          <div style={styles.options}>
            {q.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = result && i === result.correct_index;
              const isWrongPick =
                result && isSelected && i !== result.correct_index;

              let bg = "rgba(15, 10, 35, 0.6)";
              let border = "rgba(139, 92, 246, 0.2)";
              let icon = "";

              if (isSelected && !result) {
                bg = "rgba(139, 92, 246, 0.18)";
                border = "#a78bfa";
              }
              if (isCorrect) {
                bg = "rgba(16, 185, 129, 0.15)";
                border = "#10b981";
                icon = "✅";
              }
              if (isWrongPick) {
                bg = "rgba(248, 113, 113, 0.15)";
                border = "#f87171";
                icon = "❌";
              }

              return (
                <button
                  key={i}
                  style={{
                    ...styles.option,
                    background: bg,
                    borderColor: border,
                    cursor: result ? "default" : "pointer",
                  }}
                  disabled={!!result}
                  onClick={() => !result && setSelected(i)}
                >
                  <span style={styles.optionLetter}>
                    {optionLabels[i]}
                  </span>
                  <span style={styles.optionText}>{opt}</span>
                  {icon && <span style={styles.optionIcon}>{icon}</span>}
                </button>
              );
            })}
          </div>

          {result && (
            <div
              style={{
                ...styles.feedbackBox,
                borderColor: result.is_correct ? "#10b981" : "#f87171",
              }}
            >
              <div style={styles.feedbackHeader}>
                <span
                  style={{
                    ...styles.feedbackLabel,
                    color: result.is_correct ? "#6ee7b7" : "#fca5a5",
                  }}
                >
                  {result.is_correct ? "✅ Correct!" : "❌ Wrong"}
                </span>
              </div>
              {result.explanation && (
                <p style={styles.explanation}>{result.explanation}</p>
              )}
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          {!result ? (
            <button
              style={{
                ...styles.submitBtn,
                opacity: busy || selected === null ? 0.5 : 1,
                cursor: busy || selected === null ? "not-allowed" : "pointer",
              }}
              disabled={busy || selected === null}
              onClick={handleSubmit}
            >
              {busy ? "Checking..." : "Submit Answer →"}
            </button>
          ) : (
            <button
              style={styles.submitBtn}
              disabled={busy}
              onClick={handleNext}
            >
              {busy
                ? "Finishing..."
                : isLast
                ? "Finish Quiz ✨"
                : "Next Question →"}
            </button>
          )}
        </div>

        {/* Side panel */}
        <div style={styles.sidePanel}>
          <div style={styles.sideCard}>
            <div style={styles.sideTitle}>📊 Session Stats</div>
            <div style={styles.statRow}>
              <span style={styles.statKey}>Answered</span>
              <span style={styles.statVal}>
                {quiz.answers.length} / {total}
              </span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statKey}>✅ Correct</span>
              <span style={{ ...styles.statVal, color: "#6ee7b7" }}>
                {correctSoFar}
              </span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statKey}>❌ Wrong</span>
              <span style={{ ...styles.statVal, color: "#fca5a5" }}>
                {wrongSoFar}
              </span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statKey}>Progress</span>
              <span style={styles.statVal}>{progressPct}%</span>
            </div>
          </div>

          <div style={styles.sideCard}>
            <div style={styles.sideTitle}>⚡️ Quick Facts</div>
            <div style={styles.factRow}>
              <span style={styles.factIcon}>🤖</span>
              <span style={styles.factText}>AI generates 4 options per question</span>
            </div>
            <div style={styles.factRow}>
              <span style={styles.factIcon}>🎯</span>
              <span style={styles.factText}>Only 1 option is correct</span>
            </div>
            <div style={styles.factRow}>
              <span style={styles.factIcon}>⚡</span>
              <span style={styles.factText}>Instant feedback after each question</span>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

const styles = {
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  },
  qCounter: {
    color: "#c4b5fd",
    fontSize: "1rem",
    fontWeight: 600,
  },
  qBig: { color: "#f5f3ff", fontSize: "1.6rem", fontWeight: 800 },
  qSlash: { color: "#a5a0c2", fontSize: "0.95rem", fontWeight: 500 },
  roleLabel: {
    color: "#a5a0c2",
    fontSize: "0.82rem",
    marginTop: "0.2rem",
  },
  progressWrap: { flex: 1, maxWidth: "360px" },
  progressTrack: {
    height: "8px",
    background: "rgba(139, 92, 246, 0.12)",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
    borderRadius: "999px",
    transition: "width 0.4s ease",
  },
  progressLabel: {
    color: "#a5a0c2",
    fontSize: "0.72rem",
    marginTop: "0.35rem",
    textAlign: "right",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.6fr) minmax(260px, 1fr)",
    gap: "1.25rem",
    alignItems: "flex-start",
  },
  card: {
    background: "rgba(30, 27, 58, 0.55)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(139, 92, 246, 0.25)",
    borderRadius: "18px",
    padding: "2rem",
  },
  qBadge: {
    display: "inline-block",
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "white",
    padding: "0.35rem 0.85rem",
    borderRadius: "8px",
    fontSize: "0.8rem",
    fontWeight: 800,
    marginBottom: "1rem",
    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.5)",
  },
  question: {
    fontSize: "1.15rem",
    marginTop: 0,
    marginBottom: "1.5rem",
    lineHeight: 1.6,
    color: "#f5f3ff",
    fontWeight: 600,
  },
  options: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginBottom: "1.25rem",
  },
  option: {
    display: "flex",
    alignItems: "center",
    gap: "0.9rem",
    padding: "1rem 1.15rem",
    borderRadius: "12px",
    border: "1px solid",
    color: "#f5f3ff",
    fontFamily: "inherit",
    fontSize: "0.95rem",
    textAlign: "left",
    transition: "all 0.2s",
  },
  optionLetter: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "rgba(139, 92, 246, 0.25)",
    color: "#c4b5fd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.8rem",
    flexShrink: 0,
  },
  optionText: { flex: 1, lineHeight: 1.5 },
  optionIcon: { fontSize: "1.1rem", flexShrink: 0 },

  feedbackBox: {
    background: "rgba(15, 10, 35, 0.55)",
    border: "1px solid",
    borderRadius: "12px",
    padding: "1rem 1.15rem",
    marginBottom: "1.25rem",
  },
  feedbackHeader: { marginBottom: "0.4rem" },
  feedbackLabel: {
    fontSize: "0.85rem",
    fontWeight: 700,
    letterSpacing: "0.3px",
  },
  explanation: {
    color: "#d8d4ec",
    lineHeight: 1.6,
    margin: 0,
    fontSize: "0.9rem",
  },
  submitBtn: {
    marginTop: "0.5rem",
    width: "100%",
    padding: "0.95rem 1.75rem",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "0.98rem",
    boxShadow: "0 8px 22px rgba(139, 92, 246, 0.45)",
  },
  error: {
    marginTop: "1rem",
    color: "#fca5a5",
    background: "rgba(248, 113, 113, 0.1)",
    border: "1px solid rgba(248, 113, 113, 0.35)",
    padding: "0.65rem 0.9rem",
    borderRadius: "8px",
    fontSize: "0.88rem",
  },

  sidePanel: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    position: "sticky",
    top: "1.5rem",
  },
  sideCard: {
    background: "rgba(30, 27, 58, 0.55)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    borderRadius: "14px",
    padding: "1.25rem",
  },
  sideTitle: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#f5f3ff",
    marginBottom: "1rem",
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 0",
    borderBottom: "1px solid rgba(139, 92, 246, 0.1)",
  },
  statKey: { color: "#a5a0c2", fontSize: "0.85rem" },
  statVal: { color: "#f5f3ff", fontWeight: 700, fontSize: "0.9rem" },
  factRow: {
    display: "flex",
    gap: "0.6rem",
    alignItems: "flex-start",
    marginBottom: "0.75rem",
  },
  factIcon: { fontSize: "1rem", flexShrink: 0 },
  factText: { color: "#d8d4ec", fontSize: "0.82rem", lineHeight: 1.5 },
};