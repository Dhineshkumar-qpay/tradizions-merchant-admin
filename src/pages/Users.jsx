import React, { useState } from "react";
import {
  Search,
  Filter,
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  MapPin,
  X,
  Plus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import "./Users.css";

const Users = () => {
  const [users, setUsers] = useState([
    {
      id: "USR-201",
      name: "Aniket Sharma",
      email: "aniket@example.com",
      phone: "+91 98765 43210",
      role: "Admin",
      status: "Active",
      registeredDate: "2026-01-15",
      address: "No 45, Green Park, South Delhi - 110016",
      totalOrders: 12,
      totalPurchase: 8450,
    },
    {
      id: "USR-202",
      name: "Priya Verma",
      email: "priya.v@example.com",
      phone: "+91 88776 65544",
      role: "User",
      status: "Active",
      registeredDate: "2026-02-10",
      address: "Flat 302, Lake View Apts, Powai, Mumbai - 400076",
      totalOrders: 5,
      totalPurchase: 2100,
    },
    {
      id: "USR-203",
      name: "Rahul Dravid",
      email: "rahul.d@example.com",
      phone: "+91 77665 54433",
      role: "User",
      status: "Inactive",
      registeredDate: "2026-03-05",
      address: "12th Cross, Indiranagar, Bangalore - 560038",
      totalOrders: 1,
      totalPurchase: 450,
    },
    {
      id: "USR-204",
      name: "Sunita Gill",
      email: "sunita.g@example.com",
      phone: "+91 99887 76655",
      role: "User",
      status: "Active",
      registeredDate: "2026-03-20",
      address: "House No 12, Sector 15, Chandigarh - 160015",
      totalOrders: 8,
      totalPurchase: 5600,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm),
  );

  return (
    <div className="users-mgmt-container">
      <div className="page-header">
        <div className="header-text">
          <h1>User Management</h1>
          <p>Manage your platform administrators and customer accounts.</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => {
              setIsEditing(false);
              setShowFormModal(true);
            }}
          >
            <UserPlus size={18} />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      <div className="table-card section-card">
        <div className="table-filters-row">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by ID, Name or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-options">
            <div className="filter-item">
              <label>Role</label>
              <select>
                <option>All Roles</option>
                <option>Admin</option>
                <option>User</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Status</label>
              <select>
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <button className="btn-icon-outline">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="table-responsive thin-scrollbar">
          <table className="users-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Profile</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="user-row">
                  <td>
                    <span className="user-id-tag">{user.id}</span>
                  </td>
                  <td>
                    <div className="profile-cell">
                      <div className="avatar">{user.name.charAt(0)}</div>
                      <span className="name">{user.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="email-text">{user.email}</span>
                  </td>
                  <td>
                    <span className="phone-text">{user.phone}</span>
                  </td>
                  <td>
                    <span className={`role-tag ${user.role.toLowerCase()}`}>
                      <Shield size={12} />
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${user.status.toLowerCase()}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <span className="date-text">{user.registeredDate}</span>
                  </td>
                  <td>
                    <div className="action-cell">
                      <button
                        className="action-btn view"
                        title="View Details"
                        onClick={() => setShowDetailDrawer(user)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-btn edit"
                        title="Edit User"
                        onClick={() => {
                          setIsEditing(true);
                          setCurrentUser(user);
                          setShowFormModal(true);
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="action-btn delete"
                        title="Delete User"
                        onClick={() => setShowDeleteConfirm(user.id)}
                      >
                        <Trash2 size={16} />
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
            Showing <strong>{filteredUsers.length}</strong> Users
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

      {/* User Form Modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content user-form-modal animate-pop">
            <div className="modal-header">
              <h2>{isEditing ? "Edit User" : "Add New User"}</h2>
              <button
                className="close-btn"
                onClick={() => setShowFormModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    defaultValue={isEditing ? currentUser?.name : ""}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="example@mail.com"
                    defaultValue={isEditing ? currentUser?.email : ""}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 XXXX"
                    defaultValue={isEditing ? currentUser?.phone : ""}
                  />
                </div>
                {!isEditing && (
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" placeholder="••••••••" />
                  </div>
                )}
                <div className="form-group">
                  <label>Role</label>
                  <select defaultValue={isEditing ? currentUser?.role : "User"}>
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <div className="toggle-wrap">
                    <span>
                      {isEditing ? currentUser?.status : "Initial Status"}
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked={
                        isEditing ? currentUser?.status === "Active" : true
                      }
                    />
                  </div>
                </div>
                <div className="form-group full">
                  <label>Full Address</label>
                  <textarea
                    rows="3"
                    placeholder="Enter residential address"
                    defaultValue={isEditing ? currentUser?.address : ""}
                  ></textarea>
                </div>
              </div>
            </form>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowFormModal(false)}
              >
                Cancel
              </button>
              <button type="button" className="btn-primary">
                Save User Information
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Drawer */}
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
                <h2>User Details</h2>
                <span className="id">{showDetailDrawer.id}</span>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowDetailDrawer(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-content">
              <div className="user-profile-header">
                <div className="large-avatar">
                  {showDetailDrawer.name.charAt(0)}
                </div>
                <div className="user-meta">
                  <h3>{showDetailDrawer.name}</h3>
                  <span className="role">{showDetailDrawer.role}</span>
                  <span
                    className={`badge ${showDetailDrawer.status.toLowerCase()}`}
                  >
                    {showDetailDrawer.status}
                  </span>
                </div>
              </div>

              <div className="drawer-info-grid">
                <div className="info-section">
                  <h4>
                    <Shield size={16} /> Contact Information
                  </h4>
                  <div className="info-list">
                    <div className="item">
                      <Mail size={14} /> <span>{showDetailDrawer.email}</span>
                    </div>
                    <div className="item">
                      <Phone size={14} /> <span>{showDetailDrawer.phone}</span>
                    </div>
                    <div className="item">
                      <MapPin size={14} /> <p>{showDetailDrawer.address}</p>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h4>
                    <Calendar size={16} /> Account Summary
                  </h4>
                  <div className="stats-box">
                    <div className="stat">
                      <label>Registration Date</label>
                      <span>{showDetailDrawer.registeredDate}</span>
                    </div>
                    <div className="stat-row">
                      <div className="stat">
                        <label>Total Orders</label>
                        <span className="hl">
                          {showDetailDrawer.totalOrders}
                        </span>
                      </div>
                      <div className="stat">
                        <label>Total Purchase</label>
                        <span className="hl">
                          ₹{showDetailDrawer.totalPurchase}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content animate-pop compact">
            <div className="modal-icon-box delete">
              <Trash2 size={32} />
            </div>
            <h3>Delete User?</h3>
            <p>
              Are you sure you want to remove this user? This will also delete
              their associated data.
            </p>
            <div className="modal-btn-group">
              <button
                className="btn-ghost"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn-solid-danger"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
