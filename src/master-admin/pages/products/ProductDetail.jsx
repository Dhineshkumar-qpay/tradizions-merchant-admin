import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  Box,
  Image as ImageIcon,
  Activity,
  Loader2,
  Info,
  Sparkles,
  Scale,
  Globe,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES, IMAGE_URL } from "../../routes/api_routes";
import "../../../pages/ListProducts.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const response = await API.post(APIROUTES.PRODUCTDETAILS, {
          productid: parseInt(id),
          itemtype: "product",
        });
        if (response.data && response.data.statusCode === 200) {
          setDetail(response.data.data);
          if (response.data.data?.productdetail?.productimage) {
            setSelectedImage(response.data.data.productdetail.productimage);
          }
        } else {
          toast.error(response.data?.message || "Failed to fetch product detail");
        }
      } catch (error) {
        console.error("Fetch product detail error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchDetail();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <Loader2 size={48} className="animate-spin" style={{ color: "var(--primary)" }} />
        <p style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
          Loading Product Specifications...
        </p>
      </div>
    );
  }

  const p = detail ? detail.productdetail : null;

  if (!p) {
    return (
      <div style={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <Box size={64} style={{ color: "#d1d5db" }} />
        <h3 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-main)" }}>Product Not Found</h3>
        <button
          onClick={() => navigate(-1)}
          style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "var(--primary)", color: "white", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}
        >
          <ArrowLeft size={16} /> Back to Products
        </button>
      </div>
    );
  }

  const displayImages = [p.productimage, p.image1, p.image2, p.image3, p.image4].filter(Boolean);
  const currentDisplayImg = selectedImage ? `${IMAGE_URL}${selectedImage}` : "https://placehold.co/600x600?text=No+Image";

  const discountPercent = p.sellingprice > 0 && p.sellingprice < p.price
    ? Math.round(((p.price - p.sellingprice) / p.price) * 100)
    : 0;

  return (
    <div className="list-products-container">
      {/* Header Section */}
      <div className="page-header-actions" style={{ alignItems: "flex-end" }}>
        <div>
          <button
            onClick={() => navigate(-1)}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--text-muted)", fontSize: "12px", fontWeight: "700", cursor: "pointer", marginBottom: "8px" }}
          >
            <ArrowLeft size={14} /> BACK TO PRODUCTS
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h1>{p.productname}</h1>
            <span className={`status-badge ${p.availablestock > 0 ? 'status-active' : 'status-danger'}`} style={{ padding: "4px 10px", fontSize: "12px", background: p.availablestock > 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(225, 29, 72, 0.1)", color: p.availablestock > 0 ? "#059669" : "#E11D48" }}>
              {p.availablestock > 0 ? `In Stock (${p.availablestock})` : "Out of Stock"}
            </span>
          </div>
          <p style={{ marginTop: "4px", color: "var(--text-muted)", fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Box size={14} /> SKU: MT-00{p.productid} &nbsp;|&nbsp; {p.categoryname || "Category"} &gt; {p.subcategoryname || "Subcategory"}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "25px" }}>
        
        {/* Left Column: Media Gallery */}
        <div className="section-card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="table-controls" style={{ padding: "20px", borderBottom: "1px solid #f0f3ee" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
              <ImageIcon size={18} style={{ color: "var(--primary)" }} /> Product Media
            </h3>
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
            
            {/* Main Image */}
            <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: "12px", overflow: "hidden", border: "1px solid #edf2e9", background: "#f8fbf6", position: "relative" }}>
              <img src={currentDisplayImg} alt={p.productname} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "16px" }} />
              <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ background: "var(--primary)", color: "white", padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "800", textTransform: "uppercase" }}>
                  {p.brandname || "Tradizions"}
                </span>
                {p.isFeatured && (
                  <span style={{ background: "#F59E0B", color: "white", padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "800", textTransform: "uppercase" }}>
                    Featured
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {displayImages.length > 1 && (
              <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "4px" }} className="thin-scrollbar">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      width: "70px", height: "70px", borderRadius: "10px", border: selectedImage === img ? "2px solid var(--primary)" : "1px solid #edf2e9",
                      padding: "4px", background: "white", cursor: "pointer", flexShrink: 0, transition: "all 0.2s"
                    }}
                  >
                    <img src={`${IMAGE_URL}${img}`} alt={`Thumb ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Quick Specs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          
          <div className="section-card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="table-controls" style={{ padding: "20px", borderBottom: "1px solid #f0f3ee" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
                <Activity size={18} style={{ color: "var(--primary)" }} /> Pricing & Overview
              </h3>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
              
              {/* Pricing Box */}
              <div style={{ background: "rgba(76, 107, 53, 0.05)", border: "1px solid rgba(76, 107, 53, 0.15)", borderRadius: "12px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Selling Price</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginTop: "4px" }}>
                    <span style={{ fontSize: "28px", fontWeight: "900", color: "var(--primary)" }}>
                      ₹{p.sellingprice > 0 ? p.sellingprice : p.price}
                    </span>
                    {discountPercent > 0 && (
                      <span style={{ fontSize: "16px", fontWeight: "700", color: "#9ca3af", textDecoration: "line-through" }}>
                        ₹{p.price}
                      </span>
                    )}
                  </div>
                </div>
                {discountPercent > 0 && (
                  <div style={{ background: "#F59E0B", color: "white", padding: "8px 12px", borderRadius: "8px", fontSize: "14px", fontWeight: "800" }}>
                    {discountPercent}% OFF
                  </div>
                )}
              </div>

              {/* Quick Specs Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <div style={{ background: "#f8fbf6", border: "1px solid #edf2e9", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                  <Scale size={16} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
                  <p style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Weight</p>
                  <p style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-main)", marginTop: "2px" }}>{p.weight} {p.unit}</p>
                </div>
                <div style={{ background: "#f8fbf6", border: "1px solid #edf2e9", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                  <Globe size={16} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
                  <p style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Origin</p>
                  <p style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-main)", marginTop: "2px" }}>{p.country || "India"}</p>
                </div>
                <div style={{ background: "#f8fbf6", border: "1px solid #edf2e9", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                  <Clock size={16} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
                  <p style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Shelf Life</p>
                  <p style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-main)", marginTop: "2px" }}>{p.shelflife || "12 Months"}</p>
                </div>
              </div>

            </div>
          </div>

          <div className="section-card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="table-controls" style={{ padding: "20px", borderBottom: "1px solid #f0f3ee" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
                <Info size={18} style={{ color: "var(--primary)" }} /> Product Description
              </h3>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
              <p style={{ fontSize: "13px", color: "var(--text-main)", leading: "relaxed", fontWeight: "500", whiteSpace: "pre-wrap", background: "#f8fbf6", padding: "16px", borderRadius: "12px", border: "1px solid #edf2e9" }}>
                {p.description || "No description provided for this product."}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Row: Ingredients & Nutrition */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "25px", marginTop: "25px" }}>
        
        {/* Ingredients & Storage */}
        <div className="section-card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="table-controls" style={{ padding: "20px", borderBottom: "1px solid #f0f3ee" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
              <Sparkles size={18} style={{ color: "var(--primary)" }} /> Ingredients & Storage
            </h3>
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Ingredients</p>
              <div style={{ background: "#f8fbf6", padding: "16px", borderRadius: "12px", border: "1px solid #edf2e9" }}>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>
                  {p.ingredients || "100% Premium Natural Whole Product."}
                </p>
              </div>
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Storage Recommendations</p>
              <div style={{ background: "#f8fbf6", padding: "16px", borderRadius: "12px", border: "1px solid #edf2e9" }}>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>
                  {p.storageinfo || "Store in a cool, dry place in an airtight container."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Values */}
        <div className="section-card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="table-controls" style={{ padding: "20px", borderBottom: "1px solid #f0f3ee" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
              <Activity size={18} style={{ color: "var(--primary)" }} /> Nutrition Facts (Per Serving)
            </h3>
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              <div style={{ background: "rgba(76, 107, 53, 0.05)", border: "1px solid rgba(76, 107, 53, 0.15)", borderRadius: "12px", padding: "20px 12px", textAlign: "center", gridColumn: "span 4" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Calories</span>
                <p style={{ fontSize: "32px", fontWeight: "900", color: "var(--primary)", lineHeight: "1.2" }}>{p.calories || 0}</p>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af" }}>kcal</span>
              </div>
              <div style={{ background: "#f8fbf6", border: "1px solid #edf2e9", borderRadius: "12px", padding: "16px 12px", textAlign: "center" }}>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Protein</span>
                <p style={{ fontSize: "18px", fontWeight: "900", color: "var(--text-main)", marginTop: "4px" }}>{p.protien || 0}g</p>
              </div>
              <div style={{ background: "#f8fbf6", border: "1px solid #edf2e9", borderRadius: "12px", padding: "16px 12px", textAlign: "center" }}>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Fiber</span>
                <p style={{ fontSize: "18px", fontWeight: "900", color: "var(--text-main)", marginTop: "4px" }}>{p.fibre || 0}g</p>
              </div>
              <div style={{ background: "#f8fbf6", border: "1px solid #edf2e9", borderRadius: "12px", padding: "16px 12px", textAlign: "center" }}>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Fat</span>
                <p style={{ fontSize: "18px", fontWeight: "900", color: "var(--text-main)", marginTop: "4px" }}>{p.fat || 0}g</p>
              </div>
              <div style={{ background: "#f8fbf6", border: "1px solid #edf2e9", borderRadius: "12px", padding: "16px 12px", textAlign: "center" }}>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Carbs</span>
                <p style={{ fontSize: "18px", fontWeight: "900", color: "var(--text-main)", marginTop: "4px" }}>{p.carbohydrates || 0}g</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
