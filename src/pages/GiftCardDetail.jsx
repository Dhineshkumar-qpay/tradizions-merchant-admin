import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Gift,
  Tag,
  Package,
  IndianRupee,
  Clock,
  ChevronRight,
} from "lucide-react";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./AddProduct.css";

const GiftCardDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const bid = location.state?.bid;

  const [gift, setGift] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGiftDetail = async () => {
      if (!bid || !id) {
        setError("Missing Business ID or Gift ID.");
        return;
      }
      setLoading(true);
      try {
        const response = await API.post(APIROUTES.GETGIFTS, {
          bid: Number(bid),
        });
        const list = response.data?.data || response.data;
        if (Array.isArray(list)) {
          const matched = list.find((g) => g.giftid === Number(id));
          if (matched) {
            setGift(matched);
          } else {
            setError("Gift box not found.");
          }
        }
      } catch (err) {
        console.error("Failed to load gift details:", err);
        setError("Error fetching details.");
      } finally {
        setLoading(false);
      }
    };
    fetchGiftDetail();
  }, [bid, id]);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    const base = API.defaults.baseURL || "http://localhost:3003/api";
    const origin = base.replace(/\/api\/?$/, "");
    return `${origin}${path}`;
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

  if (error || !gift) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          color: "var(--status-out)",
          fontWeight: "600",
        }}
      >
        {error || "Gift box not found."}
        <br />
        <button
          className="btn-secondary"
          style={{ marginTop: "20px" }}
          onClick={() => navigate("/gift-cards/list")}
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
        <span>Gift Boxes</span>
        <ChevronRight size={14} />
        <span className="current">Details</span>
      </div>

      <div className="page-header-actions">
        <div>
          <h1>{gift.giftname}</h1>
          <p>Detailed view of premium curated package.</p>
        </div>
        <div className="btn-group">
          <button
            className="btn-secondary"
            onClick={() => navigate("/gift-cards/list")}
          >
            <ArrowLeft size={18} style={{ marginRight: "8px" }} /> Back
          </button>
          <button
            className="btn-primary"
            onClick={() =>
              navigate(`/gift-cards/edit/${gift.giftid}`, { state: { bid } })
            }
          >
            <Edit size={18} style={{ marginRight: "8px" }} /> Edit Configuration
          </button>
        </div>
      </div>

      <div className="product-form">
        <div className="form-main">
          {/* General Information */}
          <section className="form-section">
            <h3>Package Information</h3>
            <div
              className="input-stack"
              style={{
                fontSize: "15px",
                color: "var(--text-main)",
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
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
                  <Tag size={14} /> Description
                </label>
                <p style={{ color: "var(--text-muted)", lineHeight: "1.6" }}>
                  {gift.giftdescription}
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
                    Category
                  </label>
                  <p style={{ fontWeight: "600" }}>
                    {gift.categoryname} / {gift.subcategoryname}
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
                    Pricing Structure
                  </label>
                  <p
                    style={{ fontWeight: "700", color: "var(--primary-dark)" }}
                  >
                    {gift.giftsellingprice > 0 ? (
                      <>
                        ₹{gift.giftsellingprice}{" "}
                        <span
                          style={{
                            textDecoration: "line-through",
                            fontSize: "13px",
                            color: "var(--text-muted)",
                            fontWeight: "400",
                            marginLeft: "5px",
                          }}
                        >
                          ₹{gift.giftprice}
                        </span>
                      </>
                    ) : (
                      <>₹{gift.giftprice}</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Curated Products */}
          <section className="form-section">
            <div className="section-title-with-icon">
              <div className="icon-wrapper">
                <Gift size={18} />
              </div>
              <h3>Included Premium Products</h3>
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "15px",
              }}
            >
              {Array.isArray(gift.productlist) &&
                gift.productlist.map((item, i) => (
                  <span
                    key={i}
                    style={{
                      padding: "8px 16px",
                      background: "var(--primary-light)",
                      color: "var(--primary-dark)",
                      borderRadius: "20px",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    {item.name || item}
                  </span>
                ))}
            </div>
          </section>
        </div>

        <div className="form-side">
          {/* Media */}
          <section className="form-section media-section">
            <h3>Gallery Preview</h3>
            <div
              className="product-large-preview"
              style={{
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "240px",
                width: "100%",
                objectFit: "contain",
                borderRadius: "16px",
                border: "1.5px solid #edf2e9",
              }}
            >
              {gift.giftimage ? (
                <img src={getImageUrl(gift.giftimage)} alt={gift.giftname} />
              ) : (
                <Gift size={40} style={{ color: "var(--primary)" }} />
              )}
            </div>
          </section>

          {/* Package Configuration */}
          <section className="form-section">
            <h3>Package Settings</h3>
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
                  Packing Type:
                </span>
                <span style={{ fontWeight: "600", color: "var(--text-main)" }}>
                  {gift.packingtype}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid #edf2e9",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>
                  Available Stock:
                </span>
                <span
                  style={{
                    fontWeight: "600",
                    color:
                      gift.stock > 0 ? "var(--primary)" : "var(--status-out)",
                  }}
                >
                  {gift.stock} Boxes
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GiftCardDetail;
