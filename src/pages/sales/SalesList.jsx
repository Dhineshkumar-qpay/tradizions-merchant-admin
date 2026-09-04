import React, { useState, useEffect } from "react";
import { Plus, Search, Eye, Share2, Printer, Download } from "lucide-react";
import { API } from "../../service/api_service";
import { APIROUTES } from "../../routes/api_routes";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../Orders.css";

const SalesList = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Date Range (Initially this month)
  const getFirstDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  };
  const getLastDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  };

  const [fromDate, setFromDate] = useState(getFirstDayOfMonth());
  const [toDate, setToDate] = useState(getLastDayOfMonth());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
          title: 'Tradizions Invoice QR Code',
          url: url
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      toast.error("Sharing is not supported on this browser.");
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      // Ensure backend has this route, otherwise this gracefully handles an error
      const res = await API.post(APIROUTES.GETALLSALES);
      if (res.data && res.data.statusCode === 200) {
        setSales(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      (sale.orderid?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (sale.customername?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;

    let matchesDate = true;
    if (fromDate && toDate) {
      const saleDate = new Date(sale.saledate);
      saleDate.setHours(0, 0, 0, 0); // Normalize sale date time

      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);

      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      matchesDate = saleDate >= from && saleDate <= to;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, fromDate, toDate]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredSales.length / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentSales = filteredSales.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="orders-mgmt-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Sales</h1>
          <p>Manage your manual sales and transactions.</p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => navigate("/sales/add")}
            className="btn-primary"
          >
            <Plus size={18} /> Add Sale
          </button>
        </div>
      </div>

      <div className="table-card section-card">
        <div className="table-filters-row">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by Order ID or Customer Name..."
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
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="filter-item">
              <label>From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
              />
            </div>
            <div className="filter-item">
              <label>To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Sale Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>QR Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    Loading sales...
                  </td>
                </tr>
              ) : currentSales.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No sales found
                  </td>
                </tr>
              ) : (
                currentSales.map((sale, index) => (
                  <tr key={sale.id} className="order-row">
                    <td className="secondary-text" style={{ fontWeight: '500' }}>{indexOfFirstItem + index + 1}</td>
                    <td>
                      <span className="order-id-tag">{sale.orderid || "N/A"}</span>
                    </td>
                    <td><span className="primary-text">{sale.customername}</span></td>
                    <td><span className="date">{new Date(sale.saledate).toLocaleDateString()}</span></td>
                    <td><span className="amount">₹{parseFloat(sale.totalamount).toFixed(2)}</span></td>
                    <td>
                      <span
                        className={`status-badge ${sale.status === "completed" ? "delivered" : sale.status === "cancelled" ? "cancelled" : "pending"
                          }`}
                      >
                        {sale.status ? sale.status.charAt(0).toUpperCase() + sale.status.slice(1) : "Pending"}
                      </span>
                    </td>
                    <td>
                      <div
                        onClick={() => {
                          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + "/sales/invoice/" + sale.id)}`;
                          setQrModalData({ name: sale.orderid, qrUrl: qrUrl, pageUrl: window.location.origin + "/sales/invoice/" + sale.id });
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + "/sales/invoice/" + sale.id)}`}
                          alt="QR Code"
                          style={{ width: '40px', height: '40px', borderRadius: '4px', border: '1px solid var(--border-color)', objectFit: 'contain' }}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          onClick={() => navigate(`/sales/detail/${sale.id}`)}
                          className="action-btn view"
                          title="View Details"
                        >
                          <Eye size={16} />
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
                  filteredSales.length || 1
                )}
              </strong>{" "}
              to{" "}
              <strong>
                {Math.min(currentPage * rowsPerPage, filteredSales.length)}
              </strong>{" "}
              of <strong>{filteredSales.length}</strong> Results
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
                  Math.min(prev + 1, Math.ceil(filteredSales.length / rowsPerPage))
                )
              }
              disabled={currentPage === Math.ceil(filteredSales.length / rowsPerPage) || filteredSales.length === 0}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        </div>
      </div>

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

export default SalesList;
