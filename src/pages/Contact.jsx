import React, { useState } from 'react';
import {
    Search,
    Filter,
    Mail,
    Phone,
    User,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye,
    Trash2,
    X,
    MessageCircle,
    MapPin
} from 'lucide-react';
import './Contact.css';

const Contact = () => {
    const [inquiries, setInquiries] = useState([
        {
            id: 'INQ-501',
            name: 'Vikram Mehta',
            email: 'vikram.m@example.com',
            phone: '+91 98765 43210',
            subject: 'Bulk Order Inquiry',
            message: 'I am interested in ordering 50kg of Organic Foxtail Millet for my store in Pune. Please provide bulk pricing.',
            date: '2026-04-05',
            status: 'New'
        },
        {
            id: 'INQ-502',
            name: 'Sarah Joseph',
            email: 'sarah.j@example.com',
            phone: '+91 88776 65544',
            subject: 'Delivery Delay',
            message: 'My order #ORD-1025 is delayed by 3 days. Can I get an update on the current tracking status?',
            date: '2026-04-03',
            status: 'In Progress'
        },
        {
            id: 'INQ-503',
            name: 'Rahul Khanna',
            email: 'rahul.k@example.com',
            phone: '+91 77665 54433',
            subject: 'Product Quality Feedback',
            message: 'Loved the Barnyard millet! Looking forward to more organic varieties in the future.',
            date: '2026-04-01',
            status: 'Resolved'
        },
        {
            id: 'INQ-504',
            name: 'Priya Reddy',
            email: 'priya.r@example.com',
            phone: '+91 99887 76655',
            subject: 'Partnership Inquiry',
            message: 'We run a health cafe chain and would like to partner with Millets Admin for our supply chain.',
            date: '2026-03-30',
            status: 'New'
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailDrawer, setShowDetailDrawer] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const filteredInquiries = inquiries.filter(inq =>
        inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inq.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inq.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="contact-page-container">
            <div className="page-header">
                <div className="header-text">
                    <h1>Contact Inquiries</h1>
                    <p>Manage customer messages, bulk inquiries, and support requests.</p>
                </div>
            </div>

            <div className="table-card section-card">
                <div className="table-filters-row">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email or subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-options">
                        <div className="filter-item">
                            <label>Status</label>
                            <select><option>All Inquiries</option><option>New</option><option>In Progress</option><option>Resolved</option></select>
                        </div>
                        <button className="btn-icon-outline"><Filter size={18} /></button>
                    </div>
                </div>

                <div className="table-responsive thin-scrollbar">
                    <table className="contact-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Subject</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInquiries.map((inq) => (
                                <tr key={inq.id} className="contact-row">
                                    <td><span className="id-badge-text">{inq.id}</span></td>
                                    <td>
                                        <div className="name-cell">
                                            <span className="name-text">{inq.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="subject-text">{inq.subject}</span></td>
                                    <td><span className="email-text">{inq.email}</span></td>
                                    <td><span className="phone-text">{inq.phone}</span></td>
                                    <td><span className="date-text">{inq.date}</span></td>
                                    <td>
                                        <span className={`status-badge ${inq.status.toLowerCase().replace(' ', '-')}`}>
                                            {inq.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-cell">
                                            <button className="action-btn view" title="View Inquiry" onClick={() => setShowDetailDrawer(inq)}>
                                                <Eye size={16} />
                                            </button>
                                            <button className="action-btn delete" title="Delete Inquiry" onClick={() => setShowDeleteConfirm(inq.id)}>
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
                    <p>Showing <strong>{filteredInquiries.length}</strong> Inquiries</p>
                    <div className="page-controls">
                        <button className="btn-page"><ChevronLeft size={18} /></button>
                        <button className="btn-page active">1</button>
                        <button className="btn-page"><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>

            {/* Inquiry Detail Drawer */}
            {showDetailDrawer && (
                <div className="modal-overlay" onClick={() => setShowDetailDrawer(null)}>
                    <div className="modal-drawer slide-left" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer-header">
                            <div className="header-title">
                                <h2>Inquiry Details</h2>
                                <span className="id">{showDetailDrawer.id}</span>
                            </div>
                            <button className="close-btn" onClick={() => setShowDetailDrawer(null)}><X size={20} /></button>
                        </div>
                        <div className="drawer-content">
                            <div className="inquiry-profile-header">
                                <div className="icon-avatar">
                                    <MessageCircle size={32} />
                                </div>
                                <div className="user-meta">
                                    <h3>{showDetailDrawer.name}</h3>
                                    <span className="subject">{showDetailDrawer.subject}</span>
                                </div>
                            </div>

                            <div className="drawer-info-grid">
                                <div className="info-section">
                                    <h4><User size={16} /> Sender Details</h4>
                                    <div className="info-list">
                                        <div className="item"><Mail size={14} /> <span>{showDetailDrawer.email}</span></div>
                                        <div className="item"><Phone size={14} /> <span>{showDetailDrawer.phone}</span></div>
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h4><MessageCircle size={16} /> Message Content</h4>
                                    <div className="message-content-box">
                                        <p className="message-text">"{showDetailDrawer.message}"</p>
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h4><Calendar size={16} /> Metadata</h4>
                                    <div className="stats-box">
                                        <div className="stat">
                                            <label>Query Date</label>
                                            <span>{showDetailDrawer.date}</span>
                                        </div>
                                        <div className="stat">
                                            <label>Status</label>
                                            <span className={`status-badge ${showDetailDrawer.status.toLowerCase().replace(' ', '-')}`}>
                                                {showDetailDrawer.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="drawer-actions-footer">
                            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowDetailDrawer(null)}>
                                Close Inquiries
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
                        <h3>Delete Inquiry?</h3>
                        <p>Are you sure you want to remove this customer inquiry? This action cannot be undone.</p>
                        <div className="modal-btn-group">
                            <button className="btn-ghost" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                            <button className="btn-solid-danger" onClick={() => {
                                setInquiries(inquiries.filter(i => i.id !== showDeleteConfirm));
                                setShowDeleteConfirm(null);
                            }}>Delete Inquiry</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contact;
