import React from 'react';
import { reports } from '../../data/mockData';
import { FileText, Download, TrendingUp, BarChart3, PieChart, Users, FileBarChart, ExternalLink } from 'lucide-react';
import "../../../pages/ListProducts.css";

const ReportList = () => {
    return (
        <div className="list-products-container">
            <div className="page-header-actions">
                <div>
                    <h1>Reports & Analytics</h1>
                    <p>Deep dive into platform data with curated intelligence reports.</p>
                </div>
                <div className="header-controls-group">
                    <select
                        style={{ padding: "10px 15px", borderRadius: "10px", border: "1.5px solid #edf2e9", background: "white", fontSize: "14px", fontWeight: "600", minWidth: "180px" }}
                    >
                        <option value="all">All Merchants</option>
                        <option value="1">Organic Farm Co.</option>
                        <option value="2">Millets India</option>
                        <option value="3">Nature's Best</option>
                    </select>
                    <button
                        className="action-btn"
                        style={{
                            background: "var(--primary)",
                            color: "white",
                            border: "none",
                            padding: "10px 16px",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: "bold",
                            width: "auto",
                        }}
                    >
                        <TrendingUp size={16} /> Generate
                    </button>
                </div>
            </div>

            {/* Featured Analytics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <AnalyticsCard icon={BarChart3} title="Sales Growth" value="+24.5%" subtitle="Vs last month" color="#4C6B35" bg="rgba(76, 107, 53, 0.1)" />
                <AnalyticsCard icon={Users} title="New Merchants" value="45" subtitle="This month" color="#e8b059" bg="rgba(232, 176, 89, 0.1)" />
                <AnalyticsCard icon={PieChart} title="Market Share" value="12.8%" subtitle="Domestic sector" color="#0984e3" bg="rgba(9, 132, 227, 0.1)" />
                <AnalyticsCard icon={FileText} title="Reports Gen." value="124" subtitle="Total reports" color="#00b894" bg="rgba(0, 184, 148, 0.1)" />
            </div>

            <div className="table-wrapper section-card">
                <div className="table-controls">
                    <div>
                        <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>Available Reports</h3>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Download periodic system generated audits and analytics.</p>
                    </div>
                </div>

                <div style={{ padding: "0 20px" }}>
                    {reports.map((report, index) => (
                        <div key={report.id} style={{ 
                            display: "flex", alignItems: "center", justifyContent: "space-between", 
                            padding: "20px 0", borderBottom: index < reports.length - 1 ? "1px solid #f0f3ee" : "none",
                            gap: "20px", flexWrap: "wrap"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#f8fbf6", border: "1px solid #edf2e9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <FileBarChart size={20} style={{ color: "var(--text-muted)" }} />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-main)", marginBottom: "4px" }}>{report.title}</h4>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                        <span style={{ fontSize: "10px", fontWeight: "bold", background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px", color: "#64748b" }}>{report.type}</span>
                                        <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)" }}>{report.date}</span>
                                        <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)" }}>• {report.size}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <button style={{ 
                                    padding: "8px 16px", borderRadius: "8px", background: "white", border: "1.5px solid #edf2e9", 
                                    color: "var(--text-main)", fontWeight: "bold", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" 
                                }}>
                                    <ExternalLink size={14} /> Preview
                                </button>
                                <button style={{ 
                                    padding: "8px 16px", borderRadius: "8px", background: "rgba(76, 107, 53, 0.05)", border: "1.5px solid rgba(76, 107, 53, 0.2)", 
                                    color: "var(--primary)", fontWeight: "bold", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" 
                                }}>
                                    <Download size={14} /> Download
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AnalyticsCard = ({ icon: Icon, title, value, subtitle, color, bg }) => (
    <div className="section-card" style={{ padding: "20px", display: "flex", alignItems: "flex-start", gap: "15px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: bg, color: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={24} />
        </div>
        <div>
            <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px" }}>
                {title}
            </p>
            <h3 style={{ fontSize: "24px", fontWeight: "900", color: "var(--text-main)", lineHeight: "1" }}>
                {value}
            </h3>
            <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", mt: "6px" }}>
                {subtitle}
            </p>
        </div>
    </div>
);

export default ReportList;
