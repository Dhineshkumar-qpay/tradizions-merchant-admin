import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";
import "../../../pages/ListProducts.css";

const MerchantCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = !!id;
  const editMerchantData = location.state?.merchant || null;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    ownerName: "",
    email: "",
    mobileNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [menus, setMenus] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState(new Set());
  const [expandedMenus, setExpandedMenus] = useState(new Set());

  useEffect(() => {
    fetchMenus();
    if (isEditMode && editMerchantData) {
      setFormData({
        businessName: editMerchantData.businessname || "",
        description: editMerchantData.description || "",
        ownerName: editMerchantData.username || "",
        email: editMerchantData.email || "",
        mobileNumber: editMerchantData.phone || "",
      });
      if (editMerchantData.children && Array.isArray(editMerchantData.children)) {
        const preSelected = new Set(editMerchantData.children.map(child => child.menuid));
        setSelectedMenus(preSelected);
      }
    }
  }, [isEditMode, editMerchantData]);

  const fetchMenus = async () => {
    try {
      const response = await API.post(APIROUTES.ALLMENUS);
      if (response.data && response.data.statusCode === 200) {
        setMenus(response.data.data);
        const allIds = response.data.data.map((m) => m.menuid);
        setExpandedMenus(new Set(allIds));
      }
    } catch (error) {
      console.error("Failed to fetch menus", error);
    }
  };

  const toggleExpand = (menuid) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuid)) {
      newExpanded.delete(menuid);
    } else {
      newExpanded.add(menuid);
    }
    setExpandedMenus(newExpanded);
  };

  const handleMenuSelect = (menu, isChecked) => {
    const newSelected = new Set(selectedMenus);

    const updateSelection = (item, checked) => {
      if (checked) {
        newSelected.add(item.menuid);
      } else {
        newSelected.delete(item.menuid);
      }
      if (item.children && item.children.length > 0) {
        item.children.forEach((child) => updateSelection(child, checked));
      }
    };

    updateSelection(menu, isChecked);

    if (menu.parentid) {
      const parent = menus.find((m) => m.menuid === menu.parentid);
      if (parent) {
        const allChildrenSelected = parent.children.every((child) =>
          newSelected.has(child.menuid)
        );
        if (allChildrenSelected) {
          newSelected.add(parent.menuid);
        } else {
          newSelected.delete(parent.menuid);
        }
      }
    }

    setSelectedMenus(newSelected);
  };

  const renderMenuNode = (menu, isChild = false) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedMenus.has(menu.menuid);
    const isSelected = selectedMenus.has(menu.menuid);

    let isIndeterminate = false;
    if (hasChildren && !isSelected) {
      const someChildrenSelected = menu.children.some((child) =>
        selectedMenus.has(child.menuid)
      );
      if (someChildrenSelected) {
        isIndeterminate = true;
      }
    }

    return (
      <div key={menu.menuid} style={{ display: "flex", flexDirection: "column", marginTop: isChild ? "4px" : "8px", marginLeft: isChild ? "20px" : "0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px", borderRadius: "8px", transition: "background 0.2s" }} className="hover:bg-gray-50">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(menu.menuid)}
              style={{ padding: "4px", color: "var(--text-muted)", borderRadius: "6px", cursor: "pointer", border: "none", background: "transparent" }}
              className="hover:bg-gray-200"
            >
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          ) : (
            <div style={{ width: "22px" }} />
          )}

          <div
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none", flex: 1 }}
            onClick={() => handleMenuSelect(menu, !isSelected)}
          >
            <div
              style={{
                width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", transition: "all 0.2s",
                background: isSelected ? "var(--primary)" : isIndeterminate ? "rgba(76, 107, 53, 0.2)" : "white",
                border: isSelected ? "1px solid var(--primary)" : isIndeterminate ? "1px solid var(--primary)" : "1px solid #d1d5db",
                color: isSelected || isIndeterminate ? "white" : "transparent"
              }}
            >
              {isSelected && <Check size={12} />}
              {isIndeterminate && <div style={{ width: "8px", height: "8px", background: "var(--primary)", borderRadius: "2px" }} />}
            </div>

            {menu.icon && (
              <img src={menu.icon} alt={menu.menuname} style={{ width: "16px", height: "16px", objectFit: "contain", opacity: 0.7 }} />
            )}
            <span style={{ fontSize: "13px", fontWeight: isChild ? "600" : "700", color: isChild ? "var(--text-muted)" : "var(--text-main)" }}>
              {menu.menuname}
            </span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div style={{ borderLeft: "1px solid #e5e7eb", marginLeft: "10px", paddingLeft: "10px" }}>
            {menu.children.map((child) => renderMenuNode(child, true))}
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      businessname: formData.businessName,
      description: formData.description,
      phone: formData.mobileNumber.replace(/\D/g, ""),
      username: formData.ownerName,
      email: formData.email,
      menuids: Array.from(selectedMenus),
    };

    if (isEditMode) {
      payload.bid = parseInt(id, 10);
    }

    try {
      const apiRoute = isEditMode ? APIROUTES.EDITBUSINESS : APIROUTES.ADDBUSINESS;
      const response = await API.post(apiRoute, payload);
      if (response.data && response.data.statusCode === 200) {
        toast.success(
          response.data.message || `Business ${isEditMode ? "updated" : "created"} successfully!`,
        );
        navigate("/merchants");
      } else {
        toast.error(response.data?.message || `Failed to ${isEditMode ? "update" : "create"} business.`);
      }
    } catch (error) {
      console.error(`${isEditMode ? "Update" : "Create"} business error:`, error);
      if (!error.isToastShown) {
        toast.error(`An unexpected error occurred during ${isEditMode ? "update" : "creation"}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="list-products-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div className="page-header-actions">
        <div>
          <button
            onClick={() => navigate(-1)}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--text-muted)", fontSize: "12px", fontWeight: "700", cursor: "pointer", marginBottom: "8px" }}
          >
            <ArrowLeft size={14} /> BACK TO MERCHANTS
          </button>
          <h1>{isEditMode ? "Edit Merchant" : "Create Merchant"}</h1>
          <p>Configure business details and permissions for the merchant account.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        
        {/* Business Information Card */}
        <div className="section-card">
          <div className="table-controls" style={{ padding: "20px 25px", borderBottom: "1px solid #f0f3ee" }}>
            <h4 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Building2 size={18} style={{ color: "var(--primary)" }} /> Business Information
            </h4>
          </div>
          
          <div style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Building2 size={14} style={{ color: "var(--primary)" }} /> Business Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  required
                  style={{ width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px", fontWeight: "600" }}
                  placeholder="e.g. Green Earth Organics"
                  value={formData.businessName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <User size={14} style={{ color: "var(--primary)" }} /> Owner Name
                </label>
                <input
                  type="text"
                  name="ownerName"
                  required
                  style={{ width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px", fontWeight: "600" }}
                  placeholder="e.g. Arun Kumar"
                  value={formData.ownerName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <FileText size={14} style={{ color: "var(--primary)" }} /> Description
              </label>
              <textarea
                name="description"
                rows="4"
                required
                style={{ width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px", fontWeight: "500", resize: "none" }}
                placeholder="Briefly describe the business and its products..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Mail size={14} style={{ color: "var(--primary)" }} /> Business Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  style={{ width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px", fontWeight: "600" }}
                  placeholder="e.g. contact@business.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Phone size={14} style={{ color: "var(--primary)" }} /> Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  required
                  style={{ width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px", fontWeight: "600" }}
                  placeholder="e.g. +91 98765 43210"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Access Menus Card */}
        <div className="section-card">
          <div className="table-controls" style={{ padding: "20px 25px", borderBottom: "1px solid #f0f3ee" }}>
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                Merchant Access Menus
              </h4>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500", marginTop: "4px" }}>
                Select the menus and subcategories to assign access to this merchant.
              </p>
            </div>
          </div>
          <div style={{ padding: "25px" }}>
            <div style={{ background: "#f8fbf6", border: "1px solid #edf2e9", borderRadius: "12px", padding: "15px" }}>
              {menus.length > 0 ? (
                <div>
                  {menus.map((menu) => renderMenuNode(menu))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "14px", fontWeight: "600" }}>
                  Loading menus...
                </div>
              )}
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
            {loading ? (
              isEditMode ? "Updating..." : "Creating..."
            ) : (
              <>
                <Save size={16} /> {isEditMode ? "Update Merchant" : "Save Merchant"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MerchantCreate;
