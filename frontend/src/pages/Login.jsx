import { useState } from "react";
import api from "../utils/api";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();

    if (!email || !password) {
      setMessage("⚠️ Please fill in all fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      setMessage("✅ " + res.data.message);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setMessage("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundDecoration}>
        <div style={styles.circle1}></div>
        <div style={styles.circle2}></div>
        <div style={styles.circle3}></div>
      </div>

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>🛡️</div>
            <h1 style={styles.title}>Welcome Back</h1>
            <p style={styles.subtitle}>Sign in to your account</p>
          </div>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>📧</span>
              Email Address
            </label>
            <input
              style={styles.input}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🔒</span>
              Password
            </label>
            <div style={styles.passwordContainer}>
              <input
                style={styles.passwordInput}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                style={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              ...(loading && styles.submitButtonDisabled),
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={styles.spinner}></span>
                Logging in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {message && (
          <div
            style={{
              ...styles.messageBox,
              ...(message.includes("✅")
                ? styles.successMessage
                : styles.errorMessage),
            }}
          >
            {message}
          </div>
        )}

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.link}>
              Create Account
            </Link>
          </p>
        </div>

        <div style={styles.features}>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🚨</span>
            <span style={styles.featureText}>Emergency SOS</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>📍</span>
            <span style={styles.featureText}>Live Tracking</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>👥</span>
            <span style={styles.featureText}>Guardian Network</span>
          </div>
        </div>
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
    position: "relative",
    overflow: "hidden",
  },
  backgroundDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    zIndex: 0,
  },
  circle1: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.1)",
    top: "-100px",
    right: "-100px",
    animation: "float 6s ease-in-out infinite",
  },
  circle2: {
    position: "absolute",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    bottom: "-50px",
    left: "-50px",
    animation: "float 8s ease-in-out infinite",
  },
  circle3: {
    position: "absolute",
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    top: "50%",
    left: "10%",
    animation: "float 10s ease-in-out infinite",
  },
  card: {
    width: "100%",
    maxWidth: "450px",
    background: "white",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    zIndex: 1,
    position: "relative",
  },
  header: {
    textAlign: "center",
    marginBottom: "35px",
  },
  logoContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    fontSize: "60px",
    marginBottom: "10px",
  },
  title: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#2c3e50",
    margin: 0,
  },
  subtitle: {
    fontSize: "16px",
    color: "#7f8c8d",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#2c3e50",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  labelIcon: {
    fontSize: "16px",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "2px solid #e0e0e0",
    fontSize: "16px",
    transition: "all 0.3s",
    boxSizing: "border-box",
    background: "#f8f9fa",
  },
  passwordContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  passwordInput: {
    width: "100%",
    padding: "14px 45px 14px 16px",
    borderRadius: "12px",
    border: "2px solid #e0e0e0",
    fontSize: "16px",
    transition: "all 0.3s",
    boxSizing: "border-box",
    background: "#f8f9fa",
  },
  eyeButton: {
    position: "absolute",
    right: "12px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "20px",
    padding: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(102,126,234,0.3)",
    transition: "all 0.3s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginTop: "10px",
  },
  submitButtonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  messageBox: {
    padding: "14px 18px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 500,
    marginTop: "20px",
    textAlign: "center",
  },
  successMessage: {
    background: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
  },
  errorMessage: {
    background: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
  },
  footer: {
    marginTop: "25px",
    textAlign: "center",
  },
  footerText: {
    fontSize: "14px",
    color: "#7f8c8d",
    margin: 0,
  },
  link: {
    color: "#667eea",
    fontWeight: 600,
    textDecoration: "none",
    transition: "color 0.3s",
  },
  features: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "30px",
    paddingTop: "30px",
    borderTop: "1px solid #e0e0e0",
  },
  feature: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  featureIcon: {
    fontSize: "24px",
  },
  featureText: {
    fontSize: "12px",
    color: "#7f8c8d",
    fontWeight: 500,
  },
};
