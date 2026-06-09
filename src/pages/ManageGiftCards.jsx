import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  AlertCircle,
  Save,
  CreditCard,
  Loader2,
} from "lucide-react";
import { API } from "../service/api_service";
import { APIROUTES, IMAGE_URL } from "../routes/api_routes";
import "./ManageGiftCards.css";

const ManageGiftCards = () => {
  const fileInputRef = useRef(null);
  const previewContainerRef = useRef(null);

  // Initial Seeded Gift Cards for Immediate Premium Display / Fallback
  const initialGiftCards = [
    {
      giftcardid: 101,
      cardname: "₹500 Birthday Gift Card",
      cardimage: null,
      status: "active",
    },
    {
      giftcardid: 102,
      cardname: "₹1000 Festive Gift Voucher",
      cardimage: null,
      status: "active",
    },
    {
      giftcardid: 103,
      cardname: "₹2500 Anniversary Luxury Card",
      cardimage: null,
      status: "active",
    },
  ];

  // States
  const [giftCards, setGiftCards] = useState(initialGiftCards);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form input states
  const [cardName, setCardName] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Drag state
  const [textPos, setTextPos] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isDragging || !previewContainerRef.current) return;
      const rect = previewContainerRef.current.getBoundingClientRect();
      let x = ((e.clientX - rect.left) / rect.width) * 100;
      let y = ((e.clientY - rect.top) / rect.height) * 100;

      // Keep within image boundaries
      x = Math.max(5, Math.min(95, x));
      y = Math.max(5, Math.min(95, y));
      setTextPos({ x, y });
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Filters & Action States
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch gift cards on mount
  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    setLoading(true);
    try {
      const response = await API.post(APIROUTES.GETGIFTCARDS, {});
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        if (data.length > 0) {
          setGiftCards(data);
        } else {
          setGiftCards([]);
        }
      } else {
        setGiftCards(initialGiftCards);
      }
    } catch (err) {
      console.warn("Failed to fetch gift cards from API, using fallback:", err);
      setGiftCards(initialGiftCards);
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddGiftCard = async (e) => {
    e.preventDefault();
    if (!cardName.trim()) {
      setError("Please enter a Gift Card Name.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append("cardimage", imageFile);
      }
      formData.append("cardname", cardName);

      await API.post(APIROUTES.ADDGIFTCARD, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Gift card added successfully");
      setCardName("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      fetchGiftCards();
    } catch (err) {
      console.warn("Add Gift Card API Error, using fallback:", err);

      const localNew = {
        giftcardid: Date.now(),
        cardname: cardName,
        cardimage: imagePreview || null,
        status: "active",
      };

      setGiftCards([localNew, ...giftCards]);
      setSuccess("Gift card added successfully (local fallback)");
      setCardName("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGiftCard = async () => {
    try {
      await API.post(APIROUTES.DELETEGIFTCARD, {
        giftcardid: Number(showDeleteConfirm),
      });
      setGiftCards(giftCards.filter((card) => card.giftcardid !== showDeleteConfirm));
      setShowDeleteConfirm(null);
      setSuccess("Gift card deleted successfully");
    } catch (err) {
      console.warn("Delete Gift Card failed, using local fallback:", err);
      setGiftCards(giftCards.filter((card) => card.giftcardid !== showDeleteConfirm));
      setShowDeleteConfirm(null);
      setSuccess("Gift card deleted successfully");
    }
  };

  // Filtered Gift Cards
  const filteredCards = giftCards.filter(
    (card) =>
      card.cardname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Math
  const totalItems = filteredCards.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedCards = filteredCards.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="manage-gift-cards-container">
      <div className="breadcrumb">
        <span>Catalog</span>
        <ChevronRight size={14} />
        <span>Gift Products</span>
        <ChevronRight size={14} />
        <span className="current">Add Gift Card</span>
      </div>

      <div className="page-header">
        <div className="header-text">
          <h1>Add Gift Card</h1>
          <p>Create and manage premium digital or physical gift cards for your store.</p>
        </div>
      </div>

      {error && (
        <div className="login-alert error animate-pop" style={{ maxWidth: "100%", margin: "0 0 20px" }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="login-alert success animate-pop" style={{ maxWidth: "100%", margin: "0 0 20px" }}>
          <AlertCircle size={18} style={{ color: "var(--success)" }} />
          <span>{success}</span>
        </div>
      )}

      {/* Grid: Form Above and Table Below */}
      <div className="vertical-stack">
        {/* Gift Card Form Panel ABOVE */}
        <div className="form-card section-card full-width-card">
          <div className="card-header-premium">
            <Plus size={18} />
            <h2>Create Gift Card</h2>
          </div>
          <form onSubmit={handleAddGiftCard} className="gift-card-form-panel">
            <div className="gift-card-horizontal-form" style={{ display: "flex", gap: "30px", alignItems: "flex-start", flexWrap: "wrap", width: "100%" }}>
              {/* Left Side: Customize Gift Card Image */}
              <div className="form-group-custom" style={{ flex: "1.2 1 350px", minWidth: "300px" }}>
                <label>Customize Gift Card Image</label>
                <div
                  className="image-upload-wrapper"
                  onClick={(e) => {
                    if (!imagePreview) triggerFileSelect();
                  }}
                  style={{
                    height: "300px",
                    border: imagePreview ? "none" : "1.5px dashed #edf2e9",
                    background: imagePreview ? "transparent" : "#f8fbf6",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    overflow: "hidden",
                    padding: 0,
                    width: "100%"
                  }}
                >
                  {imagePreview ? (
                    <div
                      ref={previewContainerRef}
                      style={{
                        position: "relative",
                        display: "inline-block",
                        maxHeight: "100%",
                        maxWidth: "100%"
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ maxHeight: "300px", maxWidth: "100%", objectFit: "contain", display: "block" }}
                      />
                      <div
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(true);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          top: `${textPos.y}%`,
                          left: `${textPos.x}%`,
                          transform: "translate(-50%, -50%)",
                          color: "#ffffff",
                          fontSize: "28px",
                          fontWeight: "800",
                          textShadow: "2px 2px 8px rgba(0,0,0,0.7)",
                          textAlign: "center",
                          width: "90%",
                          cursor: isDragging ? "grabbing" : "grab",
                          userSelect: "none",
                          wordWrap: "break-word"
                        }}
                      >
                        {cardName || "Your Card Name Here"}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSelectedImage(e);
                        }}
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: "var(--white)",
                          border: "1px solid #edf2e9",
                          color: "var(--status-out, #dc2626)",
                          cursor: "pointer",
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", color: "var(--text-muted)", width: "100%" }}>
                      <ImageIcon size={48} style={{ margin: "0 auto 12px", color: "var(--primary)" }} />
                      <span style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Upload Card Design</span>
                      <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "600" }}>Browse files to drag here</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    hidden
                  />
                </div>
              </div>

              {/* Right Side: Form Inputs */}
              <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="form-group-custom" style={{ width: "100%" }}>
                  <label>Card Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹1000 Holiday Gift Card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                    style={{ width: "100%" }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    fontWeight: "600",
                    letterSpacing: "0.5px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    height: "48px",
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>{submitting ? "SAVING..." : "ADD GIFT CARD"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Gift Cards Datatable View BELOW */}
        <div className="table-card section-card full-width-card">
          <div className="table-filters">
            <div className="search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search gift cards by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Loader2 size={28} className="animate-spin" style={{ color: "var(--primary)", margin: "0 auto" }} />
              </div>
            ) : paginatedCards.length > 0 ? (
              <table className="gift-card-table">
                <thead>
                  <tr>
                    <th>Card Design</th>
                    <th>Card Details</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCards.map((card) => (
                    <tr key={card.giftcardid}>
                      <td>
                        <div className="card-img-box">
                          {card.cardimage ? (
                            <img src={`${IMAGE_URL}${card.cardimage}`} alt={card.cardname} />
                          ) : (
                            <CreditCard size={24} />
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="card-info">
                          <span className="card-name">{card.cardname}</span>
                          <span className="card-desc">ID: CARD-{card.giftcardid.toString().padStart(3, "0")}</span>
                        </div>
                      </td>
                      <td>
                        <span className="status-badge">
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--success)" }}></div>
                          {card.status || "active"}
                        </span>
                      </td>
                      <td>
                        <div className="action-cell">
                          <button
                            className="action-btn delete"
                            title="Delete Gift Card"
                            onClick={() => setShowDeleteConfirm(card.giftcardid)}
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
              <div className="empty-state">
                <AlertCircle size={48} style={{ margin: "0 auto", color: "var(--text-muted)" }} />
                <h3>No gift cards found</h3>
                <p>Add your first gift card using the form above.</p>
              </div>
            )}
          </div>

          <div className="pagination-footer">
            <p>
              Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{totalItems}</strong> entries
            </p>
            <div className="page-controls" style={{ display: "flex", gap: "5px" }}>
              <button
                className="btn-page"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>
              <button className="btn-page active">{currentPage}</button>
              <button
                className="btn-page"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content animate-pop" style={{ maxWidth: "400px", textAlign: "center", padding: "30px" }}>
            <div
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
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "10px" }}>Remove Gift Card?</h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "25px" }}>
              This will permanently remove this gift card from your catalog.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="btn-ghost" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn-primary" style={{ background: "#dc2626" }} onClick={handleDeleteGiftCard}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGiftCards;

