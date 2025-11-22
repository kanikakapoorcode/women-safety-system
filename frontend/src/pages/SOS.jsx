import { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function SOS() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get location on component mount
  useEffect(() => {
    fetchLocation();
  }, []);

  // Get live location
  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocation(coords);
        setStatus("Location fetched successfully");
      },
      (err) => {
        setStatus("Unable to access location. Please enable location services.");
        console.error("Location error:", err);
      }
    );
  };

  // Send SOS alert
  const sendSOS = async () => {
    if (!location) {
      setStatus("Please fetch location first");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("Please login first");
      navigate("/login");
      return;
    }

    setLoading(true);
    setStatus("Sending SOS alert...");

    try {
      const res = await api.post("/sos/send", { location }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStatus(`✅ ${res.data.message}`);
      setLoading(false);
      
      // Navigate to live tracking after successful SOS
      if (res.data.alertId) {
        setTimeout(() => {
          navigate("/live-tracking", { 
            state: { alertId: res.data.alertId } 
          });
        }, 2000);
      }
    } catch (err) {
      setStatus(
        err.response?.data?.error || 
        "Failed to send SOS alert. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🚨 SOS Emergency</h2>
        <p style={styles.description}>
          Use this page to send an emergency SOS alert with your location
        </p>

        <button 
          style={styles.locationBtn} 
          onClick={fetchLocation}
          disabled={loading}
        >
          📍 Get My Location
        </button>

        {location && (
          <div style={styles.locationInfo}>
            <p>
              <strong>Latitude:</strong> {location.lat.toFixed(6)}
            </p>
            <p>
              <strong>Longitude:</strong> {location.lng.toFixed(6)}
            </p>
          </div>
        )}

        <button 
          style={{
            ...styles.sosBtn,
            ...((!location || loading) && styles.sosBtnDisabled)
          }} 
          onClick={sendSOS}
          disabled={!location || loading}
        >
          {loading ? "Sending..." : "🚨 SEND SOS ALERT"}
        </button>

        {status && (
          <p style={styles.status}>{status}</p>
        )}

        <button 
          style={styles.backBtn} 
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "30px",
    borderRadius: "15px",
    background: "white",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
  },
  title: {
    color: "#e74c3c",
    marginBottom: "10px",
    fontSize: "28px",
  },
  description: {
    color: "#666",
    marginBottom: "25px",
    fontSize: "14px",
  },
  locationBtn: {
    width: "100%",
    padding: "12px",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "8px",
    margin: "10px 0",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
  },
  locationInfo: {
    background: "#f8f9fa",
    padding: "15px",
    borderRadius: "8px",
    margin: "15px 0",
    textAlign: "left",
  },
  sosBtn: {
    width: "100%",
    padding: "15px",
    background: "#e74c3c",
    color: "white",
    fontSize: "18px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    marginTop: "20px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(231, 76, 60, 0.3)",
    transition: "all 0.3s",
  },
  sosBtnDisabled: {
    background: "#ccc",
    cursor: "not-allowed",
    boxShadow: "none",
    opacity: 0.6,
  },
  status: {
    marginTop: "20px",
    padding: "10px",
    borderRadius: "5px",
    fontSize: "14px",
  },
  backBtn: {
    width: "100%",
    padding: "10px",
    background: "transparent",
    color: "#666",
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginTop: "15px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

