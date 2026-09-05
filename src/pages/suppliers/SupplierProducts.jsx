import React, { useState, useEffect } from "react";
import { formatIndianAmount } from "../../utils/formatters";
import { Plus, Edit2, Trash2, ArrowLeft, Save, X, Box, Search } from "lucide-react";
import { API } from "../../service/api_service";
import { APIROUTES } from "../../routes/api_routes";
import { toast } from "react-toastify";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../Orders.css";
import "../business/Business.css";

const SupplierProducts = () => {
  const { id: supplierid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [supplier, setSupplier] = useState(location.state?.supplier || null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(null); // stores product id if editing inline or modal
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [searchingProducts, setSearchingProducts] = useState(false);

  useEffect(() => {
    const value = productSearch.trim();
    if (value.length < 2 || isEditing) {
      setProductResults([]);
      return undefined;
    }

    const timer = setTimeout(() => {
      searchCatalogProducts(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [productSearch, isEditing]);

  const [formData, setFormData] = useState({
    productid: "",
    productname: "",
    totalweight: "",
    unit: "kg",
    totalprice: "",
    perproductkgprice: "",
  });

  const searchCatalogProducts = async (value = productSearch) => {
    if (value.trim().length < 2) {
      setProductResults([]);
      return;
    }
    try {
      setSearchingProducts(true);
      const res = await API.post(APIROUTES.SEARCHPRODUCTS, { search: value, supplierid });
      if (res.data?.statusCode === 200) setProductResults(res.data.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to search products");
    } finally {
      setSearchingProducts(false);
    }
  };

  const selectCatalogProduct = (product) => {
    setFormData((previous) => ({
      ...previous,
      productid: product.productid,
      productname: product.productname,
    }));
    setProductSearch(product.productname);
    setProductResults([]);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.post(APIROUTES.GETALLSUPPLIERPRODUCTS, { supplierid });
      if (res.data && res.data.statusCode === 200) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierDetails = async () => {
    try {
      const res = await API.post(APIROUTES.GETALLSUPPLIERS, { status: "all" });
      if (res.data && res.data.statusCode === 200) {
        const found = res.data.data.find(s => s.id.toString() === supplierid.toString());
        if (found) {
          setSupplier(found);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
    if (!supplier) {
      fetchSupplierDetails();
    }
  }, [supplierid]);

  useEffect(() => {
    const totalWeight = parseFloat(formData.totalweight);
    const perProductKgPrice = parseFloat(formData.perproductkgprice);
    const totalPrice = Number.isFinite(totalWeight) && Number.isFinite(perProductKgPrice)
      ? (totalWeight * perProductKgPrice).toFixed(2)
      : "";

    setFormData((previous) => (
      previous.totalprice === totalPrice ? previous : { ...previous, totalprice: totalPrice }
    ));
  }, [formData.totalweight, formData.perproductkgprice]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      productid: "",
      productname: "",
      totalweight: "",
      unit: "kg",
      totalprice: "",
      perproductkgprice: "",
    });
    setIsEditing(null);
  };

  const handleEditClick = (product) => {
    setIsEditing(product.id);
    setFormData({
      productid: product.productid || "",
      productname: product.productname,
      totalweight: product.totalweight,
      unit: product.unit,
      totalprice: product.totalprice,
      perproductkgprice: product.perproductkgprice || "",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productid || !formData.totalweight || !formData.totalprice || !formData.perproductkgprice) {
      toast.error("Select a catalog product and fill all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        supplierid,
        totalweight: parseFloat(formData.totalweight),
        totalprice: parseFloat(formData.totalprice),
        perproductkgprice: parseFloat(formData.perproductkgprice),
      };

      if (isEditing) {
        payload.id = isEditing;
        const res = await API.post(APIROUTES.UPDATESUPPLIERPRODUCT, payload);
        if (res.data && res.data.statusCode === 200) {
          toast.success("Product updated successfully");
        }
      } else {
        const res = await API.post(APIROUTES.ADDSUPPLIERPRODUCT, payload);
        if (res.data && res.data.statusCode === 200) {
          toast.success("Product added successfully");
        }
      }
      
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await API.post(APIROUTES.DELETESUPPLIERPRODUCT, { id });
        if (res.data && res.data.statusCode === 200) {
          toast.success("Product deleted successfully");
          fetchProducts();
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to delete product");
      }
    }
  };

  return (
    <div className="orders-mgmt-container">
      <div className="page-header">
        <div className="header-text" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={() => navigate("/suppliers")}
            className="btn-secondary"
            style={{ padding: '8px' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Supplier Products</h1>
            <p>Managing products for {supplier?.name || "Supplier"}</p>
          </div>
        </div>
      </div>

      {/* Supplier Profile Detail Card */}
      {supplier && (
        <div className="section-form-card" style={{ marginBottom: '24px', backgroundColor: '#f8fafc' }}>
          <div className="section-title">
            <h2 style={{ fontSize: '18px' }}>{supplier.name} - Details</h2>
            <span
              className={`status-badge ${supplier.status === "active" ? "delivered" : "cancelled"}`}
              style={{ marginLeft: 'auto' }}
            >
              {supplier.status?.toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Company Name</span>
              <span style={{ fontWeight: '500' }}>{supplier.companyname || "-"}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phone</span>
              <span style={{ fontWeight: '500' }}>{supplier.phone || "-"}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email</span>
              <span style={{ fontWeight: '500' }}>{supplier.email || "-"}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>GST Number</span>
              <span style={{ fontWeight: '500' }}>{supplier.gst || "-"}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Address</span>
              <span style={{ fontWeight: '500' }}>{supplier.address || "-"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form */}
      <section className="section-form-card" style={{ marginBottom: '24px' }}>
        <div className="section-title">
          <Box size={18} />
          <h2>{isEditing ? "Edit Product" : "Add New Product"}</h2>
          {isEditing && (
            <button
              onClick={resetForm}
              className="btn-secondary"
              style={{ marginLeft: 'auto', padding: '4px 8px', fontSize: '12px' }}
            >
              <X size={14} /> Cancel Edit
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field-group">
                <label className="field-label">Search Catalog Product <span>*</span></label>
                <div style={{ display: "flex", gap: 8 }}>
                  <Search size={18} style={{ marginTop: 10, color: "var(--text-muted)" }} />
                  <input
                    type="search"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="form-input"
                    placeholder="Type at least 2 characters"
                    disabled={Boolean(isEditing)}
                  />
                </div>
                {searchingProducts && <div className="search-loading"><span className="circular-loader" /> Searching products...</div>}
                {productResults.length > 0 && (
                  <div style={{ border: "1px solid var(--border-color)", borderRadius: 6, marginTop: 6, maxHeight: 160, overflowY: "auto" }}>
                    {productResults.map((product) => (
                      <button
                        type="button"
                        key={product.productid}
                        onClick={() => selectCatalogProduct(product)}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", border: 0, background: "#fff", cursor: "pointer" }}
                      >
                        {product.productname} {product.brandname ? `(${product.brandname})` : ""}
                      </button>
                    ))}
                  </div>
                )}
                {formData.productid && <small>Selected: {formData.productname}</small>}
              </div>
              <div className="field-group">
                <label className="field-label">Product Name</label>
              <input
                type="text"
                name="productname"
                value={formData.productname}
                  readOnly
                className="form-input"
                  placeholder="Select a catalog product"
              />
            </div>
            
            <div className="field-group">
              <label className="field-label">Total Weight <span>*</span></label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="totalweight"
                required
                value={formData.totalweight}
                onChange={handleInputChange}
                className="form-input"
                placeholder="0.00"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Unit <span>*</span></label>
              <select
                name="unit"
                required
                value={formData.unit}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="kg">kg</option>
                <option value="grams">grams</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Total Price (₹) <span>*</span></label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="totalprice"
                required
                value={formData.totalprice}
                readOnly
                className="form-input"
                placeholder="Automatically calculated"
              />
            </div>
            
            <div className="field-group">
              <label className="field-label">Per Product KG Price (₹) <span>*</span></label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="perproductkgprice"
                required
                value={formData.perproductkgprice}
                onChange={handleInputChange}
                className="form-input"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="section-footer-actions" style={{ marginTop: '20px' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  {isEditing ? <Save size={16} /> : <Plus size={16} />}
                  <span>{isEditing ? "Update Product" : "Add Product"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Product List */}
      <div className="table-card section-card">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Products List</h2>
        </div>
        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Product Name</th>
                <th>Total Weight</th>
                <th>Remaining Weight</th>
                <th>Total Price</th>
                <th>Per KG Price</th>
                <th>Added On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No products added yet. Use the form above to add one.
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={product.id} className="order-row">
                    <td className="secondary-text" style={{ fontWeight: '500' }}>{index + 1}</td>
                    <td><span className="primary-text">{product.product?.productname || product.productname}</span></td>
                    <td><span className="secondary-text">{product.totalweight} {product.unit}</span></td>
                    <td>
                      <span className="secondary-text" style={{ fontWeight: '600', color: 'var(--primary-dark)' }}>
                        {product.remainingweight !== undefined ? `${product.remainingweight} ${product.unit}` : "-"}
                      </span>
                    </td>
                    <td><span className="amount">₹{formatIndianAmount(parseFloat(product.totalprice), 2)}</span></td>
                    <td><span className="amount">₹{product.perproductkgprice !== undefined ? formatIndianAmount(parseFloat(product.perproductkgprice), 2) : "-"}</span></td>
                    <td><span className="date">{new Date(product.createdAt).toLocaleDateString()}</span></td>
                    <td>
                      <div className="action-cell">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="action-btn edit"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="action-btn delete"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierProducts;
