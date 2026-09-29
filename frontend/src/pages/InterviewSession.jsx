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
  const [skipping, setSkipping] = useState(false);
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

  async function handleSkip() {
    if (!window.confirm("Skip this question? It will be marked as skipped.")) {
      return;
    }
    setError("");
    setSkipping(true);
    try {
      const data = await submitAnswer(
        interview.id,
        interview.questions[current],
        "[SKIPPED]"
      );
      setInterview(data);
      setFeedback(data.answers[data.answers.length - 1]);
      setAnswer("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSkipping(false);
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
        <p style={{ color: "#a5a0c2" }}>{error || "Loading..."}</p>
      </PageLayout>
    );
  }

  const total = interview.questions.length;
  const done = interview.answers.length;
  const isLast = current === total - 1;
  const progressPct = Math.round(((current + (feedback ? 1 : 0)) / total) * 100);

  const scores = interview.answers.map((a) => a.score).filter((s) => s != null);
  const avgSoFar = scores.length
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : null;

  const isLastAnswerSkipped = feedback?.answer === "[SKIPPED]";

  return (
    <PageLayout>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div>
          <div style={styles.qCounter}>
            Question <span style={styles.qBig}>{current + 1}</span>{" "}
            <span style={styles.qSlash}>/ {total}</span>
          </div>
          <div style={styles.roleLabel}>Role: {interview.role}</div>
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

      {/* Two-column layout */}
      <div style={styles.grid}>
        {/* Main card */}
        <div style={styles.card}>
          <div style={styles.qBadge}>Q{current + 1}</div>

          <h2 style={styles.question}>{interview.questions[current]}</h2>

          {!feedback ? (
            <>
              <textarea
                style={styles.textarea}
                placeholder="Type your answer here... Be specific, use examples, and structure your thoughts."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={10}
              />

              <div style={styles.textareaFooter}>
                <span style={styles.hint}>
                  💡 Tip: aim for 3-5 sentences. AI scores on clarity, depth, and relevance.
                </span>
                <span style={styles.charCount}>{answer.length} chars</span>
              </div>

              {error && <div style={styles.error}>{error}</div>}

              <div style={styles.actionRow}>
                <button
                  style={styles.skipBtn}
                  onClick={handleSkip}
                  disabled={busy || skipping}
                  title="Skip this question"
                >
                  {skipping ? "Skipping..." : "⏭ Skip"}
                </button>

                <button
                  style={{
                    ...styles.submitBtn,
                    opacity: busy || skipping || !answer.trim() ? 0.5 : 1,
                    cursor:
                      busy || skipping || !answer.trim()
                        ? "not-allowed"
                        : "pointer",
                  }}
                  disabled={busy || skipping || !answer.trim()}
                  onClick={handleSubmit}
                >
                  {busy ? "🤖 AI is evaluating..." : "Submit Answer →"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  ...styles.feedbackCard,
                  borderColor: isLastAnswerSkipped
                    ? "rgba(217, 153, 34, 0.4)"
                    : "rgba(139, 92, 246, 0.2)",
                }}
              >
                <div style={styles.feedbackHeader}>
                  <span
                    style={{
                      ...styles.feedbackLabel,
                      color: isLastAnswerSkipped ? "#fbbf24" : "#c4b5fd",
                    }}
                  >
                    {isLastAnswerSkipped ? "⏭ SKIPPED" : "AI EVALUATION"}
                  </span>
                  {!isLastAnswerSkipped && (
                    <div style={styles.scoreWrap}>
                      <span style={styles.scoreBig}>{feedback.score}</span>
                      <span style={styles.scoreMax}>/10</span>
                    </div>
                  )}
                </div>

                <p style={styles.feedbackText}>
                  {isLastAnswerSkipped
                    ? "You skipped this question. Skipped questions count as 0."
                    : feedback.feedback}
                </p>

                {!isLastAnswerSkipped && (
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
                )}
              </div>

              <button
                style={{
                  ...styles.submitBtn,
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

        {/* Side panel */}
        <div style={styles.sidePanel}>
          <div style={styles.sideCard}>
            <div style={styles.sideTitle}>📊 Session Stats</div>
            <div style={styles.statRow}>
              <span style={styles.statKey}>Answered</span>
              <span style={styles.statVal}>
                {done} / {total}
              </span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statKey}>Avg Score</span>
              <span style={styles.statVal}>{avgSoFar ?? "—"}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statKey}>Progress</span>
              <span style={styles.statVal}>{progressPct}%</span>
            </div>
          </div>

          <div style={styles.sideCard}>
            <div style={styles.sideTitle}>🎯 Answer Tips</div>
            <ul style={styles.tipList}>
              <li>Start with the key idea</li>
              <li>Give 1 concrete example</li>
              <li>Mention trade-offs</li>
              <li>Keep it structured</li>
              <li>Stay under 2 minutes</li>
            </ul>
          </div>

          <div style={styles.sideCard}>
            <div style={styles.sideTitle}>⚡️ Quick Facts</div>
            <div style={styles.factRow}>
              <span style={styles.factIcon}>🤖</span>
              <span style={styles.factText}>AI reads your answer for clarity and depth</span>
            </div>
            <div style={styles.factRow}>
              <span style={styles.factIcon}>⏭</span>
              <span style={styles.factText}>Skip any question — it counts as 0</span>
            </div>
            <div style={styles.factRow}>
              <span style={styles.factIcon}>🏆</span>
              <span style={styles.factText}>Final report after all questions</span>
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
  qCounter: { color: "#c4b5fd", fontSize: "1rem", fontWeight: 600 },
  qBig: { color: "#f5f3ff", fontSize: "1.6rem", fontWeight: 800 },
  qSlash: { color: "#a5a0c2", fontSize: "0.95rem", fontWeight: 500 },
  roleLabel: { color: "#a5a0c2", fontSize: "0.82rem", marginTop: "0.2rem" },
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
    fontSize: "1.2rem",
    marginTop: 0,
    marginBottom: "1.25rem",
    lineHeight: 1.6,
    color: "#f5f3ff",
    fontWeight: 600,
  },
  textarea: {
    width: "100%",
    padding: "1.1rem",
    borderRadius: "12px",
    border: "1px solid rgba(139, 92, 246, 0.25)",
    background: "rgba(15, 10, 35, 0.6)",
    color: "#f5f3ff",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
    lineHeight: 1.65,
    boxSizing: "border-box",
  },
  textareaFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    marginTop: "0.65rem",
    flexWrap: "wrap",
  },
  hint: {
    color: "#a5a0c2",
    fontSize: "0.82rem",
    flex: 1,
    minWidth: "200px",
  },
  charCount: {
    color: "#a5a0c2",
    fontSize: "0.78rem",
    fontVariantNumeric: "tabular-nums",
  },

  actionRow: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "1.25rem",
    alignItems: "stretch",
  },
  skipBtn: {
    padding: "0.95rem 1.5rem",
    borderRadius: "12px",
    border: "1px solid rgba(217, 153, 34, 0.4)",
    background: "rgba(217, 153, 34, 0.12)",
    color: "#fbbf24",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.95rem",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  },
  submitBtn: {
    flex: 1,
    padding: "0.95rem 1.75rem",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "0.98rem",
    letterSpacing: "0.3px",
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

  feedbackCard: {
    background: "rgba(15, 10, 35, 0.55)",
    border: "1px solid",
    borderRadius: "14px",
    padding: "1.5rem",
    marginTop: "0.5rem",
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
    fontSize: "0.72rem",
    letterSpacing: "1.5px",
    fontWeight: 700,
  },
  scoreWrap: { display: "flex", alignItems: "baseline", gap: "0.15rem" },
  scoreBig: {
    fontSize: "2.6rem",
    fontWeight: 800,
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    lineHeight: 1,
  },
  scoreMax: { color: "#a5a0c2", fontSize: "1rem", fontWeight: 600 },
  feedbackText: {
    color: "#d8d4ec",
    lineHeight: 1.65,
    margin: "0 0 1rem",
    fontSize: "0.92rem",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
  tipList: {
    color: "#d8d4ec",
    paddingLeft: "1.1rem",
    margin: 0,
    lineHeight: 1.7,
    fontSize: "0.85rem",
  },
  factRow: {
    display: "flex",
    gap: "0.6rem",
    alignItems: "flex-start",
    marginBottom: "0.75rem",
  },
  factIcon: { fontSize: "1rem", flexShrink: 0 },
  factText: { color: "#d8d4ec", fontSize: "0.82rem", lineHeight: 1.5 },
};