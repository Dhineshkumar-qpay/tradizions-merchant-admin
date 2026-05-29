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
  Layers,
  Save,
  Grid,
} from "lucide-react";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./Subcategories.css";

const Subcategories = () => {
  // States
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default ten per page

  // Form input states
  const [formData, setFormData] = useState({
    categoryid: "",
    subcategoryname: "",
  });

  // Filters & Actions States
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch subcategories when categories load or selection changes
  useEffect(() => {
    if (categories.length > 0) {
      fetchSubcategories(selectedFilterCategory);
    }
  }, [categories, selectedFilterCategory]);

  // Image Absolute Path Resolver
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    const base = API.defaults.baseURL || "http://localhost:3000/api";
    const origin = base.replace(/\/api\/?$/, "");
    return `${origin}${path}`;
  };

  const fetchCategories = async () => {
    try {
      const response = await API.post(APIROUTES.GETALLCATEGORIES);
      const data = response.data?.data || response.data;
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      }
    } catch (err) {
      console.warn("Failed to fetch categories from API, using fallback:", err);
    }
  };

  const fetchSubcategories = async (filterCatId = "all") => {
    setLoading(true);
    try {
      if (filterCatId === "all") {
        const allFetched = [];
        for (const cat of categories) {
          try {
            const res = await API.post(APIROUTES.GETALLSUBCATEGORIES, {
              categoryid: Number(cat.categoryid),
            });
            const data = res.data?.data || res.data;
            if (Array.isArray(data)) {
              allFetched.push(...data);
            }
          } catch (err) {
            console.warn(
              `Failed to fetch subcategories for category ${cat.categoryid}:`,
              err,
            );
          }
        }
        if (allFetched.length > 0) {
          setSubcategories(allFetched);
        } else {
          setSubcategories(initialSubcategories);
        }
      } else {
        const res = await API.post(APIROUTES.GETALLSUBCATEGORIES, {
          categoryid: Number(filterCatId),
        });
        const data = res.data?.data || res.data;
        if (Array.isArray(data)) {
          setSubcategories(data);
        } else {
          setSubcategories([]);
        }
      }
    } catch (err) {
      console.warn(
        "Failed to fetch subcategories from API, using fallback:",
        err,
      );
      if (filterCatId === "all") {
        setSubcategories(initialSubcategories);
      } else {
        setSubcategories(
          initialSubcategories.filter(
            (s) => Number(s.categoryid) === Number(filterCatId),
          ),
        );
      }
    } finally {
      setLoading(false);
      setCurrentPage(1); // Reset page on filter changes
    }
  };

  // Add subcategory submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryid) {
      setError("Please select a parent category.");
      return;
    }
    if (!formData.subcategoryname.trim()) {
      setError("Please enter a subcategory name.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const parentCat = categories.find(
      (c) => Number(c.categoryid) === Number(formData.categoryid),
    );
    const parentName = parentCat ? parentCat.categoryname : "";

    const payload = {
      categoryid: Number(formData.categoryid),
      categoryname: parentName,
      subcategoryname: formData.subcategoryname,
    };

    try {
      const response = await API.post(APIROUTES.ADDSUBCATEGORY, payload);
      setSuccess("Subcategory created successfully!");
      setFormData({ categoryid: "", subcategoryname: "" });
      fetchSubcategories(selectedFilterCategory);
    } catch (err) {
      console.error("Add Subcategory API Error, using fallback:", err);

      const localNew = {
        subcategoryid: subcategories.length + 1,
        categoryid: Number(formData.categoryid),
        categoryname: parentName,
        subcategoryname: formData.subcategoryname,
        description: formData.description || "No description provided.",
        status: "Active",
        date: new Date().toISOString().split("T")[0],
      };
      setSubcategories([localNew, ...subcategories]);
      setSuccess("Subcategory added successfully (local fallback)!");
      setFormData({ categoryid: "", subcategoryname: "" });
    } finally {
      setLoading(false);
    }
  };

  // Delete subcategory local fallback
  const handleDelete = () => {
    setSubcategories(
      subcategories.filter((sub) => sub.subcategoryid !== showDeleteConfirm),
    );
    setShowDeleteConfirm(null);
    setSuccess("Subcategory deleted successfully!");
  };

  // Edit subcategory update
  const handleUpdateSubcategory = (e) => {
    e.preventDefault();
    const parentCat = categories.find(
      (c) => Number(c.categoryid) === Number(showEditModal.categoryid),
    );
    const parentName = parentCat ? parentCat.categoryname : "";

    const updatedSubcategories = subcategories.map((sub) =>
      sub.subcategoryid === showEditModal.subcategoryid
        ? { ...sub, ...showEditModal, categoryname: parentName }
        : sub,
    );
    setSubcategories(updatedSubcategories);
    setShowEditModal(null);
    setSuccess("Subcategory updated successfully!");
  };

  // Toggle status
  const toggleStatus = (id) => {
    const updated = subcategories.map((sub) =>
      sub.subcategoryid === id
        ? { ...sub, status: sub.status === "Inactive" ? "Active" : "Inactive" }
        : sub,
    );
    setSubcategories(updated);
  };

  // Helper: Get Parent Category image
  const getParentCategoryImage = (catId) => {
    const cat = categories.find((c) => Number(c.categoryid) === Number(catId));
    return cat ? cat.categoryimage : null;
  };

  // Filtering Logic
  const filteredSubcategories = subcategories.filter((sub) => {
    const matchesSearch =
      sub.subcategoryname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.categoryname?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedFilterCategory === "all" ||
      Number(sub.categoryid) === Number(selectedFilterCategory);
    return matchesSearch && matchesCategory;
  });

  // Pagination Math
  const totalItems = filteredSubcategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedSubcategories = filteredSubcategories.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="subcat-mgmt-container">
      <div className="breadcrumb">
        <span>Catalog</span>
        <ChevronRight size={14} />
        <span>Categories</span>
        <ChevronRight size={14} />
        <span className="current">Subcategories</span>
      </div>

      <div className="page-header">
        <div className="header-text">
          <h1>Subcategories</h1>
          <p>
            Organize specific product groups within major category branches.
          </p>
        </div>
      </div>

      {error && (
        <div
          className="login-alert error animate-pop"
          style={{ maxWidth: "100%", margin: "0 0 20px" }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          className="login-alert success animate-pop"
          style={{ maxWidth: "100%", margin: "0 0 20px" }}
        >
          <AlertCircle size={18} className="success-icon" />
          <span>{success}</span>
        </div>
      )}

      {/* Redesigned Grid: Form Above and Table Below */}
      <div className="subcat-dashboard-grid vertical-stack">
        {/* Subcategory Form Panel ABOVE (Full Width Row) */}
        <div className="form-card section-card full-width-card">
          <div className="card-header-premium">
            <Plus size={18} />
            <h2>Create Subcategory</h2>
          </div>
          <form onSubmit={handleAddSubmit} className="subcategory-form-panel">
            <div className="subcategory-horizontal-form">
              <div className="form-group-custom">
                <label>Parent Category *</label>
                <select
                  value={formData.categoryid}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryid: e.target.value })
                  }
                  required
                >
                  <option value="">Select Parent Category</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryid} value={cat.categoryid}>
                      {cat.categoryname}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group-custom">
                <label>Subcategory Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Almonds, Foxtail Millet"
                  value={formData.subcategoryname}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      subcategoryname: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary form-grid-submit"
                disabled={loading}
              >
                <Save size={16} />
                <span>{loading ? "SAVING..." : "ADD SUBCATEGORY"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Subcategories Table View BELOW (Full Width Row) */}
        <div className="table-card section-card full-width-card">
          <div className="table-filters subcat-filters">
            <div className="search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search subcategories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-actions flex-gap">
              <span className="filter-label">
                <Filter size={14} /> View Category:
              </span>
              <select
                className="category-filter-select"
                value={selectedFilterCategory}
                onChange={(e) => setSelectedFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.categoryid} value={cat.categoryid}>
                    {cat.categoryname}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-responsive">
            {paginatedSubcategories.length > 0 ? (
              <table className="category-table subcat-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Subcategory Info</th>
                    <th>Parent Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubcategories.map((sub, index) => {
                    const parentImg = getParentCategoryImage(sub.categoryid);
                    return (
                      <tr key={sub.subcategoryid}>
                        <td>
                          <div className="subcat-img-box">{index + 1}</div>
                        </td>
                        <td>
                          <div className="cat-info">
                            <span className="cat-name">
                              {sub.subcategoryname}
                            </span>
                            <span className="cat-desc">
                              {sub.description ||
                                "Premium quality millet & organic product sub-branch."}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="parent-cat-badge">
                            <Grid size={12} />
                            {sub.categoryname || "Unknown Category"}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`status-toggle ${(sub.status || "Active").toLowerCase()}`}
                            onClick={() => toggleStatus(sub.subcategoryid)}
                          >
                            <div className="toggle-dot"></div>
                            <span>{sub.status || "Active"}</span>
                          </button>
                        </td>
                        <td>
                          <div className="action-cell">
                            <button
                              className="action-btn view"
                              title="View Details"
                              onClick={() => setShowDetailDrawer(sub)}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="action-btn edit"
                              title="Edit Subcategory"
                              onClick={() => setShowEditModal(sub)}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="action-btn delete"
                              title="Delete Subcategory"
                              onClick={() =>
                                setShowDeleteConfirm(sub.subcategoryid)
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <AlertCircle size={48} />
                </div>
                <h3>No subcategories found</h3>
                <p>
                  Try resetting filters or enter a different search keyword.
                </p>
              </div>
            )}
          </div>

          {/* Paginated Footer with Rows-Per-Page Select count option */}
          <div className="pagination-footer">
            <div className="rows-count-selector">
              <span>Show</span>
              <select
                className="items-per-page-dropdown"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Safely reset to page one on count resize
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>

            <p>
              Showing <strong>{startIndex + 1}</strong> to{" "}
              <strong>{endIndex}</strong> of <strong>{totalItems}</strong>{" "}
              entries
            </p>

            <div className="page-controls">
              <button
                className="btn-page"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>
              <button className="btn-page active">{currentPage}</button>
              <button
                className="btn-page"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategory Read-Only Detail Drawer */}
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
                <h2>Subcategory Details</h2>
                <span className="id-badge">
                  SUB-
                  {showDetailDrawer.subcategoryid.toString().padStart(3, "0")}
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
                  {getParentCategoryImage(showDetailDrawer.categoryid) ? (
                    <img
                      src={getImageUrl(
                        getParentCategoryImage(showDetailDrawer.categoryid),
                      )}
                      alt={showDetailDrawer.subcategoryname}
                    />
                  ) : (
                    <ImageIcon size={40} />
                  )}
                </div>
                <div className="cat-main-meta">
                  <h3>{showDetailDrawer.subcategoryname}</h3>
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
                    <Layers size={14} /> Description
                  </label>
                  <p>
                    {showDetailDrawer.description ||
                      "Premium quality millet & organic product sub-branch."}
                  </p>
                </div>
                <div className="info-row-grid">
                  <div className="info-block">
                    <label>
                      <Grid size={14} /> Parent Category
                    </label>
                    <p>{showDetailDrawer.categoryname}</p>
                  </div>
                  <div className="info-block">
                    <label>
                      <Calendar size={14} /> Date Created
                    </label>
                    <p>{showDetailDrawer.date || "2026-05-11"}</p>
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
                  <Edit size={16} /> Edit Subcategory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div
            className="modal-content animate-pop"
            style={{ maxWidth: "500px" }}
          >
            <div className="modal-header">
              <h2>Edit Subcategory</h2>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(null)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateSubcategory}>
              <div className="modal-form" style={{ padding: "25px" }}>
                <div
                  className="form-group-custom"
                  style={{ marginBottom: "20px" }}
                >
                  <label>Parent Category</label>
                  <select
                    value={showEditModal.categoryid}
                    onChange={(e) =>
                      setShowEditModal({
                        ...showEditModal,
                        categoryid: Number(e.target.value),
                      })
                    }
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.categoryid} value={cat.categoryid}>
                        {cat.categoryname}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  className="form-group-custom"
                  style={{ marginBottom: "20px" }}
                >
                  <label>Subcategory Name</label>
                  <input
                    type="text"
                    value={showEditModal.subcategoryname}
                    onChange={(e) =>
                      setShowEditModal({
                        ...showEditModal,
                        subcategoryname: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div
                  className="form-group-custom"
                  style={{ marginBottom: "20px" }}
                >
                  <label>Description</label>
                  <textarea
                    rows="4"
                    value={showEditModal.description || ""}
                    onChange={(e) =>
                      setShowEditModal({
                        ...showEditModal,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group-custom">
                  <label>Status</label>
                  <select
                    value={showEditModal.status || "Active"}
                    onChange={(e) =>
                      setShowEditModal({
                        ...showEditModal,
                        status: e.target.value,
                      })
                    }
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
                  Update Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
                justifyContent: "center",
                margin: "0 auto 20px",
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
              Delete Subcategory?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                marginBottom: "25px",
              }}
            >
              Are you sure you want to delete this subcategory? All linked
              products will become un-subcategorized.
            </p>
            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center" }}
            >
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                type="button"
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

export default Subcategories;
