import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ArrowLeft, Save, X, Box } from "lucide-react";
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
  const supplier = location.state?.supplier || { name: "Supplier" };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(null); // stores product id if editing inline or modal

  const [formData, setFormData] = useState({
    productname: "",
    totalweight: "",
    unit: "kg",
    totalprice: "",
    perproductkgprice: "",
  });

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

  useEffect(() => {
    fetchProducts();
  }, [supplierid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
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
    if (!formData.productname || !formData.totalweight || !formData.totalprice) {
      toast.error("Please fill all required fields");
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
            <p>Managing products for {supplier.name}</p>
          </div>
        </div>
      </div>

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
              <label className="field-label">Product Name <span>*</span></label>
              <input
                type="text"
                name="productname"
                required
                value={formData.productname}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g. Dates"
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
                onChange={handleInputChange}
                className="form-input"
                placeholder="0.00"
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
                  <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No products added yet. Use the form above to add one.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="order-row">
                    <td><span className="primary-text">{product.productname}</span></td>
                    <td><span className="secondary-text">{product.totalweight} {product.unit}</span></td>
                    <td>
                      <span className="secondary-text" style={{ fontWeight: '600', color: 'var(--primary-dark)' }}>
                        {product.remainingweight !== undefined ? `${product.remainingweight} ${product.unit}` : "-"}
                      </span>
                    </td>
                    <td><span className="amount">₹{parseFloat(product.totalprice).toFixed(2)}</span></td>
                    <td><span className="amount">₹{product.perproductkgprice !== undefined ? parseFloat(product.perproductkgprice).toFixed(2) : "-"}</span></td>
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
