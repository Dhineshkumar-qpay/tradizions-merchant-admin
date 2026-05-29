import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Gift,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./GiftCardManagement.css";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";

const ListGiftCards = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [selectedBid, setSelectedBid] = useState("");
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectCount, setSelectCount] = useState("10");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await API.post(APIROUTES.GETALLBUSINESS);
        const data = response.data?.data || response.data;
        if (Array.isArray(data)) {
          setBusinesses(data);
          if (data.length > 0) {
            setSelectedBid(data[0].bid);
          }
        }
      } catch (err) {
        console.error("Failed to load businesses:", err);
      }
    };
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBid) {
      fetchGiftCards(selectedBid);
    }
  }, [selectedBid]);

  const fetchGiftCards = async (bid) => {
    setLoading(true);
    try {
      const response = await API.post(APIROUTES.GETGIFTS, { bid: Number(bid) });
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        setGiftCards(data);
      } else {
        setGiftCards([]);
      }
    } catch (err) {
      console.error("Failed to load gift cards:", err);
      setGiftCards([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    const base = API.defaults.baseURL || "http://localhost:3003/api";
    const origin = base.replace(/\/api\/?$/, ""); // strip /api
    return `${origin}${path}`;
  };

  const handleDeleteGift = async () => {
    try {
      await API.post(APIROUTES.DELETEGIFT, {
        bid: selectedBid,
        giftid: showDeleteConfirm,
      });
      setGiftCards(
        giftCards.filter((card) => card.giftid !== showDeleteConfirm),
      );
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Delete gift card failed:", err);
    }
  };

  const filteredGiftCards = giftCards.filter(
    (card) =>
      card.giftname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.giftdescription?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const displayedGiftCards =
    selectCount === "All"
      ? filteredGiftCards
      : filteredGiftCards.slice(0, Number(selectCount));

  return (
    <div className="gift-card-mgmt-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Gift Box Management</h1>
          <p>Curate and manage your premium gifting catalog.</p>
        </div>
        <div className="header-controls-group">
          <div className="business-filter-container">
            <span className="business-filter-label">Business:</span>
            <select
              className="form-select business-filter-select"
              value={selectedBid}
              onChange={(e) => setSelectedBid(Number(e.target.value))}
            >
              {businesses.map((b) => (
                <option key={b.bid} value={b.bid}>{b.businessname}</option>
              ))}
            </select>
          </div>
          <button
            className="btn-primary add-gift-btn"
            onClick={() => navigate("/gift-cards/add")}
          >
            <Plus size={18} />
            <span>Add Gift Box</span>
          </button>
        </div>
      </div>

      <div className="table-card section-card">
        <div
          className="table-filters"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px",
            gap: "15px",
          }}
        >
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search gift boxes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div
            className="filter-group"
            style={{ display: "flex", gap: "15px", alignItems: "center" }}
          >
            <div
              className="filter-item"
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                Show Count
              </label>
              <select
                className="form-select"
                value={selectCount}
                onChange={(e) => setSelectCount(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  minWidth: "130px",
                  fontSize: "14px",
                }}
              >
                <option value="10">10 Entries</option>
                <option value="20">20 Entries</option>
                <option value="30">30 Entries</option>
                <option value="40">40 Entries</option>
                <option value="50">50 Entries</option>
                <option value="All">All Gifts</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive thin-scrollbar">
          {loading ? (
            <div className="circular-loader"></div>
          ) : displayedGiftCards.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--text-muted)",
              }}
            >
              No gift boxes found for this business.
            </div>
          ) : (
            <table className="gift-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Gift Details</th>
                  <th>Included Items</th>
                  <th>Pricing</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedGiftCards.map((card) => (
                  <tr key={card.giftid}>
                    <td>
                      <div
                        className="gift-img-box"
                        style={{
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {card.giftimage ? (
                          <img
                            src={getImageUrl(card.giftimage)}
                            alt={card.giftname}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Gift size={24} />
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="gift-info">
                        <span className="gift-name">{card.giftname}</span>
                        <span className="gift-id-badge">
                          BOX-{card.giftid.toString().padStart(3, "0")}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="product-tags">
                        {Array.isArray(card.productlist) &&
                          card.productlist.map((p, i) => (
                            <span key={i} className="p-tag">
                              {p.name || p}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td>
                      <div className="gift-pricing">
                        <div className="price-main">
                          {card.giftsellingprice > 0 ? (
                            <>
                              <span className="offer">₹{card.giftsellingprice}</span>
                              <span className="original" style={{ textDecoration: "line-through" }}>₹{card.giftprice}</span>
                            </>
                          ) : (
                            <span className="offer">₹{card.giftprice}</span>
                          )}
                        </div>
                        {card.giftsellingprice > 0 && card.giftprice > card.giftsellingprice && (
                          <span className="discount-tag">
                            {Math.round(
                              ((card.giftprice - card.giftsellingprice) /
                                card.giftprice) *
                                100,
                            )}
                            % OFF
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${card.stock > 0 ? "active" : "inactive"}`}
                      >
                        {card.stock > 0 ? "Active" : "Out of Stock"}
                      </span>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          className="action-btn view"
                          title="View Details"
                          onClick={() =>
                            navigate(`/gift-cards/detail/${card.giftid}`, {
                              state: { bid: selectedBid },
                            })
                          }
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="action-btn edit"
                          title="Edit Gift Box"
                          onClick={() =>
                            navigate(`/gift-cards/edit/${card.giftid}`, {
                              state: { bid: selectedBid },
                            })
                          }
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Delete Gift Box"
                          onClick={() => setShowDeleteConfirm(card.giftid)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="pagination-footer">
          <p>
            Showing <strong>{displayedGiftCards.length}</strong> of{" "}
            <strong>{filteredGiftCards.length}</strong> gift boxes
          </p>
          <div className="page-controls">
            <button className="btn-page" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="btn-page active">1</button>
            <button className="btn-page">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div
            className="modal-content animate-pop"
            style={{ maxWidth: "400px", textAlign: "center", padding: "30px" }}
          >
            <div
              className="modal-icon-box"
              style={{
                background: "#fff1f1",
                color: "#dc2626",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Trash2 size={32} />
            </div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                marginBottom: "10px",
              }}
            >
              Remove Gift Box?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                marginBottom: "25px",
              }}
            >
              This will permanently remove this premium packaging from your
              catalog.
            </p>
            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center" }}
            >
              <button
                className="btn-ghost"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ background: "#dc2626" }}
                onClick={handleDeleteGift}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListGiftCards;
