import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2, Package, Edit, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { API } from "../../services/api_service";
import { APIROUTES, IMAGE_URL } from "../../routes/api_routes";
import { toast } from "react-toastify";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import "../../../pages/ListProducts.css";

const MerchantProducts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const merchantName = location.state?.merchant?.businessname || "Merchant";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inStock"); // inStock, lowStock, outOfStock
  const [currentPage, setCurrentPage] = useState(1);
  const [editingStockId, setEditingStockId] = useState(null);
  const [newStockValue, setNewStockValue] = useState("");
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.post(APIROUTES.PRODUCTSTOCKS || "/home/product-stocks", { bid: parseInt(id) });
        const data = res.data.data || {};
        const allProducts = [
          ...(data.instock || []),
          ...(data.lowstock || []),
          ...(data.outofstock || [])
        ];
        setProducts(allProducts);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to fetch merchant products");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProducts();
  }, [id]);

  const handleUpdateStock = async (productId, value) => {
    const numericVal = parseInt(value);
    if (isNaN(numericVal) || numericVal < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }
    try {
      const res = await API.post(APIROUTES.UPDATEPRODUCTSTOCK || "/home/update-product-stock", {
        bid: parseInt(id),
        productid: productId,
        availablestock: numericVal,
      });
      if (res.data?.statusCode === 200 || res.status === 200) {
        setProducts((prev) =>
          prev.map((p) => (p.productid === productId ? { ...p, availablestock: numericVal } : p))
        );
        toast.success("Stock updated successfully");
        setEditingStockId(null);
      } else {
        toast.error("Failed to update stock");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update stock");
    }
  };

  const inStock = products.filter((p) => p.availablestock > 10);
  const lowStock = products.filter((p) => p.availablestock > 0 && p.availablestock <= 10);
  const outOfStock = products.filter((p) => p.availablestock === 0);

  const chartData = [
    { name: "In Stock", value: inStock.length, color: "#10B981" },
    { name: "Low Stock", value: lowStock.length, color: "#F59E0B" },
    { name: "Out of Stock", value: outOfStock.length, color: "#F43F5E" },
  ];

  let currentList = inStock;
  if (activeTab === "lowStock") currentList = lowStock;
  if (activeTab === "outOfStock") currentList = outOfStock;

  const totalPages = Math.ceil(currentList.length / itemsPerPage) || 1;
  const paginatedData = currentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setEditingStockId(null);
  };

  if (loading) {
    return (
      <div style={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
        <Loader2 size={48} className="animate-spin" style={{ color: "var(--primary)" }} />
        <p style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
          Loading Products...
        </p>
      </div>
    );
  }

  return (
    <div className="list-products-container">
      {/* Header */}
      <div className="page-header-actions">
        <div>
          <button
            onClick={() => navigate(-1)}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--text-muted)", fontSize: "12px", fontWeight: "700", cursor: "pointer", marginBottom: "8px" }}
          >
            <ArrowLeft size={14} /> BACK
          </button>
          <h1>{merchantName} Products</h1>
          <p>Monitor inventory and update stock levels for this merchant.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "25px", alignItems: "start" }} className="products-grid-layout">
        
        {/* Left Column: Chart Card */}
        <div className="section-card" style={{ position: "sticky", top: "24px" }}>
          <div className="table-controls" style={{ padding: "20px", borderBottom: "1px solid #f0f3ee", justifyContent: "center" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-main)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Stock Overview
            </h3>
          </div>
          <div style={{ padding: "20px", height: "300px", position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                  itemStyle={{ fontWeight: "800", fontSize: "14px" }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "12px", fontWeight: "800" }}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", paddingBottom: "36px" }}>
              <span style={{ fontSize: "36px", fontWeight: "900", color: "var(--text-main)", lineHeight: "1" }}>{products.length}</span>
              <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>Total</span>
            </div>
          </div>
        </div>

        {/* Right Column: Products Table */}
        <div className="section-card table-wrapper" style={{ display: "flex", flexDirection: "column" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #f0f3ee", background: "#f9fcf8" }}>
            <button
              onClick={() => handleTabChange("inStock")}
              style={{
                flex: 1, padding: "16px 20px", fontSize: "13px", fontWeight: "800", border: "none", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                borderBottom: activeTab === "inStock" ? "3px solid #10B981" : "3px solid transparent",
                color: activeTab === "inStock" ? "#059669" : "var(--text-muted)",
                background: activeTab === "inStock" ? "rgba(16, 185, 129, 0.05)" : "transparent"
              }}
            >
              In Stock ({inStock.length})
            </button>
            <button
              onClick={() => handleTabChange("lowStock")}
              style={{
                flex: 1, padding: "16px 20px", fontSize: "13px", fontWeight: "800", border: "none", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                borderBottom: activeTab === "lowStock" ? "3px solid #F59E0B" : "3px solid transparent",
                color: activeTab === "lowStock" ? "#D97706" : "var(--text-muted)",
                background: activeTab === "lowStock" ? "rgba(245, 158, 11, 0.05)" : "transparent"
              }}
            >
              Low Stock ({lowStock.length})
            </button>
            <button
              onClick={() => handleTabChange("outOfStock")}
              style={{
                flex: 1, padding: "16px 20px", fontSize: "13px", fontWeight: "800", border: "none", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                borderBottom: activeTab === "outOfStock" ? "3px solid #F43F5E" : "3px solid transparent",
                color: activeTab === "outOfStock" ? "#E11D48" : "var(--text-muted)",
                background: activeTab === "outOfStock" ? "rgba(244, 63, 94, 0.05)" : "transparent"
              }}
            >
              Out of Stock ({outOfStock.length})
            </button>
          </div>

          {/* Table */}
          <div className="table-responsive thin-scrollbar">
            <table className="products-table">
              <thead>
                <tr>
                  <th style={{ width: "60px", textAlign: "center" }}>S.NO</th>
                  <th>Product Details</th>
                  <th style={{ textAlign: "center" }}>Current Stock</th>
                  <th style={{ textAlign: "right", width: "150px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={item.productid}>
                    <td style={{ textAlign: "center" }}>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "8px", overflow: "hidden", background: "#f3f4f6", border: "1px solid #e5e7eb", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {item.productimage ? (
                            <img
                              src={IMAGE_URL + item.productimage}
                              alt={item.productname}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <Package size={20} style={{ color: "#9ca3af" }} />
                          )}
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-main)" }}>
                          {item.productname}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{
                        fontSize: "16px", fontWeight: "900",
                        color: item.availablestock === 0 ? "#E11D48" : item.availablestock <= 10 ? "#D97706" : "#059669"
                      }}>
                        {item.availablestock} <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>units</span>
                      </span>
                    </td>
                    <td>
                      <div className="action-cell" style={{ justifyContent: "flex-end" }}>
                        {editingStockId === item.productid ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
                            <input
                              type="number"
                              min="0"
                              value={newStockValue}
                              onChange={(e) => setNewStockValue(e.target.value)}
                              autoFocus
                              style={{ width: "70px", padding: "6px 8px", borderRadius: "6px", border: "2px solid var(--primary)", fontSize: "13px", fontWeight: "800", textAlign: "center", outline: "none" }}
                            />
                            <button
                              onClick={() => handleUpdateStock(item.productid, newStockValue)}
                              style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--primary)", border: "none", color: "white", display: "flex", alignItems: "center", justifyItems: "center", cursor: "pointer", padding: "8px" }}
                              title="Save"
                            >
                              <Check size={16} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="action-btn edit" 
                            title="Update Stock"
                            onClick={() => {
                              setEditingStockId(item.productid);
                              setNewStockValue(item.availablestock.toString());
                            }}
                          >
                            <Edit size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontWeight: "600" }}>
                      No products found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-footer">
              <p>
                Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </p>
              <div className="page-controls">
                <button
                  className="btn-page"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={18} />
                </button>
                <button className="btn-page active">{currentPage}</button>
                <button
                  className="btn-page"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Embedded style to force grid layout responsiveness since CSS might not be entirely accessible from here */}
      <style>{`
        @media (max-width: 1024px) {
          .products-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MerchantProducts;
