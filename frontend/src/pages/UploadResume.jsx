import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadResume, listResumes } from "../api/client";

export default function UploadResume() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    listResumes().then(setHistory).catch(() => {});
  }, []);

  function handlePick(e) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  async function handleUpload() {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const data = await uploadResume(file);
      setUploaded(data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      const list = await listResumes();
      setHistory(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <h1 style={styles.logo}>AI Mock Interview</h1>
        <button style={styles.back} onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </header>

      <main style={styles.main}>
        <h2 style={styles.title}>Upload Your Resume</h2>
        <p style={styles.sub}>PDF only. We'll extract skills and generate a summary.</p>

        <div style={styles.card}>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePick}
            style={{ color: "#e6edf3", marginBottom: "1rem" }}
          />

          {file && (
            <p style={styles.fileInfo}>
              Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button
            style={{ ...styles.button, opacity: !file || busy ? 0.5 : 1 }}
            disabled={!file || busy}
            onClick={handleUpload}
          >
            {busy ? "Uploading & parsing..." : "Upload & Parse"}
          </button>
        </div>

        {uploaded && (
          <div style={styles.resultCard}>
            <h3 style={styles.resultTitle}>✅ Parsed Resume</h3>
            <p style={styles.summary}>{uploaded.summary}</p>

            <h4 style={styles.skillsTitle}>Detected Skills ({uploaded.skills.length})</h4>
            <div style={styles.skillGrid}>
              {uploaded.skills.length === 0 ? (
                <p style={styles.sub}>No skills detected.</p>
              ) : (
                uploaded.skills.map((s) => (
                  <span key={s} style={styles.skill}>{s}</span>
                ))
              )}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div style={styles.historyCard}>
            <h3 style={styles.resultTitle}>📚 Upload History</h3>
            <ul style={styles.historyList}>
              {history.map((r) => (
                <li key={r.id} style={styles.historyItem}>
                  <strong>{r.filename}</strong>
                  <span style={styles.historyMeta}>
                    {r.skills.length} skills · {new Date(r.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
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
  card: { background: "#161b22", padding: "1.5rem", borderRadius: "8px", border: "1px solid #30363d", marginBottom: "1.5rem" },
  fileInfo: { color: "#8b949e", fontSize: "0.9rem", marginBottom: "1rem" },
  button: { padding: "0.75rem 1.25rem", borderRadius: "6px", border: "none", background: "#238636", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "1rem" },
  error: { color: "#f85149", background: "#3d1418", padding: "0.5rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.9rem" },
  resultCard: { background: "#161b22", padding: "1.5rem", borderRadius: "8px", border: "1px solid #238636", marginBottom: "1.5rem" },
  historyCard: { background: "#161b22", padding: "1.5rem", borderRadius: "8px", border: "1px solid #30363d" },
  resultTitle: { marginTop: 0 },
  summary: { color: "#8b949e", marginBottom: "1rem" },
  skillsTitle: { marginBottom: "0.5rem" },
  skillGrid: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  skill: { background: "#1f6feb33", color: "#79c0ff", padding: "0.25rem 0.7rem", borderRadius: "999px", fontSize: "0.85rem", border: "1px solid #1f6feb" },
  historyList: { listStyle: "none", padding: 0, margin: 0 },
  historyItem: { display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #30363d" },
  historyMeta: { color: "#8b949e", fontSize: "0.85rem" },
};