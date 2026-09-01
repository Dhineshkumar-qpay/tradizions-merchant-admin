import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  MapPin,
  CreditCard,
  Package,
  Gift,
  ExternalLink,
  Loader2,
  Store,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Briefcase
} from "lucide-react";
import { API } from "../../services/api_service";
import { APIROUTES, IMAGE_URL } from "../../routes/api_routes";
import { toast } from "react-toastify";
import "../../../pages/ListProducts.css";

const MerchantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Detail API States
  const [basicInfo, setBasicInfo] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [addressInfo, setAddressInfo] = useState(null);
  const [bankInfo, setBankInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMerchantDetails = async () => {
      setLoading(true);
      const payload = { bid: parseInt(id) };

      try {
        const [
          basicRes,
          businessRes,
          addressRes,
          bankRes,
          productsRes,
          giftsRes,
        ] = await Promise.all([
          API.post(APIROUTES.GETBASICINFO, payload).catch((err) => ({ error: err })),
          API.post(APIROUTES.GETBUSINESSINFO, payload).catch((err) => ({ error: err })),
          API.post(APIROUTES.GETADDRESSINFO, payload).catch((err) => ({ error: err })),
          API.post(APIROUTES.GETBANKINFO, payload).catch((err) => ({ error: err })),
          API.post(APIROUTES.GETPRODUCTS, payload).catch((err) => ({ error: err })),
          API.post(APIROUTES.GETGIFTS, payload).catch((err) => ({ error: err })),
        ]);

        if (basicRes && !basicRes.error && basicRes.data?.statusCode === 200) {
          setBasicInfo(basicRes.data.data);
        }
        if (businessRes && !businessRes.error && businessRes.data?.statusCode === 200) {
          setBusinessInfo(businessRes.data.data);
        }
        if (addressRes && !addressRes.error && addressRes.data?.statusCode === 200) {
          setAddressInfo(addressRes.data.data);
        }
        if (bankRes && !bankRes.error && bankRes.data?.statusCode === 200) {
          setBankInfo(bankRes.data.data);
        }
        if (productsRes && !productsRes.error && productsRes.data?.statusCode === 200) {
          setProducts(productsRes.data.data || []);
        }
        if (giftsRes && !giftsRes.error && giftsRes.data?.statusCode === 200) {
          setGifts(giftsRes.data.data || []);
        }
      } catch (err) {
        console.error("Error loading merchant details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadMerchantDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <Loader2 size={48} className="animate-spin" style={{ color: "var(--primary)" }} />
        <p style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
          Retrieving Merchant Dossier...
        </p>
      </div>
    );
  }

  const businessDisplayName = businessInfo?.businessname || basicInfo?.ownername || "Merchant Details";

  return (
    <div className="list-products-container">
      {/* Header Section */}
      <div className="page-header-actions" style={{ alignItems: "flex-end" }}>
        <div>
          <button
            onClick={() => navigate("/merchants")}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--text-muted)", fontSize: "12px", fontWeight: "700", cursor: "pointer", marginBottom: "8px", transition: "color 0.2s" }}
            className="hover:text-primary"
          >
            <ArrowLeft size={14} /> BACK TO MERCHANTS
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h1>{businessDisplayName}</h1>
            <span className="status-badge status-active" style={{ padding: "4px 10px", fontSize: "12px" }}>Active Account</span>
          </div>
          <p style={{ marginTop: "4px", color: "var(--text-muted)", fontWeight: "600", fontSize: "14px" }}>
            Merchant ID: #{id} &nbsp;|&nbsp; {basicInfo?.designation || "Business Owner"}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        
        {/* Top Row: Basic Info & Address */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "25px" }}>
          
          {/* Basic Details */}
          <div className="section-card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="table-controls" style={{ padding: "20px", borderBottom: "1px solid #f0f3ee" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
                <User size={18} style={{ color: "var(--primary)" }} /> Basic Details
              </h3>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <InfoItem label="Owner Name" value={basicInfo?.ownername} icon={User} />
                <InfoItem label="Designation" value={basicInfo?.designation} icon={Briefcase} />
                <InfoItem label="Mobile Number" value={basicInfo?.mobile} icon={Phone} />
                <InfoItem label="WhatsApp" value={basicInfo?.whatsapp} icon={Phone} />
              </div>
              <div style={{ borderTop: "1px solid #f0f3ee", paddingTop: "16px" }}>
                <InfoItem label="Email Address" value={basicInfo?.email} icon={Mail} />
              </div>
              <div style={{ borderTop: "1px solid #f0f3ee", paddingTop: "16px" }}>
                <InfoItem label="Created Date" value={basicInfo?.createdAt ? new Date(basicInfo.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "—"} icon={Calendar} />
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="section-card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="table-controls" style={{ padding: "20px", borderBottom: "1px solid #f0f3ee" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
                <MapPin size={18} style={{ color: "var(--primary)" }} /> Location & Address
              </h3>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
              <div style={{ background: "#f8fbf6", padding: "16px", borderRadius: "12px", border: "1px solid #edf2e9" }}>
                <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Street Address</p>
                <p style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)", lineHeight: "1.5" }}>
                  {addressInfo?.addressline || "—"}
                </p>
                {addressInfo?.landmark && (
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", marginTop: "4px" }}>
                    Landmark: {addressInfo.landmark}
                  </p>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <InfoItem label="City" value={addressInfo?.city} />
                <InfoItem label="District" value={addressInfo?.district} />
                <InfoItem label="State" value={addressInfo?.state} />
                <InfoItem label="Pincode" value={addressInfo?.pincode} />
              </div>
            </div>
          </div>

        </div>

        {/* Middle Row: Business Info & Bank Details */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "25px" }}>
          
          {/* Business Info */}
          <div className="section-card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="table-controls" style={{ padding: "20px", borderBottom: "1px solid #f0f3ee" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
                <Store size={18} style={{ color: "var(--primary)" }} /> Shop & Business
              </h3>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
              {businessInfo?.businessimage ? (
                <div style={{ width: "100%", height: "160px", borderRadius: "12px", overflow: "hidden", border: "1px solid #edf2e9" }}>
                  <img src={`${IMAGE_URL}${businessInfo.businessimage}`} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ width: "100%", height: "160px", borderRadius: "12px", background: "#f8fbf6", border: "1px dashed #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                  <Store size={48} opacity={0.5} />
                </div>
              )}
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Business Description</p>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)", marginTop: "4px", lineHeight: "1.5" }}>{businessInfo?.description || "No description provided."}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", borderTop: "1px solid #f0f3ee", paddingTop: "16px" }}>
                  <InfoItem label="Legal Name" value={businessInfo?.legalbusinessname} icon={ShieldCheck} />
                  <InfoItem label="Operating Hours" value={businessInfo?.opentime && businessInfo?.closetime ? `${businessInfo.opentime} - ${businessInfo.closetime}` : "—"} icon={Clock} />
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="section-card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="table-controls" style={{ padding: "20px", borderBottom: "1px solid #f0f3ee" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
                <CreditCard size={18} style={{ color: "var(--primary)" }} /> Banking Information
              </h3>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <InfoItem label="Account Holder" value={bankInfo?.accountholdername} />
                <InfoItem label="Account Number" value={bankInfo?.accountnumber} />
                <InfoItem label="Bank Name" value={bankInfo?.bankname} />
                <InfoItem label="Branch Name" value={bankInfo?.branchname} />
              </div>
              <div style={{ borderTop: "1px solid #f0f3ee", paddingTop: "16px" }}>
                <InfoItem label="IFSC Code" value={bankInfo?.ifsc} uppercaseValue={true} />
              </div>
              <div style={{ borderTop: "1px solid #f0f3ee", paddingTop: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Passbook / Cheque Copy</p>
                {bankInfo?.passbook ? (
                  <div style={{ flex: 1, minHeight: "120px", borderRadius: "12px", overflow: "hidden", border: "1px solid #edf2e9" }}>
                    <img src={`${IMAGE_URL}${bankInfo.passbook}`} alt="Bank Proof" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : (
                  <div style={{ flex: 1, minHeight: "120px", borderRadius: "12px", background: "#f8fbf6", border: "1px dashed #d1d5db", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", color: "#9ca3af" }}>
                    <CreditCard size={32} opacity={0.5} />
                    <span style={{ fontSize: "12px", fontWeight: "600" }}>No Document Uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Row: Products & Gifts Tables */}
        <div className="section-card table-wrapper">
          <div className="table-controls" style={{ padding: "24px", borderBottom: "1px solid #f0f3ee" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
              <Package size={20} style={{ color: "var(--primary)" }} /> Merchant Products
              <span style={{ fontSize: "12px", background: "rgba(76, 107, 53, 0.1)", color: "var(--primary)", padding: "4px 10px", borderRadius: "20px", marginLeft: "8px" }}>{products.length} Total</span>
            </h3>
          </div>
          <div className="table-responsive thin-scrollbar">
            {products.length > 0 ? (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Weight / Unit</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.productid}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <img
                            src={`${IMAGE_URL}${product.productimage}`}
                            alt=""
                            style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--border)" }}
                            onError={(e) => { e.target.src = "https://placehold.co/40x40?text=Product"; }}
                          />
                          <div>
                            <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>
                              {product.productname}
                            </p>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
                              {product.categoryname || "Generic"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: "700", color: "var(--text-main)" }}>{product.weight} {product.unit}</td>
                      <td style={{ fontWeight: "800", color: "var(--text-main)" }}>
                        {product.discount > 0 && (
                          <span style={{ fontSize: "11px", textDecoration: "line-through", color: "var(--text-muted)", marginRight: "8px" }}>
                            ₹{product.price}
                          </span>
                        )}
                        ₹{product.sellingprice || product.price}
                      </td>
                      <td>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: product.availablestock > 10 ? "#059669" : product.availablestock > 0 ? "#D97706" : "#E11D48" }}>
                          {product.availablestock} Units
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => navigate(`/products/${product.productid}`)}
                          className="action-btn"
                          title="View Product"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontWeight: "600", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <Package size={32} opacity={0.3} />
                No products uploaded by this merchant.
              </div>
            )}
          </div>
        </div>

        <div className="section-card table-wrapper">
          <div className="table-controls" style={{ padding: "24px", borderBottom: "1px solid #f0f3ee" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
              <Gift size={20} style={{ color: "var(--primary)" }} /> Gift Cards
              <span style={{ fontSize: "12px", background: "rgba(76, 107, 53, 0.1)", color: "var(--primary)", padding: "4px 10px", borderRadius: "20px", marginLeft: "8px" }}>{gifts.length} Total</span>
            </h3>
          </div>
          <div className="table-responsive thin-scrollbar">
            {gifts.length > 0 ? (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Gift Card</th>
                    <th>Packing Type</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Assorted Products</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {gifts.map((gc) => (
                    <tr key={gc.giftid}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <img
                            src={`${IMAGE_URL}${gc.giftimage}`}
                            alt=""
                            style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--border)" }}
                            onError={(e) => { e.target.src = "https://placehold.co/40x40?text=Gift"; }}
                          />
                          <div>
                            <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>
                              {gc.giftname}
                            </p>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
                              {gc.categoryname || "Bundle"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: "700", color: "var(--text-main)" }}>{gc.packingtype || "Standard Box"}</td>
                      <td style={{ fontWeight: "800", color: "var(--text-main)" }}>
                        {gc.giftprice > gc.giftsellingprice && (
                          <span style={{ fontSize: "11px", textDecoration: "line-through", color: "var(--text-muted)", marginRight: "8px" }}>
                            ₹{gc.giftprice}
                          </span>
                        )}
                        ₹{gc.giftsellingprice || gc.giftprice}
                      </td>
                      <td>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: gc.stock > 10 ? "#059669" : gc.stock > 0 ? "#D97706" : "#E11D48" }}>
                          {gc.stock} Units
                        </span>
                      </td>
                      <td style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", maxWidth: "250px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {gc.productlist ? gc.productlist.map((p) => p.name).join(", ") : "—"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => navigate(`/giftcards/${gc.giftid}`)}
                          className="action-btn"
                          title="View Gift Card"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontWeight: "600", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <Gift size={32} opacity={0.3} />
                No gift cards cataloged by this merchant.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const InfoItem = ({ label, value, icon: Icon, uppercaseValue = false }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "6px" }}>
      {Icon && <Icon size={12} />} {label}
    </p>
    <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)", wordBreak: "break-word", textTransform: uppercaseValue ? "uppercase" : "none" }}>
      {value || "—"}
    </p>
  </div>
);

export default MerchantDetail;
