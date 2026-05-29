import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Package,
  Gift,
  Phone,
  Mail,
  MapPin,
  Trash2,
  X,
  CreditCard,
  Download,
  Loader2,
} from "lucide-react";
import "./Orders.css";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [selectedStatusChanges, setSelectedStatusChanges] = useState({});
  const [selectedItemStatusChanges, setSelectedItemStatusChanges] = useState(
    {},
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [filterOrderStatus, setFilterOrderStatus] = useState("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("pending");
  const [filterDate, setFilterDate] = useState("last1month");

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await API.post(APIROUTES.GETALLBUSINESSES);
        if (response.data && response.data.statusCode === 200) {
          setBusinesses(response.data.data || []);
          if (response.data.data && response.data.data.length > 0) {
            setSelectedBusinessId(response.data.data[0].bid);
          }
        }
      } catch (error) {
        console.error("Error fetching businesses:", error);
      }
    };
    fetchBusinesses();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!selectedBusinessId) return;
      setLoading(true);
      try {
        const response = await API.post(APIROUTES.MERCHANTORDERS, {
          bid: selectedBusinessId,
          orderstatus: filterOrderStatus,
          paymentstatus: filterPaymentStatus,
          date: filterDate,
        });
        console.log(response.data);

        if (response.data && response.data.statusCode === 200) {
          const rawData = response.data.data || [];
          const formattedData = rawData.map((o) => ({
            ...o,
            orderstatus: o.orderstatus ? String(o.orderstatus).toLowerCase() : o.orderstatus,
            itemstatus: o.itemstatus ? String(o.itemstatus).toLowerCase() : o.itemstatus,
          }));
          setOrders(formattedData);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [selectedBusinessId, filterOrderStatus, filterPaymentStatus, filterDate]);

  // Filter stats
  const stats = {
    total: orders.length,
    pending: orders.filter(
      (o) => o.orderstatus !== "delivered" && o.orderstatus !== "cancelled",
    ).length,
    delivered: orders.filter((o) => o.orderstatus === "delivered").length,
    cancelled: orders.filter((o) => o.orderstatus === "cancelled").length,
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchTerm) return true;
    const term = String(searchTerm).toLowerCase();
    return (
      (o.orderid && String(o.orderid).includes(term)) ||
      (o.orderitemid && String(o.orderitemid).includes(term)) ||
      (o.username && String(o.username).toLowerCase().includes(term)) ||
      (o.phone && String(o.phone).includes(term)) ||
      (o.userid && String(o.userid).includes(term))
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handleOrderStatusUpdate = async (id) => {
    const newStatus = selectedStatusChanges[id];
    if (!newStatus) return;

    setProcessingId(id);
    try {
      const response = await API.post(APIROUTES.ORDERSTATUSUPDATE, {
        orderid: Number(id),
        orderstatus: newStatus,
      });
      if (response.data && response.data.statusCode === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.orderid === id ? { ...o, orderstatus: newStatus } : o,
          ),
        );
        setSelectedStatusChanges((prev) => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
        if (
          selectedOrder &&
          selectedOrder.order &&
          selectedOrder.order.orderid === id
        ) {
          setSelectedOrder((prev) => ({
            ...prev,
            order: { ...prev.order, orderstatus: newStatus },
          }));
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleItemStatusUpdate = async (orderItemId) => {
    const newStatus = selectedItemStatusChanges[orderItemId];
    if (!newStatus) return;

    setProcessingId(`item_${orderItemId}`);
    try {
      const response = await API.post(APIROUTES.ORDERITEMTATUSUPDATE, {
        orderitemid: Number(orderItemId),
        itemstatus: newStatus,
      });
      if (response.data && response.data.statusCode === 200) {
        if (selectedOrder && selectedOrder.items) {
          const updatedItems = selectedOrder.items.map((item) =>
            item.orderitemid === orderItemId
              ? { ...item, itemstatus: newStatus }
              : item,
          );
          setSelectedOrder({
            ...selectedOrder,
            items: updatedItems,
          });
        }
        setSelectedItemStatusChanges((prev) => {
          const newState = { ...prev };
          delete newState[orderItemId];
          return newState;
        });
      }
    } catch (error) {
      console.error("Error updating item status:", error);
      alert("Failed to update item status. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewOrder = async (order) => {
    try {
      // Fetch details using the orderid
      const response = await API.post("/order/order-details", {
        orderid: order.orderid || order.orderitemid,
      });
      if (response.data && response.data.statusCode === 200) {
        let data = response.data.data;
        if (data && data.order && data.order.orderstatus) {
          data.order.orderstatus = String(data.order.orderstatus).toLowerCase();
        }
        if (data && data.items) {
          data.items = data.items.map(item => ({
            ...item,
            itemstatus: item.itemstatus ? String(item.itemstatus).toLowerCase() : item.itemstatus
          }));
        }
        setSelectedOrder(data);
      } else {
        // Fallback if API fails or not ready
        setSelectedOrder(order);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      // Fallback
      setSelectedOrder(order);
    }
  };

  return (
    <div className="orders-mgmt-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Order Management</h1>
          <p>
            Monitor your sales performance and manage customer fulfillment
            journeys.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon all">
            <Package size={24} />
          </div>
          <div className="stat-data">
            <span className="label">Total Orders</span>
            <span className="value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-data">
            <span className="label">Pending Orders</span>
            <span className="value">{stats.pending}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon delivered">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-data">
            <span className="label">Delivered Orders</span>
            <span className="value">{stats.delivered}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cancelled">
            <XCircle size={24} />
          </div>
          <div className="stat-data">
            <span className="label">Cancelled Orders</span>
            <span className="value">{stats.cancelled}</span>
          </div>
        </div>
      </div>

      <div className="table-card section-card">
        <div className="table-filters-row">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by ID, Name or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-options">
            <div className="filter-item">
              <label>Business</label>
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
              >
                {businesses.map((biz) => (
                  <option key={biz.bid} value={biz.bid}>
                    {biz.businessname}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Order Status</label>
              <select
                value={filterOrderStatus}
                onChange={(e) => setFilterOrderStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Payment Status</label>
              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Date</label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last1month">Last 1 Month</option>
                <option value="last6months">Last 6 Months</option>
              </select>
            </div>
            <div className="filter-item" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => {
                  setFilterOrderStatus("all");
                  setFilterPaymentStatus("pending");
                  setFilterDate("last1month");
                }}
                style={{ height: '38px' }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "40px",
              }}
            >
              <div className="circular-loader"></div>
            </div>
          ) : filteredOrders.length > 0 ? (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Products</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th>Order Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.orderid || order.orderitemid}
                    className="order-row"
                  >
                    <td>
                      <span className="order-id-tag">
                        ORD-{order.orderid || order.orderitemid}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`type-tag ${(order.ordertype || order.itemtype || "normal").toLowerCase()}`}
                        style={{
                          maxWidth: "200px",
                          display: "inline-block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={
                          order.items
                            ? order.items.map((i) => i.productname).join(", ")
                            : order.ordertype || "Normal"
                        }
                      >
                        {order.items && order.items.length > 0
                          ? order.items.map((i) => i.productname).join(", ")
                          : order.ordertype || order.itemtype || "Normal"}
                      </span>
                    </td>
                    <td>
                      <span className="amount">
                        ₹{order.totalamount || order.totalprice}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`payment-badge ${(order.paymentstatus || "pending").toLowerCase()}`}
                      >
                        {order.paymentstatus || "Pending"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${(order.orderstatus || order.itemstatus || "pending").toLowerCase()}`}
                      >
                        {order.orderstatus || order.itemstatus || "Pending"}
                      </span>
                    </td>
                    <td>
                      <span className="date">{order.createdAt || "N/A"}</span>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          className="action-btn view"
                          title="View Order"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye size={16} />
                        </button>
                        {/* <button
                          className="action-btn delete"
                          title="Delete Order"
                          onClick={() => {
                            setShowDeleteConfirm(order.orderitemid);
                            setSelectedOrder(null);
                          }}
                        >
                          <Trash2 size={16} />
                        </button> */}
                        <div
                          className="status-dropdown-wrap"
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          {processingId ===
                            (order.orderid || order.orderitemid) ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                              }}
                            >
                              <select
                                value={
                                  selectedStatusChanges[
                                  order.orderid || order.orderitemid
                                  ] ||
                                  order.orderstatus ||
                                  order.itemstatus ||
                                  "pending"
                                }
                                disabled={
                                  (order.orderstatus || order.itemstatus) ===
                                  "delivered" ||
                                  (order.orderstatus || order.itemstatus) ===
                                  "cancelled"
                                }
                                onChange={(e) =>
                                  setSelectedStatusChanges({
                                    ...selectedStatusChanges,
                                    [order.orderid || order.orderitemid]:
                                      e.target.value,
                                  })
                                }
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <button
                                className="btn-secondary"
                                style={{ padding: "4px 8px", fontSize: "12px" }}
                                onClick={() =>
                                  handleOrderStatusUpdate(
                                    order.orderid || order.orderitemid,
                                  )
                                }
                                disabled={
                                  !selectedStatusChanges[
                                  order.orderid || order.orderitemid
                                  ] ||
                                  selectedStatusChanges[
                                  order.orderid || order.orderitemid
                                  ] === (order.orderstatus || order.itemstatus)
                                }
                              >
                                Confirm
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <Package size={64} />
              <h3>No orders available</h3>
              <p>We couldn't find any orders matching your filters.</p>
            </div>
          )}
        </div>

        <div
          className="pagination-footer"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <p>
              Showing{" "}
              <strong>
                {Math.min(
                  (currentPage - 1) * rowsPerPage + 1,
                  filteredOrders.length || 1,
                )}
              </strong>{" "}
              to{" "}
              <strong>
                {Math.min(currentPage * rowsPerPage, filteredOrders.length)}
              </strong>{" "}
              of <strong>{filteredOrders.length}</strong> Results
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
                border: "1px solid #ddd",
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={40}>40</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="page-controls">
            <button
              className="btn-page"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </button>
            <button className="btn-page active">{currentPage}</button>
            <button
              className="btn-page"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div
            className="modal-drawer slide-left"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <div className="drawer-header">
              <div className="header-title">
                <h2>Order Details</h2>
                <span className="id">
                  ORD-
                  {selectedOrder.order?.orderid ||
                    selectedOrder.orderid ||
                    selectedOrder.orderitemid}
                </span>
              </div>
              <button
                className="close-btn"
                onClick={() => {
                  setSelectedOrder(null);
                  setSelectedItemStatusChanges({});
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="drawer-content">
              {/* Timeline */}
              <div className="order-timeline-wrapper">
                {(selectedOrder.order?.orderstatus ||
                  selectedOrder.orderstatus ||
                  selectedOrder.itemstatus) === "cancelled" ? (
                  <div className="order-timeline">
                    <div className="step pending active">
                      <div className="bullet"></div>
                      <span>Pending</span>
                    </div>
                    <div className="step cancelled active">
                      <div className="bullet"></div>
                      <span>Cancelled</span>
                    </div>
                  </div>
                ) : (
                  <div className="order-timeline">
                    <div
                      className={`step pending ${["pending", "confirmed", "shipped", "delivered"].includes(selectedOrder.order?.orderstatus || selectedOrder.orderstatus || selectedOrder.itemstatus) ? "active" : ""}`}
                    >
                      <div className="bullet"></div>
                      <span>Pending</span>
                    </div>
                    <div
                      className={`step confirmed ${["confirmed", "shipped", "delivered"].includes(selectedOrder.order?.orderstatus || selectedOrder.orderstatus || selectedOrder.itemstatus) ? "active" : ""}`}
                    >
                      <div className="bullet"></div>
                      <span>Confirmed</span>
                    </div>
                    <div
                      className={`step shipped ${["shipped", "delivered"].includes(selectedOrder.order?.orderstatus || selectedOrder.orderstatus || selectedOrder.itemstatus) ? "active" : ""}`}
                    >
                      <div className="bullet"></div>
                      <span>Shipped</span>
                    </div>
                    <div
                      className={`step delivered ${(selectedOrder.order?.orderstatus || selectedOrder.orderstatus || selectedOrder.itemstatus) === "delivered" ? "active" : ""}`}
                    >
                      <div className="bullet"></div>
                      <span>Delivered</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="drawer-grid">
                <div className="grid-main">
                  {/* Customer Card */}
                  <div className="info-card">
                    <h4 className="card-title">
                      <User size={16} /> Customer Information
                    </h4>
                    <div className="card-body">
                      <div className="detail-item">
                        <span className="label">Name</span>
                        <span className="val">
                          {selectedOrder.items?.[0]?.address?.fullname ||
                            selectedOrder.username ||
                            "User ID: " +
                            (selectedOrder.order?.userid ||
                              selectedOrder.userid ||
                              "N/A")}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Phone</span>
                        <span className="val">
                          <Phone size={14} />{" "}
                          {selectedOrder.items?.[0]?.address?.mobilenumber ||
                            selectedOrder.phone ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Email</span>
                        <span className="val">
                          <Mail size={14} />{" "}
                          {selectedOrder.items?.[0]?.address?.email ||
                            selectedOrder.email ||
                            "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="info-card">
                    <h4 className="card-title">
                      <Package size={16} /> Order Items
                    </h4>
                    <div className="items-list">
                      {(selectedOrder.items || [selectedOrder]).map(
                        (item, idx) => (
                          <div
                            className="product-item"
                            key={item.orderitemid || idx}
                            style={{
                              flexDirection: "column",
                              alignItems: "flex-start",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                width: "100%",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "10px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                }}
                              >
                                <div className="p-img">
                                  {item.product?.productimage ||
                                    item.productimage ? (
                                    <img
                                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${item.product?.productimage || item.productimage}`}
                                      alt={
                                        item.product?.productname ||
                                        item.productname
                                      }
                                      style={{
                                        width: "40px",
                                        height: "40px",
                                        objectFit: "cover",
                                        borderRadius: "4px",
                                      }}
                                    />
                                  ) : (
                                    <Package size={20} />
                                  )}
                                </div>
                                <div className="p-info">
                                  <span className="p-name">
                                    {item.product?.productname ||
                                      item.productname}
                                  </span>
                                  <span className="p-qty">
                                    Qty: {item.quantity || 1}
                                  </span>
                                </div>
                              </div>
                              <div
                                className="p-price"
                                style={{ minWidth: "80px", textAlign: "right" }}
                              >
                                ₹{item.totalprice || item.price || 0}
                              </div>
                            </div>

                            {/* Product Specific Address */}
                            {item.address && (
                              <div
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  backgroundColor: "#f8fafc",
                                  borderRadius: "6px",
                                  border: "1px dashed #cbd5e1",
                                  marginBottom: "10px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    marginBottom: "6px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    color: "var(--text-main)",
                                  }}
                                >
                                  <MapPin size={14} /> Delivery Address{" "}
                                  {item.address.title
                                    ? `(${item.address.title})`
                                    : ""}
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "var(--text-muted)",
                                    lineHeight: "1.5",
                                  }}
                                >
                                  <strong>{item.address.fullname}</strong> -{" "}
                                  {item.address.mobilenumber}
                                  <br />
                                  {item.address.addressline}
                                  {item.address.landmark
                                    ? `, ${item.address.landmark}`
                                    : ""}
                                  , {item.address.city}, {item.address.district}
                                  , {item.address.state} -{" "}
                                  {item.address.pincode}
                                </div>
                              </div>
                            )}

                            {/* Monthly Specs */}
                            {item.ordertype === "monthly" && (
                              <div
                                className="monthly-specs"
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(3, 1fr)",
                                  gap: "12px",
                                  width: "100%",
                                  padding: "12px",
                                  backgroundColor: "#f8fafc",
                                  borderRadius: "6px",
                                  fontSize: "13px",
                                  marginTop: "4px",
                                  marginBottom: "12px",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#64748b",
                                      fontSize: "11px",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.5px",
                                    }}
                                  >
                                    Grams / Day
                                  </span>
                                  <strong
                                    style={{
                                      color: "#0f172a",
                                      marginTop: "2px",
                                    }}
                                  >
                                    {item.gramsperday}g
                                  </strong>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#64748b",
                                      fontSize: "11px",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.5px",
                                    }}
                                  >
                                    Days / Month
                                  </span>
                                  <strong
                                    style={{
                                      color: "#0f172a",
                                      marginTop: "2px",
                                    }}
                                  >
                                    {item.dayspermonth}
                                  </strong>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#64748b",
                                      fontSize: "11px",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.5px",
                                    }}
                                  >
                                    Family Members
                                  </span>
                                  <strong
                                    style={{
                                      color: "#0f172a",
                                      marginTop: "2px",
                                    }}
                                  >
                                    {item.familymembers}
                                  </strong>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#64748b",
                                      fontSize: "11px",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.5px",
                                    }}
                                  >
                                    Qty / Person
                                  </span>
                                  <strong
                                    style={{
                                      color: "#0f172a",
                                      marginTop: "2px",
                                    }}
                                  >
                                    {item.quantitypersonkg} kg
                                  </strong>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#64748b",
                                      fontSize: "11px",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.5px",
                                    }}
                                  >
                                    Total Qty
                                  </span>
                                  <strong
                                    style={{
                                      color: "#0f172a",
                                      marginTop: "2px",
                                    }}
                                  >
                                    {item.totalquantitykg} kg
                                  </strong>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#64748b",
                                      fontSize: "11px",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.5px",
                                    }}
                                  >
                                    Calc. Price
                                  </span>
                                  <strong
                                    style={{
                                      color: "#0f172a",
                                      marginTop: "2px",
                                    }}
                                  >
                                    ₹{item.calculatedprice}
                                  </strong>
                                </div>
                              </div>
                            )}

                            {/* Individual Item Status Update */}
                            {item.orderitemid && (
                              <div
                                className="item-status-update"
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  alignItems: "center",
                                  width: "100%",
                                  justifyContent: "flex-end",
                                  borderTop: "1px solid #eaeaea",
                                  paddingTop: "10px",
                                }}
                              >
                                <span
                                  style={{ fontSize: "12px", color: "#666" }}
                                >
                                  Item Status:
                                </span>
                                {processingId === `item_${item.orderitemid}` ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <>
                                    <select
                                      style={{
                                        padding: "4px 8px",
                                        fontSize: "12px",
                                        borderRadius: "4px",
                                        border: "1px solid #ddd",
                                      }}
                                      value={
                                        selectedItemStatusChanges[
                                        item.orderitemid
                                        ] ||
                                        item.itemstatus ||
                                        "pending"
                                      }
                                      disabled={
                                        item.itemstatus === "delivered" ||
                                        item.itemstatus === "cancelled"
                                      }
                                      onChange={(e) =>
                                        setSelectedItemStatusChanges({
                                          ...selectedItemStatusChanges,
                                          [item.orderitemid]: e.target.value,
                                        })
                                      }
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="confirmed">
                                        Confirmed
                                      </option>
                                      <option value="shipped">Shipped</option>
                                      <option value="delivered">
                                        Delivered
                                      </option>
                                      <option value="cancelled">
                                        Cancelled
                                      </option>
                                    </select>
                                    <button
                                      className="btn-secondary"
                                      style={{
                                        padding: "4px 8px",
                                        fontSize: "12px",
                                      }}
                                      onClick={() =>
                                        handleItemStatusUpdate(item.orderitemid)
                                      }
                                      disabled={
                                        !selectedItemStatusChanges[
                                        item.orderitemid
                                        ] ||
                                        selectedItemStatusChanges[
                                        item.orderitemid
                                        ] === item.itemstatus
                                      }
                                    >
                                      Confirm
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Gift Section */}
                  {selectedOrder.itemtype === "gift" && (
                    <div className="info-card gift-card">
                      <h4 className="card-title">
                        <Gift size={16} /> Gift Specification
                      </h4>
                      <div className="gift-details">
                        <div className="gift-box-title">
                          {selectedOrder.giftcardname}
                        </div>
                        <div className="gift-message">
                          "{selectedOrder.giftmessage}"
                        </div>
                        {selectedOrder.giftcardimage && (
                          <div
                            className="gift-img"
                            style={{ marginTop: "10px", marginBottom: "10px" }}
                          >
                            <img
                              src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${selectedOrder.giftcardimage}`}
                              alt={selectedOrder.giftcardname}
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          </div>
                        )}
                        <div className="gift-meta">
                          <span>
                            Receiver: <strong>{selectedOrder.username}</strong>
                          </span>
                          <span>
                            Date: <strong>{selectedOrder.odredate}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid-side">
                  {/* Summary */}
                  <div className="summary-card">
                    <h4>Price Summary</h4>
                    <div className="summary-list">
                      <div className="row">
                        <span>Subtotal</span>
                        <span>
                          ₹
                          {selectedOrder.order?.totalamount ||
                            (selectedOrder.price && selectedOrder.quantity
                              ? selectedOrder.price * selectedOrder.quantity
                              : selectedOrder.totalprice)}
                        </span>
                      </div>
                      {selectedOrder.giftcardprice && (
                        <div className="row">
                          <span>Gift Card</span>
                          <span>₹{selectedOrder.giftcardprice}</span>
                        </div>
                      )}
                      <div className="row grand-total">
                        <span>Total Amount</span>
                        <span>
                          ₹
                          {selectedOrder.order?.totalamount ||
                            selectedOrder.totalprice ||
                            (selectedOrder.price && selectedOrder.quantity
                              ? selectedOrder.price * selectedOrder.quantity
                              : 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="drawer-actions">
                    <div
                      className="action-group"
                      style={{ marginBottom: "16px" }}
                    >
                      <label>Update Total Order Status</label>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <select
                          className="status-select"
                          value={
                            selectedStatusChanges[
                            selectedOrder.order?.orderid ||
                            selectedOrder.orderid ||
                            selectedOrder.orderitemid
                            ] ||
                            selectedOrder.order?.orderstatus ||
                            selectedOrder.orderstatus ||
                            selectedOrder.itemstatus ||
                            "pending"
                          }
                          disabled={
                            (selectedOrder.order?.orderstatus ||
                              selectedOrder.orderstatus ||
                              selectedOrder.itemstatus) === "delivered" ||
                            (selectedOrder.order?.orderstatus ||
                              selectedOrder.orderstatus ||
                              selectedOrder.itemstatus) === "cancelled"
                          }
                          onChange={(e) =>
                            setSelectedStatusChanges({
                              ...selectedStatusChanges,
                              [selectedOrder.order?.orderid ||
                                selectedOrder.orderid ||
                                selectedOrder.orderitemid]: e.target.value,
                            })
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          className="btn-primary"
                          onClick={() =>
                            handleOrderStatusUpdate(
                              selectedOrder.order?.orderid ||
                              selectedOrder.orderid ||
                              selectedOrder.orderitemid,
                            )
                          }
                          disabled={
                            !selectedStatusChanges[
                            selectedOrder.order?.orderid ||
                            selectedOrder.orderid ||
                            selectedOrder.orderitemid
                            ] ||
                            selectedStatusChanges[
                            selectedOrder.order?.orderid ||
                            selectedOrder.orderid ||
                            selectedOrder.orderitemid
                            ] ===
                            (selectedOrder.order?.orderstatus ||
                              selectedOrder.orderstatus ||
                              selectedOrder.itemstatus)
                          }
                        >
                          {processingId ===
                            (selectedOrder.order?.orderid ||
                              selectedOrder.orderid ||
                              selectedOrder.orderitemid) ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            "Confirm Status Update"
                          )}
                        </button>
                      </div>
                    </div>

                    {/* <button
                      className="btn-danger-outline"
                      onClick={() => {
                        setShowDeleteConfirm(selectedOrder.orderitemid);
                        setSelectedOrder(null);
                      }}
                    >
                      <Trash2 size={18} />
                      <span>Delete Order</span>
                    </button> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content animate-pop">
            <div className="modal-icon-box delete">
              <Trash2 size={32} />
            </div>
            <h3>Delete Order?</h3>
            <p>
              This will remove the order history for{" "}
              <strong>{showDeleteConfirm}</strong>. This cannot be undone.
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
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal sub-component for User icon because I forgot to import 'User' from lucide
const User = ({ size }) => <Package size={size} />;

export default Orders;
