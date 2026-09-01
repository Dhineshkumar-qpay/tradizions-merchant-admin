import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Mail,
  Phone,
  MessageSquare,
  Building,
  User,
  Calendar,
  Eye,
  Trash2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";
import "../../../pages/ListProducts.css";

const ContactsList = () => {
  const [activeTab, setActiveTab] = useState("normal"); // "normal" or "corporate"
  const [normalInquiries, setNormalInquiries] = useState([]);
  const [corporateInquiries, setCorporateInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectCount, setSelectCount] = useState("10");

  const fetchAllContacts = async () => {
    setIsLoading(true);
    try {
      const [normalRes, corporateRes] = await Promise.all([
        API.post(APIROUTES.GETCONTACTS, { type: "normal" }).catch(() => null),
        API.post(APIROUTES.GETCONTACTS, { type: "corporate" }).catch(
          () => null,
        ),
      ]);

      if (normalRes && normalRes.data && normalRes.data.statusCode === 200) {
        setNormalInquiries(normalRes.data.data || []);
      }
      if (
        corporateRes &&
        corporateRes.data &&
        corporateRes.data.statusCode === 200
      ) {
        setCorporateInquiries(corporateRes.data.data || []);
      }
    } catch (error) {
      console.error("Fetch contacts error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllContacts();
  }, []);

  const activeList = activeTab === "normal" ? normalInquiries : corporateInquiries;

  const filteredInquiries = activeList.filter((item) => {
    const nameStr = (item.name || "").toLowerCase();
    const emailStr = (item.email || "").toLowerCase();
    const phoneStr = (item.phone || "").toLowerCase();
    const descStr = (item.description || "").toLowerCase();
    const qtyStr = (item.quantity || "").toLowerCase();

    return (
      nameStr.includes(searchTerm.toLowerCase()) ||
      emailStr.includes(searchTerm.toLowerCase()) ||
      phoneStr.includes(searchTerm.toLowerCase()) ||
      descStr.includes(searchTerm.toLowerCase()) ||
      qtyStr.includes(searchTerm.toLowerCase())
    );
  });

  const paginatedInquiries = selectCount === "All"
    ? filteredInquiries
    : filteredInquiries.slice(
        (currentPage - 1) * Number(selectCount),
        currentPage * Number(selectCount),
      );
  
  const totalPages = selectCount === "All" ? 1 : Math.ceil(filteredInquiries.length / Number(selectCount));

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this enquiry log?")) return;

    try {
      const response = await API.post(APIROUTES.DELETECONTACT, { contactid: id });
      if (response.data && response.data.statusCode === 200) {
        toast.success(response.data.message || "Enquiry log removed successfully.");
        if (activeTab === "normal") {
          setNormalInquiries((prev) => prev.filter((item) => item.contactid !== id));
        } else {
          setCorporateInquiries((prev) => prev.filter((item) => item.contactid !== id));
        }
      } else {
        toast.error(response.data?.message || "Failed to delete enquiry");
      }
    } catch (error) {
      console.error("Delete contact error:", error);
    }
  };

  return (
    <div className="list-products-container">
      {/* Header */}
      <div className="page-header-actions">
        <div>
          <h1>Contact Enquiries</h1>
          <p>Review customer feedback, general questions, and corporate B2B requests.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "#f8fbf6", padding: "6px", borderRadius: "12px", width: "fit-content", marginBottom: "20px", border: "1.5px solid #edf2e9" }}>
        <button
          onClick={() => handleTabChange("normal")}
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            border: "none",
            background: activeTab === "normal" ? "white" : "transparent",
            color: activeTab === "normal" ? "var(--primary)" : "var(--text-muted)",
            boxShadow: activeTab === "normal" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
            transition: "all 0.2s"
          }}
        >
          <User size={16} /> General Contacts ({normalInquiries.length})
        </button>
        <button
          onClick={() => handleTabChange("corporate")}
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            border: "none",
            background: activeTab === "corporate" ? "white" : "transparent",
            color: activeTab === "corporate" ? "var(--primary)" : "var(--text-muted)",
            boxShadow: activeTab === "corporate" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
            transition: "all 0.2s"
          }}
        >
          <Building size={16} /> Bulk / B2B ({corporateInquiries.length})
        </button>
      </div>

      {/* List Section */}
      <div className="table-wrapper section-card">
        <div className="table-controls">
          <div className="search-box" style={{ flex: 1, maxWidth: "400px" }}>
            <Search size={18} />
            <input
              type="text"
              placeholder={activeTab === "normal" ? "Search regular contacts..." : "Search corporate enquiries..."}
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
              <option value="All">All Entries</option>
            </select>
          </div>
        </div>

        <div className="table-responsive thin-scrollbar">
          {isLoading ? (
            <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : paginatedInquiries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              No matching enquiries found.
            </div>
          ) : (
            <table className="products-table">
              <thead>
                {activeTab === "normal" ? (
                  <tr>
                    <th>S.NO</th>
                    <th>Contact Person</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Description</th>
                    <th>Submitted</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                ) : (
                  <tr>
                    <th>S.NO</th>
                    <th>Company & Client</th>
                    <th>Target Qty</th>
                    <th>Contact Info</th>
                    <th>Requirements</th>
                    <th>Submitted</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {paginatedInquiries.map((item, index) => (
                  <tr key={item.contactid} onClick={() => setSelectedInquiry(item)} style={{ cursor: "pointer" }}>
                    <td>
                      {(currentPage - 1) * (selectCount === "All" ? 10 : Number(selectCount)) + index + 1}
                    </td>
                    {activeTab === "normal" ? (
                      <>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div className="table-img-placeholder" style={{ borderRadius: "10px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: "bold" }}>
                              {(item.name || "C").charAt(0)}
                            </div>
                            <span style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-main)" }}>
                              {item.name || "—"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", color: "var(--text-muted)", fontWeight: "500" }}>
                            <Mail size={14} /> {item.email || "—"}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: "600", fontSize: "14px" }}>
                            {item.phone || "—"}
                          </span>
                        </td>
                        <td>
                          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.description}>
                            {item.description || "—"}
                          </p>
                        </td>
                        <td>
                          <span style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "13px" }}>
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div className="table-img-placeholder" style={{ borderRadius: "10px", background: "#fffbeb", border: "1px solid #fef3c7", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706", fontWeight: "bold" }}>
                              {(item.name || "C").charAt(0)}
                            </div>
                            <div>
                              <p style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-main)" }}>
                                {item.name || "—"}
                              </p>
                              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>B2B Client</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="status-badge status-low">
                            {item.quantity || "Bulk"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "var(--text-muted)", fontWeight: "500" }}>
                              <Mail size={12} /> {item.email || "—"}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "var(--text-muted)", fontWeight: "500" }}>
                              <Phone size={12} /> {item.phone || "—"}
                            </div>
                          </div>
                        </td>
                        <td>
                          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.description}>
                            {item.description || "—"}
                          </p>
                        </td>
                        <td>
                          <span style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "13px" }}>
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                          </span>
                        </td>
                      </>
                    )}

                    <td>
                      <div className="action-cell" onClick={(e) => e.stopPropagation()} style={{ justifyContent: "flex-end" }}>
                        <button className="action-btn view" title="View Details" onClick={() => setSelectedInquiry(item)}>
                          <Eye size={16} />
                        </button>
                        <button className="action-btn delete" title="Delete Enquiry" onClick={(e) => handleDelete(item.contactid, e)}>
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
            Showing <strong>{paginatedInquiries.length}</strong> of{" "}
            <strong>{filteredInquiries.length}</strong> enquiries
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

      {/* Inquiry Detail Sidebar Overlay Drawer */}
      {selectedInquiry &&
        createPortal(
          <>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
                zIndex: 9999
              }}
              onClick={() => setSelectedInquiry(null)}
            />
            <div 
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                maxWidth: "460px",
                backgroundColor: "white",
                boxShadow: "-10px 0 25px rgba(0,0,0,0.15)",
                zIndex: 10000,
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div style={{ padding: "24px 24px 16px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.5px" }}>
                      Enquiry Specifications
                    </h2>
                    <span style={{ display: "inline-block", marginTop: "6px", fontSize: "10px", fontWeight: "800", color: "var(--primary)", backgroundColor: "rgba(76,107,53,0.1)", padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>
                      {activeTab === "normal"
                        ? "General Contact"
                        : "B2B Bulk Request"}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "white", border: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px", borderBottom: "1px solid #f9fafb", backgroundColor: "#f8fbf6" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "14px", backgroundColor: "rgba(76,107,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: "900", fontSize: "20px", textTransform: "uppercase", flexShrink: 0 }}>
                  {(selectedInquiry.name || "C").charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "900", color: "var(--text-main)" }}>
                    {selectedInquiry.name || "—"}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    <Calendar size={14} /> Date Logged:{" "}
                    {selectedInquiry.createdAt
                      ? new Date(selectedInquiry.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }} className="thin-scrollbar">
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <p style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <User size={14} /> Sender Identification
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                    <div style={{ padding: "12px", backgroundColor: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: "10px" }}>
                      <span style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                        Contact Name
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: "900", color: "var(--text-main)", display: "block", marginTop: "2px" }}>
                        {selectedInquiry.name || "—"}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div style={{ padding: "12px", backgroundColor: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: "10px", overflow: "hidden" }}>
                        <span style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                          Email
                        </span>
                        <span
                          style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-main)", display: "block", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                          title={selectedInquiry.email}
                        >
                          {selectedInquiry.email || "—"}
                        </span>
                      </div>
                      <div style={{ padding: "12px", backgroundColor: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: "10px" }}>
                        <span style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                          Phone
                        </span>
                        <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-main)", display: "block", marginTop: "2px" }}>
                          {selectedInquiry.phone || "—"}
                        </span>
                      </div>
                    </div>

                    {activeTab === "corporate" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div style={{ padding: "12px", backgroundColor: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: "10px", overflow: "hidden" }}>
                          <span style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                            Client
                          </span>
                          <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-main)", display: "block", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {selectedInquiry.name || "—"}
                          </span>
                        </div>
                        <div style={{ padding: "12px", backgroundColor: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "10px" }}>
                          <span style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#d97706", textTransform: "uppercase", letterSpacing: "1px" }}>
                            Quantity Target
                          </span>
                          <span style={{ fontSize: "13px", fontWeight: "900", color: "#b45309", display: "block", marginTop: "2px" }}>
                            {selectedInquiry.quantity || "Bulk"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "16px", borderTop: "1px solid #f3f4f6" }}>
                  <p style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <MessageSquare size={14} />{" "}
                    Inquiry Message Description
                  </p>
                  <div style={{ padding: "16px", backgroundColor: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: "10px", fontSize: "13px", fontWeight: "600", color: "var(--text-main)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {selectedInquiry.description || "—"}
                  </div>
                </div>

                <div style={{ paddingTop: "24px", borderTop: "1px solid #f3f4f6", display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    style={{ flex: 1, padding: "12px", border: "1px solid #e5e7eb", backgroundColor: "white", color: "var(--text-muted)", fontWeight: "800", fontSize: "12px", borderRadius: "10px", cursor: "pointer" }}
                  >
                    Dismiss Drawer
                  </button>
                  <button
                    onClick={() => {
                      toast.success("Enquiry marked as read and archived.");
                      setSelectedInquiry(null);
                    }}
                    style={{ flex: 1, padding: "12px", border: "none", backgroundColor: "var(--primary)", color: "white", fontWeight: "800", fontSize: "12px", borderRadius: "10px", cursor: "pointer" }}
                  >
                    Resolve / Archive Log
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};

export default ContactsList;
