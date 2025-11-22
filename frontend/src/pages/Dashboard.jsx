import { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("");
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  // Check authentication and fetch user info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUserInfo();
    fetchAlertHistory();
  }, [navigate]);

  const fetchUserInfo = async () => {
    try {
      const res = await api.get("/users/profile");
      setUserInfo(res.data);
    } catch (err) {
      console.error("Error fetching user info:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  // Get live location
  const fetchLocation = () => {
    if (!navigator.geolocation) {
      return setStatus("Geolocation not supported");
    }

    setStatus("Fetching location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocation(coords);
        setStatus("✅ Location fetched successfully");
      },
      () => {
        setStatus("❌ Unable to access location");
      }
    );
  };

  // Fetch alert history
  const fetchAlertHistory = async () => {
    try {
      setLoadingAlerts(true);
      const res = await api.get("/alerts/my-alerts");
      setRecentAlerts(res.data.slice(0, 3));
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  // Send SOS alert
  const sendSOS = async () => {
    if (!location) {
      setStatus("⚠️ Please fetch location first");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("Please login first");
      navigate("/login");
      return;
    }

    setStatus("Sending SOS alert...");

    try {
      const res = await api.post("/sos/send", { location });

      setStatus(`✅ ${res.data.message || "SOS alert sent successfully!"}`);

      // Refresh alert history after sending SOS
      fetchAlertHistory();

      // Navigate to live tracking page
      setTimeout(() => {
        navigate("/live-tracking", {
          state: { alertId: res.data.alertId },
        });
      }, 2000);
    } catch (err) {
      console.error("SOS Error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to send SOS";
      setStatus(`❌ ${errorMsg}`);

      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        setTimeout(() => navigate("/login"), 2000);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={styles.appContainer}>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main style={styles.mainContent}>
        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>
            Welcome back, {userInfo?.name || "User"}! 👋
          </h1>
          <p style={styles.welcomeSubtitle}>
            Your safety is our priority. Stay connected and protected.
          </p>
        </div>

        {/* Quick Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📬</div>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>{recentAlerts.length}</div>
              <div style={styles.statLabel}>Recent Alerts</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>
                {userInfo?.guardians?.length || 0}
              </div>
              <div style={styles.statLabel}>Guardians</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              {location ? "✅" : "📍"}
            </div>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>
                {location ? "Ready" : "Not Set"}
              </div>
              <div style={styles.statLabel}>Location Status</div>
            </div>
          </div>
        </div>

        {/* SOS Section */}
        <div style={styles.sosSection}>
          <h2 style={styles.sectionTitle}>🚨 Emergency SOS</h2>
          <div style={styles.sosCard}>
            {!location ? (
              <div style={styles.locationPrompt}>
                <p style={styles.promptText}>
                  First, get your current location to enable SOS alerts
                </p>
                <button style={styles.locationBtn} onClick={fetchLocation}>
                  📍 Get My Location
                </button>
              </div>
            ) : (
              <div style={styles.locationReady}>
                <div style={styles.locationInfo}>
                  <p style={styles.locationLabel}>📍 Current Location:</p>
                  <p style={styles.coordinates}>
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                </div>
                <button style={styles.sosBtn} onClick={sendSOS}>
                  🚨 SEND SOS ALERT
                </button>
                <button
                  style={styles.updateLocationBtn}
                  onClick={fetchLocation}
                >
                  🔄 Update Location
                </button>
              </div>
            )}

            {status && (
              <div
                style={{
                  ...styles.statusMessage,
                  ...(status.includes("✅")
                    ? styles.successStatus
                    : status.includes("❌")
                    ? styles.errorStatus
                    : styles.infoStatus),
                }}
              >
                {status}
              </div>
            )}
          </div>
        </div>

        {/* Recent Alerts Section */}
        <div style={styles.alertsSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📋 Recent Alerts</h2>
            <button
              style={styles.viewAllBtn}
              onClick={() => navigate("/alerts")}
            >
              View All →
            </button>
          </div>

          {loadingAlerts ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading alerts...</p>
            </div>
          ) : recentAlerts.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <p style={styles.emptyText}>No alerts yet</p>
              <p style={styles.emptySubtext}>
                Your SOS alerts will appear here
              </p>
            </div>
          ) : (
            <div style={styles.alertsGrid}>
              {recentAlerts.map((alert) => (
                <div
                  key={alert._id}
                  style={{
                    ...styles.alertCard,
                    ...(alert.status === "active"
                      ? styles.activeAlertCard
                      : styles.resolvedAlertCard),
                  }}
                >
                  <div style={styles.alertHeader}>
                    <span style={styles.alertStatus}>
                      {alert.status === "active" ? "🚨 Active" : "✅ Resolved"}
                    </span>
                    <span style={styles.alertTime}>
                      {formatDate(alert.createdAt)}
                    </span>
                  </div>
                  {alert.location && (
                    <div style={styles.alertLocation}>
                      <p style={styles.locationCoords}>
                        📍 {alert.location.lat.toFixed(4)},{" "}
                        {alert.location.lng.toFixed(4)}
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${alert.location.lat},${alert.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.mapLink}
                      >
                        View Map
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={styles.quickActions}>
          <h2 style={styles.sectionTitle}>⚡ Quick Actions</h2>
          <div style={styles.actionsGrid}>
            <button
              style={styles.actionCard}
              onClick={() => navigate("/sos")}
            >
              <div style={styles.actionIcon}>🚨</div>
              <div style={styles.actionLabel}>SOS Page</div>
            </button>
            <button
              style={styles.actionCard}
              onClick={() => navigate("/alerts")}
            >
              <div style={styles.actionIcon}>📬</div>
              <div style={styles.actionLabel}>All Alerts</div>
            </button>
            <button
              style={styles.actionCard}
              onClick={() => navigate("/guardians")}
            >
              <div style={styles.actionIcon}>👥</div>
              <div style={styles.actionLabel}>Guardians</div>
            </button>
            <button
              style={styles.actionCard}
              onClick={() => navigate("/live-tracking")}
            >
              <div style={styles.actionIcon}>📍</div>
              <div style={styles.actionLabel}>Live Tracking</div>
            </button>
            {userInfo?.role === "admin" && (
              <button
                style={styles.actionCard}
                onClick={() => navigate("/admin")}
              >
                <div style={styles.actionIcon}>🔐</div>
                <div style={styles.actionLabel}>Admin Panel</div>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  appContainer: {
    minHeight: "100vh",
    background: "#f5f7fa",
    display: "flex",
    flexDirection: "column",
  },
  mainContent: {
    flex: 1,
    padding: "30px",
    marginTop: "70px",
    maxWidth: "1400px",
    width: "100%",
    margin: "70px auto 0",
  },
  welcomeSection: {
    marginBottom: "30px",
  },
  welcomeTitle: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#2c3e50",
    margin: "0 0 10px 0",
  },
  welcomeSubtitle: {
    fontSize: "16px",
    color: "#7f8c8d",
    margin: 0,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    background: "white",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  statIcon: {
    fontSize: "40px",
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#2c3e50",
    marginBottom: "5px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#7f8c8d",
  },
  sosSection: {
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: 600,
    color: "#2c3e50",
    margin: "0 0 20px 0",
  },
  sosCard: {
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  locationPrompt: {
    textAlign: "center",
    padding: "20px",
  },
  promptText: {
    fontSize: "16px",
    color: "#7f8c8d",
    marginBottom: "20px",
  },
  locationBtn: {
    padding: "15px 30px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(102,126,234,0.3)",
    transition: "transform 0.2s",
  },
  locationReady: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  locationInfo: {
    padding: "15px",
    background: "#f0f4ff",
    borderRadius: "12px",
    border: "1px solid #e0e7ff",
  },
  locationLabel: {
    fontSize: "14px",
    color: "#667eea",
    fontWeight: 600,
    margin: "0 0 8px 0",
  },
  coordinates: {
    fontSize: "16px",
    color: "#2c3e50",
    fontFamily: "monospace",
    margin: 0,
  },
  sosBtn: {
    padding: "20px",
    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    fontSize: "20px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 25px rgba(255,107,107,0.4)",
    transition: "transform 0.2s",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  updateLocationBtn: {
    padding: "12px 24px",
    background: "#e0e7ff",
    color: "#667eea",
    border: "1px solid #c7d2fe",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  statusMessage: {
    padding: "15px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 500,
    marginTop: "15px",
  },
  successStatus: {
    background: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
  },
  errorStatus: {
    background: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
  },
  infoStatus: {
    background: "#d1ecf1",
    color: "#0c5460",
    border: "1px solid #bee5eb",
  },
  alertsSection: {
    marginBottom: "30px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  viewAllBtn: {
    background: "transparent",
    border: "none",
    color: "#667eea",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    padding: "8px 0",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "15px",
    fontSize: "14px",
    color: "#7f8c8d",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  emptyIcon: {
    fontSize: "60px",
    marginBottom: "15px",
  },
  emptyText: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#2c3e50",
    margin: "0 0 8px 0",
  },
  emptySubtext: {
    fontSize: "14px",
    color: "#7f8c8d",
    margin: 0,
  },
  alertsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  alertCard: {
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "transform 0.2s",
  },
  activeAlertCard: {
    background: "linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%)",
    border: "2px solid #ff6b6b",
  },
  resolvedAlertCard: {
    background: "linear-gradient(135deg, #f0fff4 0%, #e0ffe0 100%)",
    border: "2px solid #2ecc71",
  },
  alertHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  alertStatus: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#2c3e50",
  },
  alertTime: {
    fontSize: "12px",
    color: "#7f8c8d",
  },
  alertLocation: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },
  locationCoords: {
    fontSize: "13px",
    color: "#555",
    fontFamily: "monospace",
    margin: 0,
    flex: 1,
  },
  mapLink: {
    padding: "6px 12px",
    background: "#667eea",
    color: "white",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    textDecoration: "none",
    transition: "background 0.2s",
  },
  quickActions: {
    marginBottom: "30px",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "15px",
  },
  actionCard: {
    background: "white",
    padding: "25px 20px",
    borderRadius: "16px",
    border: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  actionIcon: {
    fontSize: "32px",
  },
  actionLabel: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#2c3e50",
  },
};

