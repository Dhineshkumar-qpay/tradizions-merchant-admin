import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";
import "../../../pages/ListProducts.css"; // exact match style

const SubcategoryList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectCount, setSelectCount] = useState("10");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newSub, setNewSub] = useState({
    name: "",
    categoryId: "",
    status: "Active",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubcategories = async (
    cats = categories,
    catId = filterCategory,
  ) => {
    setIsLoading(true);
    try {
      if (catId === "All") {
        const promises = cats.map((c) =>
          API.post(APIROUTES.GETALLSUBCATEGORIES, {
            categoryid: c.categoryid,
          }).catch(() => null),
        );
        const results = await Promise.all(promises);
        const allSubs = [];
        results.forEach((res) => {
          if (
            res &&
            res.data &&
            res.data.statusCode === 200 &&
            Array.isArray(res.data.data)
          ) {
            allSubs.push(...res.data.data);
          }
        });
        setSubcategories(allSubs);
      } else {
        const res = await API.post(APIROUTES.GETALLSUBCATEGORIES, {
          categoryid: parseInt(catId),
        });
        if (res.data && res.data.statusCode === 200) {
          setSubcategories(res.data.data || []);
        } else {
          setSubcategories([]);
        }
      }
    } catch (error) {
      console.error("Fetch subcategories error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const catRes = await API.post(APIROUTES.GETALLCATEGORIES, { type: "all" });
        if (catRes.data && catRes.data.statusCode === 200) {
          const fetchedCats = catRes.data.data || [];
          setCategories(fetchedCats);

          const promises = fetchedCats.map((c) =>
            API.post(APIROUTES.GETALLSUBCATEGORIES, {
              categoryid: c.categoryid,
            }).catch(() => null),
          );
          const results = await Promise.all(promises);
          const allSubs = [];
          results.forEach((res) => {
            if (
              res &&
              res.data &&
              res.data.statusCode === 200 &&
              Array.isArray(res.data.data)
            ) {
              allSubs.push(...res.data.data);
            }
          });
          setSubcategories(allSubs);
        }
      } catch (error) {
        console.error("Load initial data error:", error);
        toast.error("Failed to load categories data");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    fetchSubcategories(categories, filterCategory);
  }, [filterCategory]);

  const filteredSubs = subcategories.filter(
    (sub) =>
      (filterCategory === "All" ||
        sub.categoryid.toString() === filterCategory.toString()) &&
      (sub.subcategoryname || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const displayedSubs =
    selectCount === "All"
      ? filteredSubs
      : filteredSubs.slice(
          (currentPage - 1) * Number(selectCount),
          currentPage * Number(selectCount),
        );

  const totalPages = selectCount === "All" ? 1 : Math.ceil(filteredSubs.length / Number(selectCount));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      toast.success("Subcategory updated!");
      setIsAdding(false);
      setEditingId(null);
      setNewSub({ name: "", categoryId: "", status: "Active" });
      return;
    }

    const selectedCat = categories.find(
      (c) => c.categoryid.toString() === newSub.categoryId.toString(),
    );
    const categoryName = selectedCat ? selectedCat.categoryname : "";

    try {
      const payload = {
        categoryid: parseInt(newSub.categoryId),
        categoryname: categoryName,
        subcategoryname: newSub.name,
      };

      const response = await API.post(APIROUTES.ADDSUBCATEGORY, payload);
      if (response.data && response.data.statusCode === 200) {
        toast.success(`Subcategory "${newSub.name}" created successfully!`);
        setIsAdding(false);
        setNewSub({ name: "", categoryId: "", status: "Active" });
        fetchSubcategories(categories, filterCategory);
      } else {
        toast.error(response.data?.message || "Failed to create subcategory");
      }
    } catch (error) {
      console.error("Add subcategory error:", error);
    }
  };

  const handleEdit = (sub) => {
    setEditingId(sub.subcategoryid);
    setNewSub({
      name: sub.subcategoryname,
      categoryId: sub.categoryid.toString(),
      status: sub.status || "Active",
    });
    setIsAdding(true);
  };

  const handleDelete = (name) => {
    if (window.confirm(`Delete subcategory ${name}?`)) {
      toast.error(`Deleted ${name}`);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewSub({ name: "", categoryId: "", status: "Active" });
  };

  return (
    <div className="list-products-container">
      {/* Header */}
      <div className="page-header-actions">
        <div>
          <h1>Subcategories</h1>
          <p>Organize products further into nested subcategories.</p>
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
              <Plus size={16} /> Add Subcategory
            </button>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="table-wrapper section-card animate-pop" style={{ marginBottom: "30px", border: "1px solid var(--accent)", background: "rgba(232, 176, 89, 0.02)" }}>
          <div className="table-controls" style={{ borderBottom: "1px solid #f0f3ee", paddingBottom: "15px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>
                {editingId ? "Edit Subcategory" : "Create Subcategory"}
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
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "250px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    Subcategory Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newSub.name}
                    onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                    style={{ width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px" }}
                    placeholder="e.g. Pearl Millet"
                  />
                </div>
                <div style={{ flex: 1, minWidth: "250px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    Parent Category
                  </label>
                  <select
                    required
                    value={newSub.categoryId}
                    onChange={(e) => setNewSub({ ...newSub, categoryId: e.target.value })}
                    style={{ width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px" }}
                  >
                    <option value="">Select Category...</option>
                    {categories.map((cat) => (
                      <option key={cat.categoryid} value={cat.categoryid}>
                        {cat.categoryname}
                      </option>
                    ))}
                  </select>
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
                  {editingId ? "Update Subcategory" : "Save Subcategory"}
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
              placeholder="Search subcategories..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center" }}>
            <div className="filter-item" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" }}>
                Parent Category
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Filter size={14} style={{ position: "absolute", left: "10px", color: "var(--text-muted)" }} />
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ padding: "8px 12px 8px 30px", borderRadius: "8px", minWidth: "150px", fontSize: "14px", border: "1.5px solid #edf2e9", background: "#f8fbf6" }}
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryid} value={cat.categoryid}>
                      {cat.categoryname}
                    </option>
                  ))}
                </select>
              </div>
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
                <option value="30">30 Entries</option>
                <option value="40">40 Entries</option>
                <option value="50">50 Entries</option>
                <option value="All">All Subs</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive thin-scrollbar">
          {isLoading ? (
            <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : displayedSubs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              No subcategories found.
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>Subcategory Name</th>
                  <th>Parent Category</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedSubs.map((sub, index) => (
                  <tr key={sub.subcategoryid} onClick={() => handleEdit(sub)} style={{ cursor: "pointer" }}>
                    <td>
                      {(currentPage - 1) * (selectCount === "All" ? 10 : Number(selectCount)) + index + 1}
                    </td>
                    <td>
                      <div className="p-cell-info">
                        <span className="p-name">{sub.subcategoryname}</span>
                        <span className="p-id-badge" style={{ marginTop: "4px" }}>
                          SUB-00{sub.subcategoryid}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="cat-pill" style={{ display: "inline-block" }}>
                        {sub.categoryname}
                      </span>
                    </td>
                    <td>
                      <div className="action-cell" onClick={(e) => e.stopPropagation()} style={{ justifyContent: "flex-end" }}>
                        <button className="action-btn edit" title="Edit Subcategory" onClick={() => handleEdit(sub)}>
                          <Edit size={16} />
                        </button>
                        <button className="action-btn delete" title="Delete Subcategory" onClick={() => handleDelete(sub.subcategoryname)}>
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
            Showing <strong>{displayedSubs.length}</strong> of{" "}
            <strong>{filteredSubs.length}</strong> subcategories
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

export default SubcategoryList;
