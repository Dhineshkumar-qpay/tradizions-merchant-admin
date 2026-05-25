import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  X,
  Tag,
  Loader2,
  ChevronRight,
  Gift,
} from "lucide-react";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./AddProduct.css";

const EditGiftCard = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const bid = location.state?.bid;

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [giftType, setGiftType] = useState("Nuts Pack");
  const [giftimage, setGiftImage] = useState(null);
  const [productlist, setProductlist] = useState([]);
  const [newTag, setNewTag] = useState("");

  const [formData, setFormData] = useState({
    giftname: "",
    giftdescription: "",
    giftprice: 0,
    giftsellingprice: 0,
    stock: 0,
    packingtype: "Box",
    giftimage: "",
  });

  const discount = formData.giftprice > 0 && formData.giftprice > formData.giftsellingprice
    ? Math.round(((formData.giftprice - formData.giftsellingprice) / formData.giftprice) * 100)
    : 0;

  useEffect(() => {
    const fetchGiftAndCategories = async () => {
      if (!bid || !id) {
        setError("Missing Business ID or Gift ID.");
        return;
      }

      setLoading(true);
      setError("");
      try {
        // Fetch Categories
        const catRes = await API.post(APIROUTES.GETALLCATEGORIES);
        const catData = catRes.data?.data || catRes.data;
        if (Array.isArray(catData)) {
          setCategories(catData);
        }

        // Fetch Gifts
        const giftRes = await API.post(APIROUTES.GETGIFTS, { bid: Number(bid) });
        const list = giftRes.data?.data || giftRes.data;
        if (Array.isArray(list)) {
          const matched = list.find((g) => g.giftid === Number(id));
          if (matched) {
            setFormData({
              giftname: matched.giftname,
              giftdescription: matched.giftdescription,
              giftprice: matched.giftprice,
              giftsellingprice: matched.giftsellingprice,
              stock: matched.stock,
              packingtype: matched.packingtype || "Box",
              giftimage: matched.giftimage,
            });

            setGiftType(matched.categoryname?.toLowerCase().includes("pooja") ? "Pooja Pack" : "Nuts Pack");

            if (Array.isArray(matched.productlist)) {
              setProductlist(matched.productlist.map((p) => p.name || p));
            }

            if (matched.categoryid) {
              const subRes = await API.post(APIROUTES.GETALLSUBCATEGORIES, {
                categoryid: Number(matched.categoryid),
              });
              const subData = subRes.data?.data || subRes.data;
              if (Array.isArray(subData)) {
                setSubcategories(subData);
              }
            }
          } else {
            setError("Gift Box not found.");
          }
        }
      } catch (err) {
        console.error("Failed to load details:", err);
        setError("Error loading configuration details.");
      } finally {
        setLoading(false);
      }
    };

    fetchGiftAndCategories();
  }, [bid, id]);

  const [resolvedCategory, setResolvedCategory] = useState(null);

  useEffect(() => {
    if (categories.length === 0) return;

    const keyword = giftType === "Nuts Pack" ? "Nuts" : "Pooja";
    let matchedCat = categories.find((c) =>
      c.categoryname?.toLowerCase().includes(keyword.toLowerCase())
    );

    if (!matchedCat) {
      matchedCat = categories[0];
    }

    setResolvedCategory(matchedCat);
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

  const handleUpdateGift = async (e) => {
    if (e) e.preventDefault();

    if (!formData.giftname.trim()) {
      setError("Please enter a gift box title.");
      return;
    }
    if (!formData.giftdescription.trim()) {
      setError("Please enter a description.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let finalImagePath = formData.giftimage;

      if (giftimage) {
        const imageFormData = new FormData();
        imageFormData.append("giftimage", giftimage);
        imageFormData.append("oldimage", formData.giftimage || "");

        const imageResponse = await API.post(APIROUTES.UPLOADGIFTIMAGE, imageFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        finalImagePath = imageResponse.data?.data || imageResponse.data;
        if (!finalImagePath) {
          throw new Error("Failed to upload image.");
        }
      }

      const subId = subcategories.length > 0 ? subcategories[0].subcategoryid : 1;
      const subName = subcategories.length > 0 ? subcategories[0].subcategoryname : "Default";

      const giftPayload = {
        giftid: Number(id),
        bid: Number(bid),
        giftname: formData.giftname,
        giftdescription: formData.giftdescription,
        categoryid: Number(resolvedCategory?.categoryid || 1),
        categoryname: resolvedCategory?.categoryname || "Gift Packs",
        subcategoryid: Number(subId),
        subcategoryname: subName,
        productlist: JSON.stringify(productlist.map((name) => ({ name }))),
        giftprice: Number(formData.giftprice),
        giftsellingprice: Number(formData.giftsellingprice),
        stock: Number(formData.stock),
        packingtype: formData.packingtype,
        giftimage: finalImagePath,
      };

      await API.post(APIROUTES.EDITGIFT, giftPayload);

      setSuccess("Gift Box updated successfully!");
      setTimeout(() => {
        navigate("/gift-cards/list");
      }, 1500);
    } catch (err) {
      console.error("Update failed:", err);
      setError(err?.response?.data?.message || err.message || "Failed to update package.");
      setSubmitting(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    const base = API.defaults.baseURL || "http://localhost:3003/api";
    const origin = base.replace(/\/api\/?$/, "");
    return `${origin}${path}`;
  };

  return (
    <div className="add-product-container">
      <div className="breadcrumb">
        <span>Catalog</span>
        <ChevronRight size={14} />
        <span>Gift Boxes</span>
        <ChevronRight size={14} />
        <span className="current">Edit Package</span>
      </div>

      <div className="page-header-actions">
        <div>
          <h1>Edit Gift Box</h1>
          {error && <p style={{ color: "var(--status-out)", fontWeight: "600", marginTop: "5px" }}>{error}</p>}
          {success && <p style={{ color: "var(--primary)", fontWeight: "600", marginTop: "5px" }}>{success}</p>}
        </div>
        <div className="btn-group">
          <button className="btn-secondary" type="button" onClick={() => navigate("/gift-cards/list")} disabled={submitting}>
            Discard
          </button>
          <button className="btn-primary" type="button" onClick={handleUpdateGift} disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span>{submitting ? "Saving..." : "Update Gift Box"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
          <div className="circular-loader"></div>
        </div>
      ) : (
        <form className="product-form" onSubmit={handleUpdateGift}>
          <div className="form-main">
            <section className="form-section">
              <h3>Configuration</h3>
              <div className="input-group">
                <label>Gift Box Type *</label>
                <select
                  className="form-select"
                  value={giftType}
                  onChange={(e) => setGiftType(e.target.value)}
                >
                  <option value="Nuts Pack">Nuts Pack</option>
                  <option value="Pooja Pack">Pooja Pack</option>
                </select>
              </div>
            </section>

            <section className="form-section">
              <h3>Gift Package Details</h3>
              <div className="input-stack">
                <div className="input-group">
                  <label>Gift Box Title *</label>
                  <input
                    type="text"
                    value={formData.giftname}
                    onChange={(e) => setFormData({ ...formData, giftname: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Included Products (Press Enter to Add Item) *</label>
                  <input
                    type="text"
                    placeholder="Type name and press Enter..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    style={{ marginBottom: "10px" }}
                  />
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {productlist.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: "6px 12px",
                          background: "var(--primary-light)",
                          color: "var(--primary-dark)",
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
                    value={formData.giftdescription}
                    onChange={(e) => setFormData({ ...formData, giftdescription: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3>Pricing Details</h3>
              <div className="grid-stack">
                <div className="input-group">
                  <label>Original Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.giftprice || ""}
                    onChange={(e) => setFormData({ ...formData, giftprice: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Offer Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.giftsellingprice || ""}
                    onChange={(e) => setFormData({ ...formData, giftsellingprice: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>
              {discount > 0 && (
                <div style={{ marginTop: "15px", fontSize: "14px" }}>
                  <span>Calculated Discount: </span>
                  <strong style={{ color: "var(--primary)" }}>{discount}% OFF</strong>
                </div>
              )}
            </section>
          </div>

          <div className="form-side">
            <section className="form-section media-section">
              <h3>Image Preview</h3>
              <div
                className="upload-placeholder"
                onClick={() => document.getElementById("gift-image-input").click()}
                style={{ cursor: "pointer", position: "relative", overflow: "hidden" }}
              >
                {giftimage ? (
                  <img src={URL.createObjectURL(giftimage)} alt="Selected Box" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : formData.giftimage ? (
                  <img src={getImageUrl(formData.giftimage)} alt="Current Box" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <>
                    <ImageIcon size={32} />
                    <p>Upload Image</p>
                  </>
                )}
              </div>
              <input id="gift-image-input" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
            </section>

            <section className="form-section">
              <h3>Pack Settings</h3>
              <div className="input-stack mini">
                <div className="input-group">
                  <label>Packing Type</label>
                  <input type="text" value={formData.packingtype} onChange={(e) => setFormData({ ...formData, packingtype: e.target.value })} />
                </div>
                <div className="input-group" style={{ marginTop: "10px" }}>
                  <label>Stock Count</label>
                  <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
            </section>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditGiftCard;
