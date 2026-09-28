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
      const data = await submitAnswer(interview.id, interview.questions[current], answer);
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
        <p style={{ color: "#8b949e" }}>{error || "Loading..."}</p>
      </PageLayout>
    );
  }

  const total = interview.questions.length;
  const done = interview.answers.length;
  const isLast = current === total - 1;

  return (
    <PageLayout
      title={`Question ${current + 1} / ${total}`}
      subtitle={`Role: ${interview.role}`}
    >
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${(done / total) * 100}%` }} />
      </div>

      <div style={styles.card}>
        <h2 style={styles.question}>{interview.questions[current]}</h2>

        {!feedback ? (
          <>
            <textarea
              style={styles.textarea}
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button
              style={{ ...styles.button, opacity: busy || !answer.trim() ? 0.5 : 1 }}
              disabled={busy || !answer.trim()}
              onClick={handleSubmit}
            >
              {busy ? "Evaluating..." : "Submit Answer"}
            </button>
          </>
        ) : (
          <>
            <div style={styles.feedbackBox}>
              <h3 style={styles.feedbackTitle}>
                Score: <span style={styles.score}>{feedback.score}/10</span>
              </h3>
              <p style={styles.feedbackText}>{feedback.feedback}</p>

              {feedback.strengths?.length > 0 && (
                <>
                  <h4 style={styles.listTitle}>✅ Strengths</h4>
                  <ul style={styles.list}>
                    {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </>
              )}
              {feedback.improvements?.length > 0 && (
                <>
                  <h4 style={styles.listTitle}>💡 Improvements</h4>
                  <ul style={styles.list}>
                    {feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </>
              )}
            </div>
            <button style={styles.button} disabled={busy} onClick={handleNext}>
              {busy ? "Finishing..." : isLast ? "Finish Interview" : "Next Question →"}
            </button>
          </>
        )}
      </div>
    </PageLayout>
  );
}

const styles = {
  progressBar: { height: "6px", background: "#21262d", borderRadius: "999px", overflow: "hidden" },
  progressFill: { height: "100%", background: "#1f6feb", transition: "width 0.3s" },
  card: { background: "#161b22", padding: "1.75rem", borderRadius: "10px", border: "1px solid #30363d", maxWidth: "720px" },
  question: { fontSize: "1.15rem", marginTop: 0, marginBottom: "1rem", lineHeight: 1.5 },
  textarea: { width: "100%", padding: "0.85rem", borderRadius: "8px", border: "1px solid #30363d", background: "#0d1117", color: "#e6edf3", fontSize: "0.95rem", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" },
  button: { marginTop: "1rem", padding: "0.85rem 1.5rem", borderRadius: "8px", border: "none", background: "#238636", color: "white", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem" },
  error: { color: "#f85149", background: "#3d1418", padding: "0.6rem", borderRadius: "6px", fontSize: "0.9rem" },
  feedbackBox: { background: "#0d1117", padding: "1rem", borderRadius: "8px", border: "1px solid #30363d", marginTop: "0.5rem" },
  feedbackTitle: { margin: 0, marginBottom: "0.5rem" },
  score: { color: "#79c0ff", fontSize: "1.4rem" },
  feedbackText: { color: "#c9d1d9", lineHeight: 1.6, margin: "0 0 0.75rem" },
  listTitle: { marginTop: "0.75rem", marginBottom: "0.4rem" },
  list: { color: "#c9d1d9", paddingLeft: "1.2rem", margin: 0, lineHeight: 1.6 },
};