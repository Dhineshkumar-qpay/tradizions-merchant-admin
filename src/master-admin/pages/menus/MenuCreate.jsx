import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, LayoutGrid, Type, Link as LinkIcon, Image as ImageIcon, GitMerge } from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../../service/api_service";
import { APIROUTES } from "../../../routes/api_routes";
import "../../../pages/ListProducts.css";

const MenuCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [parentMenus, setParentMenus] = useState([]);
  
  const [formData, setFormData] = useState({
    menuname: "",
    menukey: "",
    icon: "",
    parentid: "",
  });

  useEffect(() => {
    // Fetch existing menus to populate the Parent Menu dropdown
    const fetchMenus = async () => {
      try {
        const response = await API.post(APIROUTES.ALLMENUS);
        if (response.data && response.data.statusCode === 200) {
          // We only need top-level menus as parents
          const menus = response.data.data || [];
          setParentMenus(menus);
        }
      } catch (error) {
        console.error("Fetch menus error:", error);
      }
    };
    fetchMenus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      menuname: formData.menuname,
      menukey: formData.menukey,
      icon: formData.icon,
      parentid: formData.parentid ? parseInt(formData.parentid) : null,
    };

    try {
      const response = await API.post(APIROUTES.ADDMENU, payload);
      if (response.data && (response.data.statusCode === 200 || response.data.statusCode === 201)) {
        toast.success(response.data.message || "Menu created successfully!");
        navigate("/menus");
      } else {
        toast.error(response.data?.message || "Failed to create menu.");
      }
    } catch (error) {
      console.error("Create menu error:", error);
      toast.error("An unexpected error occurred during creation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="list-products-container" style={{ maxWidth: "700px", margin: "0 auto" }}>
      {/* Header */}
      <div className="page-header-actions">
        <div>
          <button
            onClick={() => navigate(-1)}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--text-muted)", fontSize: "12px", fontWeight: "700", cursor: "pointer", marginBottom: "8px" }}
          >
            <ArrowLeft size={14} /> BACK TO MENUS
          </button>
          <h1>Create New Menu</h1>
          <p>Add a new sidebar menu or sub-menu for the merchant dashboard.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        
        {/* Form Card */}
        <div className="section-card">
          <div className="table-controls" style={{ padding: "20px 25px", borderBottom: "1px solid #f0f3ee" }}>
            <h4 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
              <LayoutGrid size={18} style={{ color: "var(--primary)" }} /> Menu Details
            </h4>
          </div>
          
          <div style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {/* Menu Name */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Type size={14} style={{ color: "var(--primary)" }} /> Menu Name
                </label>
                <input
                  type="text"
                  name="menuname"
                  required
                  style={{ width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px", fontWeight: "600" }}
                  placeholder="e.g. Add Gift Card"
                  value={formData.menuname}
                  onChange={handleChange}
                />
              </div>

              {/* Menu Key / Path */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <LinkIcon size={14} style={{ color: "var(--primary)" }} /> Menu Path (Key)
                </label>
                <input
                  type="text"
                  name="menukey"
                  required
                  style={{ width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px", fontWeight: "600" }}
                  placeholder="e.g. /giftcard/add"
                  value={formData.menukey}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Icon URL */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <ImageIcon size={14} style={{ color: "var(--primary)" }} /> Icon URL
              </label>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input
                  type="url"
                  name="icon"
                  required
                  style={{ flex: 1, padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px", fontWeight: "600" }}
                  placeholder="https://cdn-icons-png.flaticon.com/..."
                  value={formData.icon}
                  onChange={handleChange}
                />
                {formData.icon && (
                  <div style={{ width: "42px", height: "42px", borderRadius: "10px", border: "1px solid #edf2e9", background: "#f8fbf6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <img src={formData.icon} alt="Preview" style={{ width: "24px", height: "24px", objectFit: "contain" }} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>
            </div>

            {/* Parent Menu Selection */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <GitMerge size={14} style={{ color: "var(--primary)" }} /> Parent Menu (Optional)
              </label>
              <select
                name="parentid"
                value={formData.parentid}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px", fontWeight: "600", outline: "none", cursor: "pointer" }}
              >
                <option value="">-- No Parent (Top Level Menu) --</option>
                {parentMenus.map((m) => (
                  <option key={m.menuid} value={m.menuid}>
                    {m.menuname} (ID: {m.menuid})
                  </option>
                ))}
              </select>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px", fontWeight: "500" }}>
                If you select a parent menu, this will appear as a sub-menu under that category.
              </p>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px" }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ padding: "12px 24px", borderRadius: "10px", background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "12px 32px", borderRadius: "10px", background: "var(--primary)", border: "none", color: "white", fontWeight: "bold", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          >
            {loading ? "Creating..." : <><Save size={16} /> Save Menu</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuCreate;
