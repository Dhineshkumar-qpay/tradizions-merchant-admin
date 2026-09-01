import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LayoutGrid, Search, Loader2, List, Trash2, Edit } from "lucide-react";
import { API } from "../../../service/api_service";
import { APIROUTES } from "../../../routes/api_routes";
import { toast } from "react-toastify";
import "../../../pages/ListProducts.css";

const MenuList = () => {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const response = await API.post(APIROUTES.ALLMENUS);
      if (response.data && response.data.statusCode === 200) {
        setMenus(response.data.data || []);
      } else {
        toast.error("Failed to fetch menus");
      }
    } catch (error) {
      console.error("Fetch menus error:", error);
      toast.error("An error occurred while fetching menus");
    } finally {
      setLoading(false);
    }
  };

  // Flatten menus for easier searching/displaying if needed, but a tree structure is nice.
  // For simplicity, we can render top level, and indent children.
  const filterMenus = (menuList, term) => {
    if (!term) return menuList;
    const lowerTerm = term.toLowerCase();
    
    return menuList.reduce((acc, menu) => {
      const match = menu.menuname.toLowerCase().includes(lowerTerm) || menu.menukey.toLowerCase().includes(lowerTerm);
      const childrenMatch = filterMenus(menu.children || [], term);
      
      if (match || childrenMatch.length > 0) {
        acc.push({ ...menu, children: childrenMatch });
      }
      return acc;
    }, []);
  };

  const filteredMenus = filterMenus(menus, searchTerm);

  return (
    <div className="list-products-container">
      {/* Header */}
      <div className="page-header-actions">
        <div>
          <h1>Menu Management</h1>
          <p>Create and organize sidebar menus and page access for merchants.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => navigate("/menus/create")}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "var(--primary)", color: "white", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}
          >
            <Plus size={16} /> Add New Menu
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="section-card table-wrapper">
        <div className="table-controls" style={{ padding: "20px 24px", borderBottom: "1px solid #f0f3ee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ position: "relative", width: "300px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search menus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "14px", fontWeight: "500", outline: "none" }}
            />
          </div>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", background: "#f8fbf6", padding: "6px 12px", borderRadius: "6px", border: "1px solid #edf2e9" }}>
            {menus.length} Top-level Menus
          </span>
        </div>

        <div className="table-responsive thin-scrollbar">
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "12px" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
              <p style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Loading Menus...</p>
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th style={{ width: "80px", textAlign: "center" }}>ID</th>
                  <th>Menu Details</th>
                  <th>Path / Key</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMenus.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontWeight: "600" }}>
                      No menus found matching your criteria.
                    </td>
                  </tr>
                )}
                {filteredMenus.map((menu) => (
                  <React.Fragment key={menu.menuid}>
                    {/* Parent Menu Row */}
                    <tr style={{ background: "#fafdf9" }}>
                      <td style={{ textAlign: "center", fontWeight: "800", color: "var(--text-muted)" }}>{menu.menuid}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {menu.icon ? (
                            <img src={menu.icon} alt={menu.menuname} style={{ width: "24px", height: "24px", objectFit: "contain" }} />
                          ) : (
                            <LayoutGrid size={20} style={{ color: "var(--primary)" }} />
                          )}
                          <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-main)" }}>{menu.menuname}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", background: "#f3f4f6", padding: "4px 8px", borderRadius: "6px", fontFamily: "monospace" }}>
                          {menu.menukey}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`status-badge status-${menu.status === 'active' ? 'active' : 'danger'}`} style={{ textTransform: "capitalize" }}>
                          {menu.status || "active"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {/* Actions placeholders */}
                        <div className="action-cell" style={{ justifyContent: "flex-end" }}>
                          <button className="action-btn edit" title="Edit Menu" onClick={() => toast.info("Edit coming soon")}>
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Children Rows */}
                    {menu.children && menu.children.map((child) => (
                      <tr key={child.menuid}>
                        <td style={{ textAlign: "center", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)" }}>{child.menuid}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "36px" }}>
                            <div style={{ width: "12px", height: "1px", background: "#d1d5db" }} />
                            {child.icon ? (
                              <img src={child.icon} alt={child.menuname} style={{ width: "18px", height: "18px", objectFit: "contain", opacity: 0.8 }} />
                            ) : (
                              <List size={16} style={{ color: "var(--text-muted)" }} />
                            )}
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>{child.menuname}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-muted)", fontFamily: "monospace" }}>
                            {child.menukey}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`status-badge status-${child.status === 'active' ? 'active' : 'danger'}`} style={{ textTransform: "capitalize", transform: "scale(0.9)" }}>
                            {child.status || "active"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="action-cell" style={{ justifyContent: "flex-end" }}>
                            <button className="action-btn edit" title="Edit Submenu" onClick={() => toast.info("Edit coming soon")}>
                              <Edit size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuList;
