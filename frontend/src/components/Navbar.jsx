import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserInfo();
    }
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await api.get("/users/profile");
      setUserName(res.data.name || "User");
    } catch (err) {
      console.error("Error fetching user info:", err);
      setUserName("User");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navLeft}>
        <button style={styles.menuBtn} onClick={onMenuClick}>
          ☰
        </button>
        <h1 style={styles.logo}>🛡️ Women Safety</h1>
      </div>
      <div style={styles.navRight}>
        <span style={styles.userName}>👤 {userName}</span>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 25px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  menuBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    fontSize: "24px",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  logo: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "600",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "500",
  },
  logoutBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "white",
    padding: "8px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background 0.3s",
  },
};

