import { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket, getSocket } from "../utils/socket";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
    
    // Set up socket.io for real-time updates
    const setupSocket = async () => {
      try {
        const userRes = await api.get("/users/profile");
        setUserId(userRes.data._id);
        const socket = connectSocket(userRes.data._id, userRes.data.role);
        
        // Listen for new alerts
        socket.on('new-alert', (data) => {
          console.log('🔔 New alert received:', data);
          fetchAlerts(); // Refresh alerts list
        });
        
        // Listen for resolved alerts
        socket.on('alert-resolved', (data) => {
          console.log('✅ Alert resolved:', data);
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
    
    // Auto-refresh every 30 seconds for new alerts (fallback)
    const interval = setInterval(fetchAlerts, 30000);
    
    return () => {
      clearInterval(interval);
      disconnectSocket();
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      setError("");
      let response;
      
      // Try to get user info first to determine role
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch alerts based on user role
      // First try guardian alerts, then all alerts (admin), then my alerts
      try {
        response = await api.get("/alerts/guardian-alerts");
        setUserRole("guardian");
        setAlerts(response.data);
      } catch (guardianErr) {
        try {
          response = await api.get("/alerts/all-alerts");
          setUserRole("admin");
          setAlerts(response.data);
        } catch (adminErr) {
          // If not guardian or admin, show user's own alerts
          response = await api.get("/alerts/my-alerts");
          setUserRole("user");
          setAlerts(response.data);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching alerts:", err);
      setError(
        err.response?.data?.message || 
        "Failed to load alerts. Please try again."
      );
      setLoading(false);
      
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await api.put(`/alerts/resolve/${alertId}`);
      // Refresh alerts after resolving
      fetchAlerts();
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

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2>🚨 SOS Alerts</h2>
          <button style={styles.refreshBtn} onClick={fetchAlerts}>
            🔄 Refresh
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {userRole !== "user" && (
          <p style={styles.info}>
            {userRole === "admin" 
              ? "Viewing all alerts (Admin)" 
              : "Viewing alerts from users you're guardian for"}
          </p>
        )}

        {alerts.length === 0 ? (
          <div style={styles.emptyState}>
            <p>📭 No active alerts</p>
            <p style={styles.emptySubtext}>
              {userRole === "user" 
                ? "You haven't sent any SOS alerts yet" 
                : "No alerts from your users"}
            </p>
          </div>
        ) : (
          <div style={styles.alertsList}>
            {alerts.map((alert) => (
              <div 
                key={alert._id} 
                style={{
                  ...styles.alertCard,
                  ...(alert.status === "resolved" && styles.resolvedCard)
                }}
              >
                <div style={styles.alertHeader}>
                  <div>
                    <h3 style={styles.alertTitle}>
                      {alert.status === "active" ? "🚨 Active Alert" : "✅ Resolved"}
                    </h3>
                    {alert.userId && (
                      <p style={styles.alertUser}>
                        From: {alert.userId.name || "Unknown User"}
                        {alert.userId.phone && ` (${alert.userId.phone})`}
                      </p>
                    )}
                  </div>
                  {alert.status === "active" && userRole !== "user" && (
                    <button
                      style={styles.resolveBtn}
                      onClick={() => resolveAlert(alert._id)}
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>

                <p style={styles.alertMessage}>{alert.message}</p>

                {alert.location && alert.location.lat && alert.location.lng && (
                  <div style={styles.locationSection}>
                    <p style={styles.locationText}>
                      📍 Location: {alert.location.lat.toFixed(6)}, {alert.location.lng.toFixed(6)}
                    </p>
                    <button
                      style={styles.mapBtn}
                      onClick={() => openLocationInMaps(alert.location.lat, alert.location.lng)}
                    >
                      Open in Google Maps
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
        )}

        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
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
    maxWidth: "800px",
    margin: "0 auto",
    padding: "25px",
    borderRadius: "15px",
    background: "white",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  refreshBtn: {
    padding: "8px 15px",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
  info: {
    padding: "10px",
    background: "#e8f4f8",
    borderRadius: "5px",
    marginBottom: "20px",
    fontSize: "14px",
    color: "#2c3e50",
  },
  error: {
    color: "#e74c3c",
    padding: "10px",
    background: "#fdf2f2",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#7f8c8d",
  },
  emptySubtext: {
    marginTop: "10px",
    fontSize: "14px",
  },
  alertsList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  alertCard: {
    padding: "20px",
    border: "2px solid #e74c3c",
    borderRadius: "10px",
    background: "#fff5f5",
  },
  resolvedCard: {
    border: "2px solid #2ecc71",
    background: "#f0fff4",
    opacity: 0.8,
  },
  alertHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
  },
  alertTitle: {
    margin: 0,
    color: "#e74c3c",
    fontSize: "18px",
  },
  alertUser: {
    margin: "5px 0 0 0",
    fontSize: "14px",
    color: "#555",
    fontWeight: "500",
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
    fontSize: "15px",
    color: "#333",
  },
  locationSection: {
    margin: "15px 0",
    padding: "10px",
    background: "#f8f9fa",
    borderRadius: "5px",
  },
  locationText: {
    margin: "0 0 10px 0",
    fontSize: "14px",
    color: "#555",
  },
  mapBtn: {
    padding: "8px 15px",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
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
  backBtn: {
    width: "100%",
    padding: "10px",
    background: "transparent",
    color: "#666",
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginTop: "20px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

