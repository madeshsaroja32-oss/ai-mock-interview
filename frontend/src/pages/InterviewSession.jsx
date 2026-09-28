import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { finishInterview, getInterview, submitAnswer } from "../api/client";
import PageLayout from "../components/PageLayout";

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getInterview(id)
      .then((data) => {
        setInterview(data);
        setCurrent(data.answers.length);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  async function handleSubmit() {
    if (!answer.trim()) return;
    setError("");
    setBusy(true);
    try {
      const data = await submitAnswer(
        interview.id,
        interview.questions[current],
        answer
      );
      setInterview(data);
      setFeedback(data.answers[data.answers.length - 1]);
      setAnswer("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleNext() {
    setFeedback(null);
    const next = current + 1;
    if (next >= interview.questions.length) {
      setBusy(true);
      try {
        const data = await finishInterview(interview.id);
        navigate(`/interview/${data.id}/report`);
      } catch (err) {
        setError(err.message);
      } finally {
        setBusy(false);
      }
    } else {
      setCurrent(next);
    }
  }

  if (!interview) {
    return (
      <PageLayout title="Interview">
        <p style={styles.muted}>{error || "Loading..."}</p>
      </PageLayout>
    );
  }

  const total = interview.questions.length;
  const done = interview.answers.length;
  const isLast = current === total - 1;
  const progressPct = Math.round((done / total) * 100);

  return (
    <PageLayout>
      {/* Custom top bar */}
      <div style={styles.topBar}>
        <div>
          <div style={styles.qCounter}>
            Question <span style={styles.qBig}>{current + 1}</span> / {total}
          </div>
          <div style={styles.roleLabel}>Role: {interview.role}</div>
        </div>
        <div style={styles.pillProgress}>
          <div
            style={{
              ...styles.pillFill,
              width: `${progressPct}%`,
            }}
          />
          <span style={styles.pillText}>{progressPct}%</span>
        </div>
      </div>

      {/* Main card */}
      <div style={styles.card}>
        <div style={styles.questionNumber}>
          <span style={styles.qMark}>Q{current + 1}</span>
        </div>

        <h2 style={styles.question}>{interview.questions[current]}</h2>

        {!feedback ? (
          <>
            <textarea
              style={styles.textarea}
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={8}
            />
            {error && <p style={styles.error}>{error}</p>}
            <div style={styles.footerRow}>
              <span style={styles.hint}>
                Take your time. AI will score your answer.
              </span>
              <button
                style={{
                  ...styles.button,
                  opacity: busy || !answer.trim() ? 0.5 : 1,
                  cursor: busy || !answer.trim() ? "not-allowed" : "pointer",
                }}
                disabled={busy || !answer.trim()}
                onClick={handleSubmit}
              >
                {busy ? "Evaluating..." : "Submit Answer →"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={styles.feedbackBox}>
              <div style={styles.feedbackHeader}>
                <span style={styles.feedbackLabel}>AI SCORE</span>
                <div style={styles.scoreWrap}>
                  <span style={styles.scoreBig}>{feedback.score}</span>
                  <span style={styles.scoreMax}>/10</span>
                </div>
              </div>

              <p style={styles.feedbackText}>{feedback.feedback}</p>

              <div style={styles.twoCol}>
                {feedback.strengths?.length > 0 && (
                  <div style={styles.listBox}>
                    <div style={styles.listTitle}>✅ Strengths</div>
                    <ul style={styles.list}>
                      {feedback.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {feedback.improvements?.length > 0 && (
                  <div style={styles.listBox}>
                    <div style={styles.listTitle}>💡 Improvements</div>
                    <ul style={styles.list}>
                      {feedback.improvements.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <button
              style={{
                ...styles.button,
                width: "100%",
                marginTop: "1.25rem",
              }}
              disabled={busy}
              onClick={handleNext}
            >
              {busy
                ? "Finishing..."
                : isLast
                ? "Finish Interview ✨"
                : "Next Question →"}
            </button>
          </>
        )}
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
    gap: "1rem",
    marginBottom: "0.5rem",
  },
  qCounter: {
    color: "#c4b5fd",
    fontSize: "1rem",
    fontWeight: 600,
    letterSpacing: "0.3px",
  },
  qBig: {
    color: "#f5f3ff",
    fontSize: "1.5rem",
    fontWeight: 800,
  },
  roleLabel: {
    color: "#a5a0c2",
    fontSize: "0.82rem",
    marginTop: "0.2rem",
  },
  pillProgress: {
    position: "relative",
    width: "200px",
    height: "30px",
    background: "rgba(139, 92, 246, 0.15)",
    borderRadius: "999px",
    overflow: "hidden",
    border: "1px solid rgba(139, 92, 246, 0.25)",
  },
  pillFill: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
    borderRadius: "999px",
    transition: "width 0.4s ease",
  },
  pillText: {
    position: "relative",
    display: "block",
    textAlign: "center",
    lineHeight: "30px",
    color: "white",
    fontWeight: 700,
    fontSize: "0.8rem",
    zIndex: 1,
  },

  card: {
    background: "rgba(30, 27, 58, 0.55)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(139, 92, 246, 0.25)",
    borderRadius: "18px",
    padding: "2rem",
    maxWidth: "780px",
    marginTop: "1.5rem",
  },
  questionNumber: {
    display: "inline-block",
    marginBottom: "0.75rem",
  },
  qMark: {
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "white",
    padding: "0.3rem 0.75rem",
    borderRadius: "8px",
    fontSize: "0.8rem",
    fontWeight: 800,
    letterSpacing: "0.5px",
    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.5)",
  },
  question: {
    fontSize: "1.25rem",
    marginTop: "0.5rem",
    marginBottom: "1.5rem",
    lineHeight: 1.55,
    color: "#f5f3ff",
    fontWeight: 600,
  },
  textarea: {
    width: "100%",
    padding: "1rem",
    borderRadius: "12px",
    border: "1px solid rgba(139, 92, 246, 0.25)",
    background: "rgba(15, 10, 35, 0.6)",
    color: "#f5f3ff",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
    lineHeight: 1.6,
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  button: {
    padding: "0.85rem 1.6rem",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "0.95rem",
    letterSpacing: "0.3px",
    boxShadow: "0 8px 22px rgba(139, 92, 246, 0.45)",
    transition: "opacity 0.2s",
  },
  footerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
    marginTop: "1.25rem",
  },
  hint: {
    color: "#a5a0c2",
    fontSize: "0.82rem",
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

  /* Feedback */
  feedbackBox: {
    background: "rgba(15, 10, 35, 0.55)",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    borderRadius: "14px",
    padding: "1.5rem",
  },
  feedbackHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid rgba(139, 92, 246, 0.15)",
  },
  feedbackLabel: {
    color: "#c4b5fd",
    fontSize: "0.72rem",
    letterSpacing: "1.5px",
    fontWeight: 700,
  },
  scoreWrap: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.15rem",
  },
  scoreBig: {
    fontSize: "2.4rem",
    fontWeight: 800,
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    lineHeight: 1,
  },
  scoreMax: {
    color: "#a5a0c2",
    fontSize: "1rem",
    fontWeight: 600,
  },
  feedbackText: {
    color: "#d8d4ec",
    lineHeight: 1.65,
    margin: "0 0 1rem",
    fontSize: "0.92rem",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
  },
  listBox: {
    background: "rgba(139, 92, 246, 0.08)",
    border: "1px solid rgba(139, 92, 246, 0.15)",
    borderRadius: "10px",
    padding: "0.9rem 1rem",
  },
  listTitle: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#f5f3ff",
    marginBottom: "0.5rem",
  },
  list: {
    color: "#d8d4ec",
    paddingLeft: "1.1rem",
    margin: 0,
    lineHeight: 1.55,
    fontSize: "0.85rem",
  },
  muted: { color: "#a5a0c2" },
};