import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={styles.appContainer}>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main style={styles.mainContent}>{children}</main>
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
};

