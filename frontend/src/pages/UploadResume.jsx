import { useEffect, useRef, useState } from "react";
import { uploadResume, listResumes } from "../api/client";
import PageLayout from "../components/PageLayout";

export default function UploadResume() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState(null);
  const [history, setHistory] = useState([]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    listResumes().then(setHistory).catch(() => {});
  }, []);

  function handlePick(e) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      if (!f.name.toLowerCase().endsWith(".pdf")) {
        setError("Please drop a PDF file.");
        return;
      }
      setFile(f);
      setError("");
    }
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
    <PageLayout
      title="Upload Your Resume"
      subtitle="PDF only. We'll extract skills and generate a summary."
    >
      {/* Upload card */}
      <div style={styles.uploadCard}>
        <div
          style={{
            ...styles.dropzone,
            borderColor: dragging
              ? "#ec4899"
              : "rgba(139, 92, 246, 0.35)",
            background: dragging
              ? "rgba(236, 72, 153, 0.08)"
              : "rgba(15, 10, 35, 0.4)",
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={styles.dropIcon}>📄</div>
          <div style={styles.dropTitle}>
            {file ? file.name : "Drop your PDF here or click to browse"}
          </div>
          <div style={styles.dropSub}>
            {file
              ? `${(file.size / 1024).toFixed(1)} KB — ready to upload`
              : "Max size 10 MB · PDF format only"}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePick}
            style={{ display: "none" }}
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={{
            ...styles.button,
            opacity: !file || busy ? 0.5 : 1,
            cursor: !file || busy ? "not-allowed" : "pointer",
          }}
          disabled={!file || busy}
          onClick={handleUpload}
        >
          {busy ? "Uploading & parsing..." : "Upload & Parse"}
        </button>
      </div>

      {/* Parsed result */}
      {uploaded && (
        <div style={styles.resultCard}>
          <div style={styles.resultHeader}>
            <span style={styles.resultEmoji}>✅</span>
            <h3 style={styles.resultTitle}>Parsed Resume</h3>
          </div>

          <div style={styles.summaryBox}>
            <div style={styles.summaryLabel}>AI SUMMARY</div>
            <p style={styles.summaryText}>{uploaded.summary}</p>
          </div>

          <div style={styles.skillsHeader}>
            <span style={styles.skillsTitle}>Detected Skills</span>
            <span style={styles.skillsCount}>{uploaded.skills.length}</span>
          </div>

          <div style={styles.skillGrid}>
            {uploaded.skills.length === 0 ? (
              <p style={styles.muted}>No skills detected.</p>
            ) : (
              uploaded.skills.map((s) => (
                <span key={s} style={styles.skill}>
                  {s}
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div style={styles.historyCard}>
          <div style={styles.historyHeader}>
            <h3 style={styles.historyTitle}>📚 Upload History</h3>
            <span style={styles.historyCount}>
              {history.length} file{history.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div style={styles.historyList}>
            {history.map((r) => (
              <div key={r.id} style={styles.historyItem}>
                <div style={styles.historyLeft}>
                  <span style={styles.fileIcon}>📄</span>
                  <div>
                    <div style={styles.historyFilename}>{r.filename}</div>
                    <div style={styles.historyMeta}>
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <span style={styles.skillChip}>{r.skills.length} skills</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
}

const styles = {
  uploadCard: {
    background: "rgba(30, 27, 58, 0.55)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    borderRadius: "16px",
    padding: "1.75rem",
    maxWidth: "760px",
  },
  dropzone: {
    border: "2px dashed rgba(139, 92, 246, 0.35)",
    borderRadius: "14px",
    padding: "2.5rem 1.5rem",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  dropIcon: {
    fontSize: "2.2rem",
    marginBottom: "0.5rem",
  },
  dropTitle: {
    color: "#f5f3ff",
    fontWeight: 600,
    fontSize: "1rem",
    marginBottom: "0.35rem",
  },
  dropSub: {
    color: "#a5a0c2",
    fontSize: "0.82rem",
  },
  button: {
    marginTop: "1.25rem",
    width: "100%",
    padding: "0.9rem",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "white",
    fontWeight: 700,
    fontSize: "0.95rem",
    letterSpacing: "0.5px",
    boxShadow: "0 8px 24px rgba(139, 92, 246, 0.4)",
    transition: "opacity 0.2s",
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

  /* Parsed result */
  resultCard: {
    background: "rgba(30, 27, 58, 0.55)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(16, 185, 129, 0.35)",
    borderRadius: "16px",
    padding: "1.75rem",
    maxWidth: "760px",
  },
  resultHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    marginBottom: "1.25rem",
  },
  resultEmoji: { fontSize: "1.4rem" },
  resultTitle: {
    margin: 0,
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#f5f3ff",
  },
  summaryBox: {
    background: "rgba(15, 10, 35, 0.55)",
    border: "1px solid rgba(139, 92, 246, 0.15)",
    borderRadius: "10px",
    padding: "1rem 1.15rem",
    marginBottom: "1.25rem",
  },
  summaryLabel: {
    color: "#c4b5fd",
    fontSize: "0.7rem",
    letterSpacing: "1.2px",
    fontWeight: 700,
    marginBottom: "0.5rem",
  },
  summaryText: {
    color: "#d8d4ec",
    lineHeight: 1.65,
    margin: 0,
    fontSize: "0.92rem",
  },
  skillsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.75rem",
  },
  skillsTitle: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#f5f3ff",
  },
  skillsCount: {
    background: "rgba(139, 92, 246, 0.2)",
    color: "#c4b5fd",
    borderRadius: "999px",
    padding: "0.15rem 0.6rem",
    fontSize: "0.75rem",
    fontWeight: 700,
  },
  skillGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  skill: {
    background: "rgba(139, 92, 246, 0.15)",
    color: "#c4b5fd",
    padding: "0.35rem 0.85rem",
    borderRadius: "999px",
    fontSize: "0.82rem",
    border: "1px solid rgba(139, 92, 246, 0.35)",
    fontWeight: 500,
  },

  /* History */
  historyCard: {
    background: "rgba(30, 27, 58, 0.55)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    borderRadius: "16px",
    padding: "1.5rem",
    maxWidth: "760px",
  },
  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  historyTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 600,
    color: "#f5f3ff",
  },
  historyCount: {
    color: "#a5a0c2",
    fontSize: "0.8rem",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 0.9rem",
    background: "rgba(15, 10, 35, 0.5)",
    borderRadius: "10px",
    border: "1px solid rgba(139, 92, 246, 0.12)",
  },
  historyLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    minWidth: 0,
  },
  fileIcon: { fontSize: "1.2rem" },
  historyFilename: {
    color: "#f5f3ff",
    fontSize: "0.9rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  historyMeta: {
    color: "#a5a0c2",
    fontSize: "0.75rem",
    marginTop: "0.1rem",
  },
  skillChip: {
    background: "rgba(139, 92, 246, 0.18)",
    color: "#c4b5fd",
    padding: "0.25rem 0.7rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  muted: { color: "#a5a0c2", fontSize: "0.88rem", margin: 0 },
};