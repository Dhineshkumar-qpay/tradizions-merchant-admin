import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  X,
  Upload,
  Layers,
  Image as ImageIcon,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES, IMAGE_URL } from "../../routes/api_routes";
import "../../../pages/ListProducts.css"; // exact match style

const CategoryList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectCount, setSelectCount] = useState("10");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    image: null,
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await API.post(APIROUTES.GETALLCATEGORIES, { type: "all" });
      if (response.data && response.data.statusCode === 200) {
        setCategories(response.data.data || []);
      } else {
        toast.error(response.data?.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    (cat.categoryname || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const displayedCategories =
    selectCount === "All"
      ? filteredCategories
      : filteredCategories.slice(
          (currentPage - 1) * Number(selectCount),
          currentPage * Number(selectCount),
        );

  const totalPages = selectCount === "All" ? 1 : Math.ceil(filteredCategories.length / Number(selectCount));

  const handleEdit = (cat) => {
    setEditingId(cat.categoryid);
    setNewCategory({
      name: cat.categoryname,
      description: cat.description || "",
      image: null,
    });
    setIsAdding(true);
    setSelectedCategory(null);
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      toast.success(`Category updated successfully!`);
      setIsAdding(false);
      setEditingId(null);
      setNewCategory({ name: "", description: "", image: null });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("categoryname", newCategory.name);
      formData.append("description", newCategory.description);
      if (newCategory.image) {
        formData.append("categoryimage", newCategory.image);
      }

      const response = await API.post(APIROUTES.ADDCATEGORY, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data && response.data.statusCode === 200) {
        toast.success(`Category "${newCategory.name}" created successfully!`);
        setIsAdding(false);
        setNewCategory({ name: "", description: "", image: null });
        fetchCategories();
      } else {
        toast.error(response.data?.message || "Failed to create category");
      }
    } catch (error) {
      console.error("Add category error:", error);
    }
  };

  const handleDelete = (name) => {
    if (window.confirm(`Delete category "${name}"?`)) {
      toast.error(`Category ${name} removed`);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewCategory({ name: "", description: "", image: null });
  };

  return (
    <div className="list-products-container">
      {/* Header */}
      <div className="page-header-actions">
        <div>
          <h1>Categories</h1>
          <p>Organize and manage your product categories.</p>
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
              <Plus size={16} /> Add Category
            </button>
          </div>
        )}
      </div>

      {/* Form Section */}
      {isAdding && (
        <div className="table-wrapper section-card animate-pop" style={{ marginBottom: "30px", border: "1px solid var(--accent)", background: "rgba(232, 176, 89, 0.02)" }}>
          <div className="table-controls" style={{ borderBottom: "1px solid #f0f3ee", paddingBottom: "15px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>
                {editingId ? "Edit Category" : "Create Category"}
              </h3>
            </div>
            <button
              onClick={handleCancel}
              style={{ padding: "8px", background: "#f8fbf6", borderRadius: "10px", color: "var(--text-muted)" }}
            >
              <X size={18} />
            </button>
          </div>
          <div style={{ padding: "20px" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
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
                    {newCategory.image ? (
                      <img
                        src={URL.createObjectURL(newCategory.image)}
                        alt="Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <>
                        <Upload size={24} color="#9ca3af" style={{ marginBottom: "8px" }} />
                        <span style={{ fontSize: "10px", fontWeight: "bold", color: "#9ca3af", textTransform: "uppercase" }}>
                          Upload
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                      onChange={(e) => setNewCategory({ ...newCategory, image: e.target.files[0] })}
                    />
                  </div>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "15px", minWidth: "250px" }}>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                      Category Name
                    </label>
                    <input
                      type="text"
                      style={{ width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px" }}
                      placeholder="e.g. Organic Millets"
                      required
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                      Short Description
                    </label>
                    <textarea
                      style={{ width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px", minHeight: "80px", resize: "none" }}
                      placeholder="Brief summary..."
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    />
                  </div>
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
                  {editingId ? "Update Category" : "Save Category"}
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
              placeholder="Search categories..."
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
              style={{ padding: "8px 12px", borderRadius: "8px", minWidth: "130px", fontSize: "14px" }}
            >
              <option value="10">10 Entries</option>
              <option value="20">20 Entries</option>
              <option value="30">30 Entries</option>
              <option value="40">40 Entries</option>
              <option value="50">50 Entries</option>
              <option value="All">All Categories</option>
            </select>
          </div>
        </div>

        <div className="table-responsive thin-scrollbar">
          {isLoading ? (
            <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : displayedCategories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              No categories found.
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>Image</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Products</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedCategories.map((cat, index) => (
                  <tr key={cat.categoryid} onClick={() => setSelectedCategory(cat)} style={{ cursor: "pointer" }}>
                    <td>
                      {(currentPage - 1) * (selectCount === "All" ? 10 : Number(selectCount)) + index + 1}
                    </td>
                    <td>
                      <div className="table-img-placeholder" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {cat.categoryimage ? (
                          <img
                            src={`${IMAGE_URL}${cat.categoryimage}`}
                            alt={cat.categoryname}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div style={{ display: cat.categoryimage ? "none" : "flex", color: "var(--primary)", fontWeight: "bold" }}>
                          {(cat.categoryname || "C").charAt(0)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="p-cell-info">
                        <span className="p-name">{cat.categoryname}</span>
                        <span className="p-id-badge" style={{ marginTop: "4px" }}>
                          CAT-00{cat.categoryid}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {cat.description || "No description."}
                      </div>
                    </td>
                    <td>
                      <span className="cat-pill">
                        <Layers size={12} style={{ display: "inline", marginRight: "4px" }} />
                        {cat.products || 0} Linked
                      </span>
                    </td>
                    <td>
                      <div className="action-cell" onClick={(e) => e.stopPropagation()}>
                        <button className="action-btn view" title="View Details" onClick={() => setSelectedCategory(cat)}>
                          <Eye size={16} />
                        </button>
                        <button className="action-btn edit" title="Edit Category" onClick={() => handleEdit(cat)}>
                          <Edit size={16} />
                        </button>
                        <button className="action-btn delete" title="Delete Category" onClick={() => handleDelete(cat.categoryname)}>
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
            Showing <strong>{displayedCategories.length}</strong> of{" "}
            <strong>{filteredCategories.length}</strong> categories
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

      {/* Category View Sidebar Drawer */}
      {selectedCategory &&
        createPortal(
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
              onClick={() => setSelectedCategory(null)}
            />
            <div className="modal-drawer slide-left">
              <div className="drawer-header">
                <div className="header-title">
                  <h2>Category Details</h2>
                  <span className="id-badge">CAT-00{selectedCategory.categoryid}</span>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="close-btn"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="drawer-content">
                <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "30px", paddingBottom: "25px", borderBottom: "1px solid #f0f3ee" }}>
                  <div className="product-large-preview">
                    {selectedCategory.categoryimage ? (
                      <img
                        src={`${IMAGE_URL}${selectedCategory.categoryimage}`}
                        alt={selectedCategory.categoryname}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "16px" }}
                      />
                    ) : (
                      <ImageIcon size={32} />
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "22px", fontWeight: "bold", color: "var(--text-main)", marginBottom: "5px" }}>
                      {selectedCategory.categoryname}
                    </h3>
                    <span className="status-badge status-active">Active</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <h4 style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
                      Description
                    </h4>
                    <p style={{ fontSize: "14px", color: "var(--text-main)", lineHeight: "1.6" }}>
                      {selectedCategory.description || "No description provided."}
                    </p>
                  </div>
                  <div style={{ paddingTop: "20px", borderTop: "1px solid #f0f3ee" }}>
                    <h4 style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
                      Products Linked
                    </h4>
                    <span className="cat-pill" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", padding: "8px 14px" }}>
                      <Layers size={16} /> {selectedCategory.products || 0} Items
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => handleEdit(selectedCategory)}>
                  <Edit size={16} style={{ marginRight: "6px" }} /> Edit Category
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};

export default CategoryList;
