import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Trash2,
  X,
  Activity,
  Image as ImageIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES, IMAGE_URL } from "../../routes/api_routes";
import "../../../pages/ListProducts.css";

const HealthGoalList = () => {
  const [healthGoals, setHealthGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectCount, setSelectCount] = useState("10");
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ goalname: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchHealthGoals = async () => {
    setIsLoading(true);
    try {
      const response = await API.post(APIROUTES.GETHEALTHGOALS);
      if (response.data && response.data.statusCode === 200) {
        setHealthGoals(response.data.data || []);
      } else {
        toast.error(response.data?.message || "Failed to fetch Health Goals");
      }
    } catch (error) {
      console.error("Fetch health goals error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthGoals();
  }, []);

  const filteredGoals = healthGoals.filter(
    (item) =>
      (item.goalname &&
        item.goalname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const displayedGoals =
    selectCount === "All"
      ? filteredGoals
      : filteredGoals.slice(
          (currentPage - 1) * Number(selectCount),
          currentPage * Number(selectCount),
        );

  const totalPages = selectCount === "All" ? 1 : Math.ceil(filteredGoals.length / Number(selectCount));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.goalname.trim() || !formData.description.trim() || !imageFile) {
      toast.error("Please fill in all fields and upload an image.");
      return;
    }

    const data = new FormData();
    data.append("goalimage", imageFile);
    data.append("goalname", formData.goalname);
    data.append("description", formData.description);

    try {
      const response = await API.post(APIROUTES.ADDHEALTHGOAL, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data && response.data.statusCode === 200) {
        toast.success(response.data.data || "Health goal added successfully!");
        fetchHealthGoals();
        handleCancel();
      } else {
        toast.error(response.data?.message || "Failed to add health goal");
      }
    } catch (error) {
      console.error("Add health goal error:", error);
      toast.error("An error occurred while adding the health goal.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Health Goal?")) {
      try {
        const response = await API.post(APIROUTES.DELETEHEALTHGOAL, { goalid: id });
        if (response.data && response.data.statusCode === 200) {
          toast.success(response.data.data || "Health goal deleted successfully");
          fetchHealthGoals();
        } else {
          toast.error(response.data?.message || "Failed to delete health goal");
        }
      } catch (error) {
        console.error("Delete health goal error:", error);
        toast.error("An error occurred while deleting the health goal.");
      }
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setFormData({ goalname: "", description: "" });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${IMAGE_URL}${path}`;
  };

  return (
    <div className="list-products-container">
      {/* Header */}
      <div className="page-header-actions">
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={24} style={{ color: "var(--primary)" }} /> Health Goals
          </h1>
          <p>Manage health categories and target areas for products.</p>
        </div>
        {!isAdding && (
          <div className="header-controls-group">
            <button
              className="action-btn"
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
                width: "auto",
              }}
            >
              <Plus size={16} /> Add Goal
            </button>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="table-wrapper section-card animate-pop" style={{ marginBottom: "30px", border: "1px solid var(--accent)", background: "rgba(232, 176, 89, 0.02)" }}>
          <div className="table-controls" style={{ borderBottom: "1px solid #f0f3ee", paddingBottom: "15px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>
                Add New Health Goal
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                      Goal Name
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.goalname}
                      onChange={(e) => setFormData({ ...formData, goalname: e.target.value })}
                      style={{ width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px" }}
                      placeholder="e.g. Diabetes, Weight Management..."
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                      Description
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      style={{ width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px", resize: "none" }}
                      placeholder="Enter description..."
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    Goal Image
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: "100%",
                      height: "175px",
                      borderRadius: "16px",
                      border: "2px dashed #d1d5db",
                      background: "#f9fafb",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <>
                        <ImageIcon size={32} color="#9ca3af" style={{ marginBottom: "8px", opacity: 0.7 }} />
                        <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)" }}>
                          Click to upload image
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                  </div>
                  {imageFile && (
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
                      {imageFile.name}
                    </p>
                  )}
                </div>
              </div>
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
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List Section */}
      <div className="table-wrapper section-card">
        <div className="table-controls">
          <div className="search-box" style={{ flex: 1, maxWidth: "400px" }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search health goals..."
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
              <option value="All">All Goals</option>
            </select>
          </div>
        </div>

        <div className="table-responsive thin-scrollbar">
          {isLoading ? (
            <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : displayedGoals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              No Health Goals found.
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>Image</th>
                  <th>Goal Name</th>
                  <th style={{ width: "40%" }}>Description</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedGoals.map((item, index) => (
                  <tr key={item.goalid}>
                    <td>
                      {(currentPage - 1) * (selectCount === "All" ? 10 : Number(selectCount)) + index + 1}
                    </td>
                    <td>
                      <div className="table-img-placeholder" style={{ width: "48px", height: "48px", borderRadius: "10px", overflow: "hidden", border: "1px solid #edf2e9" }}>
                        {item.goalimage ? (
                          <img
                            src={getImageUrl(item.goalimage)}
                            alt={item.goalname}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "#f8fbf6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ImageIcon size={20} color="var(--text-muted)" />
                          </div>
                        )}
                        <div style={{ display: item.goalimage ? "none" : "flex", width: "100%", height: "100%", background: "#f8fbf6", alignItems: "center", justifyContent: "center" }}>
                           <ImageIcon size={20} color="var(--text-muted)" />
                        </div>
                      </div>
                    </td>
                    <td>
                      <p style={{ fontWeight: "700", fontSize: "14.5px", color: "var(--text-main)" }}>
                        {item.goalname}
                      </p>
                    </td>
                    <td>
                      <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.6", fontWeight: "500" }}>
                        {item.description}
                      </p>
                    </td>
                    <td>
                      <div className="action-cell" style={{ justifyContent: "flex-end" }}>
                        <button className="action-btn delete" title="Delete Goal" onClick={() => handleDelete(item.goalid)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="pagination-footer">
          <p>
            Showing <strong>{displayedGoals.length}</strong> of{" "}
            <strong>{filteredGoals.length}</strong> goals
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

export default HealthGoalList;
