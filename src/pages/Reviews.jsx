import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Star,
    MessageSquare,
    User,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye,
    Trash2,
    X,
    Package,
    Loader2
} from 'lucide-react';
import { API } from '../service/api_service';
import { APIROUTES } from '../routes/api_routes';
import './Reviews.css';

const Reviews = () => {
    const [businesses, setBusinesses] = useState([]);
    const [selectedBid, setSelectedBid] = useState("");
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRating, setSelectedRating] = useState('All');
    const [selectCount, setSelectCount] = useState('10');

    const [showDetailDrawer, setShowDetailDrawer] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    // Fetch businesses on mount
    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const response = await API.post(APIROUTES.GETALLBUSINESS);
                const data = response.data?.data || response.data;
                if (Array.isArray(data)) {
                    setBusinesses(data);
                    if (data.length > 0) {
                        setSelectedBid(data[0].bid);
                    }
                }
            } catch (err) {
                console.error("Failed to load businesses:", err);
            }
        };
        fetchBusinesses();
    }, []);

    // Fetch reviews when selected business changes
    useEffect(() => {
        if (selectedBid) {
            fetchReviews(selectedBid);
        }
    }, [selectedBid]);

    const fetchReviews = async (bid) => {
        setLoading(true);
        try {
            const response = await API.post(APIROUTES.PRODUCTRATINGS, { bid });
            const data = response.data?.data || response.data;
            if (Array.isArray(data)) {
                setReviews(data);
            } else {
                setReviews([]);
            }
        } catch (err) {
            console.error("Failed to load reviews:", err);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    // Toggle Review Status (Active / Inactive)
    const handleToggleStatus = async (review) => {
        const currentStatus = review.status || "inactive";
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        
        setTogglingId(review.reviewid);
        try {
            await API.post(APIROUTES.ACTIVERATINGSTATUS, {
                bid: Number(selectedBid),
                productid: Number(review.productid),
                status: newStatus
            });
            // Update local state smoothly
            setReviews(prev => prev.map(r => r.reviewid === review.reviewid ? { ...r, status: newStatus } : r));
            
            // If the drawer is open for this review, update its state too
            if (showDetailDrawer && showDetailDrawer.reviewid === review.reviewid) {
                setShowDetailDrawer(prev => ({ ...prev, status: newStatus }));
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        } finally {
            setTogglingId(null);
        }
    };

    // Delete Review
    const handleDeleteReview = async () => {
        if (!showDeleteConfirm) return;
        
        try {
            await API.post(APIROUTES.DELETERATINGS, {
                bid: Number(selectedBid),
                productid: Number(showDeleteConfirm.productid)
            });
            // Filter deleted review out of state
            setReviews(prev => prev.filter(r => r.reviewid !== showDeleteConfirm.reviewid));
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error("Failed to delete review:", err);
        }
    };

    // Client-side search and rating filter
    const filteredReviews = reviews.filter(rev => {
        // Search filter
        const matchSearch = 
            (rev.productname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (rev.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (rev.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(rev.reviewid).includes(searchTerm);

        // Rating filter
        if (selectedRating === "All") return matchSearch;
        if (selectedRating === "5") return matchSearch && rev.rating === 5;
        if (selectedRating === "4") return matchSearch && rev.rating === 4;
        if (selectedRating === "3 & Below") return matchSearch && rev.rating <= 3;
        return matchSearch && String(rev.rating) === selectedRating;
    });

    // Apply "selectcount wise ratings listout" slice (pagination/count limit)
    const displayedReviews = selectCount === "All" 
        ? filteredReviews 
        : filteredReviews.slice(0, Number(selectCount));

    const renderStars = (rating) => {
        const starNum = Number(rating) || 0;
        return (
            <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        fill={i < starNum ? "#f59e0b" : "none"}
                        stroke={i < starNum ? "#f59e0b" : "#cbd5e1"}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="reviews-page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
                <div className="header-text">
                    <h1>Product Ratings & Reviews</h1>
                    <p>Monitor and manage customer feedback across your product catalog.</p>
                </div>
                
                {/* Business Filter Dropdown */}
                <div className="input-group-inline" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>
                        Business:
                    </span>
                    <select
                        className="form-select"
                        value={selectedBid}
                        onChange={(e) => setSelectedBid(Number(e.target.value))}
                        style={{
                            padding: "10px 15px",
                            borderRadius: "10px",
                            border: "1.5px solid #edf2e9",
                            background: "#fcfdfb",
                            fontSize: "14px",
                            fontWeight: "600",
                            minWidth: "220px",
                        }}
                    >
                        {businesses.map((b) => (
                            <option key={b.bid} value={b.bid}>
                                {b.businessname}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table-card section-card">
                <div className="table-filters-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', gap: '15px', flexWrap: 'wrap' }}>
                    <div className="search-box" style={{ flex: 1, minWidth: '250px' }}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by ID, product, customer name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="filter-options" style={{ display: 'flex', gap: '15px' }}>
                        {/* Star Rating filter */}
                        <div className="filter-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Rating</label>
                            <select 
                                className="form-select"
                                value={selectedRating}
                                onChange={(e) => setSelectedRating(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '8px', minWidth: '130px', fontSize: '14px' }}
                            >
                                <option value="All">All Ratings</option>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3 & Below">3 Stars & Below</option>
                            </select>
                        </div>

                        {/* Selectcount filter */}
                        <div className="filter-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Show Count</label>
                            <select 
                                className="form-select"
                                value={selectCount}
                                onChange={(e) => setSelectCount(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '8px', minWidth: '130px', fontSize: '14px' }}
                            >
                                <option value="10">10 Entries</option>
                                <option value="20">20 Entries</option>
                                <option value="30">30 Entries</option>
                                <option value="40">40 Entries</option>
                                <option value="50">50 Entries</option>
                                <option value="All">All Reviews</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="table-responsive thin-scrollbar">
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', flexDirection: 'column', gap: '10px' }}>
                            <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
                            <p style={{ color: 'var(--text-muted)' }}>Loading reviews...</p>
                        </div>
                    ) : displayedReviews.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
                            No reviews found for this selection.
                        </div>
                    ) : (
                        <table className="reviews-table">
                            <thead>
                                <tr>
                                    <th>Review ID</th>
                                    <th>Product</th>
                                    <th>Customer</th>
                                    <th>Rating</th>
                                    <th>Comment</th>
                                    <th>Date</th>
                                    <th style={{ textAlign: 'center' }}>Toggle Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedReviews.map((rev) => (
                                    <tr key={rev.reviewid} className="review-row">
                                        <td><span className="id-badge-text">REV-{rev.reviewid}</span></td>
                                        <td>
                                            <div className="product-info-cell">
                                                <span className="product-name">{rev.productname}</span>
                                                <span className="p-id-badge" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {rev.productid}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="customer-cell" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <User size={14} className="muted" />
                                                    <span style={{ fontWeight: '600' }}>{rev.name}</span>
                                                </div>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '20px' }}>{rev.email}</span>
                                            </div>
                                        </td>
                                        <td>{renderStars(rev.rating)}</td>
                                        <td className="comment-cell">
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                {rev.title && <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{rev.title}</strong>}
                                                <p className="comment-text" title={rev.review}>{rev.review}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="date-text">
                                                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={rev.status === "active"}
                                                        onChange={() => handleToggleStatus(rev)}
                                                        disabled={togglingId === rev.reviewid}
                                                    />
                                                    <span className="slider"></span>
                                                </label>
                                                <span className={`status-badge ${rev.status === "active" ? "published" : "flagged"}`}>
                                                    {rev.status === "active" ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-cell">
                                                <button className="action-btn view" title="View Review" onClick={() => setShowDetailDrawer(rev)}>
                                                    <Eye size={16} />
                                                </button>
                                                <button className="action-btn delete" title="Delete Review" onClick={() => setShowDeleteConfirm(rev)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="pagination-footer">
                    <p>Showing <strong>{displayedReviews.length}</strong> of <strong>{filteredReviews.length}</strong> Reviews</p>
                    <div className="page-controls">
                        <button className="btn-page" disabled><ChevronLeft size={18} /></button>
                        <button className="btn-page active">1</button>
                        <button className="btn-page" disabled><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>

            {/* Review Detail Drawer */}
            {showDetailDrawer && (
                <div className="modal-overlay" onClick={() => setShowDetailDrawer(null)}>
                    <div className="modal-drawer slide-left" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer-header">
                            <div className="header-title">
                                <h2>Review Details</h2>
                                <span className="id">REV-{showDetailDrawer.reviewid}</span>
                            </div>
                            <button className="close-btn" onClick={() => setShowDetailDrawer(null)}><X size={20} /></button>
                        </div>
                        <div className="drawer-content">
                            <div className="review-profile-header">
                                <div className="rating-large">
                                    <span className="rating-num">{showDetailDrawer.rating}</span>
                                    <Star size={24} fill="#f59e0b" stroke="#f59e0b" />
                                </div>
                                <div className="user-meta">
                                    <h3>{showDetailDrawer.name}</h3>
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block' }}>{showDetailDrawer.email}</span>
                                    <span className="product">Product: <strong>{showDetailDrawer.productname}</strong> (ID: {showDetailDrawer.productid})</span>
                                </div>
                            </div>

                            <div className="drawer-info-grid">
                                <div className="info-section">
                                    <h4><MessageSquare size={16} /> Customer Feedback</h4>
                                    <div className="feedback-content">
                                        {showDetailDrawer.title && <strong style={{ display: 'block', marginBottom: '8px', fontSize: '15px' }}>{showDetailDrawer.title}</strong>}
                                        <p className="comment-large">"{showDetailDrawer.review}"</p>
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h4><Calendar size={16} /> Review Metadata</h4>
                                    <div className="stats-box">
                                        <div className="stat">
                                            <label>Submission Date</label>
                                            <span>{showDetailDrawer.createdAt ? new Date(showDetailDrawer.createdAt).toLocaleString() : 'N/A'}</span>
                                        </div>
                                        <div className="stat">
                                            <label>Review Status</label>
                                            <span className={`status-badge ${showDetailDrawer.status === "active" ? "published" : "flagged"}`}>
                                                {showDetailDrawer.status === "active" ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="drawer-actions-footer">
                            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowDetailDrawer(null)}>
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop compact">
                        <div className="modal-icon-box delete" style={{ background: "#fff1f1", color: "#dc2626", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                            <Trash2 size={32} />
                        </div>
                        <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "10px", textAlign: 'center' }}>Delete Review?</h3>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "25px", textAlign: 'center' }}>Are you sure you want to remove this customer review? This action cannot be undone.</p>
                        <div className="modal-btn-group" style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                            <button className="btn-ghost" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                            <button className="btn-solid-danger" style={{ background: "#dc2626", color: "white", padding: "10px 20px", borderRadius: "10px", border: 'none', fontWeight: '600' }} onClick={handleDeleteReview}>Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reviews;
