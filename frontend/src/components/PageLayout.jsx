import Sidebar from "./Sidebar";

export default function PageLayout({ title, subtitle, children }) {
  return (
    <div style={styles.wrap}>
      <Sidebar />
      <main style={styles.main}>
        {title && (
          <header style={styles.header}>
            <h1 style={styles.title}>{title}</h1>
            {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
          </header>
        )}
        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    minHeight: "100vh",
    background: "#0d1117",
    color: "#e6edf3",
    fontFamily: "'Segoe UI', sans-serif",
  },
  main: {
    flex: 1,
    padding: "2rem 2.5rem",
    maxWidth: "1100px",
    overflowX: "hidden",
  },
  header: {
    marginBottom: "1.75rem",
    paddingBottom: "1.25rem",
    borderBottom: "1px solid #1f2733",
  },
  title: {
    margin: 0,
    fontSize: "1.7rem",
    fontWeight: 700,
    color: "#e6edf3",
  },
  subtitle: {
    margin: "0.35rem 0 0",
    color: "#8b949e",
    fontSize: "0.95rem",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
};