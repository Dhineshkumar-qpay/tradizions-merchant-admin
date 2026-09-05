import React, { useState, useEffect } from 'react';
import { formatIndianAmount } from '../utils/formatters';
import { toast } from 'react-toastify';
import { ChevronRight, Save, Loader2, Ticket, Edit2, Trash2, X, CheckCircle2 } from 'lucide-react';
import { APIROUTES } from '../routes/api_routes';
import { API } from '../service/api_service';
import './Coupons.css';

const Coupons = () => {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('fixed');
  const [discountValue, setDiscountValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [editCode, setEditCode] = useState('');
  const [editDiscountType, setEditDiscountType] = useState('fixed');
  const [editDiscountValue, setEditDiscountValue] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchCoupons = async () => {
    setFetchLoading(true);
    try {
      const response = await API.get(APIROUTES.GETALLCOUPONS);
      if (response.status === 200 && response.data?.coupons) {
        setCoupons(response.data.coupons);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleStatus = async (code, currentStatus) => {
    try {
      const response = await API.post(APIROUTES.TOGGLECOUPONSTATUS, {
        code,
        is_active: !currentStatus
      });
      if (response.status === 200) {
        toast.success(response.data.message);
        fetchCoupons();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update coupon status');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code || !discountValue) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post(APIROUTES.CREATECOUPON, {
        code,
        discount_type: discountType,
        discount_value: parseFloat(discountValue)
      });
      
      if (response.status === 201 || response.status === 200) {
        toast.success('Coupon created successfully!');
        setCode('');
        setDiscountValue('');
        setDiscountType('fixed');
        fetchCoupons(); // Refresh list after creation
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (couponid) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const response = await API.delete(`${APIROUTES.DELETECOUPON}/${couponid}`);
      if (response.status === 200) {
        toast.success(response.data.message || 'Coupon deleted');
        fetchCoupons();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleEditClick = (coupon) => {
    setEditingCoupon(coupon);
    setEditCode(coupon.code);
    setEditDiscountType(coupon.discount_type);
    setEditDiscountValue(coupon.discount_value);
    setShowEditModal(true);
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    if (!editCode || !editDiscountValue) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await API.put(APIROUTES.EDITCOUPON, {
        couponid: editingCoupon.couponid,
        code: editCode,
        discount_type: editDiscountType,
        discount_value: parseFloat(editDiscountValue)
      });
      if (response.status === 200) {
        toast.success('Coupon updated successfully!');
        setShowEditModal(false);
        fetchCoupons();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coupons-container">
      <div className="breadcrumb">
        <span>Marketing</span>
        <ChevronRight size={14} />
        <span className="current">Manage Coupons</span>
      </div>

      <div className="page-header">
        <div className="header-text">
          <h1>Manage Coupons</h1>
          <p>Create new discount coupons and promotional offers for your customers.</p>
        </div>
      </div>

      <div className="vertical-stack">
        <div className="section-card full-width-card">
          <div className="card-header-premium">
            <Ticket size={18} />
            <h2>Create New Coupon</h2>
          </div>
          <form onSubmit={handleCreateCoupon} className="coupon-form-panel">
            <div className="coupon-horizontal-form">
              <div className="form-group-custom">
                <label>Coupon Code *</label>
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER50"
                  required
                />
              </div>
              
              <div className="form-group-custom">
                <label>Discount Type *</label>
                <select 
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="fixed">Fixed Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              
              <div className="form-group-custom">
                <label>Discount Value *</label>
                <input 
                  type="number" 
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'fixed' ? 'e.g. 500' : 'e.g. 20'}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{
                  width: '200px',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  height: '48px',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{loading ? 'CREATING...' : 'CREATE COUPON'}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="table-card section-card" style={{ marginTop: '24px' }}>
          <div className="card-header-premium">
            <Ticket size={18} />
            <h2>Existing Coupons</h2>
          </div>
          <div className="table-responsive thin-scrollbar">
            {fetchLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
              </div>
            ) : coupons.length > 0 ? (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount Type</th>
                    <th>Value</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.couponid} className="user-row">
                      <td>
                        <span className="user-id-tag">{coupon.code}</span>
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize' }}>{coupon.discount_type}</span>
                      </td>
                      <td>
                        <span className="hl">{coupon.discount_type === 'fixed' ? `₹${formatIndianAmount(coupon.discount_value)}` : `${coupon.discount_value}%`}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${coupon.is_active ? 'active' : 'inactive'}`}>
                          {coupon.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <span className="date-text">{new Date(coupon.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td>
                        <div className="action-cell" style={{ justifyContent: 'center' }}>
                          <button
                            className="action-btn view"
                            title={coupon.is_active ? 'Deactivate' : 'Activate'}
                            onClick={() => handleToggleStatus(coupon.code, coupon.is_active)}
                          >
                            {coupon.is_active ? <X size={16} /> : <CheckCircle2 size={16} />}
                          </button>
                          <button
                            className="action-btn edit"
                            title="Edit Coupon"
                            onClick={() => handleEditClick(coupon)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="action-btn delete"
                            title="Delete Coupon"
                            onClick={() => handleDelete(coupon.couponid)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <Ticket size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <h3>No Coupons Found</h3>
                <p>You haven't created any coupons yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Edit Coupon Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-pop" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <h2>Edit Coupon</h2>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleUpdateCoupon}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Coupon Code</label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Discount Type</label>
                  <select
                    value={editDiscountType}
                    onChange={(e) => setEditDiscountType(e.target.value)}
                  >
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Discount Value</label>
                  <input
                    type="number"
                    value={editDiscountValue}
                    onChange={(e) => setEditDiscountValue(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
