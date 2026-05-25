import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  AlertCircle,
  Eye,
  Calendar,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./CategoryManagement.css";
const ListCategories = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  // Resolve uploads URL dynamically
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    const base = API.defaults.baseURL || "http://localhost:3003/api";
    const origin = base.replace(/\/api\/?$/, ""); // strip /api
    return `${origin}${path}`;
  };

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.post(APIROUTES.GETALLCATEGORIES);
      console.log("Get All Categories response:", response.data);
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.warn(
        "Failed to fetch categories from API:",
        err,
      );
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (id) => {
    setCategories(
      categories.map((cat) => {
        if (cat.categoryid === id) {
          const currentStatus = cat.status || "Active";
          return {
            ...cat,
            status: currentStatus === "Active" ? "Inactive" : "Active",
          };
        }
        return cat;
      }),
    );
  };

  const handleDelete = () => {
    setCategories(
      categories.filter((cat) => cat.categoryid !== showDeleteConfirm),
    );
    setShowDeleteConfirm(null);
    setSuccess("Category deleted successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleUpdateCategorySubmit = (e) => {
    e.preventDefault();
    setCategories(
      categories.map((cat) =>
        cat.categoryid === showEditModal.categoryid
          ? { ...cat, ...showEditModal }
          : cat,
      ),
    );
    setShowEditModal(null);
    setSuccess("Category updated successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const filteredCategories = categories.filter((cat) =>
    (cat.categoryname || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="category-mgmt-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Category List</h1>
          <p>Organize and manage your product catalog sections.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate("/categories/add")}
        >
          <Plus size={18} />
          <span>Add New Category</span>
        </button>
      </div>

      {success && (
        <div
          className="login-alert success animate-pop"
          style={{ maxWidth: "100%", margin: "0 0 20px" }}
        >
          <AlertCircle size={18} style={{ color: "var(--success)" }} />
          <span>{success}</span>
        </div>
      )}

      <div className="table-card section-card">
        <div className="table-filters">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-actions">
            <button
              className="btn-icon-label"
              onClick={fetchCategories}
              disabled={loading}
            >
              <Filter size={18} />
              <span>{loading ? "Refreshing..." : "Reload Categories"}</span>
            </button>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="circular-loader"></div>
          ) : filteredCategories.length > 0 ? (
            <table className="category-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Category Info</th>
                  <th>Products Count</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => (
                  <tr key={cat.categoryid}>
                    <td>
                      <div className="cat-img-box">
                        {cat.categoryimage ? (
                          <img
                            src={getImageUrl(cat.categoryimage)}
                            alt={cat.categoryname}
                          />
                        ) : (
                          <ImageIcon size={20} />
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="cat-info">
                        <span className="cat-name">{cat.categoryname}</span>
                        <span className="cat-desc">{cat.description}</span>
                      </div>
                    </td>
                    <td>
                      <span className="parent-cat-badge">
                        <Package size={12} />
                        {cat.products || 0} Products
                      </span>
                    </td>
                    <td>
                      <button
                        className={`status-toggle ${(cat.status || "Active").toLowerCase()}`}
                        onClick={() => toggleStatus(cat.categoryid)}
                      >
                        <div className="toggle-dot"></div>
                        <span>{cat.status || "Active"}</span>
                      </button>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          className="action-btn view"
                          title="View Details"
                          onClick={() => setShowDetailDrawer(cat)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="action-btn edit"
                          title="Edit Category"
                          onClick={() => setShowEditModal(cat)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => setShowDeleteConfirm(cat.categoryid)}
                          title="Delete Category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <AlertCircle size={48} />
              </div>
              <h3>No categories found</h3>
            </div>
          )}
        </div>

        <div className="pagination-footer">
          <p>
            Showing <strong>{filteredCategories.length}</strong> categories
          </p>
          <div className="page-controls">
            <button className="btn-page" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="btn-page active">1</button>
            <button className="btn-page" disabled>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Detail Drawer (Read-Only) */}
      {showDetailDrawer && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailDrawer(null)}
        >
          <div
            className="modal-drawer slide-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div className="header-title">
                <h2>Category Details</h2>
                <span className="id-badge">
                  CAT-{showDetailDrawer.categoryid.toString().padStart(3, "0")}
                </span>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowDetailDrawer(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="drawer-content">
              <div className="detail-profile-section">
                <div className="cat-large-img">
                  {showDetailDrawer.categoryimage ? (
                    <img
                      src={getImageUrl(showDetailDrawer.categoryimage)}
                      alt={showDetailDrawer.categoryname}
                    />
                  ) : (
                    <ImageIcon size={40} />
                  )}
                </div>
                <div className="cat-main-meta">
                  <h3>{showDetailDrawer.categoryname}</h3>
                  <span
                    className={`status-badge ${(showDetailDrawer.status || "Active").toLowerCase()}`}
                  >
                    {showDetailDrawer.status || "Active"}
                  </span>
                </div>
              </div>

              <div className="detail-info-grid">
                <div className="info-block">
                  <label>
                    <Filter size={14} /> Description
                  </label>
                  <p>{showDetailDrawer.description}</p>
                </div>
                <div className="info-row-grid">
                  <div className="info-block">
                    <label>
                      <Calendar size={14} /> ID Reference
                    </label>
                    <p>ID: {showDetailDrawer.categoryid}</p>
                  </div>
                  <div className="info-block">
                    <label>
                      <Package size={14} /> Products
                    </label>
                    <p>{showDetailDrawer.products || 0} Items Linked</p>
                  </div>
                </div>
              </div>

              <div className="drawer-actions-footer">
                <button
                  className="btn-primary"
                  style={{ width: "100%" }}
                  onClick={() => {
                    setShowDetailDrawer(null);
                    setShowEditModal(showDetailDrawer);
                  }}
                >
                  <Edit size={16} /> Edit Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div
            className="modal-content animate-pop"
            style={{ maxWidth: "500px" }}
          >
            <div className="modal-header">
              <h2>Edit Category</h2>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(null)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateCategorySubmit}>
              <div className="modal-form" style={{ padding: "25px" }}>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={showEditModal.categoryname}
                    onChange={(e) =>
                      setShowEditModal({
                        ...showEditModal,
                        categoryname: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1.5px solid #edf2e9",
                      background: "#fcfdfb",
                    }}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    rows="4"
                    value={showEditModal.description}
                    onChange={(e) =>
                      setShowEditModal({
                        ...showEditModal,
                        description: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1.5px solid #edf2e9",
                      background: "#fcfdfb",
                      resize: "none",
                    }}
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Status
                  </label>
                  <select
                    value={showEditModal.status || "Active"}
                    onChange={(e) =>
                      setShowEditModal({
                        ...showEditModal,
                        status: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1.5px solid #edf2e9",
                      background: "#fcfdfb",
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowEditModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div
            className="modal-content animate-pop"
            style={{ maxWidth: "400px", textAlign: "center", padding: "30px" }}
          >
            <div
              className="modal-icon-box"
              style={{
                background: "#fff1f1",
                color: "#dc2626",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyCenter: "center",
                margin: "0 auto 20px",
                justifyContent: "center",
              }}
            >
              <Trash2 size={32} />
            </div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                marginBottom: "10px",
              }}
            >
              Delete Category?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                marginBottom: "25px",
              }}
            >
              This action cannot be undone. All related products might become
              uncategorized.
            </p>
            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center" }}
            >
              <button
                className="btn-ghost"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ background: "#dc2626" }}
                onClick={handleDelete}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListCategories;
