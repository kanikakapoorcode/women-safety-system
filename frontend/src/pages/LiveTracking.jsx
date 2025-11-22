import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { useNavigate, useLocation } from "react-router-dom";

export default function LiveTracking() {
  const navigate = useNavigate();
  const locationState = useLocation();
  const alertId = locationState.state?.alertId;
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const watchIdRef = useRef(null);
  const updateIntervalRef = useRef(null);

  useEffect(() => {
    // Start tracking if we have an alert ID
    if (alertId) {
      startTracking();
    }
    return () => {
      stopTracking();
    };
  }, [alertId]);

  const startTracking = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }

    setIsTracking(true);
    setStatus("Starting live tracking...");

    // Get initial location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: new Date(),
        };
        setCurrentLocation(coords);
        setLocationHistory([coords]);
        updateLocationOnServer(coords);
      },
      (err) => {
        setError("Unable to access location: " + err.message);
        setIsTracking(false);
      }
    );

    // Watch position for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: new Date(),
        };
        setCurrentLocation(coords);
        setLocationHistory(prev => [...prev, coords].slice(-10)); // Keep last 10 locations
      },
      (err) => {
        setError("Location tracking error: " + err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    // Update server every 10 seconds
    updateIntervalRef.current = setInterval(() => {
      if (currentLocation) {
        updateLocationOnServer(currentLocation);
      }
    }, 10000);

    setStatus("✅ Live tracking active - Location updating every 10 seconds");
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    setIsTracking(false);
    setStatus("Tracking stopped");
  };

  const updateLocationOnServer = async (coords) => {
    try {
      if (!alertId) return;
      
      await api.put("/alerts/update-location", {
        lat: coords.lat,
        lng: coords.lng,
      });

      setStatus(`📍 Location updated: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
    } catch (err) {
      console.error("Error updating location:", err);
      // Don't show error to user, just log it
    }
  };

  const openLocationInMaps = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2>📍 Live Location Tracking</h2>
          <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
            ← Back
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}
        {status && <p style={styles.status}>{status}</p>}

        {!alertId ? (
          <div style={styles.emptyState}>
            <p>No active alert to track</p>
            <p style={styles.emptySubtext}>
              Send an SOS alert first to start live tracking
            </p>
            <button
              style={styles.sosBtn}
              onClick={() => navigate("/sos")}
            >
              Go to SOS Page
            </button>
          </div>
        ) : (
          <>
            {/* Current Location */}
            {currentLocation && (
              <div style={styles.locationCard}>
                <h3 style={styles.locationTitle}>📍 Current Location</h3>
                <div style={styles.locationInfo}>
                  <p style={styles.coordinates}>
                    <strong>Latitude:</strong> {currentLocation.lat.toFixed(6)}
                  </p>
                  <p style={styles.coordinates}>
                    <strong>Longitude:</strong> {currentLocation.lng.toFixed(6)}
                  </p>
                  <p style={styles.timeStamp}>
                    Last updated: {currentLocation.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <button
                  style={styles.mapBtn}
                  onClick={() => openLocationInMaps(currentLocation.lat, currentLocation.lng)}
                >
                  🗺️ View on Google Maps
                </button>
              </div>
            )}

            {/* Tracking Status */}
            <div style={styles.trackingStatus}>
              <div style={styles.statusIndicator}>
                <div
                  style={{
                    ...styles.statusDot,
                    background: isTracking ? "#2ecc71" : "#e74c3c",
                  }}
                />
                <span style={styles.statusText}>
                  {isTracking ? "Tracking Active" : "Tracking Stopped"}
                </span>
              </div>
              {isTracking && (
                <button style={styles.stopBtn} onClick={stopTracking}>
                  Stop Tracking
                </button>
              )}
            </div>

            {/* Location History */}
            {locationHistory.length > 0 && (
              <div style={styles.historySection}>
                <h3 style={styles.historyTitle}>Location History</h3>
                <p style={styles.historySubtext}>
                  Last {locationHistory.length} location updates
                </p>
                <div style={styles.historyList}>
                  {locationHistory.slice().reverse().map((loc, index) => (
                    <div key={index} style={styles.historyItem}>
                      <span style={styles.historyCoords}>
                        {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                      </span>
                      <span style={styles.historyTime}>
                        {loc.timestamp.toLocaleTimeString()}
                      </span>
                      <button
                        style={styles.historyMapBtn}
                        onClick={() => openLocationInMaps(loc.lat, loc.lng)}
                      >
                        Map
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div style={styles.instructions}>
              <h4>ℹ️ How it works:</h4>
              <ul style={styles.instructionsList}>
                <li>Your location is being tracked and updated every 10 seconds</li>
                <li>Guardians and admins can see your real-time location</li>
                <li>Location updates are sent to the server automatically</li>
                <li>You can view your location history below</li>
                <li>Click "View on Google Maps" to see your exact location</li>
              </ul>
            </div>
          </>
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
    maxWidth: "800px",
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
    marginBottom: "15px",
  },
  status: {
    color: "#2ecc71",
    padding: "10px",
    background: "#f0fff4",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  locationCard: {
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "10px",
    marginBottom: "20px",
    border: "2px solid #3498db",
  },
  locationTitle: {
    margin: "0 0 15px 0",
    color: "#3498db",
  },
  locationInfo: {
    marginBottom: "15px",
  },
  coordinates: {
    margin: "8px 0",
    fontSize: "15px",
    color: "#333",
  },
  timeStamp: {
    margin: "8px 0",
    fontSize: "13px",
    color: "#666",
    fontStyle: "italic",
  },
  mapBtn: {
    width: "100%",
    padding: "12px",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
  },
  trackingStatus: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  statusIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  statusDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    animation: "pulse 2s infinite",
  },
  statusText: {
    fontSize: "14px",
    fontWeight: "500",
  },
  stopBtn: {
    padding: "8px 20px",
    background: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  historySection: {
    marginTop: "20px",
  },
  historyTitle: {
    margin: "0 0 10px 0",
    fontSize: "18px",
  },
  historySubtext: {
    margin: "0 0 15px 0",
    fontSize: "13px",
    color: "#666",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "200px",
    overflowY: "auto",
  },
  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    background: "#f8f9fa",
    borderRadius: "6px",
    fontSize: "13px",
  },
  historyCoords: {
    flex: 1,
    fontFamily: "monospace",
  },
  historyTime: {
    fontSize: "12px",
    color: "#666",
    marginRight: "10px",
  },
  historyMapBtn: {
    padding: "4px 10px",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
  },
  instructions: {
    marginTop: "25px",
    padding: "15px",
    background: "#e8f4f8",
    borderRadius: "8px",
  },
  instructionsList: {
    margin: "10px 0 0 20px",
    fontSize: "14px",
    color: "#555",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#999",
  },
  emptySubtext: {
    margin: "10px 0 20px 0",
    fontSize: "14px",
  },
  sosBtn: {
    padding: "12px 30px",
    background: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

