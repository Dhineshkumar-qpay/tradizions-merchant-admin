import React, { useState } from "react";
import {
    Search,
    Filter,
    Eye,
    ChevronLeft,
    ChevronRight,
    Download,
    Receipt,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    CreditCard,
    Building2,
    Wallet,
    Clock,
    CheckCircle2,
    XCircle,
    MoreVertical,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Transactions.css";

const Transactions = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");

    const [transactions] = useState([
        {
            id: "TXN-5021",
            orderId: "ORD-8821",
            customer: "Anitha Sharma",
            amount: 1540,
            method: "UPI",
            status: "Success",
            date: "2026-04-07",
            time: "14:30",
        },
        {
            id: "TXN-5022",
            orderId: "ORD-8822",
            customer: "Rajesh Kumar",
            amount: 2100,
            method: "Credit Card",
            status: "Success",
            date: "2026-04-07",
            time: "16:15",
        },
        {
            id: "TXN-5023",
            orderId: "ORD-8823",
            customer: "Suresh Raina",
            amount: 850,
            method: "Net Banking",
            status: "Pending",
            date: "2026-04-08",
            time: "09:45",
        },
        {
            id: "TXN-5024",
            orderId: "ORD-8824",
            customer: "Deepika P.",
            amount: 1200,
            method: "Card",
            status: "Failed",
            date: "2026-04-08",
            time: "11:20",
        },
        {
            id: "TXN-5025",
            orderId: "ORD-8825",
            customer: "Rahul Dravid",
            amount: 540,
            method: "UPI",
            status: "Success",
            date: "2026-04-09",
            time: "10:05",
        },
        {
            id: "TXN-5026",
            orderId: "ORD-8826",
            customer: "Priya Verma",
            amount: 3200,
            method: "Wallet",
            status: "Success",
            date: "2026-04-09",
            time: "15:40",
        },
    ]);

    const stats = {
        totalRevenue: "₹9,430",
        successCount: transactions.filter(t => t.status === "Success").length,
        pendingCount: transactions.filter(t => t.status === "Pending").length,
        failedCount: transactions.filter(t => t.status === "Failed").length,
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.orderId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All Status" || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case "Success": return <CheckCircle2 size={14} />;
            case "Pending": return <Clock size={14} />;
            case "Failed": return <XCircle size={14} />;
            default: return null;
        }
    };

    const getMethodIcon = (method) => {
        if (method.includes("Card")) return <CreditCard size={14} />;
        if (method === "UPI") return <Wallet size={14} />;
        if (method === "Net Banking") return <Building2 size={14} />;
        return <Receipt size={14} />;
    };

    return (
        <div className="transactions-container">
            <div className="page-header">
                <div className="header-text">
                    <h1>Transactions History</h1>
                    <p>Track all incoming payments and financial settlements.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary">
                        <Download size={18} />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon revenue"><ArrowUpRight size={24} /></div>
                    <div className="stat-data">
                        <span className="label">Total Revenue</span>
                        <span className="value">{stats.totalRevenue}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success"><CheckCircle2 size={24} /></div>
                    <div className="stat-data">
                        <span className="label">Successful</span>
                        <span className="value">{stats.successCount}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon pending"><Clock size={24} /></div>
                    <div className="stat-data">
                        <span className="label">Pending</span>
                        <span className="value">{stats.pendingCount}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon failed"><XCircle size={24} /></div>
                    <div className="stat-data">
                        <span className="label">Failed</span>
                        <span className="value">{stats.failedCount}</span>
                    </div>
                </div>
            </div>

            <div className="table-card section-card">
                <div className="table-filters-row">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by TXN ID, Order ID or Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-options">
                        <div className="filter-item">
                            <label>Status</label>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option>All Status</option>
                                <option>Success</option>
                                <option>Pending</option>
                                <option>Failed</option>
                            </select>
                        </div>
                        <div className="filter-item">
                            <label>Date Range</label>
                            <button className="date-picker-btn">
                                <Calendar size={16} />
                                <span>Today</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Date & Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((txn) => (
                                <tr key={txn.id} className="txn-row">
                                    <td><span className="txn-id-tag">{txn.id}</span></td>
                                    <td><span className="order-link">{txn.orderId}</span></td>
                                    <td>
                                        <div className="customer-info">
                                            <div className="avatar">{txn.customer.charAt(0)}</div>
                                            <span>{txn.customer}</span>
                                        </div>
                                    </td>
                                    <td><span className="amount">₹{txn.amount}</span></td>
                                    <td>
                                        <div className="method-cell">
                                            {getMethodIcon(txn.method)}
                                            <span>{txn.method}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${txn.status.toLowerCase()}`}>
                                            {getStatusIcon(txn.status)}
                                            {txn.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="datetime-cell">
                                            <span className="date">{txn.date}</span>
                                            <span className="time">{txn.time}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-cell">
                                            <button
                                                className="action-btn view"
                                                title="View Details"
                                                onClick={() => navigate(`/transactions/${txn.id}`)}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button className="action-btn more">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTransactions.length === 0 && (
                        <div className="empty-table">
                            <Receipt size={48} />
                            <p>No transactions found matching your criteria</p>
                        </div>
                    )}
                </div>

                <div className="pagination-footer">
                    <p>Showing <strong>{filteredTransactions.length}</strong> transactions</p>
                    <div className="page-controls">
                        <button className="btn-page"><ChevronLeft size={18} /></button>
                        <button className="btn-page active">1</button>
                        <button className="btn-page"><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
