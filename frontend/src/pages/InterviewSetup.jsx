import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listResumes, startInterview } from "../api/client";
import PageLayout from "../components/PageLayout";

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [role, setRole] = useState("Python Backend Developer");
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
      const data = await startInterview(role, Number(resumeId), numQuestions);
      navigate(`/interview/${data.id}`);
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
    "Data Scientist",
    "Machine Learning Engineer",
    "DevOps Engineer",
    "Mobile App Developer",
  ];

  return (
    <PageLayout
      title="Start a Mock Interview"
      subtitle="Pick a role and resume. AI generates 5 questions."
    >
      <div style={styles.card}>
        {/* Target Role */}
        <div style={styles.field}>
          <label style={styles.label}>TARGET ROLE</label>
          <input
            style={styles.input}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Python Backend Developer"
          />
          <div style={styles.chips}>
            {roles.slice(0, 4).map((r) => (
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

        {/* Resume */}
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

        {/* Number of Questions */}
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
          {busy ? "Generating questions... (~5s)" : "Start Interview ✨"}
        </button>
      </div>
    </PageLayout>
  );
}

const styles = {
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
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.55rem",
  },
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
    transition: "border-color 0.2s",
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

  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.4rem",
    marginTop: "0.15rem",
  },
  chip: {
    padding: "0.35rem 0.75rem",
    background: "rgba(139, 92, 246, 0.1)",
    border: "1px solid rgba(139, 92, 246, 0.25)",
    color: "#a5a0c2",
    borderRadius: "999px",
    fontSize: "0.75rem",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  chipActive: {
    background: "rgba(139, 92, 246, 0.35)",
    borderColor: "#a78bfa",
    color: "#f5f3ff",
    fontWeight: 600,
  },

  sliderRow: {
    display: "flex",
    gap: "0.5rem",
  },
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
    transition: "all 0.2s",
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
    transition: "opacity 0.2s",
    cursor: "pointer",
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