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
  User,
} from "lucide-react";
import "./Orders.css";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";

const MonthlyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [selectedStatusChanges, setSelectedStatusChanges] = useState({});
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
        const response = await API.post(APIROUTES.CALCULATORMERCHANTORDERS, {
          bid: selectedBusinessId,
          orderstatus: filterOrderStatus,
          paymentstatus: filterPaymentStatus,
          date: filterDate,
        });
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
        console.error("Error fetching monthly orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [selectedBusinessId, filterOrderStatus, filterPaymentStatus, filterDate]);

  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    setLoadingDetails(true);
    try {
      const response = await API.post(APIROUTES.CALCULATORORDERDETAILS, {
        orderid: order.orderid,
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
        setOrderDetails(data);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Filter stats
  const stats = {
    total: orders.length,
    pending: orders.filter(
      (o) => o.orderstatus !== "delivered" && o.orderstatus !== "cancelled",
    ).length,
    delivered: orders.filter((o) => o.orderstatus === "delivered").length,
    cancelled: orders.filter((o) => o.orderstatus === "cancelled").length,
  };

  const filteredOrders = orders.filter(
    (o) =>
      (o.orderid && String(o.orderid).includes(searchTerm)) ||
      (o.ordertype &&
        o.ordertype.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handleStatusUpdate = async (id, newStatus) => {
    setProcessingId(id);
    try {
      const response = await API.post(APIROUTES.CALCULATORORDERSTATUSUPDATE, {
        orderid: Number(id),
        orderstatus: newStatus,
      });
      if (response.data && response.data.statusCode === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.orderid === id ? { ...o, orderstatus: newStatus } : o,
          ),
        );
        if (selectedOrder && selectedOrder.orderid === id) {
          setSelectedOrder({ ...selectedOrder, orderstatus: newStatus });
        }
        if (orderDetails && orderDetails.order) {
          setOrderDetails({
            ...orderDetails,
            order: { ...orderDetails.order, orderstatus: newStatus },
          });
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="orders-mgmt-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Monthly Orders Management</h1>
          <p>
            Monitor your monthly subscription sales and manage customer
            fulfillment journeys.
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
            <span className="label">Total Monthly Orders</span>
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
              placeholder="Search by ID..."
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
                  <th>Type</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th>Order Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.orderid} className="order-row">
                    <td>
                      <span className="order-id-tag">ORD-{order.orderid}</span>
                    </td>
                    <td>
                      <span className={`type-tag monthly`}>
                        {order.ordertype || "Monthly"}
                      </span>
                    </td>
                    <td>
                      <span className="amount">₹{order.totalamount}</span>
                    </td>
                    <td>
                      <span
                        className={`payment-badge ${order.paymentstatus === "paid" ? "paid" : "pending"}`}
                      >
                        {order.paymentstatus}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${order.orderstatus.toLowerCase()}`}
                      >
                        {order.orderstatus}
                      </span>
                    </td>
                    <td>
                      <span className="date">{order.orderdate}</span>
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
                        <div
                          className="status-dropdown-wrap"
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          {processingId === order.orderid ? (
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
                                  selectedStatusChanges[order.orderid] ||
                                  order.orderstatus
                                }
                                disabled={order.orderstatus === "delivered" || order.orderstatus === "cancelled"}
                                onChange={(e) =>
                                  setSelectedStatusChanges({
                                    ...selectedStatusChanges,
                                    [order.orderid]: e.target.value,
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
                                  handleStatusUpdate(
                                    order.orderid,
                                    selectedStatusChanges[order.orderid] ||
                                    order.orderstatus,
                                  )
                                }
                                disabled={
                                  !selectedStatusChanges[order.orderid] ||
                                  selectedStatusChanges[order.orderid] ===
                                  order.orderstatus
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
              <p>We couldn't find any monthly orders matching your filters.</p>
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
            <div className="drawer-header">
              <div className="header-title">
                <h2>Monthly Order Details</h2>
                <span className="id">ORD-{selectedOrder.orderid}</span>
              </div>
              <button
                className="close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-content">
              {loadingDetails ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "40px",
                  }}
                >
                  <div className="circular-loader"></div>
                </div>
              ) : orderDetails ? (
                <>
                  {/* Timeline */}
                  <div className="order-timeline-wrapper">
                    {orderDetails.order.orderstatus === "cancelled" ? (
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
                          className={`step pending ${["pending", "confirmed", "shipped", "delivered"].includes(orderDetails.order.orderstatus) ? "active" : ""}`}
                        >
                          <div className="bullet"></div>
                          <span>Pending</span>
                        </div>
                        <div
                          className={`step confirmed ${["confirmed", "shipped", "delivered"].includes(orderDetails.order.orderstatus) ? "active" : ""}`}
                        >
                          <div className="bullet"></div>
                          <span>Confirmed</span>
                        </div>
                        <div
                          className={`step shipped ${["shipped", "delivered"].includes(orderDetails.order.orderstatus) ? "active" : ""}`}
                        >
                          <div className="bullet"></div>
                          <span>Shipped</span>
                        </div>
                        <div
                          className={`step delivered ${orderDetails.order.orderstatus === "delivered" ? "active" : ""}`}
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
                              {orderDetails.order?.fullname || "N/A"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Phone</span>
                            <span className="val">
                              <Phone size={14} /> {orderDetails.order?.mobilenumber || "N/A"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Email</span>
                            <span className="val">
                              <Mail size={14} /> {orderDetails.order?.email || "N/A"}
                            </span>
                          </div>
                          <div className="detail-item full">
                            <span className="label">Delivery Address</span>
                            <span
                              className="val"
                              style={{ whiteSpace: "pre-wrap" }}
                            >
                              <MapPin size={14} /> {orderDetails.order?.address || "N/A"}
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
                          {orderDetails.items &&
                            orderDetails.items.map((item) => (
                              <div
                                key={item.orderitemid}
                                className="product-item"
                                style={{ flexWrap: "wrap" }}
                              >
                                <div className="p-img">
                                  {item.productimage ? (
                                    <img
                                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${item.productimage}`}
                                      alt={item.productname}
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
                                <div
                                  className="p-info"
                                  style={{ flex: "1 1 200px" }}
                                >
                                  <span className="p-name">
                                    {item.productname}
                                  </span>
                                  <span className="p-qty">
                                    Grams/Day: {item.gramsperday}g | Days:{" "}
                                    {item.dayspermonth} | Members:{" "}
                                    {item.familymembers}
                                  </span>
                                  <span
                                    className="p-qty"
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "var(--text-muted)",
                                    }}
                                  >
                                    Total: {item.totalquantitykg}kg
                                  </span>
                                </div>
                                <div className="p-price">
                                  ₹{item.totalprice}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid-side">
                      {/* Summary */}
                      <div className="summary-card">
                        <h4>Price Summary</h4>
                        <div className="summary-list">
                          <div className="row grand-total">
                            <span>Total Amount</span>
                            <span>₹{orderDetails.order.totalamount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="drawer-actions">
                        <div className="action-group">
                          <label>Update Status</label>
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
                                orderDetails.order.orderid
                                ] || orderDetails.order.orderstatus
                              }
                              disabled={
                                orderDetails.order.orderstatus === "delivered" ||
                                orderDetails.order.orderstatus === "cancelled"
                              }
                              onChange={(e) =>
                                setSelectedStatusChanges({
                                  ...selectedStatusChanges,
                                  [orderDetails.order.orderid]: e.target.value,
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
                                handleStatusUpdate(
                                  orderDetails.order.orderid,
                                  selectedStatusChanges[
                                  orderDetails.order.orderid
                                  ] || orderDetails.order.orderstatus,
                                )
                              }
                              disabled={
                                !selectedStatusChanges[
                                orderDetails.order.orderid
                                ] ||
                                selectedStatusChanges[
                                orderDetails.order.orderid
                                ] === orderDetails.order.orderstatus
                              }
                            >
                              {processingId === orderDetails.order.orderid ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                "Confirm Status Update"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <p>Could not load order details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyOrders;
