import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Tag,
  Package,
  Clock,
  ChevronRight,
  Leaf,
  Image as ImageIcon,
  Award,
  Flame,
  Info,
  Sparkles,
} from "lucide-react";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./AddProduct.css";

const ProductDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const bid = location.state?.bid;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!bid || !id) {
        setError("Missing Business ID or Product ID.");
        return;
      }
      setLoading(true);
      try {
        const response = await API.post(APIROUTES.GETALLPRODUCTS, {
          bid: Number(bid),
        });
        const list = response.data?.data || response.data;
        if (Array.isArray(list)) {
          const matched = list.find((p) => p.productid === Number(id));
          if (matched) {
            setProduct(matched);
          } else {
            setError("Product not found.");
          }
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
        setError("Error fetching details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [bid, id]);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    const base = API.defaults.baseURL || "http://localhost:3003/api";
    const origin = base.replace(/\/api\/?$/, "");
    return `${origin}${path}`;
  };

  const getStatusClass = (status) => {
    if (status === "Active" || status === true) return "status-active";
    if (status === "Inactive" || status === false) return "status-out";
    return "";
  };

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "80px" }}
      >
        <div className="circular-loader"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          color: "var(--status-out)",
          fontWeight: "600",
        }}
      >
        {error || "Product not found."}
        <br />
        <button
          className="btn-secondary"
          style={{ marginTop: "20px" }}
          onClick={() => navigate("/products/list")}
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="add-product-container">
      <div className="breadcrumb">
        <span>Catalog</span>
        <ChevronRight size={14} />
        <span>Products</span>
        <ChevronRight size={14} />
        <span className="current">Details</span>
      </div>

      <div className="page-header-actions">
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {product.productname}
            <span
              className={`status-badge ${getStatusClass(product.isActive)}`}
              style={{ fontSize: "12px", padding: "4px 10px" }}
            >
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </h1>
          <p>
            Full catalog item details, nutritional configurations, and active
            specifications.
          </p>
        </div>
        <div className="btn-group">
          <button
            className="btn-secondary"
            onClick={() => navigate("/products/list")}
          >
            <ArrowLeft size={18} style={{ marginRight: "8px" }} /> Back
          </button>
          <button
            className="btn-primary"
            onClick={() =>
              navigate(`/products/edit/${product.productid}`, {
                state: { bid },
              })
            }
          >
            <Edit size={18} style={{ marginRight: "8px" }} /> Edit Product
          </button>
        </div>
      </div>

      <div className="product-form">
        <div className="form-main">
          {/* General Information */}
          <section className="form-section">
            <h3>General Information</h3>
            <div
              className="input-stack"
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div
                style={{
                  padding: "15px",
                  background: "#fbfdfa",
                  borderRadius: "12px",
                  border: "1px dashed #e2ebd9",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "var(--primary)",
                    marginBottom: "6px",
                  }}
                >
                  <Tag size={14} /> Full Description
                </label>
                <p
                  style={{
                    color: "var(--text-muted)",
                    lineHeight: "1.6",
                    fontSize: "14px",
                  }}
                >
                  {product.description || "No description provided."}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div
                  style={{
                    padding: "12px",
                    background: "#fcfdfb",
                    border: "1.5px solid #edf2e9",
                    borderRadius: "10px",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Category Tree
                  </label>
                  <p style={{ fontWeight: "600", fontSize: "14px" }}>
                    {product.categoryname} / {product.subcategoryname}
                  </p>
                </div>
                <div
                  style={{
                    padding: "12px",
                    background: "#fcfdfb",
                    border: "1.5px solid #edf2e9",
                    borderRadius: "10px",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Country & Brand
                  </label>
                  <p style={{ fontWeight: "600", fontSize: "14px" }}>
                    {product.brandname || "Tradizions"} (
                    {product.country || "India"})
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Nutritional Profile */}
          <section className="form-section">
            <div className="section-title-with-icon">
              <div className="icon-wrapper">
                <Leaf size={18} />
              </div>
              <h3>Nutritional Profile (per 100g)</h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "12px",
                marginTop: "15px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  background: "#fdfdfa",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #edf2e9",
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Energy
                </div>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "16px",
                    color: "var(--primary-dark)",
                    marginTop: "4px",
                  }}
                >
                  {product.calories || 0} kcal
                </div>
              </div>
              <div
                style={{
                  background: "#fdfdfa",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #edf2e9",
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Protein
                </div>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "16px",
                    color: "var(--primary-dark)",
                    marginTop: "4px",
                  }}
                >
                  {product.protien || 0}g
                </div>
              </div>
              <div
                style={{
                  background: "#fdfdfa",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #edf2e9",
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Fiber
                </div>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "16px",
                    color: "var(--primary-dark)",
                    marginTop: "4px",
                  }}
                >
                  {product.fibre || 0}g
                </div>
              </div>
              <div
                style={{
                  background: "#fdfdfa",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #edf2e9",
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Fats
                </div>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "16px",
                    color: "var(--primary-dark)",
                    marginTop: "4px",
                  }}
                >
                  {product.fat || 0}g
                </div>
              </div>
              <div
                style={{
                  background: "#fdfdfa",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #edf2e9",
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Carbs
                </div>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "16px",
                    color: "var(--primary-dark)",
                    marginTop: "4px",
                  }}
                >
                  {product.carbohydrates || 0}g
                </div>
              </div>
            </div>
          </section>

          {/* Additional Gallery */}
          <section className="form-section">
            <h3>Additional Product Images</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px",
                marginTop: "15px",
              }}
            >
              {[1, 2, 3, 4].map((i) => {
                const imgUrl = product[`image${i}`];
                return (
                  <div
                    key={i}
                    style={{
                      height: "100px",
                      borderRadius: "10px",
                      background: "#fcfdfb",
                      border: "1.5px solid #edf2e9",
                      display: "flex",
                      alignItems: "center",
                      justify: "center",
                      overflow: "hidden",
                    }}
                  >
                    {imgUrl ? (
                      <img
                        src={getImageUrl(imgUrl)}
                        alt={`Gallery ${i}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <ImageIcon size={20} style={{ color: "#c2d1b8" }} />
                        <span
                          style={{
                            fontSize: "10px",
                            color: "var(--text-muted)",
                          }}
                        >
                          Slot {i}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="form-side">
          {/* Main Image */}
          <section className="form-section media-section">
            <h3>Product Image Preview</h3>
            <div
              className="product-large-preview"
              style={{
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "240px",
                width: "100%",
                borderRadius: "16px",
                objectFit: "contain",
                border: "1.5px solid #edf2e9",
              }}
            >
              {product.productimage ? (
                <img
                  src={getImageUrl(product.productimage)}
                  alt={product.productname}
                />
              ) : (
                <ImageIcon size={40} style={{ color: "var(--primary)" }} />
              )}
            </div>
          </section>

          {/* Pricing & Stock */}
          <section className="form-section">
            <h3>Inventory Configurations</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                fontSize: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid #edf2e9",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>
                  Original Price:
                </span>
                <span
                  style={{
                    fontWeight: "600",
                    textDecoration: product.sellingprice > 0 ? "line-through" : "none",
                    color: product.sellingprice > 0 ? "var(--text-muted)" : "var(--primary-dark)",
                    fontSize: product.sellingprice > 0 ? "14px" : "16px",
                  }}
                >
                  ₹{product.price}
                </span>
              </div>
              {product.sellingprice > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid #edf2e9",
                  }}
                >
                  <span style={{ color: "var(--text-muted)" }}>Offer Price:</span>
                  <span
                    style={{
                      fontWeight: "700",
                      color: "var(--primary-dark)",
                      fontSize: "16px",
                    }}
                  >
                    ₹{product.sellingprice}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid #edf2e9",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Weight/Size:</span>
                <span style={{ fontWeight: "600", color: "var(--text-main)" }}>
                  {product.weight} {product.unit || "g"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>
                  Stock Available:
                </span>
                <span style={{ fontWeight: "600", color: "var(--primary)" }}>
                  {product.availablestock} {product.unit || "Units"}
                </span>
              </div>
            </div>
          </section>

          {/* Product Flags */}
          <section className="form-section">
            <h3>Marketing Flags</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  background: product.isFeatured ? "#eef2ff" : "#fbfdfb",
                  borderRadius: "8px",
                  border: "1px solid #edf2e9",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: product.isFeatured ? "#4f46e5" : "var(--text-muted)",
                  }}
                >
                  Featured Product
                </span>
                {product.isFeatured ? (
                  <Award size={16} style={{ color: "#4f46e5" }} />
                ) : (
                  <Info size={16} style={{ color: "#c2d1b8" }} />
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  background: product.isTrending ? "#fef2f2" : "#fbfdfb",
                  borderRadius: "8px",
                  border: "1px solid #edf2e9",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: product.isTrending ? "#dc2626" : "var(--text-muted)",
                  }}
                >
                  Trending Item
                </span>
                {product.isTrending ? (
                  <Flame size={16} style={{ color: "#dc2626" }} />
                ) : (
                  <Info size={16} style={{ color: "#c2d1b8" }} />
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  background: product.isBestSeller ? "#fffbeb" : "#fbfdfb",
                  borderRadius: "8px",
                  border: "1px solid #edf2e9",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: product.isBestSeller
                      ? "#d97706"
                      : "var(--text-muted)",
                  }}
                >
                  Best Seller Tag
                </span>
                {product.isBestSeller ? (
                  <Award size={16} style={{ color: "#d97706" }} />
                ) : (
                  <Info size={16} style={{ color: "#c2d1b8" }} />
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  background: product.isNewArrivals ? "#fdf4ff" : "#fbfdfb",
                  borderRadius: "8px",
                  border: "1px solid #edf2e9",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: product.isNewArrivals ? "#c026d3" : "var(--text-muted)",
                  }}
                >
                  New Arrivals
                </span>
                {product.isNewArrivals ? (
                  <Sparkles size={16} style={{ color: "#c026d3" }} />
                ) : (
                  <Info size={16} style={{ color: "#c2d1b8" }} />
                )}
              </div>
            </div>
          </section>

          {/* Technical Specs */}
          <section className="form-section">
            <h3>Technical Specifications</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "13px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "8px",
                  borderBottom: "1px solid #edf2e9",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Ingredients:</span>
                <span
                  style={{
                    fontWeight: "600",
                    color: "var(--text-main)",
                    textAlign: "right",
                  }}
                >
                  {product.ingredients || "100% Organic"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "8px",
                  borderBottom: "1px solid #edf2e9",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Shelf Life:</span>
                <span style={{ fontWeight: "600", color: "var(--text-main)" }}>
                  {product.shelflife || "12 Months"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>
                  Storage Info:
                </span>
                <span style={{ fontWeight: "600", color: "var(--text-main)" }}>
                  {product.storageinfo || "Cool, dry place"}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
