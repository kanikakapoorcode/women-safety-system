import { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../utils/socket";

export default function AdminDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllAlerts();
    
    // Set up socket.io for real-time updates
    const setupSocket = async () => {
      try {
        const userRes = await api.get("/users/profile");
        const socket = connectSocket(userRes.data._id, 'admin');
        
        // Listen for new alerts
        socket.on('new-alert', (data) => {
          console.log('🔔 New alert received (Admin):', data);
          fetchAllAlerts(); // Refresh alerts list
        });
        
        // Listen for resolved alerts
        socket.on('alert-resolved', (data) => {
          console.log('✅ Alert resolved (Admin):', data);
          setAlerts(prevAlerts => 
            prevAlerts.map(alert => 
              alert._id === data.alert._id ? data.alert : alert
            )
          );
        });
      } catch (err) {
        console.error("Error setting up socket:", err);
      }
    };
    
    setupSocket();
    
    // Auto-refresh every 15 seconds (fallback)
    const interval = setInterval(fetchAllAlerts, 15000);
    
    return () => {
      clearInterval(interval);
      disconnectSocket();
    };
  }, []);

  const fetchAllAlerts = async () => {
    try {
      setError("");
      const response = await api.get("/alerts/all-alerts");
      setAlerts(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching alerts:", err);
      if (err.response?.status === 403) {
        setError("Access denied. Admin role required.");
      } else {
        setError("Failed to load alerts. Please try again.");
      }
      setLoading(false);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await api.put(`/alerts/resolve/${alertId}`);
      fetchAllAlerts();
    } catch (err) {
      console.error("Error resolving alert:", err);
      setError("Failed to resolve alert");
    }
  };

  const openLocationInMaps = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const activeAlerts = alerts.filter(a => a.status === "active");
  const resolvedAlerts = alerts.filter(a => a.status === "resolved");

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2>🔐 Admin Dashboard</h2>
          <div style={styles.headerActions}>
            <button style={styles.refreshBtn} onClick={fetchAllAlerts}>
              🔄 Refresh
            </button>
            <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
              ← Dashboard
            </button>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* Statistics */}
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{alerts.length}</div>
            <div style={styles.statLabel}>Total Alerts</div>
          </div>
          <div style={{...styles.statCard, background: "#fff5f5"}}>
            <div style={{...styles.statNumber, color: "#e74c3c"}}>{activeAlerts.length}</div>
            <div style={styles.statLabel}>Active Alerts</div>
          </div>
          <div style={{...styles.statCard, background: "#f0fff4"}}>
            <div style={{...styles.statNumber, color: "#2ecc71"}}>{resolvedAlerts.length}</div>
            <div style={styles.statLabel}>Resolved</div>
          </div>
        </div>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <div style={styles.emptyState}>
            <p>📭 No alerts in the system</p>
          </div>
        ) : (
          <div style={styles.alertsSection}>
            <h3 style={styles.sectionTitle}>All Alerts ({alerts.length})</h3>
            <div style={styles.alertsList}>
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  style={{
                    ...styles.alertCard,
                    ...(alert.status === "active" ? styles.activeAlertCard : styles.resolvedAlertCard)
                  }}
                >
                  <div style={styles.alertHeader}>
                    <div style={styles.alertInfo}>
                      <h3 style={styles.alertTitle}>
                        {alert.status === "active" ? "🚨 Active" : "✅ Resolved"}
                      </h3>
                      {alert.userId && (
                        <div>
                          <p style={styles.alertUser}>
                            <strong>User:</strong> {alert.userId.name || "Unknown"}
                          </p>
                          {alert.userId.email && (
                            <p style={styles.alertDetail}>📧 {alert.userId.email}</p>
                          )}
                          {alert.userId.phone && (
                            <p style={styles.alertDetail}>📱 {alert.userId.phone}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={styles.alertActions}>
                      <span style={styles.timeAgo}>{getTimeAgo(alert.createdAt)}</span>
                      {alert.status === "active" && (
                        <button
                          style={styles.resolveBtn}
                          onClick={() => resolveAlert(alert._id)}
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={styles.alertMessage}>{alert.message}</p>

                  {alert.location && alert.location.lat && alert.location.lng && (
                    <div style={styles.locationSection}>
                      <p style={styles.locationText}>
                        📍 <strong>Location:</strong> {alert.location.lat.toFixed(6)}, {alert.location.lng.toFixed(6)}
                      </p>
                      <button
                        style={styles.mapBtn}
                        onClick={() => openLocationInMaps(alert.location.lat, alert.location.lng)}
                      >
                        🗺️ View on Google Maps
                      </button>
                    </div>
                  )}

                  {/* Timeline */}
                  <div style={styles.timeline}>
                    <div style={styles.timelineItem}>
                      <span style={styles.timelineLabel}>Created:</span>
                      <span style={styles.timelineValue}>{formatDate(alert.createdAt)}</span>
                    </div>
                    {alert.notifiedAt && (
                      <div style={styles.timelineItem}>
                        <span style={styles.timelineLabel}>Notified:</span>
                        <span style={styles.timelineValue}>{formatDate(alert.notifiedAt)}</span>
                      </div>
                    )}
                    {alert.resolvedAt && (
                      <div style={styles.timelineItem}>
                        <span style={styles.timelineLabel}>Resolved:</span>
                        <span style={styles.timelineValue}>{formatDate(alert.resolvedAt)}</span>
                        {alert.resolvedBy && typeof alert.resolvedBy === 'object' && (
                          <span style={styles.resolvedBy}> by {alert.resolvedBy.name}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  card: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px",
    borderRadius: "15px",
    background: "white",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "15px",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
  },
  refreshBtn: {
    padding: "8px 15px",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  backBtn: {
    padding: "8px 15px",
    background: "transparent",
    color: "#666",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  error: {
    color: "#e74c3c",
    padding: "10px",
    background: "#fdf2f2",
    borderRadius: "5px",
    marginBottom: "20px",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
    marginBottom: "30px",
  },
  statCard: {
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "10px",
    textAlign: "center",
    border: "1px solid #e0e0e0",
  },
  statNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "5px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#666",
  },
  sectionTitle: {
    margin: "0 0 20px 0",
    fontSize: "20px",
    color: "#333",
  },
  alertsSection: {
    marginTop: "20px",
  },
  alertsList: {
    display: "grid",
    gap: "15px",
  },
  alertCard: {
    padding: "20px",
    borderRadius: "10px",
    border: "2px solid",
  },
  activeAlertCard: {
    borderColor: "#e74c3c",
    background: "#fff5f5",
  },
  resolvedAlertCard: {
    borderColor: "#2ecc71",
    background: "#f0fff4",
    opacity: 0.9,
  },
  alertHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
    flexWrap: "wrap",
    gap: "10px",
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    margin: "0 0 10px 0",
    fontSize: "18px",
  },
  alertUser: {
    margin: "5px 0",
    fontSize: "15px",
    color: "#333",
  },
  alertDetail: {
    margin: "3px 0",
    fontSize: "13px",
    color: "#666",
  },
  alertActions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "10px",
  },
  timeAgo: {
    fontSize: "12px",
    color: "#999",
    fontStyle: "italic",
  },
  resolveBtn: {
    padding: "6px 12px",
    background: "#2ecc71",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "12px",
  },
  alertMessage: {
    margin: "10px 0",
    fontSize: "14px",
    color: "#555",
  },
  locationSection: {
    margin: "15px 0",
    padding: "12px",
    background: "#f8f9fa",
    borderRadius: "6px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  locationText: {
    margin: 0,
    fontSize: "14px",
    color: "#555",
  },
  mapBtn: {
    padding: "8px 15px",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  alertTime: {
    margin: "10px 0 0 0",
    fontSize: "12px",
    color: "#7f8c8d",
  },
  timeline: {
    marginTop: "15px",
    paddingTop: "15px",
    borderTop: "1px solid #eee",
  },
  timelineItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    fontSize: "12px",
  },
  timelineLabel: {
    fontWeight: 600,
    color: "#555",
    marginRight: "10px",
  },
  timelineValue: {
    color: "#7f8c8d",
    flex: 1,
    textAlign: "right",
  },
  resolvedBy: {
    color: "#2ecc71",
    fontWeight: 600,
    marginLeft: "5px",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#999",
    fontSize: "16px",
  },
};

