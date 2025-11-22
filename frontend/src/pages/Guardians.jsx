import { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Guardians() {
  const [guardians, setGuardians] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchGuardians();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length >= 3) {
      const timer = setTimeout(() => {
        searchUsers();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const fetchGuardians = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/users/guardians");
      setGuardians(res.data);
    } catch (err) {
      console.error("Error fetching guardians:", err);
      setError("Failed to load guardians");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (searchQuery.length < 3) return;

    try {
      setSearchLoading(true);
      const res = await api.get(`/users/search?query=${encodeURIComponent(searchQuery)}`);
      
      // Filter out users who are already guardians
      const guardianIds = guardians.map(g => g._id || g.id);
      const filtered = res.data.filter(
        user => !guardianIds.includes(user._id.toString())
      );
      setSearchResults(filtered);
    } catch (err) {
      console.error("Error searching users:", err);
      setError("Failed to search users");
    } finally {
      setSearchLoading(false);
    }
  };

  const addGuardian = async (userId) => {
    try {
      setMessage("");
      setError("");
      await api.post("/users/guardians", { guardianId: userId });
      setMessage("Guardian added successfully!");
      setSearchQuery("");
      setSearchResults([]);
      fetchGuardians();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to add guardian";
      setError(errorMsg);
    }
  };

  const removeGuardian = async (guardianId) => {
    if (!window.confirm("Are you sure you want to remove this guardian?")) {
      return;
    }

    try {
      setMessage("");
      setError("");
      await api.delete(`/users/guardians/${guardianId}`);
      setMessage("Guardian removed successfully!");
      fetchGuardians();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to remove guardian";
      setError(errorMsg);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2>👥 Manage Guardians</h2>
          <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
            ← Back
          </button>
        </div>

        <p style={styles.description}>
          Add trusted contacts who will be notified when you send an SOS alert.
        </p>

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}

        {/* Search Section */}
        <div style={styles.searchSection}>
          <h3>Add New Guardian</h3>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchLoading && <p style={styles.loadingText}>Searching...</p>}

          {searchResults.length > 0 && (
            <div style={styles.searchResults}>
              {searchResults.map((user) => (
                <div key={user._id} style={styles.searchResultItem}>
                  <div style={styles.userInfo}>
                    <p style={styles.userName}>{user.name}</p>
                    {user.email && <p style={styles.userDetail}>📧 {user.email}</p>}
                    {user.phone && <p style={styles.userDetail}>📱 {user.phone}</p>}
                  </div>
                  <button
                    style={styles.addBtn}
                    onClick={() => addGuardian(user._id)}
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchQuery.length >= 3 && searchResults.length === 0 && !searchLoading && (
            <p style={styles.noResults}>No users found</p>
          )}
        </div>

        {/* Current Guardians List */}
        <div style={styles.guardiansSection}>
          <h3>My Guardians ({guardians.length})</h3>
          {loading ? (
            <p style={styles.loadingText}>Loading...</p>
          ) : guardians.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No guardians added yet</p>
              <p style={styles.emptySubtext}>
                Search above to add guardians who will receive SOS notifications
              </p>
            </div>
          ) : (
            <div style={styles.guardiansList}>
              {guardians.map((guardian) => (
                <div key={guardian._id || guardian.id} style={styles.guardianItem}>
                  <div style={styles.guardianInfo}>
                    <p style={styles.guardianName}>{guardian.name}</p>
                    {guardian.email && (
                      <p style={styles.guardianDetail}>📧 {guardian.email}</p>
                    )}
                    {guardian.phone && (
                      <p style={styles.guardianDetail}>📱 {guardian.phone}</p>
                    )}
                  </div>
                  <button
                    style={styles.removeBtn}
                    onClick={() => removeGuardian(guardian._id || guardian.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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
    maxWidth: "700px",
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
    marginBottom: "10px",
  },
  description: {
    color: "#666",
    marginBottom: "25px",
    fontSize: "14px",
  },
  success: {
    color: "#2ecc71",
    padding: "10px",
    background: "#f0fff4",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  error: {
    color: "#e74c3c",
    padding: "10px",
    background: "#fdf2f2",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  searchSection: {
    marginBottom: "30px",
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "10px",
  },
  searchInput: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "16px",
    boxSizing: "border-box",
  },
  searchResults: {
    marginTop: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  searchResultItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    background: "white",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    margin: "0 0 5px 0",
    fontWeight: "600",
    fontSize: "15px",
  },
  userDetail: {
    margin: "3px 0",
    fontSize: "13px",
    color: "#666",
  },
  addBtn: {
    padding: "8px 20px",
    background: "#2ecc71",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  guardiansSection: {
    marginTop: "20px",
  },
  guardiansList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "15px",
  },
  guardianItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },
  guardianInfo: {
    flex: 1,
  },
  guardianName: {
    margin: "0 0 5px 0",
    fontWeight: "600",
    fontSize: "15px",
  },
  guardianDetail: {
    margin: "3px 0",
    fontSize: "13px",
    color: "#666",
  },
  removeBtn: {
    padding: "8px 20px",
    background: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    fontSize: "14px",
    marginTop: "10px",
  },
  noResults: {
    textAlign: "center",
    color: "#999",
    fontSize: "14px",
    marginTop: "10px",
    fontStyle: "italic",
  },
  emptyState: {
    textAlign: "center",
    padding: "30px 20px",
    color: "#999",
  },
  emptySubtext: {
    marginTop: "10px",
    fontSize: "13px",
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
};

