import React, { useState, useEffect } from "react";
import { Search, Eye, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./Subcategories.css";
import "./Contact.css";

const TradizionsContacts = () => {
  const [inquiries, setInquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailDrawer, setShowDetailDrawer] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      const endpoint = APIROUTES.GETCONTACTS || "/contact/get-contacts";
      const res = await API.post(endpoint, { type: "normal" });
      if (res.data && res.data.statusCode === 200) {
        setInquiries(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this contact?")) {
        try {
            const endpoint = APIROUTES.DELETECONTACT || "/delete-contactus";
            await API.post(endpoint, { contactid: id });
            setInquiries(inquiries.filter(i => i.contactid !== id));
        } catch (e) { console.error(e); }
    }
  };

  const filteredData = inquiries.filter(inq =>
    (inq.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inq.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="subcat-mgmt-container contact-page-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Contacts</h1>
          <p>Manage customer messages and inquiries.</p>
        </div>
      </div>

      <div className="subcat-dashboard-grid vertical-stack">
        <div className="table-card section-card full-width-card">
          <div className="table-filters subcat-filters">
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="table-responsive thin-scrollbar">
            <table className="category-table subcat-table contact-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((inq, i) => (
                  <tr key={i} className="contact-row">
                    <td><span className="id-badge-text">{(currentPage - 1) * itemsPerPage + i + 1}</span></td>
                    <td><div className="name-cell"><span className="name-text">{inq.name}</span></div></td>
                    <td><span className="email-text">{inq.email}</span></td>
                    <td><span className="phone-text">{inq.phone}</span></td>
                    <td><span className="description-text">{inq.description}</span></td>
                    <td><span className="date-text">{inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : "—"}</span></td>
                    <td>
                      <div className="action-cell">
                        <button className="action-btn view" onClick={() => setShowDetailDrawer(inq)}><Eye size={16} /></button>
                        <button className="action-btn delete" onClick={() => handleDelete(inq.contactid)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
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
      
      {showDetailDrawer && (
        <div className="modal-overlay" onClick={() => setShowDetailDrawer(null)}>
          <div className="modal-drawer slide-left" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="header-title"><h2>Inquiry Details</h2></div>
              <button className="close-btn" onClick={() => setShowDetailDrawer(null)}><X size={20} /></button>
            </div>
            <div className="drawer-content" style={{padding: '20px'}}>
               <p><strong>Name:</strong> {showDetailDrawer.name}</p>
               <p><strong>Email:</strong> {showDetailDrawer.email}</p>
               <p><strong>Phone:</strong> {showDetailDrawer.phone}</p>
               <p><strong>Message:</strong> {showDetailDrawer.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TradizionsContacts;
