import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", icon: "🏠", label: "Dashboard" },
    { path: "/sos", icon: "🚨", label: "SOS Alert" },
    { path: "/alerts", icon: "📬", label: "My Alerts" },
    { path: "/guardians", icon: "👥", label: "Guardians" },
    { path: "/live-tracking", icon: "📍", label: "Live Tracking" },
    { path: "/admin", icon: "🔐", label: "Admin Panel" },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {isOpen && <div style={styles.overlay} onClick={onClose} />}
      <div style={{ ...styles.sidebar, ...(isOpen ? styles.sidebarOpen : styles.sidebarClosed) }}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Menu</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              style={{
                ...styles.menuItem,
                ...(isActive(item.path) && styles.menuItemActive),
              }}
              onClick={() => handleNavigation(item.path)}
            >
              <span style={styles.menuIcon}>{item.icon}</span>
              <span style={styles.menuLabel}>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          <p style={styles.footerText}>🛡️ Stay Safe</p>
        </div>
      </div>
    </>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 999,
    transition: "opacity 0.3s",
  },
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: "280px",
    background: "white",
    boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
    zIndex: 1000,
    transition: "transform 0.3s ease",
    display: "flex",
    flexDirection: "column",
  },
  sidebarOpen: {
    transform: "translateX(0)",
  },
  sidebarClosed: {
    transform: "translateX(-100%)",
  },
  sidebarHeader: {
    padding: "20px",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  sidebarTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
  },
  closeBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    fontSize: "20px",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  nav: {
    flex: 1,
    padding: "20px 0",
    overflowY: "auto",
  },
  menuItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px 20px",
    background: "transparent",
    border: "none",
    borderLeft: "4px solid transparent",
    cursor: "pointer",
    fontSize: "16px",
    color: "#333",
    transition: "all 0.3s",
    textAlign: "left",
  },
  menuItemActive: {
    background: "#f0f4ff",
    borderLeftColor: "#667eea",
    color: "#667eea",
    fontWeight: "600",
  },
  menuIcon: {
    fontSize: "20px",
  },
  menuLabel: {
    flex: 1,
  },
  sidebarFooter: {
    padding: "20px",
    borderTop: "1px solid #e0e0e0",
    textAlign: "center",
  },
  footerText: {
    margin: 0,
    color: "#666",
    fontSize: "14px",
  },
};

