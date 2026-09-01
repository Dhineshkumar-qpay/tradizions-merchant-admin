import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Package,
  RotateCw,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Filter,
  Download,
} from "lucide-react";
import { API } from "../../services/api_service";
import { APIROUTES, IMAGE_URL } from "../../routes/api_routes";
import { toast } from "react-toastify";
import "../../../pages/ListProducts.css";

const OrderList = () => {
  const navigate = useNavigate();
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMerchants, setLoadingMerchants] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [selectCount, setSelectCount] = useState("20");

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const res = await API.post(APIROUTES.GETBUSINESS);
      if (res.data?.statusCode === 200) {
        const data = res.data.data || [];
        setMerchants(data);
        if (data.length > 0) {
          setSelectedMerchant(data[0].bid.toString());
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch merchants");
    } finally {
      setLoadingMerchants(false);
    }
  };

  useEffect(() => {
    if (selectedMerchant) {
      fetchOrders();
    }
  }, [selectedMerchant]);

  const fetchOrders = async () => {
    if (!selectedMerchant) {
      toast.warning("Please select a merchant first");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        bid: parseInt(selectedMerchant),
        date: dateFilter,
      };

      const res = await API.post(APIROUTES.MERCHANTORDERS, payload);
      if (res.data?.statusCode === 200) {
        setOrders(res.data.data || []);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch merchant orders");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDateFilter("all");
    if (selectedMerchant) fetchOrders();
  };

  // KPIs Calculation
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.orderstatus?.toLowerCase() === "pending",
  ).length;
  const shippedOrders = orders.filter(
    (o) => o.orderstatus?.toLowerCase() === "shipped",
  ).length;
  const completedOrders = orders.filter(
    (o) =>
      o.orderstatus?.toLowerCase() === "delivered" ||
      o.orderstatus?.toLowerCase() === "completed",
  ).length;
  const cancelledOrders = orders.filter(
    (o) => o.orderstatus?.toLowerCase() === "cancelled",
  ).length;

  const calcPercentage = (count) =>
    totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(2) + "%" : "0.00%";

  // Pagination Logic
  const totalPages = selectCount === "All" ? 1 : Math.ceil(orders.length / Number(selectCount)) || 1;
  const paginatedOrders = selectCount === "All"
    ? orders
    : orders.slice(
        (currentPage - 1) * Number(selectCount),
        currentPage * Number(selectCount),
      );

  const selectedMerchantName =
    merchants.find((m) => m.bid.toString() === selectedMerchant)
      ?.businessname || "";

  return (
    <div className="list-products-container">
      <div className="page-header-actions">
        <div>
          <h1>Merchant Orders</h1>
          <p>View and manage orders of all merchants.</p>
        </div>
      </div>

      <div className="table-wrapper section-card" style={{ padding: "25px", marginBottom: "30px", background: "rgba(85, 107, 47, 0.02)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1", minWidth: "250px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
              Select Merchant
            </label>
            <select
              value={selectedMerchant}
              onChange={(e) => setSelectedMerchant(e.target.value)}
              disabled={loadingMerchants}
              style={{ width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1.5px solid #edf2e9", background: "white", fontSize: "14px", fontWeight: "600" }}
            >
              <option value="">Select a Merchant</option>
              {merchants.map((m) => (
                <option key={m.bid} value={m.bid}>
                  {m.businessname}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: "1", minWidth: "200px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
              Date Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1.5px solid #edf2e9", background: "white", fontSize: "14px", fontWeight: "600" }}
            >
              <option value="all">All Time</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last1month">Last 1 Month</option>
              <option value="last6months">Last 6 Months</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleReset}
              style={{ padding: "12px 24px", borderRadius: "10px", background: "white", border: "1.5px solid #edf2e9", color: "var(--text-main)", fontWeight: "bold", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
            >
              <RefreshCw size={16} /> Reset
            </button>
            <button
              onClick={fetchOrders}
              style={{ padding: "12px 24px", borderRadius: "10px", background: "var(--primary)", border: "none", color: "white", fontWeight: "bold", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
            >
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        {[
          { title: "Total Orders", value: totalOrders, subtitle: "All Orders", icon: ShoppingBag, color: "#636e72", bg: "#f1f2f6" },
          { title: "Pending", value: pendingOrders, subtitle: calcPercentage(pendingOrders), icon: Package, color: "#e17055", bg: "#fff3f0" },
          { title: "Shipped", value: shippedOrders, subtitle: calcPercentage(shippedOrders), icon: RotateCw, color: "#0984e3", bg: "#eef7ff" },
          { title: "Completed", value: completedOrders, subtitle: calcPercentage(completedOrders), icon: CheckCircle2, color: "#00b894", bg: "#ebfbf7" },
          { title: "Cancelled", value: cancelledOrders, subtitle: calcPercentage(cancelledOrders), icon: XCircle, color: "#d63031", bg: "#ffefef" },
        ].map((kpi, idx) => (
          <div key={idx} className="section-card" style={{ padding: "20px", display: "flex", alignItems: "flex-start", gap: "15px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: kpi.bg, color: kpi.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <kpi.icon size={24} />
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px" }}>
                {kpi.title}
              </p>
              <h3 style={{ fontSize: "24px", fontWeight: "900", color: "var(--text-main)", lineHeight: "1" }}>
                {kpi.value}
              </h3>
              <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", marginTop: "6px" }}>
                {kpi.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="table-wrapper section-card">
        <div className="table-controls">
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>
              Orders List {selectedMerchantName && <span style={{ color: "var(--text-muted)" }}>({selectedMerchantName})</span>}
            </h3>
          </div>
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <button style={{ padding: "8px 16px", borderRadius: "8px", background: "white", border: "1.5px solid #edf2e9", color: "var(--text-main)", fontWeight: "bold", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <Download size={14} /> Export
            </button>
            <div className="filter-item" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "14px" }}
              >
                <option value="10">10 Entries</option>
                <option value="20">20 Entries</option>
                <option value="50">50 Entries</option>
                <option value="All">All</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive thin-scrollbar">
          {loading ? (
            <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              {selectedMerchant
                ? "No orders found for this merchant."
                : "Please select a merchant to view orders."}
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>Order ID</th>
                  <th>Products</th>
                  <th>Order Type</th>
                  <th>Order Date</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order, index) => {
                  const itemStatus = order.orderstatus?.toLowerCase();
                  const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;

                  return (
                    <tr key={order.orderid} onClick={() => navigate(`/orders/${order.orderid}`)} style={{ cursor: "pointer" }}>
                      <td>
                        {(currentPage - 1) * (selectCount === "All" ? 20 : Number(selectCount)) + index + 1}
                      </td>
                      <td>
                        <div className="p-cell-info">
                          <span className="p-id-badge">ORD-{order.orderid}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="table-img-placeholder" style={{ width: "36px", height: "36px", borderRadius: "8px", overflow: "hidden", border: "1px solid #edf2e9" }}>
                            {firstItem?.productimage ? (
                              <img
                                src={`${IMAGE_URL}${firstItem.productimage}`}
                                alt=""
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <div style={{ width: "100%", height: "100%", background: "#f8fbf6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Package size={16} color="var(--text-muted)" />
                              </div>
                            )}
                          </div>
                          <div>
                            {order.items?.map((item, idx) => (
                              <div key={idx} style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>
                                {item.productname}
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "13px", fontWeight: "600" }}>
                          {order.ordertype?.charAt(0).toUpperCase() + order.ordertype?.slice(1) || "N/A"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)" }}>
                          {order.createdAt}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: "800", color: "var(--text-main)", fontSize: "15px" }}>
                          ₹{order.totalamount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${order.paymentstatus?.toLowerCase() === "paid" ? "status-active" : order.paymentstatus?.toLowerCase() === "failed" ? "status-out" : "status-low"}`}>
                          {order.paymentstatus || "pending"}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${['delivered', 'completed'].includes(itemStatus) ? "status-active" : ['cancelled'].includes(itemStatus) ? "status-out" : "status-low"}`}>
                          {order.orderstatus}
                        </span>
                      </td>
                      <td>
                        <div className="action-cell" onClick={(e) => e.stopPropagation()} style={{ justifyContent: "flex-end" }}>
                          <button className="action-btn view" title="View Order" onClick={() => navigate(`/orders/${order.orderid}`)}>
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="pagination-footer">
          <p>
            Showing <strong>{paginatedOrders.length}</strong> of{" "}
            <strong>{orders.length}</strong> orders
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

export default OrderList;
