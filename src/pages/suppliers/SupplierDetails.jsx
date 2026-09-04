import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../../service/api_service";
import { APIROUTES } from "../../routes/api_routes";
import { Store, Box, Mail, Phone, MapPin, Hash, Map, User, Check, Clock, X, PackageOpen, PieChart } from "lucide-react";
import "../sales/SaleInvoice.css";

const SupplierDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const suppRes = await API.post(APIROUTES.GETALLSUPPLIERS, { status: "all" });
        let currentSupplier = null;
        if (suppRes.data && suppRes.data.statusCode === 200) {
          currentSupplier = suppRes.data.data.find(s => s.id.toString() === id.toString());
          if (currentSupplier) {
            setSupplier(currentSupplier);
          } else {
            setError("Supplier not found.");
            setLoading(false);
            return;
          }
        }

        const prodRes = await API.post(APIROUTES.GETALLSUPPLIERPRODUCTS, { supplierid: id });
        if (prodRes.data && prodRes.data.statusCode === 200) {
          setProducts(prodRes.data.data);
        }

      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to load supplier details.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="dashboard-wrapper" style={{ justifyContent: 'center' }}>
        <div style={{ fontSize: '18px', color: '#64748b', fontWeight: '600' }}>Loading Profile...</div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #fdf4ff 50%, #f0fdf4 100%)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '550px' }}>
          <img src="/404.jpg" alt="404 Not Found" style={{ width: '100%', maxWidth: '400px', height: 'auto', marginBottom: '30px' }} />
          <h2 style={{ color: '#0f172a', margin: '10px 0 15px', fontSize: '36px', fontWeight: '800' }}>Supplier Not Found</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '18px', fontWeight: '500', lineHeight: '1.6' }}>{error || "The supplier profile you're looking for doesn't exist or has been removed."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">

        <div className="top-banner">
          <div className="banner-left">
            <div className="banner-icon-box">
              <Store size={40} />
            </div>
            <div className="banner-titles">
              <h1>{supplier.name}</h1>
              <p>{supplier.companyname || "Independent Supplier"}</p>
            </div>
          </div>
          <div className="banner-right">
            <div className="banner-meta">
              <span>Status</span>
              <div className={`status-pill ${supplier.status === 'active' ? 'active' : 'cancelled'}`}>
                {supplier.status === 'active' ? <Check size={16} /> : <X size={16} />}
                {supplier.status ? supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1) : "Unknown"}
              </div>
            </div>
            <div className="banner-meta">
              <span>Date On</span>
              <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '14px' }}>
                {new Date(supplier.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="content-grid">

          <div className="panel">
            <div className="panel-header">
              <Map size={20} />
              <span>Contact & Location</span>
            </div>
            <div className="info-list">
              <div className="info-item">
                <Phone className="info-icon" size={20} />
                <div className="info-text">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">{supplier.phone || "-"}</span>
                </div>
              </div>
              <div className="info-item">
                <Mail className="info-icon" size={20} />
                <div className="info-text">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{supplier.email || "-"}</span>
                </div>
              </div>
              <div className="info-item">
                <Hash className="info-icon" size={20} />
                <div className="info-text">
                  <span className="info-label">GST</span>
                  <span className="info-value">{supplier.gst || "-"}</span>
                </div>
              </div>
              <div className="info-item">
                <MapPin className="info-icon" size={20} />
                <div className="info-text">
                  <span className="info-label">Registered Address</span>
                  <span className="info-value" style={{ lineHeight: '1.4' }}>{supplier.address || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <PackageOpen size={20} />
              <span>Available Products Catalog ({products.length})</span>
            </div>

            <div className="product-cards-container">
              {products.length > 0 ? (
                products.map((product, index) => (
                  <div className="prod-card" key={index}>
                    <div className="prod-title-row">
                      <div>
                        <div className="prod-title">{product.productname}</div>
                        <div className="prod-subtitle">Supplier Product</div>
                      </div>
                      <div className="prod-icon-top">
                        <Box size={20} />
                      </div>
                    </div>

                    <div className="stock-indicator">
                      <div className="stock-circle" style={{ borderColor: product.remainingweight > 0 ? '#86efac' : '#fca5a5' }}></div>
                      <div className="stock-text">
                        {product.remainingweight !== undefined ? product.remainingweight : 0} {product.unit} / {product.totalweight} {product.unit}
                      </div>
                    </div>

                    <div className="prod-footer">
                      <div className="prod-stat">
                        <span className="stat-label">Price Per {product.unit.toUpperCase()}</span>
                        <span className="stat-value">₹{product.perproductkgprice !== undefined ? parseFloat(product.perproductkgprice).toFixed(2) : "-"}</span>
                      </div>
                      <div className="prod-stat right">
                        <span className="stat-label">Est. Total</span>
                        <span className="stat-value">₹{parseFloat(product.totalprice).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '15px', width: '100%' }}>
                  No products registered for this supplier yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SupplierDetails;
