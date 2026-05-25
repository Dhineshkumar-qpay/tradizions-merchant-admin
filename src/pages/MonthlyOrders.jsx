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
  MapPin,
  Trash2,
  X,
  CreditCard,
  Download,
  Loader2,
  User
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
        });
        if (response.data && response.data.statusCode === 200) {
          setOrders(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching monthly orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [selectedBusinessId]);

  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    setLoadingDetails(true);
    try {
      const response = await API.post(APIROUTES.CALCULATORORDERDETAILS, {
        orderid: order.orderid,
      });
      if (response.data && response.data.statusCode === 200) {
        setOrderDetails(response.data.data);
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
      (o.ordertype && o.ordertype.toLowerCase().includes(searchTerm.toLowerCase()))
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
            o.orderid === id ? { ...o, orderstatus: newStatus } : o
          )
        );
        if (selectedOrder && selectedOrder.orderid === id) {
          setSelectedOrder({ ...selectedOrder, orderstatus: newStatus });
        }
        if (orderDetails && orderDetails.order) {
            setOrderDetails({
                ...orderDetails,
                order: { ...orderDetails.order, orderstatus: newStatus }
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
            Monitor your monthly subscription sales and manage customer fulfillment journeys.
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
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
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
                {filteredOrders.map((order) => (
                  <tr key={order.orderid} className="order-row">
                    <td>
                      <span className="order-id-tag">ORD-{order.orderid}</span>
                    </td>
                    <td>
                      <span className={`type-tag monthly`}>
                        <Package size={12} />
                        {order.ordertype || "Monthly"}
                      </span>
                    </td>
                    <td>
                      <span className="amount">₹{order.totalamount}</span>
                    </td>
                    <td>
                      <span className={`payment-badge ${order.paymentstatus === 'paid' ? 'paid' : 'pending'}`}>{order.paymentstatus}</span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${order.orderstatus.toLowerCase()}`}
                      >
                        <div className="dot"></div>
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
                        <div className="status-dropdown-wrap">
                          {processingId === order.orderid ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <select
                              value={order.orderstatus}
                              disabled={order.orderstatus === "delivered"}
                              onChange={(e) =>
                                handleStatusUpdate(order.orderid, e.target.value)
                              }
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="packed">Packed</option>
                              <option value="shipped">Shipped</option>
                              <option value="outfordelivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                            </select>
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
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <div className="circular-loader"></div>
                </div>
              ) : orderDetails ? (
                <>
                {/* Timeline */}
                <div className="order-timeline">
                    <div
                    className={`step ${["pending", "confirmed", "processing", "packed", "shipped", "outfordelivery", "delivered"].includes(orderDetails.order.orderstatus) ? "active" : ""}`}
                    >
                    <div className="bullet"></div>
                    <span>Pending</span>
                    </div>
                    <div
                    className={`step ${["confirmed", "processing", "packed", "shipped", "outfordelivery", "delivered"].includes(orderDetails.order.orderstatus) ? "active" : ""}`}
                    >
                    <div className="bullet"></div>
                    <span>Confirmed</span>
                    </div>
                    <div
                    className={`step ${["processing", "packed", "shipped", "outfordelivery", "delivered"].includes(orderDetails.order.orderstatus) ? "active" : ""}`}
                    >
                    <div className="bullet"></div>
                    <span>Processing</span>
                    </div>
                    <div
                    className={`step ${["packed", "shipped", "outfordelivery", "delivered"].includes(orderDetails.order.orderstatus) ? "active" : ""}`}
                    >
                    <div className="bullet"></div>
                    <span>Packed</span>
                    </div>
                    <div
                    className={`step ${["shipped", "outfordelivery", "delivered"].includes(orderDetails.order.orderstatus) ? "active" : ""}`}
                    >
                    <div className="bullet"></div>
                    <span>Shipped</span>
                    </div>
                    <div
                    className={`step ${["outfordelivery", "delivered"].includes(orderDetails.order.orderstatus) ? "active" : ""}`}
                    >
                    <div className="bullet"></div>
                    <span>Out For Delivery</span>
                    </div>
                    <div
                    className={`step ${orderDetails.order.orderstatus === "delivered" ? "active" : ""}`}
                    >
                    <div className="bullet"></div>
                    <span>Delivered</span>
                    </div>
                </div>

                <div className="drawer-grid">
                    <div className="grid-main">
                    {/* Customer Card */}
                    <div className="info-card">
                        <h4 className="card-title">
                        <MapPin size={16} /> Delivery Details
                        </h4>
                        <div className="card-body">
                        <div className="detail-item full">
                            <span className="label">Delivery Address</span>
                            <span className="val" style={{ whiteSpace: "pre-wrap" }}>
                            {orderDetails.order.address}
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
                        {orderDetails.items && orderDetails.items.map((item) => (
                            <div key={item.orderitemid} className="product-item" style={{ flexWrap: 'wrap' }}>
                            <div className="p-img">
                                {item.productimage ? (
                                <img src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${item.productimage}`} alt={item.productname} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                ) : (
                                <Package size={20} />
                                )}
                            </div>
                            <div className="p-info" style={{ flex: '1 1 200px' }}>
                                <span className="p-name">{item.productname}</span>
                                <span className="p-qty">Grams/Day: {item.gramsperday}g | Days: {item.dayspermonth} | Members: {item.familymembers}</span>
                                <span className="p-qty" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total: {item.totalquantitykg}kg</span>
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
                        <select className="status-select" value={orderDetails.order.orderstatus} disabled={orderDetails.order.orderstatus === "delivered"} onChange={(e) => handleStatusUpdate(selectedOrder.orderid, e.target.value)}>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="outfordelivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                        </select>
                        </div>
                        <div className="action-group">
                        <label>Payment Status</label>
                        <div className="payment-toggle">
                            <span>Mark as Paid</span>
                            <input
                            type="checkbox"
                            defaultChecked={orderDetails.order.paymentstatus === 'paid'}
                            disabled
                            />
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
