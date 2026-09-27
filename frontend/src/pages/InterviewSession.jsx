import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { finishInterview, getInterview, submitAnswer } from "../api/client";

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
      // Finish
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

  if (error && !interview) {
    return <div style={styles.wrap}><p style={styles.error}>{error}</p></div>;
  }
  if (!interview) {
    return <div style={styles.wrap}><p style={styles.loading}>Loading...</p></div>;
  }

  const total = interview.questions.length;
  const done = interview.answers.length;
  const isLast = current === total - 1;

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <h1 style={styles.logo}>AI Mock Interview</h1>
        <span style={styles.progress}>Question {current + 1} / {total}</span>
      </header>

      <main style={styles.main}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${(done / total) * 100}%` }} />
        </div>

        <div style={styles.card}>
          <p style={styles.roleLabel}>Role: {interview.role}</p>
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
              <button
                style={styles.button}
                disabled={busy}
                onClick={handleNext}
              >
                {busy ? "Finishing..." : isLast ? "Finish Interview" : "Next Question →"}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  wrap: { minHeight: "100vh", background: "#0d1117", color: "#e6edf3" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem", borderBottom: "1px solid #30363d" },
  logo: { margin: 0, fontSize: "1.2rem" },
  progress: { color: "#8b949e" },
  main: { padding: "2rem", maxWidth: "720px", margin: "0 auto" },
  progressBar: { height: "6px", background: "#21262d", borderRadius: "999px", marginBottom: "1.5rem", overflow: "hidden" },
  progressFill: { height: "100%", background: "#1f6feb", transition: "width 0.3s" },
  card: { background: "#161b22", padding: "1.5rem", borderRadius: "8px", border: "1px solid #30363d" },
  roleLabel: { color: "#8b949e", fontSize: "0.85rem", margin: "0 0 0.5rem 0" },
  question: { fontSize: "1.2rem", marginTop: 0, marginBottom: "1rem" },
  textarea: { width: "100%", padding: "0.8rem", borderRadius: "6px", border: "1px solid #30363d", background: "#0d1117", color: "#e6edf3", fontSize: "0.95rem", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" },
  button: { marginTop: "1rem", padding: "0.8rem 1.5rem", borderRadius: "6px", border: "none", background: "#238636", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "1rem" },
  error: { color: "#f85149", background: "#3d1418", padding: "0.5rem", borderRadius: "6px", fontSize: "0.9rem" },
  loading: { padding: "2rem", color: "#8b949e" },
  feedbackBox: { background: "#0d1117", padding: "1rem", borderRadius: "6px", border: "1px solid #30363d", marginTop: "0.5rem" },
  feedbackTitle: { margin: 0, marginBottom: "0.5rem" },
  score: { color: "#79c0ff", fontSize: "1.4rem" },
  feedbackText: { color: "#c9d1d9", lineHeight: 1.6 },
  listTitle: { marginTop: "1rem", marginBottom: "0.4rem" },
  list: { color: "#c9d1d9", paddingLeft: "1.2rem", margin: 0 },
};