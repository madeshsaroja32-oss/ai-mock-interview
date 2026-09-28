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
    listResumes().then((list) => {
      setResumes(list);
      if (list.length > 0) setResumeId(list[0].id);
    }).catch(() => {});
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

  return (
    <PageLayout
      title="Start a Mock Interview"
      subtitle="Pick a role and resume. AI generates 5 questions."
    >
      <div style={styles.card}>
        <label style={styles.label}>Target Role</label>
        <input
          style={styles.input}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Python Backend Developer"
        />

        <label style={styles.label}>Resume</label>
        {resumes.length === 0 ? (
          <p style={styles.warn}>No resumes found. Upload one first.</p>
        ) : (
          <select
            style={styles.input}
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

        <label style={styles.label}>Number of Questions</label>
        <input
          type="number"
          min={3}
          max={10}
          style={styles.input}
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={{ ...styles.button, opacity: busy || !resumeId ? 0.5 : 1 }}
          disabled={busy || !resumeId}
          onClick={handleStart}
        >
          {busy ? "Generating questions... (~5s)" : "Start Interview"}
        </button>
      </div>
    </PageLayout>
  );
}

const styles = {
  card: { background: "#161b22", padding: "1.75rem", borderRadius: "10px", border: "1px solid #30363d", display: "flex", flexDirection: "column", gap: "0.6rem", maxWidth: "560px" },
  label: { color: "#8b949e", fontSize: "0.8rem", marginTop: "0.5rem", letterSpacing: "0.5px" },
  input: { padding: "0.75rem", borderRadius: "8px", border: "1px solid #30363d", background: "#0d1117", color: "#e6edf3", fontSize: "0.95rem" },
  button: { marginTop: "1rem", padding: "0.85rem", borderRadius: "8px", border: "none", background: "#238636", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "0.95rem" },
  error: { color: "#f85149", background: "#3d1418", padding: "0.6rem", borderRadius: "6px", fontSize: "0.9rem", margin: 0 },
  warn: { color: "#d29922", fontSize: "0.9rem", margin: 0 },
};