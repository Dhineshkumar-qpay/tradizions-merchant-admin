import React, { useState, useEffect } from "react";
import {
  Package,
  TrendingUp,
  Users,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./Dashboard.css";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";

const Dashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedTab, setSelectedTab] = useState("In Stock");
  const [stockInputs, setStockInputs] = useState({});
  const [updatingStock, setUpdatingStock] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedBusinessId) return;
      try {
        const response = await API.post(APIROUTES.PRODUCTSTOCKS, {
          bid: selectedBusinessId,
        });
        const data = response.data?.data || response.data;
        if (data) {
          const allProducts = [
            ...(data.instock || []),
            ...(data.lowstock || []),
            ...(data.outofstock || []),
          ];
          setProducts(allProducts);
          const inputs = {};
          allProducts.forEach((p) => {
            inputs[p.productid] = p.availablestock;
          });
          setStockInputs(inputs);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    };
    fetchProducts();
  }, [selectedBusinessId]);

  const handleUpdateStock = async (product) => {
    const newStock = stockInputs[product.productid];
    if (newStock === undefined || newStock === product.availablestock) return;

    setUpdatingStock(product.productid);
    try {
      const payload = {
        bid: Number(selectedBusinessId),
        productid: product.productid,
        availablestock: Number(newStock),
      };
      await API.post(APIROUTES.UPDATEPRODUCTSTOCK, payload);

      setProducts(
        products.map((p) =>
          p.productid === product.productid
            ? { ...p, availablestock: Number(newStock) }
            : p,
        ),
      );
      alert("Stock updated successfully!");
    } catch (err) {
      console.error("Failed to update stock:", err);
      alert("Failed to update stock.");
    } finally {
      setUpdatingStock(null);
    }
  };

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await API.post(APIROUTES.GETALLBUSINESSES);
        if (response.data && response.data.statusCode === 200) {
          setBusinesses(response.data.data || []);
          if (response.data.data && response.data.data.length > 0) {
            setSelectedBusinessId(response.data.data[0].bid);
          }
        }
      } catch (error) {
        console.error("Error fetching businesses:", error);
      }
    };
    fetchBusinesses();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedBusinessId) return;
      setLoading(true);
      try {
        const response = await API.post(APIROUTES.DASHBOARDCOUNT, {
          bid: selectedBusinessId,
        });
        if (response.data && response.data.statusCode === 200) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [selectedBusinessId]);

  const stats = [
    {
      title: "Total Products",
      value: dashboardData?.totalproducts || "0",
      icon: <Package />,
      trend: "",
      isPositive: true,
    },
    {
      title: "Total Orders",
      value: dashboardData?.totalorders || "0",
      icon: <ShoppingBag />,
      trend: "",
      isPositive: true,
    },
    {
      title: "Total Revenue",
      value: "20000",
      icon: <ArrowUpRight />,
      trend: "",
      isPositive: true,
    },
  ];

  return (
    <div className="dashboard-content">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="header-text">
          <h1>Dashboard Overview</h1>
          <p>Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="header-actions">
          <select
            className="form-select business-filter-select"
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(Number(e.target.value))}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              fontSize: "14px",
            }}
          >
            {businesses.map((b) => (
              <option key={b.bid} value={b.bid}>
                {b.businessname}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
          }}
        >
          <div className="circular-loader"></div>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon-wrapper">{stat.icon}</div>
                <div className="stat-info">
                  <span className="stat-label">{stat.title}</span>
                  <h2 className="stat-value">{stat.value}</h2>
                  {stat.trend && (
                    <div
                      className={`stat-trend ${stat.isPositive ? "positive" : "negative"}`}
                    >
                      {stat.isPositive ? (
                        <ArrowUpRight size={14} />
                      ) : (
                        <ArrowDownRight size={14} />
                      )}
                      <span>{stat.trend} from last month</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>


          {/* Stock Wise DataTable */}
          <div
            className="section-card"
            style={{
              marginTop: "20px",
              marginBottom: "20px",
              padding: "24px",
              borderRadius: "16px",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
              border: "1px solid #f3f4f6",
              background: "#ffffff",
            }}
          >
            <div
              className="section-header"
              style={{
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#1f2937",
                    marginBottom: "4px",
                  }}
                >
                  Product Stock Status
                </h3>
                <p style={{ fontSize: "14px", color: "#6b7280" }}>
                  Manage your inventory levels efficiently.
                </p>
              </div>
              <div
                className="tabs"
                style={{
                  display: "flex",
                  gap: "8px",
                  background: "#f3f4f6",
                  padding: "4px",
                  borderRadius: "10px",
                }}
              >
                {["In Stock", "Low Stock", "Out of Stock"].map((tab) => {
                  let count = 0;
                  if (tab === "In Stock")
                    count = products.filter(
                      (p) => p.availablestock > 10,
                    ).length;
                  if (tab === "Low Stock")
                    count = products.filter(
                      (p) => p.availablestock > 0 && p.availablestock <= 10,
                    ).length;
                  if (tab === "Out of Stock")
                    count = products.filter(
                      (p) => p.availablestock === 0,
                    ).length;

                  const isActive = selectedTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        setSelectedTab(tab);
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: isActive ? "#ffffff" : "transparent",
                        color: isActive ? "#1f2937" : "#6b7280",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                        boxShadow: isActive
                          ? "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                          : "none",
                        transition: "all 0.2s",
                      }}
                    >
                      {tab}{" "}
                      <span
                        style={{
                          marginLeft: "4px",
                          opacity: isActive ? 1 : 0.7,
                          fontSize: "12px",
                          background: isActive ? "var(--primary)" : "#e5e7eb",
                          color: isActive ? "#ffffff" : "#4b5563",
                          padding: "2px 6px",
                          borderRadius: "10px",
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="table-responsive thin-scrollbar"
              style={{ overflowX: "auto" }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: "0 8px",
                }}
              >
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    <th
                      style={{
                        padding: "12px 16px",
                        fontWeight: "600",
                        color: "#4b5563",
                        fontSize: "14px",
                        borderBottom: "1px solid #e5e7eb",
                        width: "60px",
                      }}
                    >
                      S.No
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        fontWeight: "600",
                        color: "#4b5563",
                        fontSize: "14px",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Product
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        fontWeight: "600",
                        color: "#4b5563",
                        fontSize: "14px",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Current Stock
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        fontWeight: "600",
                        color: "#4b5563",
                        fontSize: "14px",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Update Stock
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        fontWeight: "600",
                        color: "#4b5563",
                        fontSize: "14px",
                        borderBottom: "1px solid #e5e7eb",
                        textAlign: "right",
                      }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter((p) => {
                      if (selectedTab === "Out of Stock")
                        return p.availablestock === 0;
                      if (selectedTab === "Low Stock")
                        return p.availablestock > 0 && p.availablestock <= 10;
                      if (selectedTab === "In Stock")
                        return p.availablestock > 10;
                      return true;
                    })
                    .slice((currentPage - 1) * 10, currentPage * 10)
                    .map((p, index) => (
                      <tr
                        key={p.productid}
                        style={{
                          background: "#ffffff",
                          transition: "transform 0.2s, box-shadow 0.2s",
                        }}
                      >
                        <td
                          style={{
                            padding: "16px",
                            borderBottom: "1px solid #f3f4f6",
                            fontSize: "14px",
                            color: "#4b5563",
                            fontWeight: "500",
                          }}
                        >
                          {(currentPage - 1) * 10 + index + 1}
                        </td>
                        <td
                          style={{
                            padding: "16px",
                            borderBottom: "1px solid #f3f4f6",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <div
                              style={{
                                width: "44px",
                                height: "44px",
                                overflow: "hidden",
                                borderRadius: "10px",
                                background: "#f3f4f6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid #e5e7eb",
                              }}
                            >
                              {p.productimage ? (
                                <img
                                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${p.productimage}`}
                                  alt={p.productname}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <Package size={20} color="#9ca3af" />
                              )}
                            </div>
                            <div>
                              <span
                                style={{
                                  fontWeight: "600",
                                  color: "#1f2937",
                                  fontSize: "14px",
                                }}
                              >
                                {p.productname}
                              </span>
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "#6b7280",
                                  marginTop: "2px",
                                }}
                              >
                                ID: #{p.productid}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "16px",
                            borderBottom: "1px solid #f3f4f6",
                          }}
                        >
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "600",
                              background:
                                p.availablestock === 0
                                  ? "#fee2e2"
                                  : p.availablestock <= 10
                                    ? "#fef3c7"
                                    : "#d1fae5",
                              color:
                                p.availablestock === 0
                                  ? "#991b1b"
                                  : p.availablestock <= 10
                                    ? "#92400e"
                                    : "#065f46",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background:
                                  p.availablestock === 0
                                    ? "#ef4444"
                                    : p.availablestock <= 10
                                      ? "#f59e0b"
                                      : "#10b981",
                                marginRight: "6px",
                              }}
                            ></span>
                            {p.availablestock} {p.unit || "Units"}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "16px",
                            borderBottom: "1px solid #f3f4f6",
                          }}
                        >
                          <input
                            type="number"
                            value={
                              stockInputs[p.productid] !== undefined
                                ? stockInputs[p.productid]
                                : p.availablestock
                            }
                            onChange={(e) =>
                              setStockInputs({
                                ...stockInputs,
                                [p.productid]: parseInt(e.target.value) || 0,
                              })
                            }
                            style={{
                              width: "80px",
                              padding: "8px",
                              borderRadius: "8px",
                              border: "1px solid #d1d5db",
                              textAlign: "center",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          />
                        </td>
                        <td
                          style={{
                            padding: "16px",
                            borderBottom: "1px solid #f3f4f6",
                            textAlign: "right",
                          }}
                        >
                          <button
                            className="btn-primary"
                            onClick={() => handleUpdateStock(p)}
                            disabled={
                              updatingStock === p.productid ||
                              stockInputs[p.productid] === p.availablestock
                            }
                            style={{
                              padding: "8px 16px",
                              fontSize: "13px",
                              borderRadius: "8px",
                              fontWeight: "600",
                              background:
                                updatingStock === p.productid ||
                                stockInputs[p.productid] === p.availablestock
                                  ? "#e5e7eb"
                                  : "var(--primary)",
                              color:
                                updatingStock === p.productid ||
                                stockInputs[p.productid] === p.availablestock
                                  ? "#9ca3af"
                                  : "#ffffff",
                              border: "none",
                              cursor:
                                updatingStock === p.productid ||
                                stockInputs[p.productid] === p.availablestock
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            {updatingStock === p.productid
                              ? "Saving..."
                              : "Update"}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {products.filter((p) => {
                if (selectedTab === "Out of Stock")
                  return p.availablestock === 0;
                if (selectedTab === "Low Stock")
                  return p.availablestock > 0 && p.availablestock <= 10;
                if (selectedTab === "In Stock") return p.availablestock > 10;
                return true;
              }).length === 0 && (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: "14px",
                  }}
                >
                  <Package
                    size={32}
                    color="#9ca3af"
                    style={{ marginBottom: "12px", opacity: 0.5 }}
                  />
                  <p>No products found for this status.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {products.filter((p) => {
              if (selectedTab === "Out of Stock") return p.availablestock === 0;
              if (selectedTab === "Low Stock")
                return p.availablestock > 0 && p.availablestock <= 10;
              if (selectedTab === "In Stock") return p.availablestock > 10;
              return true;
            }).length > 10 && (
              <div
                className="pagination-footer"
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid #f3f4f6",
                  paddingTop: "16px",
                }}
              >
                <p style={{ fontSize: "14px", color: "#6b7280" }}>
                  Showing{" "}
                  <strong>
                    {Math.min(
                      currentPage * 10,
                      products.filter((p) => {
                        if (selectedTab === "Out of Stock")
                          return p.availablestock === 0;
                        if (selectedTab === "Low Stock")
                          return p.availablestock > 0 && p.availablestock <= 10;
                        if (selectedTab === "In Stock")
                          return p.availablestock > 10;
                        return true;
                      }).length,
                    )}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {
                      products.filter((p) => {
                        if (selectedTab === "Out of Stock")
                          return p.availablestock === 0;
                        if (selectedTab === "Low Stock")
                          return p.availablestock > 0 && p.availablestock <= 10;
                        if (selectedTab === "In Stock")
                          return p.availablestock > 10;
                        return true;
                      }).length
                    }
                  </strong>{" "}
                  products
                </p>
                <div
                  className="page-controls"
                  style={{ display: "flex", gap: "8px" }}
                >
                  <button
                    className="btn-page"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      background: currentPage === 1 ? "#f3f4f6" : "#ffffff",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    <ChevronLeft
                      size={16}
                      color={currentPage === 1 ? "#9ca3af" : "#4b5563"}
                    />
                  </button>
                  <button
                    className="btn-page active"
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      background: "var(--primary)",
                      color: "#ffffff",
                      border: "none",
                      fontWeight: "600",
                    }}
                  >
                    {currentPage}
                  </button>
                  <button
                    className="btn-page"
                    disabled={
                      currentPage >=
                      Math.ceil(
                        products.filter((p) => {
                          if (selectedTab === "Out of Stock")
                            return p.availablestock === 0;
                          if (selectedTab === "Low Stock")
                            return (
                              p.availablestock > 0 && p.availablestock <= 10
                            );
                          if (selectedTab === "In Stock")
                            return p.availablestock > 10;
                          return true;
                        }).length / 10,
                      )
                    }
                    onClick={() => setCurrentPage(currentPage + 1)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      background:
                        currentPage >=
                        Math.ceil(
                          products.filter((p) => {
                            if (selectedTab === "Out of Stock")
                              return p.availablestock === 0;
                            if (selectedTab === "Low Stock")
                              return (
                                p.availablestock > 0 && p.availablestock <= 10
                              );
                            if (selectedTab === "In Stock")
                              return p.availablestock > 10;
                            return true;
                          }).length / 10,
                        )
                          ? "#f3f4f6"
                          : "#ffffff",
                      cursor:
                        currentPage >=
                        Math.ceil(
                          products.filter((p) => {
                            if (selectedTab === "Out of Stock")
                              return p.availablestock === 0;
                            if (selectedTab === "Low Stock")
                              return (
                                p.availablestock > 0 && p.availablestock <= 10
                              );
                            if (selectedTab === "In Stock")
                              return p.availablestock > 10;
                            return true;
                          }).length / 10,
                        )
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    <ChevronRight
                      size={16}
                      color={
                        currentPage >=
                        Math.ceil(
                          products.filter((p) => {
                            if (selectedTab === "Out of Stock")
                              return p.availablestock === 0;
                            if (selectedTab === "Low Stock")
                              return (
                                p.availablestock > 0 && p.availablestock <= 10
                              );
                            if (selectedTab === "In Stock")
                              return p.availablestock > 10;
                            return true;
                          }).length / 10,
                        )
                          ? "#9ca3af"
                          : "#4b5563"
                      }
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
