import React, { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./Subcategories.css"; 
import "./Users.css";

const TradizionsUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const endpoint = APIROUTES.GETALLUSERS || "/admin/getallusers";
      const response = await API.post(endpoint);
      if (response.data && response.data.statusCode === 200) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = users.filter((u) =>
    (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="subcat-mgmt-container users-mgmt-container">
      <div className="page-header">
        <div className="header-text">
          <h1>User List</h1>
          <p>Manage your platform administrators and customer accounts.</p>
        </div>
      </div>

      <div className="subcat-dashboard-grid vertical-stack">
        <div className="table-card section-card full-width-card">
          <div className="table-filters subcat-filters">
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search by Name or Email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="table-responsive thin-scrollbar">
            <table className="category-table subcat-table users-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Profile</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((user, i) => (
                  <tr key={i} className="user-row">
                    <td><span className="user-id-tag">{(currentPage - 1) * itemsPerPage + i + 1}</span></td>
                    <td>
                      <div className="profile-cell">
                        <span className="name">{user.username || "—"}</span>
                        <span className="order-name" style={{fontSize:'12px', color:'#888'}}>{user.ordercount || "0"} Orders</span>
                      </div>
                    </td>
                    <td><span className="email-text">{user.email || "—"}</span></td>
                    <td><span className="phone-text">{user.phone || "—"}</span></td>
                    <td><span className="date-text">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</span></td>
                  </tr>
                ))}
                {paginatedData.length === 0 && !isLoading && (
                  <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 0 && (
            <div className="pagination-footer">
              <div className="rows-count-selector">
                <span>Show</span>
                <select
                  className="items-per-page-dropdown"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
              </div>
              <p>
                Showing <strong>{filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to{" "}
                <strong>{Math.min(currentPage * itemsPerPage, filteredData.length)}</strong> of <strong>{filteredData.length}</strong> entries
              </p>
              <div className="page-controls">
                <button className="btn-page" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={18} /></button>
                <button className="btn-page active">{currentPage}</button>
                <button className="btn-page" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={18} /></button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default TradizionsUsers;
