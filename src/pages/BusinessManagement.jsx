import React, { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus,
  Building,
  MoreVertical,
  Briefcase,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./BusinessManagement.css";

const BusinessManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const [businesses] = useState([
    {
      id: "BUS-001",
      name: "Organic Millets Farm",
      description:
        "Direct from farms to your kitchen. We specialize in ancient grains.",
      owner: "Ramesh Kumar",
      location: "Salem, Tamil Nadu",
      status: "Verified",
    },
    {
      id: "BUS-002",
      name: "Dhivya Health Foods",
      description:
        "Providing nutrient-rich health mixes and snacks for all ages.",
      owner: "Dhivya S.",
      location: "Coimbatore, Tamil Nadu",
      status: "Pending",
    },
    {
      id: "BUS-003",
      name: "Ancient Grain Mart",
      description:
        "A one stop shop for all types of millets and organic pulses.",
      owner: "Arun Singh",
      location: "Mysore, Karnataka",
      status: "Verified",
    },
    {
      id: "BUS-004",
      name: "Nature's Basket Organic",
      description:
        "Premium quality organic products with sustainable packaging.",
      owner: "Meera Reddy",
      location: "Hyderabad, Telangana",
      status: "Rejected",
    },
  ]);

  const filteredBusinesses = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.owner.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="business-mgmt-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Business Directory</h1>
          <p>Manage and verify registered businesses on the platform.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            <Plus size={18} />
            <span>Register Business</span>
          </button>
        </div>
      </div>

      <div className="table-card section-card">
        <div className="table-filters-row">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by Name, Owner or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-options">
            <div className="filter-item">
              <label>Status</label>
              <select>
                <option>All Status</option>
                <option>Verified</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>
            </div>
            <button className="btn-icon-outline">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="business-table">
            <thead>
              <tr>
                <th>Business ID</th>
                <th>Business Info</th>
                <th>Owner</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBusinesses.map((biz) => (
                <tr key={biz.id} className="biz-row">
                  <td>
                    <span className="biz-id-tag">{biz.id}</span>
                  </td>
                  <td>
                    <div className="biz-info-cell">
                      <div className="biz-icon">
                        <Building size={20} />
                      </div>
                      <div className="biz-meta">
                        <span className="name">{biz.name}</span>
                        <p className="desc">
                          {biz.description.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="owner-name">{biz.owner}</span>
                  </td>
                  <td>
                    <div className="location-cell">
                      <MapPin size={14} />
                      <span>{biz.location}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${biz.status.toLowerCase()}`}
                    >
                      {biz.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-cell">
                      <button
                        className="action-btn view"
                        title="View Full Profile"
                        onClick={() => navigate(`/catalog/business/${biz.id}`)}
                      >
                        <Eye size={16} />
                        <span>Details</span>
                      </button>
                      <button className="action-btn-more">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-footer">
          <p>
            Showing <strong>{filteredBusinesses.length}</strong> Registered
            Businesses
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

export default BusinessManagement;
