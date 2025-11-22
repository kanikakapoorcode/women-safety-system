import { useState } from "react";
import api from "../utils/api";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e?.preventDefault();

    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      setMessage("⚠️ Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setMessage("⚠️ Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("⚠️ Passwords do not match");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("⚠️ Please enter a valid email address");
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(phone)) {
      setMessage("⚠️ Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/signup", {
        name,
        email,
        phone,
        password,
      });

      setMessage("✅ " + res.data.message);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
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

  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6) return { strength: 1, label: "Weak", color: "#e74c3c" };
    if (password.length < 10) return { strength: 2, label: "Medium", color: "#f39c12" };
    return { strength: 3, label: "Strong", color: "#2ecc71" };
  };

  const passwordStrength = getPasswordStrength();

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
            <h1 style={styles.title}>Create Account</h1>
            <p style={styles.subtitle}>Join us to stay safe and protected</p>
          </div>
        </div>

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>👤</span>
              Full Name
            </label>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

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
              <span style={styles.labelIcon}>📱</span>
              Phone Number
            </label>
            <input
              style={styles.input}
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
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
            {password && (
              <div style={styles.passwordStrength}>
                <div style={styles.strengthBar}>
                  <div
                    style={{
                      ...styles.strengthFill,
                      width: `${(passwordStrength.strength / 3) * 100}%`,
                      background: passwordStrength.color,
                    }}
                  ></div>
                </div>
                <span
                  style={{
                    ...styles.strengthLabel,
                    color: passwordStrength.color,
                  }}
                >
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🔒</span>
              Confirm Password
            </label>
            <div style={styles.passwordContainer}>
              <input
                style={{
                  ...styles.passwordInput,
                  ...(confirmPassword &&
                    password !== confirmPassword &&
                    styles.inputError),
                }}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                style={styles.eyeButton}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <span style={styles.errorText}>Passwords do not match</span>
            )}
            {confirmPassword && password === confirmPassword && (
              <span style={styles.successText}>✓ Passwords match</span>
            )}
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
                Creating Account...
              </>
            ) : (
              "Create Account"
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
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Sign In
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
    maxWidth: "500px",
    background: "white",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    zIndex: 1,
    position: "relative",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
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
    gap: "18px",
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
  inputError: {
    borderColor: "#e74c3c",
    background: "#fff5f5",
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
  passwordStrength: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "5px",
  },
  strengthBar: {
    flex: 1,
    height: "4px",
    background: "#e0e0e0",
    borderRadius: "2px",
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    transition: "all 0.3s",
    borderRadius: "2px",
  },
  strengthLabel: {
    fontSize: "12px",
    fontWeight: 600,
    minWidth: "50px",
  },
  errorText: {
    fontSize: "12px",
    color: "#e74c3c",
    marginTop: "5px",
  },
  successText: {
    fontSize: "12px",
    color: "#2ecc71",
    marginTop: "5px",
  },
  submitButton: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(46,204,113,0.3)",
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
