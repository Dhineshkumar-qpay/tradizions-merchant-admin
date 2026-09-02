import React, { useState, useEffect } from "react";
import { ArrowLeft, ShoppingBag, User, Calendar, CreditCard, Store } from "lucide-react";
import { API } from "../../service/api_service";
import { APIROUTES } from "../../routes/api_routes";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import "../Orders.css";
import "../business/Business.css";

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        setLoading(true);
        const res = await API.post(APIROUTES.GETSALEBYID, { id });
        if (res.data && res.data.statusCode === 200) {
          setSale(res.data.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch sale details");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchSaleDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="orders-mgmt-container" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <span style={{ color: 'var(--text-muted)' }}>Loading sale details...</span>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="orders-mgmt-container" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <span style={{ color: 'var(--text-muted)' }}>Sale not found.</span>
      </div>
    );
  }

  // Group items by supplier
  const supplierGroups = {};
  if (sale.items && sale.items.length > 0) {
    sale.items.forEach(item => {
      const suppName = item.SupplierModel?.name || "Unknown Supplier";
      if (!supplierGroups[suppName]) {
        supplierGroups[suppName] = [];
      }
      supplierGroups[suppName].push(item);
    });
  }

  return (
    <div className="orders-mgmt-container">
      <div className="page-header">
        <div className="header-text" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={() => navigate("/sales")}
            className="btn-secondary"
            style={{ padding: '8px' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Sale Details</h1>
            <p>Overview of the sale transaction.</p>
          </div>
        </div>
      </div>

      <div className="section-form-card" style={{ marginBottom: '24px' }}>
        <div className="section-title">
          <ShoppingBag size={18} />
          <h2>Order Summary</h2>
          <span
            className={`status-badge ${sale.status === "completed" ? "delivered" : sale.status === "cancelled" ? "cancelled" : "pending"
              }`}
            style={{ marginLeft: 'auto' }}
          >
            {sale.status ? sale.status.charAt(0).toUpperCase() + sale.status.slice(1) : "Pending"}
          </span>
        </div>

        <div className="drawer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', padding: '20px' }}>
          <div className="detail-item" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span className="label" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Order ID</span>
            <span className="val" style={{ fontWeight: '600', fontSize: '16px' }}>{sale.orderid || "N/A"}</span>
          </div>

          <div className="detail-item" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span className="label" style={{ color: 'var(--text-muted)', fontSize: '13px' }}><User size={14} style={{ display: 'inline', marginRight: '4px' }} /> Customer Name</span>
            <span className="val" style={{ fontWeight: '500', fontSize: '15px' }}>{sale.customername}</span>
          </div>

          <div className="detail-item" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span className="label" style={{ color: 'var(--text-muted)', fontSize: '13px' }}><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> Sale Date</span>
            <span className="val" style={{ fontWeight: '500', fontSize: '15px' }}>{new Date(sale.saledate).toLocaleDateString()}</span>
          </div>

          <div className="detail-item" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span className="label" style={{ color: 'var(--text-muted)', fontSize: '13px' }}><CreditCard size={14} style={{ display: 'inline', marginRight: '4px' }} /> Grand Total</span>
            <span className="val" style={{ fontWeight: '600', fontSize: '18px', color: 'var(--primary)' }}>₹{parseFloat(sale.totalamount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {Object.keys(supplierGroups).length > 0 ? (
        Object.keys(supplierGroups).map((supplierName, index) => (
          <div key={index} className="table-card section-card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Store size={18} />
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Supplier: {supplierName}</h2>
            </div>
            <div className="table-responsive">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierGroups[supplierName].map((item) => (
                    <tr key={item.id} className="order-row">
                      <td><span className="primary-text">{item.SupplierProductModel?.productname || item.productname}</span></td>
                      <td><span className="secondary-text">{item.quantity} {item.unit}</span></td>
                      <td><span className="secondary-text">₹{item.unit === 'grams' ? (parseFloat(item.price) * 1000).toFixed(2) : parseFloat(item.price).toFixed(2)}</span></td>
                      <td><span className="amount">₹{parseFloat(item.totalprice).toFixed(2)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <div className="section-form-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No items in this sale.
        </div>
      )}

      <div className="section-form-card" style={{ marginBottom: '24px', backgroundColor: '#f9fafb' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>Grand Total</span>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)' }}>
              ₹{parseFloat(sale.totalamount).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetails;
