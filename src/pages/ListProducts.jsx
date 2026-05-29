import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Filter,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ListProducts.css";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";

const ListProducts = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [selectedBid, setSelectedBid] = useState("");
  const [products, setProducts] = useState([]);
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
      fetchProducts(selectedBid);
    }
  }, [selectedBid]);

  const fetchProducts = async (bid) => {
    setLoading(true);
    try {
      const response = await API.post(APIROUTES.GETALLPRODUCTS, { bid });
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
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

  const getStatusClass = (status) => {
    if (status === "Active" || status === true) return "status-active";
    if (status === "Inactive" || status === false) return "status-out";
    if (status === "Out of Stock") return "status-out";
    if (status === "Low Stock") return "status-low";
    return "";
  };

  const handleDelete = async () => {
    try {
      await API.post(APIROUTES.DELETEPRODUCT, {
        bid: selectedBid,
        productid: showDeleteConfirm,
      });
      setProducts(products.filter((p) => p.productid !== showDeleteConfirm));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Delete product failed:", err);
    }
  };
  const filteredProducts = products.filter(
    (p) =>
      p.productname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedProducts =
    selectCount === "All"
      ? filteredProducts
      : filteredProducts.slice(0, Number(selectCount));

  return (
    <div className="list-products-container">
      <div className="page-header-actions">
        <div>
          <h1>Product Catalog</h1>
          <p>Manage and monitor your organic inventory.</p>
        </div>
        <div className="header-controls-group">
          <div className="business-filter-container">
            <span className="business-filter-label">
              Business:
            </span>
            <select
              className="form-select business-filter-select"
              value={selectedBid}
              onChange={(e) => setSelectedBid(Number(e.target.value))}
            >
              {businesses.map((b) => (
                <option key={b.bid} value={b.bid}>
                  {b.businessname}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="table-wrapper section-card">
        <div
          className="table-controls"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 20px",
            gap: "15px",
          }}
        >
          <div className="search-box" style={{ flex: 1, maxWidth: "400px" }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
              <option value="All">All Products</option>
            </select>
          </div>
        </div>

        <div className="table-responsive thin-scrollbar">
          {loading ? (
            <div className="circular-loader"></div>
          ) : displayedProducts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--text-muted)",
              }}
            >
              No products found.
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Pricing</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.map((p) => (
                  <tr key={p.productid}>
                    <td>
                      <div
                        className="table-img-placeholder"
                        style={{
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {p.productimage ? (
                          <img
                            src={getImageUrl(p.productimage)}
                            alt={p.productname}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <ImageIcon size={20} />
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="p-cell-info">
                        <span className="p-name">{p.productname}</span>
                        <span className="p-id-badge">
                          MIL-{p.productid.toString().padStart(3, "0")}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="cat-pill">{p.categoryname}</span>
                    </td>
                    <td>
                      <div className="p-cell-price">
                        {p.sellingprice > 0 ? (
                          <>
                            <span className="p-offer">₹{p.sellingprice}</span>
                            <span className="p-original" style={{ textDecoration: "line-through" }}>₹{p.price}</span>
                          </>
                        ) : (
                          <span className="p-offer">₹{p.price}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="stock-info">
                        <span className="stock-count">{p.availablestock}</span>
                        <span className="stock-label">{p.unit || "Units"}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(p.isActive)}`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          className="action-btn view"
                          title="View Details"
                          onClick={() =>
                            navigate(`/products/detail/${p.productid}`, {
                              state: { bid: selectedBid },
                            })
                          }
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="action-btn edit"
                          title="Edit Product"
                          onClick={() =>
                            navigate(`/products/edit/${p.productid}`, {
                              state: { bid: selectedBid },
                            })
                          }
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Delete Product"
                          onClick={() => setShowDeleteConfirm(p.productid)}
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
            Showing <strong>{displayedProducts.length}</strong> of{" "}
            <strong>{filteredProducts.length}</strong> products
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
              Remove Product?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                marginBottom: "25px",
              }}
            >
              This will permanently remove this item from your catalog.
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
                onClick={handleDelete}
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

export default ListProducts;
