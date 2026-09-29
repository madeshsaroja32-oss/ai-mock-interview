import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listResumes, startInterview, startQuiz } from "../api/client";
import PageLayout from "../components/PageLayout";

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("interview");
  const [resumes, setResumes] = useState([]);
  const [role, setRole] = useState("Python Backend Developer");
  const [topic, setTopic] = useState("SQL");
  const [resumeId, setResumeId] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listResumes()
      .then((list) => {
        setResumes(list);
        if (list.length > 0) setResumeId(list[0].id);
      })
      .catch(() => {});
  }, []);

  async function handleStart() {
    if (!resumeId) {
      setError("Please select a resume first.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const data =
        mode === "interview"
          ? await startInterview(role, Number(resumeId), numQuestions)
          : await startQuiz(topic, Number(resumeId), numQuestions);

      navigate(mode === "interview" ? `/interview/${data.id}` : `/quiz/${data.id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const roles = [
    "Python Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "Machine Learning Engineer",
  ];

  const topics = ["SQL", "Python", "JavaScript", "React", "Docker", "FastAPI", "DBMS"];

  return (
    <PageLayout
      title="Start a Session"
      subtitle="Choose an interview or quiz mode. AI generates the content."
    >
      {/* Mode toggle */}
      <div style={styles.toggleWrap}>
        <button
          style={{
            ...styles.toggleBtn,
            ...(mode === "interview" ? styles.toggleBtnActive : {}),
          }}
          onClick={() => setMode("interview")}
        >
          🎤 AI Interview
        </button>
        <button
          style={{
            ...styles.toggleBtn,
            ...(mode === "quiz" ? styles.toggleBtnActive : {}),
          }}
          onClick={() => setMode("quiz")}
        >
          📝 Quick Quiz
        </button>
      </div>

      <div style={styles.card}>
        {mode === "interview" ? (
          <div style={styles.field}>
            <label style={styles.label}>TARGET ROLE</label>
            <input
              style={styles.input}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Python Backend Developer"
            />
            <div style={styles.chips}>
              {roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  style={{
                    ...styles.chip,
                    ...(role === r ? styles.chipActive : {}),
                  }}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={styles.field}>
            <label style={styles.label}>QUIZ TOPIC</label>
            <input
              style={styles.input}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. SQL, Python, React"
            />
            <div style={styles.chips}>
              {topics.map((t) => (
                <button
                  key={t}
                  type="button"
                  style={{
                    ...styles.chip,
                    ...(topic === t ? styles.chipActive : {}),
                  }}
                  onClick={() => setTopic(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={styles.field}>
          <label style={styles.label}>RESUME</label>
          {resumes.length === 0 ? (
            <div style={styles.warn}>
              No resumes found.{" "}
              <span
                style={styles.warnLink}
                onClick={() => navigate("/upload-resume")}
              >
                Upload one first →
              </span>
            </div>
          ) : (
            <select
              style={styles.select}
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.filename} ({r.skills.length} skills)
                </option>
              ))}
            </select>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>NUMBER OF QUESTIONS</label>
          <div style={styles.sliderRow}>
            {[3, 5, 7, 10].map((n) => (
              <button
                key={n}
                type="button"
                style={{
                  ...styles.numBtn,
                  ...(numQuestions === n ? styles.numBtnActive : {}),
                }}
                onClick={() => setNumQuestions(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button
          style={{
            ...styles.button,
            opacity: busy || !resumeId ? 0.5 : 1,
            cursor: busy || !resumeId ? "not-allowed" : "pointer",
          }}
          disabled={busy || !resumeId}
          onClick={handleStart}
        >
          {busy
            ? "Generating... (~5s)"
            : mode === "interview"
            ? "Start Interview ✨"
            : "Start Quiz 📝"}
        </button>
      </div>
    </PageLayout>
  );
}

const styles = {
  toggleWrap: {
    display: "flex",
    gap: "0.5rem",
    background: "rgba(30, 27, 58, 0.55)",
    padding: "0.4rem",
    borderRadius: "14px",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    maxWidth: "420px",
  },
  toggleBtn: {
    flex: 1,
    padding: "0.75rem",
    borderRadius: "10px",
    border: "none",
    background: "transparent",
    color: "#a5a0c2",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 600,
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  toggleBtnActive: {
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "white",
    boxShadow: "0 6px 18px rgba(139, 92, 246, 0.4)",
  },
  card: {
    background: "rgba(30, 27, 58, 0.55)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(139, 92, 246, 0.25)",
    borderRadius: "16px",
    padding: "1.75rem",
    maxWidth: "640px",
    display: "flex",
    flexDirection: "column",
    gap: "1.4rem",
  },
  field: { display: "flex", flexDirection: "column", gap: "0.55rem" },
  label: {
    color: "#c4b5fd",
    fontSize: "0.72rem",
    letterSpacing: "1.2px",
    fontWeight: 700,
  },
  input: {
    padding: "0.85rem 1rem",
    borderRadius: "10px",
    border: "1px solid rgba(139, 92, 246, 0.25)",
    background: "rgba(15, 10, 35, 0.6)",
    color: "#f5f3ff",
    fontSize: "0.95rem",
    outline: "none",
  },
  select: {
    padding: "0.85rem 1rem",
    borderRadius: "10px",
    border: "1px solid rgba(139, 92, 246, 0.25)",
    background: "rgba(15, 10, 35, 0.6)",
    color: "#f5f3ff",
    fontSize: "0.95rem",
    outline: "none",
    cursor: "pointer",
  },
  chips: { display: "flex", flexWrap: "wrap", gap: "0.4rem" },
  chip: {
    padding: "0.35rem 0.75rem",
    background: "rgba(139, 92, 246, 0.1)",
    border: "1px solid rgba(139, 92, 246, 0.25)",
    color: "#a5a0c2",
    borderRadius: "999px",
    fontSize: "0.75rem",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  chipActive: {
    background: "rgba(139, 92, 246, 0.35)",
    borderColor: "#a78bfa",
    color: "#f5f3ff",
    fontWeight: 600,
  },
  sliderRow: { display: "flex", gap: "0.5rem" },
  numBtn: {
    flex: 1,
    padding: "0.75rem",
    background: "rgba(15, 10, 35, 0.6)",
    border: "1px solid rgba(139, 92, 246, 0.25)",
    color: "#a5a0c2",
    borderRadius: "10px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.95rem",
    fontWeight: 600,
  },
  numBtnActive: {
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    borderColor: "transparent",
    color: "white",
    boxShadow: "0 6px 18px rgba(139, 92, 246, 0.45)",
  },
  button: {
    marginTop: "0.5rem",
    padding: "0.95rem",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "white",
    fontWeight: 700,
    fontSize: "0.98rem",
    letterSpacing: "0.4px",
    boxShadow: "0 10px 28px rgba(139, 92, 246, 0.45)",
  },
  error: {
    color: "#fca5a5",
    background: "rgba(248, 113, 113, 0.1)",
    border: "1px solid rgba(248, 113, 113, 0.35)",
    padding: "0.65rem 0.9rem",
    borderRadius: "8px",
    fontSize: "0.88rem",
  },
  warn: {
    color: "#fbbf24",
    background: "rgba(217, 153, 34, 0.1)",
    border: "1px solid rgba(217, 153, 34, 0.3)",
    padding: "0.75rem 0.9rem",
    borderRadius: "10px",
    fontSize: "0.88rem",
  },
  warnLink: {
    color: "#fbbf24",
    textDecoration: "underline",
    cursor: "pointer",
    fontWeight: 600,
  },
};