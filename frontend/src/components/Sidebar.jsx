import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const nav = [
    { icon: "🏠", label: "Dashboard", path: "/dashboard" },
    { icon: "📄", label: "Upload Resume", path: "/upload-resume" },
    { icon: "🎤", label: "Mock Interview", path: "/interview/setup" },
    { icon: "📊", label: "Reports", path: "/reports" },
  ];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/dashboard" && location.pathname.startsWith(path));

  return (
    <aside style={styles.sidebar}>
      {/* Brand */}
      <div style={styles.brand}>
        <div style={styles.brandIcon}>AI</div>
        <div>
          <div style={styles.brandTitle}>AI Mock Interview</div>
          <div style={styles.brandSub}>Workspace</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {nav.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              ...styles.navItem,
              ...(isActive(item.path) ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={styles.bottom}>
        <div style={styles.userRow}>
          <div style={styles.avatar}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userEmail}>{user?.email}</div>
          </div>
        </div>

        <button style={styles.logout} onClick={handleLogout}>
          <span>⏻</span> Log out
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    minWidth: "240px",
    background: "#0b1117",
    borderRight: "1px solid #1f2733",
    display: "flex",
    flexDirection: "column",
    padding: "1.25rem 1rem",
    height: "100vh",
    position: "sticky",
    top: 0,
    fontFamily: "'Segoe UI', sans-serif",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    padding: "0.25rem 0.5rem 1.5rem",
    marginBottom: "0.5rem",
    borderBottom: "1px solid #1f2733",
  },
  brandIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #1f6feb, #238636)",
    color: "white",
    fontWeight: 800,
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: "0.5px",
  },
  brandTitle: {
    color: "#e6edf3",
    fontWeight: 700,
    fontSize: "0.85rem",
    lineHeight: 1.2,
  },
  brandSub: {
    color: "#6e7681",
    fontSize: "0.7rem",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    padding: "0.65rem 0.75rem",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: "8px",
    color: "#8b949e",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    textAlign: "left",
    transition: "background 0.15s, color 0.15s",
  },
  navItemActive: {
    background: "#1f6feb22",
    border: "1px solid #1f6feb55",
    color: "#79c0ff",
    fontWeight: 600,
  },
  navIcon: {
    fontSize: "1.1rem",
    width: "22px",
    textAlign: "center",
  },
  bottom: {
    borderTop: "1px solid #1f2733",
    paddingTop: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.5rem",
  },
  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1f6feb, #238636)",
    color: "white",
    fontWeight: 700,
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userInfo: {
    overflow: "hidden",
  },
  userName: {
    color: "#e6edf3",
    fontSize: "0.85rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userEmail: {
    color: "#6e7681",
    fontSize: "0.7rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  logout: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.6rem",
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "8px",
    color: "#e6edf3",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontFamily: "inherit",
  },
};