import React, { useState, useEffect } from "react";
import { formatIndianAmount } from "../../../utils/formatters";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ChevronRight,
  Package,
  Box,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  BarChart3,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";
// Using the exact same CSS file from Millets-Admin Dashboard
import "../../../pages/Dashboard.css"; 

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const [dashboardCount, setDashboardCount] = useState(null);
  const [stockCount, setStockCount] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardCount = async () => {
      try {
        const res = await API.post(
          APIROUTES.DASHBOARDCOUNT || "/home/dashboardcount",
        );
        if (res.data?.statusCode === 200) {
          setDashboardCount(res.data.data);
        }
      } catch (err) {
        console.error("Dashboard count error:", err);
      }
    };
    fetchDashboardCount();
  }, []);

  useEffect(() => {
    if (activeTab === "inventory") {
      const fetchStockCount = async () => {
        try {
          const res = await API.post(
            APIROUTES.STOCKCOUNT || "/home/stockcount",
          );
          if (res.data?.statusCode === 200) {
            setStockCount(res.data.data);
          }
        } catch (err) {
          console.error(err);
        }
      };

      const fetchMerchants = async () => {
        setIsLoading(true);
        try {
          const res = await API.post(APIROUTES.GETBUSINESS);
          if (res.data?.statusCode === 200) {
            setMerchants(res.data.data || []);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchStockCount();
      if (merchants.length === 0) fetchMerchants();
    }
  }, [activeTab]);

  const navigate = useNavigate();

  const handleMerchantClick = (merchant) => {
    navigate(`/merchant-stocks/${merchant.bid}`, { state: { merchant } });
  };

  const overviewStats = [
    {
      title: "Total Merchants",
      value: dashboardCount?.totalmerchants || 0,
      icon: <Store />,
      trend: "+12%",
      isPositive: true,
    },
    {
      title: "Total Orders",
      value: dashboardCount?.totalorders || 0,
      icon: <ShoppingBag />,
      trend: "+5%",
      isPositive: true,
    },
    {
      title: "Total Users",
      value: dashboardCount?.totalusers || 0,
      icon: <Users />,
      trend: "+18%",
      isPositive: true,
    },
    {
      title: "Total Revenue",
      value: `₹${formatIndianAmount(dashboardCount?.totalrevenue || 0)}`,
      icon: <DollarSign />,
      trend: "+24%",
      isPositive: true,
    },
  ];

  const inventoryStats = [
    {
      title: "All Products",
      value: stockCount?.totalshops || 0,
      icon: <Store />,
      isPositive: true,
    },
    {
      title: "In Stock",
      value: stockCount?.totalProducts || 0,
      icon: <Box />,
      isPositive: true,
    },
    {
      title: "Low Stock",
      value: stockCount?.totalavailable || 0,
      icon: <CheckCircle2 />,
      isPositive: true,
    },
    {
      title: "Out Of Stock",
      value: stockCount?.totallowstock || 0,
      icon: <AlertTriangle />,
      isPositive: false,
    },
  ];

  return (
    <div className="dashboard-content animate-pop">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px"
        }}
      >
        <div className="header-text">
          <h1>Dashboard Overview</h1>
          <p>Monitor real-time KPI analytics, streamline sales tracking, and manage your inventory.</p>
        </div>
        
        <div className="header-actions" style={{ display: 'flex', gap: '8px', background: '#f8fbf6', padding: '6px', borderRadius: '12px', border: '1px solid #edf2e9' }}>
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "overview" ? "var(--primary)" : "transparent",
              color: activeTab === "overview" ? "#ffffff" : "var(--text-muted)",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            <BarChart3 size={16} /> Overview
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "inventory" ? "var(--primary)" : "transparent",
              color: activeTab === "inventory" ? "#ffffff" : "var(--text-muted)",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            <Package size={16} /> Inventory
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="stats-grid animate-pop" style={{ marginTop: '24px' }}>
          {overviewStats.map((stat, i) => (
            <div key={i} className="stat-card hover-lift">
              <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #f4f7f2 0%, #edf2e9 100%)', color: 'var(--primary)' }}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <span className="stat-label">{stat.title}</span>
                <h2 className="stat-value">{stat.value}</h2>
                {stat.trend && (
                  <div className={`stat-trend ${stat.isPositive ? "positive" : "negative"}`}>
                    <ArrowUpRight size={14} />
                    <span>{stat.trend} from last month</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="animate-pop" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
          <div className="stats-grid">
            {inventoryStats.map((stat, i) => (
              <div key={i} className="stat-card hover-lift">
                <div className="stat-icon-wrapper" style={{ 
                  background: stat.title === 'Out Of Stock' ? '#fff1f1' : 'linear-gradient(135deg, #f4f7f2 0%, #edf2e9 100%)', 
                  color: stat.title === 'Out Of Stock' ? '#dc2626' : 'var(--primary)' 
                }}>
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <span className="stat-label">{stat.title}</span>
                  <h2 className="stat-value">{stat.value}</h2>
                </div>
              </div>
            ))}
          </div>

          <div
            className="section-card"
            style={{
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
              border: "1px solid rgba(85, 107, 47, 0.05)",
              background: "#ffffff",
            }}
          >
            <div
              className="section-header"
              style={{
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #f0f3ee",
                paddingBottom: "16px"
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "var(--text-main)",
                    marginBottom: "4px",
                  }}
                >
                  Merchants List
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "500" }}>
                  Manage and monitor all business accounts across the platform.
                </p>
              </div>
            </div>

            <div className="table-responsive thin-scrollbar" style={{ overflowX: "auto" }}>
              {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "150px" }}>
                  <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                  <thead>
                    <tr style={{ textAlign: "left" }}>
                      <th style={{ padding: "12px 16px", fontWeight: "700", color: "var(--text-muted)", fontSize: "12px", borderBottom: "1px solid #f0f3ee", textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        S.No
                      </th>
                      <th style={{ padding: "12px 16px", fontWeight: "700", color: "var(--text-muted)", fontSize: "12px", borderBottom: "1px solid #f0f3ee", textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Business Name
                      </th>
                      <th style={{ padding: "12px 16px", fontWeight: "700", color: "var(--text-muted)", fontSize: "12px", borderBottom: "1px solid #f0f3ee", textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Name
                      </th>
                      <th style={{ padding: "12px 16px", fontWeight: "700", color: "var(--text-muted)", fontSize: "12px", borderBottom: "1px solid #f0f3ee", textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Contact
                      </th>
                      <th style={{ padding: "12px 16px", fontWeight: "700", color: "var(--text-muted)", fontSize: "12px", borderBottom: "1px solid #f0f3ee", textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {merchants.map((m, index) => (
                      <tr
                        key={m.bid}
                        onClick={() => handleMerchantClick(m)}
                        style={{
                          background: "#ffffff",
                          transition: "all 0.2s",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f8fbf6"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#ffffff"}
                      >
                        <td style={{ padding: "16px", borderBottom: "1px solid #f8fbf6", fontSize: "14px", color: "var(--text-muted)", fontWeight: "600" }}>
                          <div style={{ width: '32px', height: '32px', background: '#f8fbf6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #edf2e9' }}>
                            {index + 1}
                          </div>
                        </td>
                        <td style={{ padding: "16px", borderBottom: "1px solid #f8fbf6", fontWeight: "700", color: "var(--text-main)", fontSize: "14.5px" }}>
                          {m.businessname}
                        </td>
                        <td style={{ padding: "16px", borderBottom: "1px solid #f8fbf6", fontWeight: "600", color: "var(--text-muted)", fontSize: "14px" }}>
                          {m.username || "—"}
                        </td>
                        <td style={{ padding: "16px", borderBottom: "1px solid #f8fbf6" }}>
                          <span style={{ background: '#f8fbf6', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', border: '1px solid #edf2e9' }}>
                            {m.phone || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "16px", borderBottom: "1px solid #f8fbf6", textAlign: "right" }}>
                          <div style={{ display: 'inline-flex', width: '32px', height: '32px', alignItems: 'center', justifyContent: 'center', background: '#f8fbf6', borderRadius: '8px', color: 'var(--primary)', border: '1px solid #edf2e9' }}>
                            <ChevronRight size={18} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {merchants.length === 0 && !isLoading && (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px", fontWeight: '500' }}>
                  <Store size={32} color="var(--text-muted)" style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                  <p>No merchants found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
