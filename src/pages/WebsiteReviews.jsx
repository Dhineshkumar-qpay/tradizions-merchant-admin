import React, { useState } from 'react';
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
    Globe
} from 'lucide-react';
import './Reviews.css';

const WebsiteReviews = () => {
    const [reviews, setReviews] = useState([
        {
            id: 'WEB-501',
            customerName: 'Aishwarya R',
            rating: 5,
            comment: 'The website interface is very smooth and easy to navigate. Love the boutique aesthetic!',
            date: '2026-04-02',
            status: 'Published'
        },
        {
            id: 'WEB-502',
            customerName: 'Karthik S',
            rating: 4,
            comment: 'Checkout process is very fast. Would be great to have more payment options.',
            date: '2026-03-30',
            status: 'Published'
        },
        {
            id: 'WEB-503',
            customerName: 'Sanjana M',
            rating: 5,
            comment: 'Mobile version is very responsive. Shopping on the go is a breeze.',
            date: '2026-03-28',
            status: 'Published'
        },
        {
            id: 'WEB-504',
            customerName: 'David Lee',
            rating: 2,
            comment: 'Site was a bit slow to load high-resolution product images yesterday.',
            date: '2026-03-25',
            status: 'Flagged'
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailDrawer, setShowDetailDrawer] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const filteredReviews = reviews.filter(rev =>
        rev.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.comment.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderStars = (rating) => {
        return (
            <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        fill={i < rating ? "#f59e0b" : "none"}
                        stroke={i < rating ? "#f59e0b" : "#cbd5e1"}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="reviews-page-container">
            <div className="page-header">
                <div className="header-text">
                    <h1>Website Feedback & Reviews</h1>
                    <p>Manage customer experience feedback regarding the overall platform and shopping journey.</p>
                </div>
            </div>

            <div className="table-card section-card">
                <div className="table-filters-row">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by customer or comment content..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-options">
                        <div className="filter-item">
                            <label>Rating</label>
                            <select><option>All Ratings</option><option>5 Stars</option><option>4 Stars</option><option>3 Stars & Below</option></select>
                        </div>
                        <button className="btn-icon-outline"><Filter size={18} /></button>
                    </div>
                </div>

                <div className="table-responsive thin-scrollbar">
                    <table className="reviews-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Rating</th>
                                <th>Experience Feedback</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReviews.map((rev) => (
                                <tr key={rev.id} className="review-row">
                                    <td><span className="id-badge-text">{rev.id}</span></td>
                                    <td>
                                        <div className="customer-cell">
                                            <User size={14} className="muted" />
                                            <span>{rev.customerName}</span>
                                        </div>
                                    </td>
                                    <td>{renderStars(rev.rating)}</td>
                                    <td className="comment-cell">
                                        <p className="comment-text">{rev.comment}</p>
                                    </td>
                                    <td><span className="date-text">{rev.date}</span></td>
                                    <td>
                                        <span className={`status-badge ${rev.status.toLowerCase()}`}>
                                            {rev.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-cell">
                                            <button className="action-btn view" title="View Review" onClick={() => setShowDetailDrawer(rev)}>
                                                <Eye size={16} />
                                            </button>
                                            <button className="action-btn delete" title="Delete Review" onClick={() => setShowDeleteConfirm(rev.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination-footer">
                    <p>Showing <strong>{filteredReviews.length}</strong> Website Reviews</p>
                    <div className="page-controls">
                        <button className="btn-page"><ChevronLeft size={18} /></button>
                        <button className="btn-page active">1</button>
                        <button className="btn-page"><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>

            {/* Review Detail Drawer */}
            {showDetailDrawer && (
                <div className="modal-overlay" onClick={() => setShowDetailDrawer(null)}>
                    <div className="modal-drawer slide-left" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer-header">
                            <div className="header-title">
                                <h2>Website Review Details</h2>
                                <span className="id">{showDetailDrawer.id}</span>
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
                                    <h3>{showDetailDrawer.customerName}</h3>
                                    <span className="product">Platform Experience Review</span>
                                </div>
                            </div>

                            <div className="drawer-info-grid">
                                <div className="info-section">
                                    <h4><Globe size={16} /> User Journey Feedback</h4>
                                    <div className="feedback-content">
                                        <p className="comment-large">"{showDetailDrawer.comment}"</p>
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h4><Calendar size={16} /> Metadata</h4>
                                    <div className="stats-box">
                                        <div className="stat">
                                            <label>Submission Date</label>
                                            <span>{showDetailDrawer.date}</span>
                                        </div>
                                        <div className="stat">
                                            <label>Review Status</label>
                                            <span className={`status-badge ${showDetailDrawer.status.toLowerCase()}`}>
                                                {showDetailDrawer.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="drawer-actions-footer">
                            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowDetailDrawer(null)}>
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
                        <div className="modal-icon-box delete">
                            <Trash2 size={32} />
                        </div>
                        <h3>Delete Review?</h3>
                        <p>Are you sure you want to remove this website review? This action cannot be undone.</p>
                        <div className="modal-btn-group">
                            <button className="btn-ghost" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                            <button className="btn-solid-danger" onClick={() => {
                                setReviews(reviews.filter(r => r.id !== showDeleteConfirm));
                                setShowDeleteConfirm(null);
                            }}>Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebsiteReviews;
