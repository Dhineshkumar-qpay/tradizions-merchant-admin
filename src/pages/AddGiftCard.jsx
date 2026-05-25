import React, { useState, useEffect } from "react";
import {
  Plus,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Tag,
  Save,
  ChevronRight,
  Wand2,
  Gift,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./AddProduct.css";

const AddGiftCard = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedBid, setSelectedBid] = useState("");
  const [giftType, setGiftType] = useState("Nuts Pack");
  const [giftimage, setGiftImage] = useState(null);
  const [productlist, setProductlist] = useState(["Almonds", "Cashews"]);
  const [newTag, setNewTag] = useState("");

  const [formData, setFormData] = useState({
    giftname: "",
    giftdescription: "",
    giftprice: 0,
    giftsellingprice: 0,
    stock: 50,
    packingtype: "Box",
  });

  // Calculate discount visually
  const discount = formData.giftprice > 0 && formData.giftprice > formData.giftsellingprice
    ? Math.round(((formData.giftprice - formData.giftsellingprice) / formData.giftprice) * 100)
    : 0;

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const busRes = await API.post(APIROUTES.GETALLBUSINESS);
        const busData = busRes.data?.data || busRes.data;
        if (Array.isArray(busData)) {
          setBusinesses(busData);
          if (busData.length > 0) {
            setSelectedBid(busData[0].bid);
          }
        }

        const catRes = await API.post(APIROUTES.GETALLCATEGORIES);
        const catData = catRes.data?.data || catRes.data;
        if (Array.isArray(catData)) {
          setCategories(catData);
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch subcategories when resolved category changes
  const [resolvedCategory, setResolvedCategory] = useState(null);

  useEffect(() => {
    if (categories.length === 0) return;

    // Resolve category based on giftType
    const keyword = giftType === "Nuts Pack" ? "Nuts" : "Pooja";
    let matchedCat = categories.find((c) =>
      c.categoryname?.toLowerCase().includes(keyword.toLowerCase())
    );

    if (!matchedCat) {
      matchedCat = categories[0];
    }

    setResolvedCategory(matchedCat);

    const fetchSubs = async () => {
      try {
        const subRes = await API.post(APIROUTES.GETALLSUBCATEGORIES, {
          categoryid: Number(matchedCat.categoryid),
        });
        const subData = subRes.data?.data || subRes.data;
        if (Array.isArray(subData) && subData.length > 0) {
          setSubcategories(subData);
        } else {
          setSubcategories([]);
        }
      } catch (err) {
        console.error("Failed to load subcategories for gift:", err);
        setSubcategories([]);
      }
    };
    fetchSubs();
  }, [giftType, categories]);

  const handleAddTag = (e) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      if (!productlist.includes(newTag.trim())) {
        setProductlist([...productlist, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag) => {
    setProductlist(productlist.filter((t) => t !== tag));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGiftImage(file);
    }
  };

  const handleSaveGift = async (e) => {
    if (e) e.preventDefault();

    if (!selectedBid) {
      setError("Please select a business.");
      return;
    }
    if (!formData.giftname.trim()) {
      setError("Please enter a gift box title.");
      return;
    }
    if (!formData.giftdescription.trim()) {
      setError("Please enter a description.");
      return;
    }
    if (!giftimage) {
      setError("Please upload a main premium image.");
      return;
    }
    if (!resolvedCategory) {
      setError("No valid category resolved for this gift box.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Step 1: Upload Gift Image
      const imageFormData = new FormData();
      imageFormData.append("giftimage", giftimage);
      imageFormData.append("oldimage", "");

      const imageResponse = await API.post(APIROUTES.UPLOADGIFTIMAGE, imageFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedImagePath = imageResponse.data?.data || imageResponse.data;
      if (!uploadedImagePath) {
        throw new Error("Failed to upload gift image");
      }

      // Resolve subcategory id and name
      const subId = subcategories.length > 0 ? subcategories[0].subcategoryid : 1;
      const subName = subcategories.length > 0 ? subcategories[0].subcategoryname : "Default";

      // Step 2: Add Gift Box
      const giftPayload = {
        bid: Number(selectedBid),
        giftname: formData.giftname,
        giftdescription: formData.giftdescription,
        categoryid: Number(resolvedCategory.categoryid),
        categoryname: resolvedCategory.categoryname,
        subcategoryid: Number(subId),
        subcategoryname: subName,
        productlist: JSON.stringify(productlist.map(name => ({ name }))),
        giftprice: Number(formData.giftprice),
        giftsellingprice: Number(formData.giftsellingprice),
        stock: Number(formData.stock),
        packingtype: formData.packingtype,
        giftimage: uploadedImagePath,
      };

      await API.post(APIROUTES.ADDGIFT, giftPayload);

      setSuccess("Gift Box added successfully!");
      setTimeout(() => {
        navigate("/gift-cards/list");
      }, 1500);
    } catch (err) {
      console.error("Save gift box failed:", err);
      setError(err?.response?.data?.message || err.message || "Failed to create gift box");
      setSubmitting(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="breadcrumb">
        <span>Gift Cards</span>
        <ChevronRight size={14} />
        <span className="current">Add New Gift Box</span>
      </div>

      <div className="page-header-actions">
        <div className="header-text">
          <h1>Add New Gift Box</h1>
          {error && <p style={{ color: "var(--status-out)", fontWeight: "600", marginTop: "5px" }}>{error}</p>}
          {success && <p style={{ color: "var(--primary)", fontWeight: "600", marginTop: "5px" }}>{success}</p>}
        </div>
        <div className="btn-group">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/gift-cards/list")}
            disabled={submitting}
          >
            <ArrowLeft size={18} style={{ marginRight: "8px" }} />
            Back to List
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSaveGift}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span>{submitting ? "Saving..." : "Save Gift Box"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>
          Loading metadata...
        </div>
      ) : (
        <form className="product-form" onSubmit={handleSaveGift}>
          <div className="form-main">
            {/* Gift Type and Business Selection */}
            <section className="form-section">
              <h3>Configuration</h3>
              <div className="grid-stack">
                <div className="input-group">
                  <label>Select Business *</label>
                  <select
                    className="form-select"
                    value={selectedBid}
                    onChange={(e) => setSelectedBid(e.target.value)}
                    required
                  >
                    <option value="">Select Business</option>
                    {businesses.map((b) => (
                      <option key={b.bid} value={b.bid}>
                        {b.businessname}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Select Gift Box Type *</label>
                  <select
                    className="form-select"
                    value={giftType}
                    onChange={(e) => setGiftType(e.target.value)}
                  >
                    <option value="Nuts Pack">Nuts Pack</option>
                    <option value="Pooja Pack">Pooja Pack</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Main Form Fields */}
            <section className="form-section">
              <div className="section-title-with-icon">
                <div className="icon-wrapper">
                  <Gift size={18} />
                </div>
                <h3>{giftType} Details</h3>
              </div>
              <div className="input-stack">
                <div className="input-group">
                  <label>Gift Box Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Premium Nuts Collection"
                    value={formData.giftname}
                    onChange={(e) => setFormData({ ...formData, giftname: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Curated Items (Press Enter to Add Item) *</label>
                  <input
                    type="text"
                    placeholder="Type item name and press Enter... e.g. Honey"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    style={{ marginBottom: "10px" }}
                  />
                  <div
                    className="selected-products-preview"
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    {productlist.map((tag) => (
                      <span
                        key={tag}
                        className="selected-tag"
                        style={{
                          padding: "6px 12px",
                          background: giftType === "Nuts Pack" ? "var(--primary-light)" : "#fff5eb",
                          color: giftType === "Nuts Pack" ? "var(--primary-dark)" : "#d97706",
                          borderRadius: "20px",
                          fontSize: "13px",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        {tag} <X size={12} style={{ cursor: "pointer" }} onClick={() => handleRemoveTag(tag)} />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="input-group">
                  <label>Description *</label>
                  <textarea
                    rows="4"
                    placeholder="Provide a stunning visual description..."
                    value={formData.giftdescription}
                    onChange={(e) => setFormData({ ...formData, giftdescription: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section className="form-section">
              <h3>Pricing Details</h3>
              <div className="grid-stack">
                <div className="input-group">
                  <label>Original Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.giftprice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        giftprice: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Offer Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.giftsellingprice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        giftsellingprice: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              </div>
              {discount > 0 && (
                <div
                  className="discount-calc-display"
                  style={{
                    marginTop: "15px",
                    fontSize: "14px",
                    color: "var(--text-main)",
                  }}
                >
                  <span>Calculated Discount: </span>
                  <strong style={{ color: "var(--primary)" }}>{discount}% OFF</strong>
                </div>
              )}
            </section>
          </div>

          <div className="form-side">
            {/* Media */}
            <section className="form-section media-section">
              <h3>Gift Box Gallery</h3>
              <div className="input-group">
                <label>Main Image *</label>
                <div
                  className="upload-placeholder"
                  onClick={() => document.getElementById("gift-image-input").click()}
                  style={{ cursor: "pointer", position: "relative", overflow: "hidden" }}
                >
                  {giftimage ? (
                    <img
                      src={URL.createObjectURL(giftimage)}
                      alt="Gift Box"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <>
                      <ImageIcon size={32} />
                      <p>Upload Premium Image</p>
                    </>
                  )}
                </div>
                <input
                  id="gift-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>
            </section>

            {/* Settings */}
            <section className="form-section">
              <h3>Pack Settings</h3>
              <div className="input-stack mini">
                <div className="input-group">
                  <label>Packing Type</label>
                  <input
                    type="text"
                    value={formData.packingtype}
                    onChange={(e) => setFormData({ ...formData, packingtype: e.target.value })}
                  />
                </div>
                <div className="input-group" style={{ marginTop: "10px" }}>
                  <label>Stock Count</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </section>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddGiftCard;
