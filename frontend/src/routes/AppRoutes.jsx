import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import SOS from "../pages/SOS";
import Alerts from "../pages/Alerts";
import Guardians from "../pages/Guardians";
import AdminDashboard from "../pages/AdminDashboard";
import LiveTracking from "../pages/LiveTracking";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/sos" element={<SOS />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/guardians" element={<Guardians />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/live-tracking" element={<LiveTracking />} />
    </Routes>
  );
}
