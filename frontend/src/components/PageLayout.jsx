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
    background:
      "radial-gradient(circle at 15% 10%, #1e1b3a 0%, #0d0a1f 45%, #050213 100%)",
    color: "#f5f3ff",
    fontFamily: "'Segoe UI', sans-serif",
  },
  main: {
    flex: 1,
    padding: "2rem 2.5rem",
    maxWidth: "1150px",
    overflowX: "hidden",
  },
  header: {
    marginBottom: "1.75rem",
    paddingBottom: "1.25rem",
    borderBottom: "1px solid rgba(139, 92, 246, 0.15)",
  },
  title: {
    margin: 0,
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#f5f3ff",
    letterSpacing: "-0.3px",
  },
  subtitle: {
    margin: "0.4rem 0 0",
    color: "#a5a0c2",
    fontSize: "0.95rem",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
};