import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, Edit, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";
import { toast } from "react-toastify";
import "../../../pages/ListProducts.css"; // Ensure exact style matching

const MerchantList = ({ type }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectCount, setSelectCount] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [merchants, setMerchants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch businesses from GETBUSINESS API
  const fetchMerchants = async () => {
    setIsLoading(true);
    try {
      const response = await API.post(APIROUTES.GETBUSINESS);
      if (response.data && response.data.statusCode === 200) {
        setMerchants(response.data.data || []);
      } else {
        toast.error(response.data?.message || "Failed to fetch merchants");
      }
    } catch (error) {
      console.error("Fetch merchants error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  // Handle Active/Inactive status toggle via ACTIVEBUSINESS API
  const handleStatusToggle = async (bid, userid, currentStatus) => {
    const toggledStatus = currentStatus === "active" ? "inactive" : "active";

    // Optimistic state update for fluid UI experience
    setMerchants((prev) =>
      prev.map((m) => (m.bid === bid ? { ...m, status: toggledStatus } : m)),
    );

    try {
      const response = await API.post(APIROUTES.ACTIVEBUSINESS, {
        bid,
        status: toggledStatus,
        userid: userid
      });

      if (response.data && response.data.statusCode === 200) {
        toast.success(`Business status updated to ${toggledStatus}!`);
      } else {
        toast.error(response.data?.message || "Failed to update status");
        setMerchants((prev) =>
          prev.map((m) =>
            m.bid === bid ? { ...m, status: currentStatus } : m,
          ),
        );
      }
    } catch (error) {
      console.error("Status toggle error:", error);
      setMerchants((prev) =>
        prev.map((m) => (m.bid === bid ? { ...m, status: currentStatus } : m)),
      );
    }
  };

  const handleDelete = async (bid) => {
    if (!window.confirm("Are you sure you want to delete this business?"))
      return;

    try {
      const response = await API.post(APIROUTES.DELETEBUSINESS, { bid });
      if (response.data.statusCode === 200) {
        toast.success(`${response.data.message}`);
        setMerchants((prev) => prev.filter((m) => m.bid !== bid));
      } else {
        toast.error(response.data?.message || "Failed to delete business");
      }
    } catch (error) {
      console.error("Delete business error:", error);
    }
  };

  const filteredMerchants = merchants.filter(
    (merchant) =>
      (merchant.businessname || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (merchant.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (merchant.username || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const displayedMerchants =
    selectCount === "All"
      ? filteredMerchants
      : filteredMerchants.slice(
          (currentPage - 1) * Number(selectCount),
          currentPage * Number(selectCount)
        );

  const totalPages = selectCount === "All" ? 1 : Math.ceil(filteredMerchants.length / Number(selectCount));

  return (
    <div className="list-products-container">
      <div className="page-header-actions">
        <div>
          <h1>Master Merchants</h1>
          <p>Manage and monitor business accounts.</p>
        </div>
        <div className="header-controls-group">
          <button className="action-btn" onClick={() => navigate("/merchants/create")} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            <Plus size={16} /> Add New Merchant
          </button>
        </div>
      </div>

      <div className="table-wrapper section-card">
        <div
          className="table-controls"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 20px",
            gap: "15px",
          }}
        >
          <div className="search-box" style={{ flex: 1, maxWidth: "400px" }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, phone, email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div
            className="filter-item"
            style={{ display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <label
              style={{
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              Show Count
            </label>
            <select
              className="form-select"
              value={selectCount}
              onChange={(e) => {
                setSelectCount(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                minWidth: "130px",
                fontSize: "14px",
              }}
            >
              <option value="10">10 Entries</option>
              <option value="20">20 Entries</option>
              <option value="30">30 Entries</option>
              <option value="40">40 Entries</option>
              <option value="50">50 Entries</option>
              <option value="All">All Merchants</option>
            </select>
          </div>
        </div>

        <div className="table-responsive thin-scrollbar">
          {isLoading ? (
            <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : displayedMerchants.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--text-muted)",
              }}
            >
              No merchants found matching search criteria.
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>Business Details</th>
                  <th>Owner Name</th>
                  <th>Phone Number</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedMerchants.map((merchant, index) => (
                  <tr key={merchant.bid} onClick={() => navigate(`/merchants/${merchant.bid}`)} style={{ cursor: "pointer" }}>
                    <td>
                      {(currentPage - 1) * (selectCount === "All" ? 10 : Number(selectCount)) + index + 1}
                    </td>
                    <td>
                      <div className="p-cell-info">
                        <span className="p-name">{merchant.businessname}</span>
                        <span className="p-id-badge" style={{ marginTop: "4px" }}>
                          {merchant.description ? merchant.description.substring(0, 30) + '...' : "No description"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: "600", color: "var(--text-main)" }}>
                        {merchant.username || "—"}
                      </span>
                    </td>
                    <td>
                      <span className="cat-pill">
                        {merchant.phone || "—"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleStatusToggle(merchant.bid, merchant.userid, merchant.status)}
                          style={{
                            position: "relative",
                            display: "inline-flex",
                            height: "24px",
                            width: "44px",
                            flexShrink: 0,
                            cursor: "pointer",
                            borderRadius: "9999px",
                            border: "none",
                            transition: "background-color 0.2s",
                            backgroundColor: merchant.status === "active" ? "var(--primary)" : "#e5e7eb",
                          }}
                        >
                          <span
                            style={{
                              pointerEvents: "none",
                              display: "inline-block",
                              height: "20px",
                              width: "20px",
                              borderRadius: "50%",
                              backgroundColor: "white",
                              transform: merchant.status === "active" ? "translateX(20px)" : "translateX(2px)",
                              transition: "transform 0.2s",
                              marginTop: "2px"
                            }}
                          />
                        </button>
                        <span className={`status-badge ${merchant.status === "active" ? "status-active" : "status-out"}`}>
                          {merchant.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="action-cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="action-btn view"
                          title="View Details"
                          onClick={() => navigate(`/merchants/${merchant.bid}`)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="action-btn edit"
                          title="Edit Merchant"
                          onClick={() => navigate(`/merchants/edit/${merchant.bid}`, { state: { merchant } })}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Delete Merchant"
                          onClick={() => handleDelete(merchant.bid)}
                        >
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
            Showing <strong>{displayedMerchants.length}</strong> of{" "}
            <strong>{filteredMerchants.length}</strong> merchants
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

export default MerchantList;
