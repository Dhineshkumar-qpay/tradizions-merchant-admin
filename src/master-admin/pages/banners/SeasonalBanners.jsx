import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  X,
  Image as ImageIcon,
  Upload,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES, IMAGE_URL } from "../../routes/api_routes";
import "../../../pages/ListProducts.css";

const SeasonalBanners = () => {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectCount, setSelectCount] = useState("10");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imagePreview: null,
  });

  const [currentPage, setCurrentPage] = useState(1);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const response = await API.post(APIROUTES.GETALLBANNER);
      if (response.data && response.data.statusCode === 200) {
        setBanners(response.data.data || []);
      } else {
        toast.error("Failed to fetch banners");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const filteredBanners = banners.filter(
    (item) =>
      (item?.bannername && String(item.bannername).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item?.description && String(item.description).toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const displayedBanners =
    selectCount === "All"
      ? filteredBanners
      : filteredBanners.slice(
          (currentPage - 1) * Number(selectCount),
          currentPage * Number(selectCount),
        );

  const totalPages = selectCount === "All" ? 1 : Math.ceil(filteredBanners.length / Number(selectCount));

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imagePreview: reader.result }));
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Please provide both Banner Name and Description.");
      return;
    }

    if (editingId) {
      const formDataToSend = new FormData();
      if (file) formDataToSend.append("bannerimage", file);
      formDataToSend.append("bannername", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("bannerid", editingId);

      try {
        const response = await API.post(APIROUTES.UPDATEBANNER, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data && response.data.statusCode === 200) {
          toast.success("Seasonal Banner updated successfully!");
          fetchBanners();
        } else {
          toast.error("Failed to update banner");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error updating banner");
      }
    } else {
      if (!file) {
        toast.error("Please select a banner image.");
        return;
      }
      const formDataToSend = new FormData();
      formDataToSend.append("bannerimage", file);
      formDataToSend.append("bannername", formData.name);
      formDataToSend.append("description", formData.description);

      try {
        const response = await API.post(APIROUTES.ADDBANNER, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data && response.data.statusCode === 200) {
          toast.success("Seasonal Banner created successfully!");
          fetchBanners();
        } else {
          toast.error("Failed to add banner");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error adding banner");
      }
    }

    setFormData({ name: "", description: "", imagePreview: null });
    setFile(null);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.bannername || "",
      description: item.description || "",
      imagePreview: item.bannerimage ? IMAGE_URL + item.bannerimage : null,
    });
    setEditingId(item.bannerid);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this seasonal banner?")
    ) {
      try {
        const response = await API.post(APIROUTES.DELETEBANNER, { bannerid: id });
        if (response.data && response.data.statusCode === 200) {
          toast.success("Banner removed successfully.");
          fetchBanners();
        } else {
          toast.error("Failed to delete banner");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error deleting banner");
      }
    }
  };

  const toggleStatus = async (id) => {
    const banner = banners.find((b) => b.bannerid === id);
    if (!banner) return;
    const newStatus = banner.status === "active" ? "inactive" : "active";

    try {
      const response = await API.post(APIROUTES.UPDATEBANNERSTATUS, {
        bannerid: id,
        status: newStatus,
      });
      if (response.data && response.data.statusCode === 200) {
        toast.success("Banner visibility status updated");
        fetchBanners();
      } else {
        toast.error("Failed to update banner status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating banner status");
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", description: "", imagePreview: null });
    setFile(null);
  };

  return (
    <div className="list-products-container">
      {/* Header Panel */}
      <div className="page-header-actions">
        <div>
          <h1>Seasonal Banners</h1>
          <p>Manage promotional banners displayed to users and optimize campaign visibility.</p>
        </div>
        {!isAdding && (
          <div className="header-controls-group">
            <button
              onClick={() => setIsAdding(true)}
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
                cursor: "pointer"
              }}
            >
              <Plus size={16} /> Add Banner
            </button>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="table-wrapper section-card animate-pop" style={{ marginBottom: "25px", border: "1px solid var(--accent)", background: "rgba(232, 176, 89, 0.02)" }}>
          <div className="table-controls" style={{ borderBottom: "1px solid #f0f3ee", paddingBottom: "15px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "var(--text-main)" }}>
                {editingId ? "Edit Seasonal Banner" : "Create Seasonal Banner"}
              </h3>
            </div>
            <button
              onClick={handleCancel}
              style={{ padding: "8px", background: "#f8fbf6", borderRadius: "10px", color: "var(--text-muted)", border: "none", cursor: "pointer" }}
            >
              <X size={18} />
            </button>
          </div>
          
          <div style={{ padding: "20px" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
                
                {/* Image Upload Area */}
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    Banner Graphic
                  </label>
                  <label style={{
                    display: "block", width: "100%", height: "150px", borderRadius: "16px",
                    border: "2px dashed #d1d5db", background: "#f9fafb", cursor: "pointer",
                    overflow: "hidden", position: "relative"
                  }}>
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                    {formData.imagePreview ? (
                      <img src={formData.imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
                        <Upload size={32} style={{ marginBottom: "8px", opacity: 0.7 }} />
                        <span style={{ fontSize: "12px", fontWeight: "bold" }}>Upload Banner Image</span>
                        <span style={{ fontSize: "10px" }}>PNG, JPG up to 5MB</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Form Fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                      Banner Name / Title
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px" }}
                      placeholder="e.g. Diwali Super Saver Hampers"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                      Description / Promotion Note
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      style={{ width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px", resize: "none" }}
                      placeholder="Describe the promotional campaign, validity, or targeted product category..."
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #f0f3ee", paddingTop: "15px" }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{ padding: "10px 20px", borderRadius: "10px", background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 20px", borderRadius: "10px", background: "var(--primary)", border: "none", color: "white", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}
                >
                  {editingId ? "Update Banner" : "Save Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List Section styled exactly like ContactsList */}
      <div className="table-wrapper section-card">
        <div className="table-controls">
          <div className="search-box" style={{ flex: 1, maxWidth: "400px" }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search banners by name or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="filter-item" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Show Count
            </label>
            <select
              className="form-select"
              value={selectCount}
              onChange={(e) => {
                setSelectCount(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: "8px 12px", borderRadius: "8px", minWidth: "110px", fontSize: "14px" }}
            >
              <option value="10">10 Entries</option>
              <option value="20">20 Entries</option>
              <option value="50">50 Entries</option>
              <option value="All">All Entries</option>
            </select>
          </div>
        </div>

        <div className="table-responsive thin-scrollbar">
          {isLoading ? (
            <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : displayedBanners.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              No matching banners found.
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>Preview</th>
                  <th>Banner Name & Description</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedBanners.map((item, index) => {
                  if (!item) return null;
                  const currentStatus = item.status || "inactive";
                  const isActive = currentStatus.toLowerCase() === "active";

                  return (
                    <tr key={item.bannerid || index}>
                      <td>
                        {(currentPage - 1) * (selectCount === "All" ? 10 : Number(selectCount)) + index + 1}
                      </td>
                      <td>
                        <div style={{ width: "120px", height: "60px", borderRadius: "8px", overflow: "hidden", border: "1px solid #edf2e9", background: "#f8fbf6" }}>
                          <img
                            src={item.bannerimage ? IMAGE_URL + item.bannerimage : ""}
                            alt={item.bannername || "Banner"}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <p style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-main)" }}>
                          {item.bannername || "Unnamed Banner"}
                        </p>
                        <p style={{ fontSize: "13.5px", color: "var(--text-muted)", maxWidth: "350px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.description}>
                          {item.description || "No description provided"}
                        </p>
                      </td>
                      <td>
                        <span className={`status-badge ${isActive ? "status-active" : "status-inactive"}`}>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="action-cell" onClick={(e) => e.stopPropagation()} style={{ justifyContent: "flex-end" }}>
                          
                          {/* Toggle Status Button inline with modern styling */}
                          <button
                            type="button"
                            onClick={() => toggleStatus(item.bannerid)}
                            style={{
                              width: "36px", height: "20px", borderRadius: "10px", padding: "2px",
                              background: isActive ? "var(--success)" : "#e2e8f0",
                              transition: "all 0.3s ease", display: "flex", cursor: "pointer",
                              border: "none", alignItems: "center"
                            }}
                            title={isActive ? "Deactivate Banner" : "Activate Banner"}
                          >
                            <span style={{
                              width: "16px", height: "16px", borderRadius: "50%", background: "white",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "all 0.3s ease",
                              transform: isActive ? "translateX(16px)" : "translateX(0)"
                            }} />
                          </button>

                          <button className="action-btn edit" title="Edit Banner" onClick={() => handleEdit(item)}>
                            <Edit size={16} />
                          </button>
                          
                          <button className="action-btn delete" title="Delete Banner" onClick={() => handleDelete(item.bannerid)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="pagination-footer">
          <p>
            Showing <strong>{displayedBanners.length}</strong> of{" "}
            <strong>{filteredBanners.length}</strong> banners
          </p>
          <div className="page-controls">
            <button
              className="btn-page"
              disabled={currentPage === 1 || selectCount === "All"}
              onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
            >
              <ChevronLeft size={18} />
            </button>
            <button className="btn-page active">{currentPage}</button>
            <button
              className="btn-page"
              disabled={currentPage === totalPages || selectCount === "All"}
              onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonalBanners;
