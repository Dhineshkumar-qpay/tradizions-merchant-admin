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
        });
        if (response.data && response.data.statusCode === 200) {
          setOrders(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [selectedBusinessId]);

  // Filter stats
  const stats = {
    total: orders.length,
    pending: orders.filter(
      (o) => o.itemstatus !== "delivered" && o.itemstatus !== "cancelled",
    ).length,
    delivered: orders.filter((o) => o.itemstatus === "delivered").length,
    cancelled: orders.filter((o) => o.itemstatus === "cancelled").length,
  };

  const filteredOrders = orders.filter(
    (o) =>
      (o.orderitemid && String(o.orderitemid).includes(searchTerm)) ||
      (o.username && o.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.phone && o.phone.includes(searchTerm)),
  );

  const handleStatusUpdate = async (id, newStatus) => {
    setProcessingId(id);
    try {
      const response = await API.post(APIROUTES.ORDERSTATUSUPDATE, {
        orderitemid: Number(id),
        itemstatus: newStatus,
      });
      if (response.data && response.data.statusCode === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.orderitemid === id ? { ...o, itemstatus: newStatus } : o
          )
        );
        setSelectedOrder((prevSelected) =>
          prevSelected && prevSelected.orderitemid === id
            ? { ...prevSelected, itemstatus: newStatus }
            : prevSelected
        );
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
              <label>Status</label>
              <select>
                <option>All Status</option>
                <option>Delivered</option>
                <option>Pending</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Payment</label>
              <select>
                <option>All</option>
                <option>Paid</option>
                <option>Pending</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Date Range</label>
              <button className="date-picker-btn">
                <Calendar size={16} /> Select Date
              </button>
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
                  <th>Customer Info</th>
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
                  <tr key={order.orderitemid} className="order-row">
                    <td>
                      <span className="order-id-tag">ORD-{order.orderitemid}</span>
                    </td>
                    <td>
                      <div className="customer-cell">
                        <span className="name">{order.username}</span>
                        <span className="phone">{order.phone}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`type-tag ${order.itemtype.toLowerCase()}`}>
                        {order.itemtype === "gift" ? (
                          <Gift size={12} />
                        ) : (
                          <Package size={12} />
                        )}
                        {order.itemtype}
                      </span>
                    </td>
                    <td>
                      <span className="amount">₹{order.totalprice}</span>
                    </td>
                    <td>
                      <span className="payment-badge paid">Paid</span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${order.itemstatus.toLowerCase()}`}
                      >
                        <div className="dot"></div>
                        {order.itemstatus}
                      </span>
                    </td>
                    <td>
                      <span className="date">{order.odredate}</span>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          className="action-btn view"
                          title="View Order"
                          onClick={() => setSelectedOrder(order)}
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
                        <div className="status-dropdown-wrap">
                          {processingId === order.orderitemid ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <select
                              value={order.itemstatus}
                              disabled={order.itemstatus === "delivered"}
                              onChange={(e) =>
                                handleStatusUpdate(order.orderitemid, e.target.value)
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
              <p>We couldn't find any orders matching your filters.</p>
            </div>
          )}
        </div>

        <div className="pagination-footer">
          <p>
            Showing <strong>{filteredOrders.length}</strong> Results
          </p>
          <div className="page-controls">
            <button className="btn-page">
              <ChevronLeft size={18} />
            </button>
            <button className="btn-page active">1</button>
            <button className="btn-page">
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
                <h2>Order Details</h2>
                <span className="id">ORD-{selectedOrder.orderitemid}</span>
              </div>
              <button
                className="close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-content">
              {/* Timeline */}
              <div className="order-timeline">
                <div
                  className={`step ${["pending", "confirmed", "processing", "packed", "shipped", "outfordelivery", "delivered"].includes(selectedOrder.itemstatus) ? "active" : ""}`}
                >
                  <div className="bullet"></div>
                  <span>Pending</span>
                </div>
                <div
                  className={`step ${["confirmed", "processing", "packed", "shipped", "outfordelivery", "delivered"].includes(selectedOrder.itemstatus) ? "active" : ""}`}
                >
                  <div className="bullet"></div>
                  <span>Confirmed</span>
                </div>
                <div
                  className={`step ${["processing", "packed", "shipped", "outfordelivery", "delivered"].includes(selectedOrder.itemstatus) ? "active" : ""}`}
                >
                  <div className="bullet"></div>
                  <span>Processing</span>
                </div>
                <div
                  className={`step ${["packed", "shipped", "outfordelivery", "delivered"].includes(selectedOrder.itemstatus) ? "active" : ""}`}
                >
                  <div className="bullet"></div>
                  <span>Packed</span>
                </div>
                <div
                  className={`step ${["shipped", "outfordelivery", "delivered"].includes(selectedOrder.itemstatus) ? "active" : ""}`}
                >
                  <div className="bullet"></div>
                  <span>Shipped</span>
                </div>
                <div
                  className={`step ${["outfordelivery", "delivered"].includes(selectedOrder.itemstatus) ? "active" : ""}`}
                >
                  <div className="bullet"></div>
                  <span>Out For Delivery</span>
                </div>
                <div
                  className={`step ${selectedOrder.itemstatus === "delivered" ? "active" : ""}`}
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
                      <User size={16} /> Customer Information
                    </h4>
                    <div className="card-body">
                      <div className="detail-item">
                        <span className="label">Name</span>
                        <span className="val">{selectedOrder.username}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Phone</span>
                        <span className="val">
                          <Phone size={14} /> {selectedOrder.phone}
                        </span>
                      </div>
                      <div className="detail-item full">
                        <span className="label">Delivery Address</span>
                        <span className="val">
                          <MapPin size={14} /> {`${selectedOrder.addressline}, ${selectedOrder.city}, ${selectedOrder.district}, ${selectedOrder.state} - ${selectedOrder.pincode}`}
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
                      <div className="product-item">
                        <div className="p-img">
                          {selectedOrder.productimage ? (
                            <img src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${selectedOrder.productimage}`} alt={selectedOrder.productname} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          ) : (
                            <Package size={20} />
                          )}
                        </div>
                        <div className="p-info">
                          <span className="p-name">{selectedOrder.productname}</span>
                          <span className="p-qty">Qty: {selectedOrder.quantity}</span>
                        </div>
                        <div className="p-price">
                          ₹{selectedOrder.price * selectedOrder.quantity}
                        </div>
                      </div>
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
                          <div className="gift-img" style={{ marginTop: '10px', marginBottom: '10px' }}>
                            <img src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${selectedOrder.giftcardimage}`} alt={selectedOrder.giftcardname} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                          </div>
                        )}
                        <div className="gift-meta">
                          <span>
                            Receiver:{" "}
                            <strong>{selectedOrder.username}</strong>
                          </span>
                          <span>
                            Date:{" "}
                            <strong>
                              {selectedOrder.odredate}
                            </strong>
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
                        <span>₹{selectedOrder.price * selectedOrder.quantity}</span>
                      </div>
                      {selectedOrder.giftcardprice && (
                        <div className="row">
                          <span>Gift Card</span>
                          <span>₹{selectedOrder.giftcardprice}</span>
                        </div>
                      )}
                      <div className="row grand-total">
                        <span>Total Amount</span>
                        <span>₹{selectedOrder.totalprice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="drawer-actions">
                    <div className="action-group">
                      <label>Update Status</label>
                      <select className="status-select" value={selectedOrder.itemstatus} disabled={selectedOrder.itemstatus === "delivered"} onChange={(e) => handleStatusUpdate(selectedOrder.orderitemid, e.target.value)}>
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
                          defaultChecked={true}
                        />
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
