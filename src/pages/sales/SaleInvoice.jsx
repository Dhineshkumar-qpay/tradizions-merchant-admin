import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../../service/api_service";
import { APIROUTES } from "../../routes/api_routes";
import { User, Box, Map, Check, Clock, X, PackageOpen, FileText } from "lucide-react";
import "./SaleInvoice.css";

const SaleInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        setLoading(true);
        const res = await API.post(APIROUTES.GETSALEBYID, { id });
        if (res.data && res.data.statusCode === 200) {
          setSale(res.data.data);
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to load invoice details.");
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchSaleDetails();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="dashboard-wrapper" style={{ justifyContent: 'center' }}>
        <div style={{ fontSize: '18px', color: '#64748b', fontWeight: '600' }}>Loading Profile...</div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #fdf4ff 50%, #f0fdf4 100%)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '550px' }}>
          <img src="/404.jpg" alt="404 Not Found" style={{ width: '100%', maxWidth: '400px', height: 'auto', marginBottom: '30px' }} />
          <h2 style={{ color: '#0f172a', margin: '10px 0 15px', fontSize: '36px', fontWeight: '800' }}>Invoice Not Found</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '18px', fontWeight: '500', lineHeight: '1.6' }}>{error || "The sales invoice you're looking for doesn't exist or has been removed."}</p>
        </div>
      </div>
    );
  }

  const items = sale.items || [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <Check size={16} />;
      case 'cancelled': return <X size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">

        <div className="top-banner">
          <div className="banner-left">
            <div className="banner-icon-box">
              <FileText size={40} />
            </div>
            <div className="banner-titles">
              <h1>{sale.orderid || "N/A"}</h1>
              <p>Tradizions Sales</p>
            </div>
          </div>
          <div className="banner-right">
            <div className="banner-meta">
              <span>Status</span>
              <div className={`status-pill ${sale.status}`}>
                {getStatusIcon(sale.status)}
                {sale.status ? sale.status.charAt(0).toUpperCase() + sale.status.slice(1) : "Pending"}
              </div>
            </div>
            <div className="banner-meta">
              <span>Date On</span>
              <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '14px' }}>
                {new Date(sale.saledate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="content-grid">

          <div className="panel">
            <div className="panel-header">
              <User size={20} />
              <span>Customer Details</span>
            </div>
            <div className="info-list">
              <div className="info-item">
                <User className="info-icon" size={20} />
                <div className="info-text">
                  <span className="info-label">Billed To</span>
                  <span className="info-value">{sale.customername}</span>
                </div>
              </div>
              <div className="info-item">
                <FileText className="info-icon" size={20} />
                <div className="info-text">
                  <span className="info-label">Invoice No</span>
                  <span className="info-value">{sale.orderid || "N/A"}</span>
                </div>
              </div>

              <div className="info-item" style={{ background: '#f8fafc', borderColor: '#e2e8f0', marginTop: '12px' }}>
                <Map className="info-icon" size={20} />
                <div className="info-text">
                  <span className="info-label" style={{ color: '#0f172a' }}>Grand Total</span>
                  <span className="info-value" style={{ fontSize: '24px', color: '#1e40af' }}>
                    ₹{parseFloat(sale.totalamount).toFixed(2)}
                  </span>
                </div>
              </div>

            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <PackageOpen size={20} />
              <span>Purchased Items ({items.length})</span>
            </div>

            <div className="product-cards-container">
              {items.length > 0 ? (
                items.map((item, index) => {
                  const amount = parseFloat(item.totalprice);
                  const pricePerUnit = item.unit === 'grams' ? parseFloat(item.price) * 1000 : parseFloat(item.price);
                  const suppName = item.SupplierModel?.name || "Unknown Supplier";

                  return (
                    <div className="prod-card" key={index}>
                      <div className="prod-title-row">
                        <div>
                          <div className="prod-title">{item.SupplierProductModel?.productname || item.productname}</div>
                          <div className="prod-subtitle">By {suppName}</div>
                        </div>
                        <div className="prod-icon-top">
                          <Box size={20} />
                        </div>
                      </div>

                      <div className="stock-indicator">
                        <div className="stock-circle" style={{ borderColor: '#60a5fa' }}></div>
                        <div className="stock-text">
                          Qty: {item.quantity} {item.unit}
                        </div>
                      </div>

                      <div className="prod-footer">
                        <div className="prod-stat">
                          <span className="stat-label">Unit Price</span>
                          <span className="stat-value">₹{pricePerUnit.toFixed(2)}</span>
                        </div>
                        <div className="prod-stat right">
                          <span className="stat-label">Est. Total</span>
                          <span className="stat-value">₹{amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '15px', width: '100%' }}>
                  No items found in this transaction.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SaleInvoice;
