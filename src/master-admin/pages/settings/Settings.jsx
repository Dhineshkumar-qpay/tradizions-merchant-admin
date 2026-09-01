import React from "react";
import {
  User,
  Phone,
  Mail,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import "../../../pages/ListProducts.css";

const Settings = () => {
  const profile = {
    name: "Super Admin",
    phone: "+91 98765 43210",
    email: "admin@tradizions.com",
    role: "Super Administrator",
    department: "Corporate Management",
    lastLogin: "May 06, 2026 - 16:11",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userid");
    toast.info("Logged out successfully!");
    window.location.href = "/login";
  };

  return (
    <div className="list-products-container" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header Panel */}
      <div className="page-header-actions">
        <div>
          <h1>Account Profile</h1>
          <p>Manage and audit your super-administrator security information.</p>
        </div>
      </div>

      {/* Main Two-Column Premium Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px" }}>
        
        {/* Left Column: Visual Avatar Card */}
        <div className="section-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Soft decorative gradient header */}
          <div style={{ height: "120px", background: "linear-gradient(135deg, var(--primary) 0%, #3a5228 100%)", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at top right, rgba(255,255,255,0.15), transparent)" }} />
          </div>

          <div style={{ padding: "0 25px 30px", position: "relative", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Profile Image Circle */}
            <div style={{ 
              marginTop: "-40px", width: "90px", height: "90px", borderRadius: "50%", background: "white", 
              padding: "4px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", zIndex: 1 
            }}>
              <div style={{ 
                width: "100%", height: "100%", borderRadius: "50%", background: "rgba(76, 107, 53, 0.1)", 
                display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", 
                fontSize: "32px", fontWeight: "900", border: "1px solid rgba(76, 107, 53, 0.2)" 
              }}>
                {profile.name.charAt(0)}
              </div>
            </div>

            {/* Basic Meta */}
            <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "900", color: "var(--text-main)", lineHeight: "1" }}>
                {profile.name}
              </h3>
              <span style={{ 
                display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", 
                borderRadius: "12px", background: "rgba(0, 184, 148, 0.1)", fontSize: "11px", 
                fontWeight: "700", color: "#00b894", border: "1px solid rgba(0, 184, 148, 0.2)" 
              }}>
                <CheckCircle2 size={12} /> Verified Admin
              </span>
            </div>

            {/* Quick Logout */}
            <div style={{ marginTop: "30px", width: "100%" }}>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%", padding: "12px", background: "#fff0f0", color: "#d63031", 
                  fontWeight: "bold", fontSize: "13px", borderRadius: "10px", display: "flex", 
                  alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", 
                  border: "1px solid #ffd6d6", transition: "all 0.2s"
                }}
              >
                <LogOut size={16} /> Sign Out from App
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Information details */}
        <div className="section-card" style={{ gridColumn: "span 2" }}>
          <div className="table-controls" style={{ padding: "20px 25px", borderBottom: "1px solid #f0f3ee" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
              <User size={18} style={{ color: "var(--primary)" }} /> Profile Credentials
            </h4>
          </div>

          <div style={{ padding: "25px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
            {/* Full Name */}
            <div style={{ padding: "16px", background: "#f8fbf6", borderRadius: "12px", border: "1px solid #edf2e9" }}>
              <p style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <User size={14} /> Full Name
              </p>
              <p style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-main)" }}>
                {profile.name}
              </p>
            </div>

            {/* Mobile Phone */}
            <div style={{ padding: "16px", background: "#f8fbf6", borderRadius: "12px", border: "1px solid #edf2e9" }}>
              <p style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <Phone size={14} /> Phone Number
              </p>
              <p style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-main)" }}>
                {profile.phone}
              </p>
            </div>

            {/* Email Address */}
            <div style={{ padding: "16px", background: "#f8fbf6", borderRadius: "12px", border: "1px solid #edf2e9", gridColumn: "1 / -1" }}>
              <p style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <Mail size={14} /> Email Address
              </p>
              <p style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-main)" }}>
                {profile.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
