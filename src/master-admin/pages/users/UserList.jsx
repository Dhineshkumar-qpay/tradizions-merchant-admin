import React, { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES, IMAGE_URL } from "../../routes/api_routes";
import "../../../pages/ListProducts.css";

const UserList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectCount, setSelectCount] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await API.post(APIROUTES.GETALLUSERS);
      if (response.data && response.data.statusCode === 200) {
        setUsers(response.data.data || []);
      } else {
        toast.error(response.data?.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      (user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const displayedUsers =
    selectCount === "All"
      ? filteredUsers
      : filteredUsers.slice(
          (currentPage - 1) * Number(selectCount),
          currentPage * Number(selectCount),
        );

  const totalPages = selectCount === "All" ? 1 : Math.ceil(filteredUsers.length / Number(selectCount));

  return (
    <div className="list-products-container">
      <div className="page-header-actions">
        <div>
          <h1>Tradizions Users</h1>
          <p>Manage and view all registered users.</p>
        </div>
      </div>

      <div className="table-wrapper section-card">
        <div className="table-controls">
          <div className="search-box" style={{ flex: 1, maxWidth: "400px" }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, phone or email..."
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
              <option value="30">30 Entries</option>
              <option value="40">40 Entries</option>
              <option value="50">50 Entries</option>
              <option value="All">All Users</option>
            </select>
          </div>
        </div>

        <div className="table-responsive thin-scrollbar">
          {isLoading ? (
            <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : displayedUsers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              No users found.
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>User Info</th>
                  <th>Mobile Number</th>
                  <th>Email</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map((user, index) => (
                  <tr key={user.userid}>
                    <td>
                      {(currentPage - 1) * (selectCount === "All" ? 10 : Number(selectCount)) + index + 1}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="table-img-placeholder" style={{ borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {user.profileimage ? (
                            <img
                              src={`${IMAGE_URL}${user.profileimage}`}
                              alt={user.username || "User"}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div style={{ display: user.profileimage ? "none" : "flex", color: "var(--primary)", fontWeight: "bold" }}>
                            {(user.username || "U").charAt(0)}
                          </div>
                        </div>
                        <div className="p-cell-info">
                          <span className="p-name">{user.username || "—"}</span>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", fontWeight: "600" }}>
                            {user.ordercount || 0} Orders placed
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: "600", fontSize: "14px" }}>
                        {user.phone || "—"}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "var(--text-muted)", fontSize: "13.5px" }}>
                        {user.email || "—"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: "600", color: "var(--text-muted)" }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="pagination-footer">
          <p>
            Showing <strong>{displayedUsers.length}</strong> of{" "}
            <strong>{filteredUsers.length}</strong> users
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

export default UserList;
