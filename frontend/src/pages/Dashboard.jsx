import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listResumes, listInterviews } from "../api/client";
import PageLayout from "../components/PageLayout";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listResumes(), listInterviews()])
      .then(([r, i]) => {
        setResumes(r);
        setInterviews(i);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed = interviews.filter((i) => i.average_score !== null);
  const avgScore = completed.length
    ? Math.round(
        (completed.reduce((s, i) => s + (i.average_score || 0), 0) /
          completed.length) * 10
      ) / 10
    : 0;
  const bestScore = completed.length
    ? Math.max(...completed.map((i) => i.average_score || 0))
    : 0;
  const totalSkills = resumes.reduce((s, r) => s + (r.skills?.length || 0), 0);

  const stats = [
    {
      label: "Interviews",
      value: interviews.length,
      accent: "#8b5cf6",
      icon: "🎤",
      trend: "+ Live",
    },
    {
      label: "Avg Score",
      value: avgScore || "—",
      accent: "#22d3ee",
      icon: "⭐",
      trend: `${completed.length} done`,
    },
    {
      label: "Best Score",
      value: bestScore || "—",
      accent: "#ec4899",
      icon: "🏆",
      trend: "Top",
    },
    {
      label: "Skills Found",
      value: totalSkills,
      accent: "#10b981",
      icon: "🧠",
      trend: `${resumes.length} resumes`,
    },
  ];

  const actions = [
    {
      icon: "📄",
      title: "Upload Resume",
      subtitle: "Add your latest PDF",
      path: "/upload-resume",
      accent: "#8b5cf6",
    },
    {
      icon: "🎤",
      title: "Mock Interview",
      subtitle: "Start an AI interview",
      path: "/interview/setup",
      accent: "#ec4899",
    },
    {
      icon: "📊",
      title: "View Reports",
      subtitle: "Track your performance",
      path: "/reports",
      accent: "#22d3ee",
    },
  ];

  return (
    <PageLayout>
      <div style={styles.hero}>
        <div>
          <h2 style={styles.heroTitle}>
            Welcome back, {user?.name?.split(" ")[0] || "there"} ✨
          </h2>
          <p style={styles.heroSub}>
            Here's what's happening with your AI interviews today.
          </p>
        </div>
        <button style={styles.ctaButton} onClick={() => navigate("/interview/setup")}>
          + New Interview
        </button>
      </div>

      <div style={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statTop}>
              <div
                style={{
                  ...styles.statIcon,
                  background: `${s.accent}22`,
                  border: `1px solid ${s.accent}55`,
                }}
              >
                {s.icon}
              </div>
              <span style={{ ...styles.statTrend, color: s.accent }}>
                {s.trend}
              </span>
            </div>
            <div style={{ ...styles.statValue, color: s.accent }}>
              {s.value}
            </div>
            <div style={styles.statLabel}>{s.label}</div>
            <div style={styles.sparkline}>
              <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                <polyline
                  points="0,20 15,15 30,22 45,10 60,18 75,8 90,14 100,6"
                  fill="none"
                  stroke={s.accent}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.twoCol}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Recent Interviews</h3>
            <button style={styles.linkBtn} onClick={() => navigate("/reports")}>
              See all →
            </button>
          </div>

          {loading ? (
            <p style={styles.muted}>Loading...</p>
          ) : interviews.length === 0 ? (
            <p style={styles.muted}>
              No interviews yet. Start one to see it here.
            </p>
          ) : (
            <div style={styles.list}>
              {interviews.slice(0, 4).map((it) => {
                const done = it.average_score !== null;
                const pct = done ? it.average_score * 10 : 0;
                return (
                  <div
                    key={it.id}
                    style={styles.listRow}
                    onClick={() =>
                      navigate(
                        done ? `/interview/${it.id}/report` : `/interview/${it.id}`
                      )
                    }
                  >
                    <div style={styles.listInfo}>
                      <div style={styles.listRole}>{it.role}</div>
                      <div style={styles.listMeta}>
                        {new Date(it.created_at).toLocaleDateString()} ·{" "}
                        {it.answers?.length || 0}/{it.questions?.length || 0} answered
                      </div>
                    </div>
                    <div style={styles.listRight}>
                      {done ? (
                        <span style={styles.scoreChip}>
                          {it.average_score}/10
                        </span>
                      ) : (
                        <span style={styles.progressChip}>In Progress</span>
                      )}
                    </div>
                    <div style={styles.miniBarWrap}>
                      <div
                        style={{
                          ...styles.miniBar,
                          width: `${pct}%`,
                          background: done
                            ? "linear-gradient(90deg, #8b5cf6, #ec4899)"
                            : "#6b7280",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Quick Actions</h3>
          </div>
          <div style={styles.actionsCol}>
            {actions.map((a) => (
              <button
                key={a.path}
                style={styles.actionBtn}
                onClick={() => navigate(a.path)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = a.accent;
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.2)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div
                  style={{
                    ...styles.actionIcon,
                    background: `${a.accent}22`,
                    border: `1px solid ${a.accent}55`,
                  }}
                >
                  {a.icon}
                </div>
                <div style={styles.actionText}>
                  <div style={styles.actionTitle}>{a.title}</div>
                  <div style={styles.actionSub}>{a.subtitle}</div>
                </div>
                <span style={{ color: a.accent, fontSize: "1.2rem" }}>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

const styles = {
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "0.5rem",
  },
  heroTitle: {
    fontSize: "1.75rem",
    margin: 0,
    marginBottom: "0.25rem",
    fontWeight: 700,
    color: "#f5f3ff",
  },
  heroSub: {
    color: "#a5a0c2",
    margin: 0,
    fontSize: "0.95rem",
  },
  ctaButton: {
    padding: "0.7rem 1.3rem",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
    boxShadow: "0 8px 24px rgba(139, 92, 246, 0.5)",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  statCard: {
    background: "rgba(30, 27, 58, 0.55)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    borderRadius: "14px",
    padding: "1.1rem 1.2rem",
    position: "relative",
    overflow: "hidden",
  },
  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  statIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
  },
  statTrend: {
    fontSize: "0.72rem",
    fontWeight: 600,
    letterSpacing: "0.3px",
  },
  statValue: {
    fontSize: "1.9rem",
    fontWeight: 800,
    lineHeight: 1,
    marginBottom: "0.3rem",
  },
  statLabel: {
    color: "#a5a0c2",
    fontSize: "0.82rem",
  },
  sparkline: {
    marginTop: "0.6rem",
    height: "30px",
    opacity: 0.7,
  },

  twoCol: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: "1rem",
  },
  panel: {
    background: "rgba(30, 27, 58, 0.55)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    borderRadius: "14px",
    padding: "1.3rem",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  panelTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 600,
    color: "#f5f3ff",
  },
  linkBtn: {
    background: "transparent",
    border: "none",
    color: "#c4b5fd",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontFamily: "inherit",
  },

  list: { display: "flex", flexDirection: "column", gap: "0.85rem" },
  listRow: {
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "0.5rem 0.75rem",
    padding: "0.5rem 0",
    borderBottom: "1px solid rgba(139, 92, 246, 0.1)",
  },
  listInfo: { minWidth: 0 },
  listRole: {
    fontSize: "0.92rem",
    fontWeight: 600,
    color: "#f5f3ff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  listMeta: {
    color: "#a5a0c2",
    fontSize: "0.78rem",
    marginTop: "0.15rem",
  },
  listRight: { alignSelf: "center" },
  scoreChip: {
    background: "rgba(139, 92, 246, 0.2)",
    color: "#c4b5fd",
    padding: "0.25rem 0.65rem",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: 600,
  },
  progressChip: {
    background: "rgba(217, 153, 34, 0.2)",
    color: "#fbbf24",
    padding: "0.25rem 0.65rem",
    borderRadius: "999px",
    fontSize: "0.72rem",
    fontWeight: 600,
  },
  miniBarWrap: {
    gridColumn: "1 / -1",
    height: "5px",
    background: "rgba(139, 92, 246, 0.12)",
    borderRadius: "999px",
    overflow: "hidden",
  },
  miniBar: {
    height: "100%",
    borderRadius: "999px",
    transition: "width 0.3s",
  },

  actionsCol: { display: "flex", flexDirection: "column", gap: "0.6rem" },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.8rem 0.9rem",
    background: "rgba(15, 10, 35, 0.5)",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    borderRadius: "10px",
    cursor: "pointer",
    color: "#f5f3ff",
    fontFamily: "inherit",
    textAlign: "left",
    transition: "all 0.2s",
  },
  actionIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.05rem",
    flexShrink: 0,
  },
  actionText: { flex: 1, minWidth: 0 },
  actionTitle: { fontSize: "0.9rem", fontWeight: 600 },
  actionSub: { fontSize: "0.75rem", color: "#a5a0c2" },

  muted: { color: "#a5a0c2", fontSize: "0.88rem" },
};