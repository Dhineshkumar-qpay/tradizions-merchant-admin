import React, { useState, useEffect } from "react";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import { Search, Eye, Filter, Loader2, X, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import "./Orders.css"; // Reuse table styles

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Create this route in APIROUTES if not exists
      const endpoint = "/admin/reports";
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const res = await API.get(`${endpoint}${params}`);

      if (res.data && res.data.statusCode === 200) {
        setReports(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch reports", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!updateStatus || !selectedReport) return;
    setProcessingId(selectedReport.report_id);
    try {
      const res = await API.post("/admin/report/update-status", {
        report_id: selectedReport.report_id,
        status: updateStatus
      });
      if (res.data && res.data.statusCode === 200) {
        toast.success("Report status updated!");
        setSelectedReport(null);
        fetchReports();
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="orders-container">
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Product Issue Reports</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Resolved">Resolved</option>
          </select>
          <button className="btn-primary" onClick={fetchReports}>
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="table-responsive">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Order Item</th>
                <th>Merchant / Batch</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.report_id}>
                  <td>#{report.report_id}</td>
                  <td>{report.order_item?.productname}</td>
                  <td>
                    {report.business?.businessname || "Unknown"} <br />
                    <small>Batch: {report.batch_id}</small>
                  </td>
                  <td>{report.reason}</td>
                  <td>
                    <span className={`status-badge ${report.status.toLowerCase().replace(" ", "-")}`}>
                      {report.status}
                    </span>
                  </td>
                  <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-icon"
                      onClick={() => {
                        setSelectedReport(report);
                        setUpdateStatus(report.status);
                      }}
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>No reports found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedReport && (
        <div className="modal-overlay">
          <div className="modal-content animate-pop" style={{ maxWidth: '600px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Report #{selectedReport.report_id} Details</h3>
              <button onClick={() => setSelectedReport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <strong>User:</strong> {selectedReport.user?.username} ({selectedReport.user?.phone})
                <br />
                <strong>Merchant:</strong> {selectedReport.business?.businessname}
                <br />
                <strong>Product:</strong> {selectedReport.order_item?.productname} (Batch: {selectedReport.batch_id})
              </div>

              <div>
                <strong>Reason:</strong> {selectedReport.reason}
              </div>

              <div>
                <strong>Description:</strong>
                <p style={{ marginTop: '4px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  {selectedReport.description || "No description provided."}
                </p>
              </div>

              {selectedReport.proof_urls && selectedReport.proof_urls.length > 0 && (
                <div>
                  <strong>Proof Images:</strong>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {selectedReport.proof_urls.map((url, idx) => (
                      <a key={idx} href={`http://localhost:3003${url}`} target="_blank" rel="noopener noreferrer">
                        <div style={{ width: '80px', height: '80px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}>
                          <ImageIcon size={24} color="#64748b" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <strong>Update Status:</strong>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    style={{ padding: '8px', flex: 1, borderRadius: '6px', border: '1px solid #ccc' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <button
                    className="btn-primary"
                    onClick={handleStatusUpdate}
                    disabled={processingId === selectedReport.report_id || updateStatus === selectedReport.status}
                  >
                    {processingId === selectedReport.report_id ? <Loader2 size={16} className="animate-spin" /> : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
