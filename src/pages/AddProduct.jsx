import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Save,
  ChevronRight,
  Wand2,
  Leaf,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./AddProduct.css";

const AddProduct = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [healthGoalsList, setHealthGoalsList] = useState([]);
  const [selectedHealthGoals, setSelectedHealthGoals] = useState([]);

  const [productimage, setProductImage] = useState(null);
  const [productimages, setProductimage] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });

  const [productData, setProductData] = useState({
    bid: "",
    productname: "",
    categoryid: "",
    categoryname: "",
    subcategoryid: "",
    subcategoryname: "",
    brandname: "Tradizions",
    description: "",
    price: 0,
    sellingprice: 0,
    weight: 0,
    unit: "g",
    availablestock: 0,
    productimage: "",
    isFeatured: false,
    isTrending: false,
    isBestSeller: false,
    isActive: true,
    ingredients: "",
    shelflife: "",
    storageinfo: "",
    calories: 0,
    protien: 0,
    fibre: 0,
    fat: 0,
    carbohydrates: 0,
    country: "India",
    isNewArrivals: false,
    healthgoalids:[]
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch Businesses
        const busRes = await API.post(APIROUTES.GETALLBUSINESS);
        const busData = busRes.data?.data || busRes.data;
        if (Array.isArray(busData)) {
          setBusinesses(busData);
          if (busData.length > 0) {
            setProductData((prev) => ({ ...prev, bid: busData[0].bid }));
          }
        }

        // Fetch Categories
        const catRes = await API.post(APIROUTES.GETALLCATEGORIES);
        const catData = catRes.data?.data || catRes.data;
        if (Array.isArray(catData)) {
          setCategories(catData);
        }

        // Fetch Health Goals
        try {
          const healthRes = await API.post(APIROUTES.GETHEALTHGOALS);
          const healthData = healthRes.data?.data || healthRes.data;
          if (Array.isArray(healthData)) {
            setHealthGoalsList(healthData);
          }
        } catch (err) {
          console.error("Failed to load health goals:", err);
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setError("Failed to load businesses or categories.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleCategoryChange = async (e) => {
    const catId = e.target.value;
    const selectedCat = categories.find((c) => c.categoryid === Number(catId));

    setProductData((prev) => ({
      ...prev,
      categoryid: catId ? Number(catId) : "",
      categoryname: selectedCat ? selectedCat.categoryname : "",
      subcategoryid: "",
      subcategoryname: "",
    }));

    if (catId) {
      try {
        const subRes = await API.post(APIROUTES.GETALLSUBCATEGORIES, {
          categoryid: Number(catId),
        });
        const subData = subRes.data?.data || subRes.data;
        if (Array.isArray(subData)) {
          setSubcategories(subData);
        } else {
          setSubcategories([]);
        }
      } catch (err) {
        console.error("Failed to load subcategories:", err);
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
  };

  const handleSubcategoryChange = (e) => {
    const subId = e.target.value;
    const selectedSub = subcategories.find(
      (s) => s.subcategoryid === Number(subId),
    );
    setProductData((prev) => ({
      ...prev,
      subcategoryid: subId ? Number(subId) : "",
      subcategoryname: selectedSub ? selectedSub.subcategoryname : "",
    }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImage(file);
    }
  };

  const handleAdditionalImageChange = (i, file) => {
    if (file) {
      setProductimage((prev) => ({
        ...prev,
        [`image${i}`]: file,
      }));
    }
  };

  const handleSaveProduct = async (e) => {
    if (e) e.preventDefault();

    if (!productData.bid) {
      setError("Please select a business.");
      return;
    }
    if (!productData.productname.trim()) {
      setError("Please enter a product name.");
      return;
    }
    if (!productData.categoryid) {
      setError("Please select a category.");
      return;
    }
    if (!productData.subcategoryid) {
      setError("Please select a subcategory.");
      return;
    }
    if (!productimage) {
      setError("Please select a main product image.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Step 1: Upload Main Product Image
      const imageFormData = new FormData();
      imageFormData.append("productimage", productimage);
      imageFormData.append("oldimage", "");

      const imageResponse = await API.post(
        APIROUTES.UPLOADPRODUCTIMAGE,
        imageFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      const uploadedImagePath = imageResponse.data?.data || imageResponse.data;
      if (!uploadedImagePath) {
        throw new Error("Failed to upload main image");
      }

      // Step 2: Add Product
      const productPayload = {
        ...productData,
        healthgoalids: selectedHealthGoals,
        productimage: uploadedImagePath,
      };

      const addResponse = await API.post(APIROUTES.ADDPRODUCT, productPayload);
      const addData = addResponse.data?.data || addResponse.data;
      const productid = addData?.productid;

      if (!productid) {
        throw new Error("Failed to retrieve added product ID");
      }

      // Step 3: Upload Multiple Images (if any selected)
      const hasAdditionalImages = Object.values(productimages).some(
        (file) => file !== null,
      );
      if (hasAdditionalImages) {
        const imagesFormData = new FormData();
        imagesFormData.append("bid", productData.bid);
        imagesFormData.append("productid", productid);

        if (productimages.image1)
          imagesFormData.append("image1", productimages.image1);
        if (productimages.image2)
          imagesFormData.append("image2", productimages.image2);
        if (productimages.image3)
          imagesFormData.append("image3", productimages.image3);
        if (productimages.image4)
          imagesFormData.append("image4", productimages.image4);

        await API.post(APIROUTES.UPLOADPRODUCTIMAGES, imagesFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setSuccess("Product added successfully!");
      setTimeout(() => {
        navigate("/products/list");
      }, 1500);
    } catch (err) {
      console.error("Save product failed:", err);
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Failed to create product",
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="breadcrumb">
        <span>Catalog</span>
        <ChevronRight size={14} />
        <span>Products</span>
        <ChevronRight size={14} />
        <span className="current">Create New</span>
      </div>

      <div className="page-header-actions">
        <div>
          <h1>Add New Product</h1>
          {error && (
            <p
              style={{
                color: "var(--status-out)",
                fontWeight: "600",
                marginTop: "5px",
              }}
            >
              {error}
            </p>
          )}
          {success && (
            <p
              style={{
                color: "var(--primary)",
                fontWeight: "600",
                marginTop: "5px",
              }}
            >
              {success}
            </p>
          )}
        </div>
        <div className="btn-group">
          <button
            className="btn-secondary"
            type="button"
            onClick={() => navigate("/products/list")}
            disabled={submitting}
          >
            Discard
          </button>
          <button
            className="btn-primary"
            type="button"
            onClick={handleSaveProduct}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            <span>{submitting ? "Saving..." : "Save Product"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "50px",
            color: "var(--text-muted)",
          }}
        >
          Loading businesses and categories...
        </div>
      ) : (
        <form className="product-form" onSubmit={handleSaveProduct}>
          <div className="form-main">
            {/* General Info */}
            <section className="form-section">
              <h3>General Information</h3>
              <div className="input-stack">
                <div className="grid-stack">
                  <div className="input-group">
                    <label>Select Business *</label>
                    <select
                      className="form-select"
                      value={productData.bid}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          bid: Number(e.target.value),
                        })
                      }
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
                    <label>Product Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Organic Foxtail Millet"
                      value={productData.productname}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          productname: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid-stack">
                  <div className="input-group">
                    <label>Category *</label>
                    <select
                      className="form-select"
                      value={productData.categoryid}
                      onChange={handleCategoryChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.categoryid} value={c.categoryid}>
                          {c.categoryname}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Subcategory *</label>
                    <select
                      className="form-select"
                      value={productData.subcategoryid}
                      onChange={handleSubcategoryChange}
                      disabled={!productData.categoryid}
                      required
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories.map((s) => (
                        <option key={s.subcategoryid} value={s.subcategoryid}>
                          {s.subcategoryname}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid-stack">
                  <div className="input-group">
                    <label>Country of Origin</label>
                    <select
                      className="form-select"
                      value={productData.country}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          country: e.target.value,
                        })
                      }
                    >
                      <option value="India">India</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Weight & Unit *</label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="number"
                        placeholder="e.g., 500"
                        style={{ flex: 2 }}
                        value={productData.weight || ""}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            weight: parseFloat(e.target.value) || 0,
                          })
                        }
                        required
                      />
                      <select
                        className="form-select"
                        style={{ flex: 1 }}
                        value={productData.unit}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            unit: e.target.value,
                          })
                        }
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">L</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label>Full Description *</label>
                  <textarea
                    rows="4"
                    placeholder="Highlight the origin and texture..."
                    value={productData.description}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        description: e.target.value,
                      })
                    }
                    required
                  ></textarea>
                </div>
              </div>
            </section>

            {/* Nutrition Information */}
            <section className="form-section">
              <div className="section-title-with-icon">
                <div className="icon-wrapper">
                  <Leaf size={18} />
                </div>
                <h3>Nutrition Information (per 100g)</h3>
              </div>

              <div className="nutrition-grid">
                <div className="input-group">
                  <label>Calories (kcal)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={productData.calories || ""}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        calories: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="input-group">
                  <label>Protein (g)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={productData.protien || ""}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        protien: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="input-group">
                  <label>Fiber (g)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={productData.fibre || ""}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        fibre: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="input-group">
                  <label>Fat (g)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={productData.fat || ""}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        fat: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="input-group">
                  <label>Carbohydrates (g)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={productData.carbohydrates || ""}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        carbohydrates: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section className="form-section">
              <h3>Pricing & Stock</h3>
              <div className="grid-stack">
                <div className="input-group">
                  <label>Original Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="150"
                    value={productData.price || ""}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Offer Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={productData.sellingprice || ""}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        sellingprice: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Initial Stock Count *</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={productData.availablestock || ""}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        availablestock: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              </div>
            </section>

            {/* Health Goals */}
            <section className="form-section">
              <h3>Health Goals</h3>
              <div className="health-goals-container" style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                {healthGoalsList.length > 0 ? (
                  healthGoalsList.map((goal) => (
                    <label key={goal.goalid} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={selectedHealthGoals.includes(goal.goalid)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedHealthGoals([...selectedHealthGoals, goal.goalid]);
                          } else {
                            setSelectedHealthGoals(selectedHealthGoals.filter(id => id !== goal.goalid));
                          }
                        }}
                      />
                      <span>{goal.goalname}</span>
                    </label>
                  ))
                ) : (
                  <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>No health goals available.</span>
                )}
              </div>
            </section>
          </div>

          <div className="form-side">
            {/* Media */}
            <section className="form-section media-section">
              <h3>Product Gallery</h3>
              <div className="input-group">
                <label>Main Image *</label>
                <div
                  className="upload-placeholder"
                  onClick={() =>
                    document.getElementById("main-image-input").click()
                  }
                  style={{
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {productimage ? (
                    <img
                      src={URL.createObjectURL(productimage)}
                      alt="Main product"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <>
                      <ImageIcon size={32} />
                      <p>Upload Main Image</p>
                    </>
                  )}
                </div>
                <input
                  id="main-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  style={{ display: "none" }}
                />
              </div>
              <div className="input-group" style={{ marginTop: "20px" }}>
                <label>Additional Images (Up to 4)</label>
                <div className="gallery-grid">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="upload-placeholder mini"
                      onClick={() =>
                        document.getElementById(`add-image-${i}`).click()
                      }
                      style={{
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {productimages[`image${i}`] ? (
                        <img
                          src={URL.createObjectURL(productimages[`image${i}`])}
                          alt={`Additional ${i}`}
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <>
                          <ImageIcon size={20} />
                          <span>Image {i}</span>
                        </>
                      )}
                      <input
                        id={`add-image-${i}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleAdditionalImageChange(i, e.target.files[0])
                        }
                        style={{ display: "none" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Product Flags */}
            <section className="form-section">
              <div className="section-title-with-icon">
                <div className="icon-wrapper">
                  <Wand2 size={18} />
                </div>
                <h3>Product Flags</h3>
              </div>

              <div className="flags-stack">
                <div className="switch-container">
                  <span className="switch-label">Featured Product</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={productData.isFeatured}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          isFeatured: e.target.checked,
                        })
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="switch-container">
                  <span className="switch-label">Trending Product</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={productData.isTrending}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          isTrending: e.target.checked,
                        })
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="switch-container">
                  <span className="switch-label">Best Seller</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={productData.isBestSeller}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          isBestSeller: e.target.checked,
                        })
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="switch-container">
                  <span className="switch-label">New Arrival</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={productData.isNewArrivals}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          isNewArrivals: e.target.checked,
                        })
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </section>

            {/* Specs */}
            <section className="form-section">
              <h3>Technical Specs</h3>
              <div className="input-stack mini">
                <div className="input-group">
                  <label>Brand Name</label>
                  <input
                    type="text"
                    value={productData.brandname}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        brandname: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="input-group">
                  <label>Ingredients</label>
                  <input
                    type="text"
                    placeholder="100% Organic..."
                    value={productData.ingredients}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        ingredients: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="input-group">
                  <label>Shelf Life</label>
                  <input
                    type="text"
                    placeholder="12 Months"
                    value={productData.shelflife}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        shelflife: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="input-group">
                  <label>Storage Info</label>
                  <input
                    type="text"
                    placeholder="Cool, dry place"
                    value={productData.storageinfo}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        storageinfo: e.target.value,
                      })
                    }
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

export default AddProduct;
