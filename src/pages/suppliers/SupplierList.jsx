import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Eye, Box, X, Share2, Printer, Download } from "lucide-react";
import { API } from "../../service/api_service";
import { APIROUTES ,IMAGE_URL} from "../../routes/api_routes";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../Orders.css";

const SupplierList = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add", "edit", "view"
  const [currentSupplier, setCurrentSupplier] = useState({
    name: "",
    companyname: "",
    phone: "",
    email: "",
    gst: "",
    address: "",
    logo: "",
    brandname: "",
    location: "",
    status: "active",
  });
  const [logoFile, setLogoFile] = useState(null);

  const [qrModalData, setQrModalData] = useState(null);

  const handlePrintQR = (qrUrl) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;"><img src="${qrUrl}" style="width:300px;height:300px;" onload="window.print();window.close();"/></body></html>`);
    printWindow.document.close();
  };

  const handleDownloadQR = async (qrUrl, filename) => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}-qrcode.png`;
      link.click();
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  const handleShareQR = async (url) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tradizions QR Code',
          url: url
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      console.warn("Sharing is not supported on this browser.");
    }
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await API.post(APIROUTES.GETALLSUPPLIERS, { status: statusFilter });
      if (res.data && res.data.statusCode === 200) {
        setSuppliers(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [statusFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSupplier({ ...currentSupplier, [name]: value });
  };

  const handleOpenModal = (mode, supplier = null) => {
    setModalMode(mode);
    if (supplier) {
      setCurrentSupplier(supplier);
    } else {
      setCurrentSupplier({
        name: "",
        companyname: "",
        phone: "",
        email: "",
        gst: "",
        address: "",
        logo: "",
        brandname: "",
        location: "",
        status: "active",
      });
    }
    setLogoFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = modalMode === "edit" ? APIROUTES.UPDATESUPPLIER : APIROUTES.ADDSUPPLIER;
      const payload = new FormData();
      Object.entries(currentSupplier).forEach(([key, value]) => {
        if (key !== "logo" && value !== undefined && value !== null) {
          payload.append(key, value);
        }
      });
      if (logoFile) payload.append("logo", logoFile);

      const res = await API.post(endpoint, payload);
      if (res.data && res.data.statusCode === 200) {
        toast.success(`Supplier ${modalMode === "edit" ? "updated" : "added"} successfully`);
        setIsModalOpen(false);
        fetchSuppliers();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        const res = await API.post(APIROUTES.DELETESUPPLIER, { id });
        if (res.data && res.data.statusCode === 200) {
          toast.success("Supplier deleted successfully");
          fetchSuppliers();
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to delete supplier");
      }
    }
  };

  const filteredSuppliers = suppliers.filter((supp) => {
    return (
      (supp.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (supp.companyname?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (supp.phone || "").includes(searchQuery)
    );
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Pagination Logic
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentSuppliers = filteredSuppliers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="orders-mgmt-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Suppliers</h1>
          <p>Manage your suppliers and their contact information.</p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => handleOpenModal("add")}
            className="btn-primary"
          >
            <Plus size={18} /> Add Supplier
          </button>
        </div>
      </div>

      <div className="table-card section-card">
        <div className="table-filters-row">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, company, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-options">
            <div className="filter-item">
              <label>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Company Name</th>
                <th>Contact</th>
                <th>Status</th>
                <th>QR Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    Loading...
                  </td>
                </tr>
              ) : currentSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No suppliers found
                  </td>
                </tr>
              ) : (
                currentSuppliers.map((supplier, index) => (
                  <tr key={supplier.id} className="order-row">
                    <td className="secondary-text" style={{ fontWeight: '500' }}>{indexOfFirstItem + index + 1}</td>
                    <td><span className="primary-text">{supplier.name}</span></td>
                    <td><span className="secondary-text">{supplier.companyname || "-"}</span></td>
                    <td>
                      <div className="contact-cell" style={{ display: "flex", flexDirection: "column" }}>
                        <span>{supplier.phone}</span>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{supplier.email || "-"}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${supplier.status === "active" ? "delivered" : "cancelled"
                          }`}
                      >
                        {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div
                        onClick={() => {
                          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + "/suppliers/details/" + supplier.id)}`;
                          setQrModalData({ name: supplier.name, qrUrl: qrUrl, pageUrl: window.location.origin + "/suppliers/details/" + supplier.id });
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + "/suppliers/details/" + supplier.id)}`}
                          alt="QR Code"
                          style={{ width: '40px', height: '40px', borderRadius: '4px', border: '1px solid var(--border-color)', objectFit: 'contain' }}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          onClick={() => handleOpenModal("view", supplier)}
                          className="action-btn view"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenModal("edit", supplier)}
                          className="action-btn edit"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/suppliers/products/${supplier.id}`, { state: { supplier } })}
                          className="action-btn view"
                          title="Manage Products"
                        >
                          <Box size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id)}
                          className="action-btn delete"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div
          className="pagination-footer"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>
              Showing{" "}
              <strong>
                {Math.min(
                  (currentPage - 1) * rowsPerPage + 1,
                  filteredSuppliers.length || 1
                )}
              </strong>{" "}
              to{" "}
              <strong>
                {Math.min(currentPage * rowsPerPage, filteredSuppliers.length)}
              </strong>{" "}
              of <strong>{filteredSuppliers.length}</strong> Results
            </p>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid var(--border-color)",
                outline: "none",
                cursor: "pointer",
                background: "#fff"
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={40}>40</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, Math.ceil(filteredSuppliers.length / rowsPerPage))
                )
              }
              disabled={currentPage === Math.ceil(filteredSuppliers.length / rowsPerPage) || filteredSuppliers.length === 0}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-drawer slide-left" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="header-title">
                <h2>
                  {modalMode === "add" ? "Add New Supplier" : modalMode === "edit" ? "Edit Supplier" : "Supplier Details"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-content">
              <form id="supplier-form" onSubmit={handleSubmit} className="section-form-card" style={{ boxShadow: 'none', border: 'none', padding: '0', background: 'transparent' }}>
                <div className="form-grid">
                  <div className="field-group">
                    <label className="field-label">Name <span>*</span></label>
                    <input
                      type="text"
                      name="name"
                      required
                      disabled={modalMode === "view"}
                      value={currentSupplier.name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Brand Name</label>
                    <input
                      type="text"
                      name="brandname"
                      disabled={modalMode === "view"}
                      value={currentSupplier.brandname || ""}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      disabled={modalMode === "view"}
                      value={currentSupplier.location || ""}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Logo</label>
                    {currentSupplier.logo && (
                      <img src={IMAGE_URL+currentSupplier.logo} alt="Supplier logo" style={{ width: 48, height: 48, objectFit: "contain", marginBottom: 8 }} />
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={modalMode === "view"}
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      className="form-input"
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Company Name</label>
                    <input
                      type="text"
                      name="companyname"
                      disabled={modalMode === "view"}
                      value={currentSupplier.companyname}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Phone <span>*</span></label>
                    <input
                      type="text"
                      name="phone"
                      required
                      disabled={modalMode === "view"}
                      value={currentSupplier.phone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      disabled={modalMode === "view"}
                      value={currentSupplier.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">GST Number</label>
                    <input
                      type="text"
                      name="gst"
                      disabled={modalMode === "view"}
                      value={currentSupplier.gst}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Status</label>
                    <select
                      name="status"
                      disabled={modalMode === "view"}
                      value={currentSupplier.status}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="field-group full">
                    <label className="field-label">Address</label>
                    <textarea
                      name="address"
                      rows="3"
                      disabled={modalMode === "view"}
                      value={currentSupplier.address}
                      onChange={handleInputChange}
                      className="form-textarea"
                    ></textarea>
                  </div>
                </div>
              </form>
            </div>

            <div className="drawer-footer" style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                {modalMode === "view" ? "Close" : "Cancel"}
              </button>
              {modalMode !== "view" && (
                <button
                  type="submit"
                  form="supplier-form"
                  className="btn-primary"
                >
                  {modalMode === "add" ? "Save Supplier" : "Update Supplier"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {qrModalData && (
        <div className="modal-overlay" onClick={() => setQrModalData(null)}>
          <div className="modal-drawer" style={{ maxWidth: '400px', height: 'auto', margin: 'auto', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px', color: 'var(--primary-dark)' }}>{qrModalData.name}</h3>
            <img src={qrModalData.qrUrl} alt="QR Code" style={{ width: '200px', height: '200px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />

            <div style={{ display: 'flex', gap: '16px', marginTop: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => handleDownloadQR(qrModalData.qrUrl, qrModalData.name.replace(/\s+/g, '-'))}>
                <Download size={16} /> Download
              </button>
              <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => handlePrintQR(qrModalData.qrUrl)}>
                <Printer size={16} /> Print
              </button>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => handleShareQR(qrModalData.pageUrl)}>
                <Share2 size={16} /> Share
              </button>
            </div>
            <a href={qrModalData.pageUrl} target="_blank" rel="noreferrer" style={{ marginTop: '20px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '500', fontSize: '14px' }}>
              Open Page in New Tab
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierList;
