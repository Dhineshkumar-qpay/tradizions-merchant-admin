import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  X,
  BookOpen,
  Quote,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";
import "../../../pages/ListProducts.css";

const KuralList = () => {
  const [kurals, setKurals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectCount, setSelectCount] = useState("10");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ kural: "", meaning: "" });
  const [file, setFile] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const fetchKurals = async () => {
    setIsLoading(true);
    try {
      const response = await API.post(APIROUTES.GETKURALS);
      if (response.data && response.data.statusCode === 200) {
        setKurals(response.data.data || []);
      } else {
        toast.error(response.data?.message || "Failed to fetch Kurals");
      }
    } catch (error) {
      console.error("Fetch kurals error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKurals();
  }, []);

  const filteredKurals = kurals.filter(
    (item) =>
      (item.kural &&
        item.kural.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.meaning &&
        item.meaning.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const displayedKurals =
    selectCount === "All"
      ? filteredKurals
      : filteredKurals.slice(
          (currentPage - 1) * Number(selectCount),
          currentPage * Number(selectCount),
        );

  const totalPages = selectCount === "All" ? 1 : Math.ceil(filteredKurals.length / Number(selectCount));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      if (!formData.kural.trim() || !formData.meaning.trim()) {
        toast.error("Please fill in both Kural and Meaning fields.");
        return;
      }
      try {
        const response = await API.post(APIROUTES.UPDATEKURAL, {
          kuralid: editingId,
          kural: formData.kural,
          meaning: formData.meaning,
        });
        if (response.data && response.data.statusCode === 200) {
          toast.success("Thinam Oru Kural updated successfully!");
          fetchKurals();
        } else {
          toast.error(response.data?.message || "Failed to update Kural");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error updating Kural");
      }
    } else {
      if (!file) {
        toast.error("Please select a JSON file to upload.");
        return;
      }
      const formDataToSend = new FormData();
      formDataToSend.append("kurals", file);

      try {
        const response = await API.post(APIROUTES.ADDKURAL, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data && response.data.statusCode === 200) {
          toast.success("Thinam Oru Kural added successfully!");
          fetchKurals();
        } else {
          toast.error(response.data?.message || "Failed to add Kurals");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error adding Kurals");
      }
    }

    setFormData({ kural: "", meaning: "" });
    setFile(null);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setFormData({ kural: item.kural, meaning: item.meaning });
    setEditingId(item.kuralid);
    setIsAdding(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this Kural?")) {
      setKurals(kurals.filter((item) => item.kuralid !== id));
      toast.error("Kural removed successfully.");
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ kural: "", meaning: "" });
    setFile(null);
  };

  return (
    <div className="list-products-container">
      {/* Header */}
      <div className="page-header-actions">
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BookOpen size={24} style={{ color: "var(--primary)" }} /> Thinam Oru Kural
          </h1>
          <p>Manage daily quotes and verses for your platform.</p>
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
              <Plus size={16} /> Add Kural
            </button>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="table-wrapper section-card animate-pop" style={{ marginBottom: "30px", border: "1px solid var(--accent)", background: "rgba(232, 176, 89, 0.02)" }}>
          <div className="table-controls" style={{ borderBottom: "1px solid #f0f3ee", paddingBottom: "15px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>
                {editingId ? "Edit Kural" : "Add New Kural"}
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
              <div style={{ display: "grid", gridTemplateColumns: editingId ? "1fr 1fr" : "1fr", gap: "20px" }}>
                {editingId ? (
                  <>
                    <div>
                      <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                        Kural Verse (குறள்)
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.kural}
                        onChange={(e) => setFormData({ ...formData, kural: e.target.value })}
                        style={{ width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px", lineHeight: "1.6" }}
                        placeholder="Enter 2-line Thirukkural verse..."
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                        Meaning (விளக்கம்)
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.meaning}
                        onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                        style={{ width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px", lineHeight: "1.6" }}
                        placeholder="Enter Kural explanation / meaning..."
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                      Upload Kurals JSON
                    </label>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => setFile(e.target.files[0])}
                      style={{ width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border)", background: "white", fontSize: "14px" }}
                    />
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
                      Only .json files are allowed.
                    </p>
                  </div>
                )}
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
                  {editingId ? "Update Kural" : "Save Kural"}
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
              placeholder="Search kurals or meanings..."
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
              <option value="All">All Kurals</option>
            </select>
          </div>
        </div>

        <div className="table-responsive thin-scrollbar">
          {isLoading ? (
            <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : displayedKurals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              No Kurals found.
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th style={{ width: "35%" }}>Kural (குறள்)</th>
                  <th style={{ width: "45%" }}>Meaning (விளக்கம்)</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedKurals.map((item, index) => (
                  <tr key={item.kuralid}>
                    <td style={{ verticalAlign: "top", paddingTop: "20px" }}>
                      {(currentPage - 1) * (selectCount === "All" ? 10 : Number(selectCount)) + index + 1}
                    </td>
                    <td style={{ verticalAlign: "top", paddingTop: "20px" }}>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <Quote size={16} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "2px" }} />
                        <p style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-main)", whiteSpace: "pre-line", lineHeight: "1.7" }}>
                          {item.kural}
                        </p>
                      </div>
                    </td>
                    <td style={{ verticalAlign: "top", paddingTop: "20px" }}>
                      <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.7", fontWeight: "500" }}>
                        {item.meaning}
                      </p>
                    </td>
                    <td style={{ verticalAlign: "top", paddingTop: "20px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)" }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </td>
                    <td style={{ verticalAlign: "top", paddingTop: "15px" }}>
                      <div className="action-cell" style={{ justifyContent: "flex-end" }}>
                        <button className="action-btn edit" title="Edit Kural" onClick={() => handleEdit(item)}>
                          <Edit size={16} />
                        </button>
                        <button className="action-btn delete" title="Delete Kural" onClick={() => handleDelete(item.kuralid)}>
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
            Showing <strong>{displayedKurals.length}</strong> of{" "}
            <strong>{filteredKurals.length}</strong> kurals
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

export default KuralList;
