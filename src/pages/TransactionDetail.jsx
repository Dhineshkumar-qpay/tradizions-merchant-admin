import React from "react";
import {
    ChevronLeft,
    Calendar,
    Clock,
    User,
    Phone,
    Mail,
    Receipt,
    Download,
    Printer,
    Share2,
    CheckCircle2,
    AlertCircle,
    CreditCard,
    Building2,
    Wallet,
    ArrowRight,
    Package,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import "./TransactionDetail.css";

const TransactionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock detailed data
    const txn = {
        id: id || "TXN-5021",
        orderId: "ORD-8821",
        customer: {
            name: "Anitha Sharma",
            phone: "+91 98765 43210",
            email: "anitha.sharma@example.com",
        },
        amount: 1540,
        subtotal: 1490,
        deliveryFee: 50,
        method: "UPI",
        methodDetails: "Google Pay • Ref: 622350218821",
        status: "Success",
        date: "2026-04-07",
        time: "14:30",
        gateway: "Razorpay",
        items: [
            { name: "Ancient Millets Mix", price: 450, qty: 2 },
            { name: "Organic Honey (500g)", price: 640, qty: 1 },
        ],
    };

    const getStatusClass = (status) => status.toLowerCase();

    return (
        <div className="txn-detail-container">
            <div className="page-header">
                <div className="header-left-group">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} />
                    </button>
                    <div className="header-text">
                        <div className="title-row">
                            <h1>Transaction Details</h1>
                            <span className={`status-pill ${getStatusClass(txn.status)}`}>
                                {txn.status === "Success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                {txn.status}
                            </span>
                        </div>
                        <p>Invoice ID: {txn.id}</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary">
                        <Share2 size={18} />
                        <span>Share</span>
                    </button>
                    <button className="btn-secondary">
                        <Printer size={18} />
                        <span>Print</span>
                    </button>
                    <button className="btn-primary">
                        <Download size={18} />
                        <span>Download Invoice</span>
                    </button>
                </div>
            </div>

            <div className="detail-grid">
                <div className="grid-left">
                    {/* Summary Card */}
                    <div className="info-card transaction-summary">
                        <div className="card-header">
                            <h3>Payment Summary</h3>
                        </div>
                        <div className="card-body">
                            <div className="amount-display">
                                <span className="currency">₹</span>
                                <span className="value">{txn.amount.toLocaleString()}</span>
                            </div>
                            <div className="txn-meta-list">
                                <div className="meta-item">
                                    <span className="label">Date & Time</span>
                                    <span className="val">
                                        <Calendar size={14} /> {txn.date} at {txn.time}
                                    </span>
                                </div>
                                <div className="meta-item">
                                    <span className="label">Payment Method</span>
                                    <span className="val">
                                        {txn.method === "UPI" ? <Wallet size={14} /> : <CreditCard size={14} />}
                                        {txn.method}
                                    </span>
                                </div>
                                <div className="meta-item">
                                    <span className="label">Gateway</span>
                                    <span className="val">{txn.gateway}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="label">Reference No.</span>
                                    <span className="val">{txn.methodDetails.split("•")[1] || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Card */}
                    <div className="info-card">
                        <div className="card-header">
                            <h3>Order Breakdown</h3>
                            <span className="order-tag">
                                <Package size={14} /> {txn.orderId}
                            </span>
                        </div>
                        <div className="card-body">
                            <div className="items-list">
                                {txn.items.map((item, index) => (
                                    <div key={index} className="item-row">
                                        <div className="item-info">
                                            <span className="name">{item.name}</span>
                                            <span className="qty">× {item.qty}</span>
                                        </div>
                                        <span className="price">₹{(item.price * item.qty).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="price-summary">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>₹{txn.subtotal}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Delivery Fee</span>
                                    <span>₹{txn.deliveryFee}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total Amount Paid</span>
                                    <span>₹{txn.amount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid-right">
                    {/* Customer Card */}
                    <div className="info-card">
                        <div className="card-header">
                            <h3>Customer Information</h3>
                        </div>
                        <div className="card-body">
                            <div className="customer-profile">
                                <div className="large-avatar">{txn.customer.name.charAt(0)}</div>
                                <div className="name-meta">
                                    <h4>{txn.customer.name}</h4>
                                    <span className="customer-id">Customer ID: CUST-442</span>
                                </div>
                            </div>
                            <div className="contact-list">
                                <div className="contact-item">
                                    <Phone size={16} />
                                    <span>{txn.customer.phone}</span>
                                </div>
                                <div className="contact-item">
                                    <Mail size={16} />
                                    <span>{txn.customer.email}</span>
                                </div>
                            </div>
                            <button className="btn-full-outline">
                                View Profile <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Activity Logs */}
                    <div className="info-card">
                        <div className="card-header">
                            <h3>Processing Timeline</h3>
                        </div>
                        <div className="card-body">
                            <div className="timeline">
                                <div className="timeline-item completed">
                                    <div className="t-icon"><CheckCircle2 size={14} /></div>
                                    <div className="t-content">
                                        <span className="action">Payment Confirmed</span>
                                        <span className="time">{txn.date}, {txn.time}</span>
                                    </div>
                                </div>
                                <div className="timeline-item completed">
                                    <div className="t-icon"><Clock size={14} /></div>
                                    <div className="t-content">
                                        <span className="action">Gateway Response Received</span>
                                        <span className="time">{txn.date}, 14:29</span>
                                    </div>
                                </div>
                                <div className="timeline-item completed">
                                    <div className="t-icon"><ArrowRight size={14} /></div>
                                    <div className="t-content">
                                        <span className="action">Transaction Initiated</span>
                                        <span className="time">{txn.date}, 14:28</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetail;
