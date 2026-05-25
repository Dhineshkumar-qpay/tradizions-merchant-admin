import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Store,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Business.css";
import { API } from "../../service/api_service";
import { APIROUTES } from "../../routes/api_routes";

const BusinessList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All Status");

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const response = await API.post(APIROUTES.GETALLBUSINESSES);
        if (response.data && response.data.statusCode === 200) {
          setBusinesses(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching businesses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch =
      (b.businessname &&
        b.businessname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.phone && b.phone.includes(searchTerm)) ||
      (b.merchantname &&
        b.merchantname.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "All Status" ||
      (statusFilter === "Active" && b.status==="active") ||
      (statusFilter === "Inactive" && b.verified==="inactive");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="business-list-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Business Management</h1>
          <p>Directory of all registered businesses and merchants.</p>
        </div>
      </div>

      <div className="table-card section-card">
        <div className="table-filters-row">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, owner or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-options">
            <div className="filter-item">
              <label>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active </option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <button className="btn-icon-outline">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div
              style={{
                padding: "80px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "15px",
              }}
            >
              <span>Loading registered businesses...</span>
            </div>
          ) : (
            <>
              <table className="business-table">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Owner Name</th>
                    <th>Mobile Number</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBusinesses.map((biz) => (
                    <tr
                      key={biz.bid}
                      className="row-hover"
                      onClick={() => navigate(`/business/${biz.bid}`)}
                    >
                      <td>
                        <div className="biz-name-cell">
                          <div className="biz-avatar">
                            <Store size={18} />
                          </div>
                          <div className="biz-info">
                            <span className="primary-text">
                              {biz.businessname}
                            </span>
                            <span className="id-badge-text">BIZ-{biz.bid}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="secondary-text">
                          {biz.merchantname || "No Owner"}
                        </span>
                      </td>
                      <td>
                        <div className="contact-cell">
                          <Phone size={14} />
                          <span>{biz.phone || "N/A"}</span>
                        </div>
                      </td>
                      <td>
                        <span className="category-tag">General</span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${biz.status ? "status-active" : "status-inactive"}`}
                        >
                          {biz?.status??""}
                        </span>
                      </td>
                      <td>
                        <div
                          className="action-cell"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="action-btn view"
                            onClick={() => navigate(`/business/${biz.bid}`)}
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="action-btn edit"
                            onClick={() =>
                              navigate(`/business/edit/${biz.bid}`)
                            }
                            title="Edit business"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredBusinesses.length === 0 && (
                <div
                  className="empty-state"
                  style={{ padding: "40px", textAlign: "center" }}
                >
                  <Store
                    size={64}
                    style={{ color: "var(--text-muted)", marginBottom: "15px" }}
                  />
                  <h3>No businesses found</h3>
                  <p>
                    We couldn't find any business matching your search criteria.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="pagination-footer">
          <p>
            Showing <strong>{filteredBusinesses.length}</strong> Businesses
          </p>
          <div className="page-controls">
            <button className="btn-page">
              <ChevronLeft size={18} />
            </button>
            <button className="btn-page active">1</button>
            <button className="btn-page">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessList;
