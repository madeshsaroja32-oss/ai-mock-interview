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
      <div style={styles.brand}>
        <div style={styles.brandIcon}>AI</div>
        <div>
          <div style={styles.brandTitle}>Mock Interview</div>
          <div style={styles.brandSub}>Workspace</div>
        </div>
      </div>

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
    background: "rgba(20, 10, 40, 0.65)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRight: "1px solid rgba(139, 92, 246, 0.18)",
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
    borderBottom: "1px solid rgba(139, 92, 246, 0.15)",
  },
  brandIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "white",
    fontWeight: 800,
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: "0.5px",
    boxShadow: "0 0 20px rgba(139, 92, 246, 0.55)",
  },
  brandTitle: {
    color: "#f5f3ff",
    fontWeight: 700,
    fontSize: "0.85rem",
    lineHeight: 1.2,
  },
  brandSub: { color: "#9ca3af", fontSize: "0.7rem" },

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
    borderRadius: "10px",
    color: "#a5a0c2",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    textAlign: "left",
    transition: "all 0.2s",
  },
  navItemActive: {
    background:
      "linear-gradient(135deg, rgba(139, 92, 246, 0.35), rgba(236, 72, 153, 0.25))",
    border: "1px solid rgba(167, 139, 250, 0.5)",
    color: "#f5f3ff",
    fontWeight: 600,
    boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
  },
  navIcon: {
    fontSize: "1.1rem",
    width: "22px",
    textAlign: "center",
  },

  bottom: {
    borderTop: "1px solid rgba(139, 92, 246, 0.15)",
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
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "white",
    fontWeight: 700,
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)",
  },
  userInfo: { overflow: "hidden" },
  userName: {
    color: "#f5f3ff",
    fontSize: "0.85rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userEmail: {
    color: "#9ca3af",
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
    background: "rgba(139, 92, 246, 0.15)",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    borderRadius: "10px",
    color: "#f5f3ff",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontFamily: "inherit",
  },
};