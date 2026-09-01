import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  MapPin,
  Printer,
  Package,
  CheckCircle2,
  Mail,
  Phone,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";
import { API } from "../../services/api_service";
import { APIROUTES, IMAGE_URL } from "../../routes/api_routes";
import { toast } from "react-toastify";
import "../../../pages/ListProducts.css";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await API.post(APIROUTES.ORDERDETAILS, {
          orderid: parseInt(id) || id,
        });
        if (res.data?.statusCode === 200 || res.status === 200) {
          setOrderData(res.data.data || res.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
        <Loader2 size={48} className="animate-spin" style={{ color: "var(--primary)" }} />
        <p style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
          Loading Order Details...
        </p>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div style={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <Package size={64} style={{ color: "#d1d5db" }} />
        <h3 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-main)" }}>Order Not Found</h3>
        <p style={{ color: "var(--text-muted)", fontWeight: "500" }}>
          The order you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "var(--primary)", color: "white", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}
        >
          <ArrowLeft size={16} /> Back to Orders
        </button>
      </div>
    );
  }

  const order = orderData?.order;
  const items = orderData?.items || [];

  const globalStatus = order?.orderstatus || "pending";
  const globalTotal = order?.totalamount || 0;

  const getStatusColor = (s) => {
    if (!s) return "status-pending";
    const lowerS = s.toLowerCase();
    if (['delivered', 'confirmed', 'pending', 'shipped', 'cancelled'].includes(lowerS)) {
      return `status-${lowerS}`;
    }
    if (lowerS === "completed") return "status-delivered";
    if (lowerS === "processing") return "status-confirmed";
    return "status-pending";
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    return IMAGE_URL + path;
  };

  const renderStepper = (status) => {
    const currentStatus = status?.toLowerCase() || "pending";
    const isCancelled = currentStatus === "cancelled";

    const statuses = ["pending", "confirmed", "shipped", "delivered"];
    const currentIndex = statuses.indexOf(currentStatus);

    const isActive = (step) => {
      if (isCancelled) return step === "pending";
      const stepIndex = statuses.indexOf(step);
      return stepIndex <= currentIndex && currentIndex !== -1;
    };

    return (
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "24px", padding: "10px 0" }}>
        <div style={{ position: "absolute", left: "13px", top: "20px", bottom: "20px", width: "2px", background: "#e5e7eb", zIndex: 0 }} />

        {/* Step 1: Pending */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center", position: "relative", zIndex: 1 }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            background: isActive("pending") || isCancelled ? "var(--primary)" : "white",
            color: isActive("pending") || isCancelled ? "white" : "#9ca3af",
            border: isActive("pending") || isCancelled ? "none" : "2px solid #d1d5db"
          }}>
            <CheckCircle2 size={16} />
          </div>
          <p style={{ fontSize: "14px", fontWeight: "700", color: isActive("pending") || isCancelled ? "var(--text-main)" : "var(--text-muted)" }}>Pending</p>
        </div>

        {/* Step 2: Confirmed */}
        {!isCancelled && (
          <div style={{ display: "flex", gap: "16px", alignItems: "center", position: "relative", zIndex: 1 }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              background: isActive("confirmed") ? "var(--primary)" : "white",
              color: isActive("confirmed") ? "white" : "#9ca3af",
              border: isActive("confirmed") ? "none" : "2px solid #d1d5db"
            }}>
              <CheckCircle2 size={16} />
            </div>
            <p style={{ fontSize: "14px", fontWeight: "700", color: isActive("confirmed") ? "var(--text-main)" : "var(--text-muted)" }}>Confirmed</p>
          </div>
        )}

        {/* Step 3: Shipped */}
        {!isCancelled && (
          <div style={{ display: "flex", gap: "16px", alignItems: "center", position: "relative", zIndex: 1 }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              background: isActive("shipped") ? "var(--primary)" : "white",
              color: isActive("shipped") ? "white" : "#9ca3af",
              border: isActive("shipped") ? "none" : "2px solid #d1d5db"
            }}>
              <CheckCircle2 size={16} />
            </div>
            <p style={{ fontSize: "14px", fontWeight: "700", color: isActive("shipped") ? "var(--text-main)" : "var(--text-muted)" }}>Shipped</p>
          </div>
        )}

        {/* Step 4: Delivered */}
        {!isCancelled && (
          <div style={{ display: "flex", gap: "16px", alignItems: "center", position: "relative", zIndex: 1 }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              background: isActive("delivered") || currentStatus === "completed" ? "var(--primary)" : "white",
              color: isActive("delivered") || currentStatus === "completed" ? "white" : "#9ca3af",
              border: isActive("delivered") || currentStatus === "completed" ? "none" : "2px solid #d1d5db"
            }}>
              <CheckCircle2 size={16} />
            </div>
            <p style={{ fontSize: "14px", fontWeight: "700", color: isActive("delivered") || currentStatus === "completed" ? "var(--text-main)" : "var(--text-muted)" }}>Delivered</p>
          </div>
        )}

        {/* Cancelled */}
        {isCancelled && (
          <div style={{ display: "flex", gap: "16px", alignItems: "center", position: "relative", zIndex: 1 }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              background: "#ef4444", color: "white"
            }}>
              <XCircle size={16} />
            </div>
            <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>Cancelled</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="list-products-container">
      {/* Header */}
      <div className="page-header-actions" style={{ alignItems: "flex-end" }}>
        <div>
          <button
            onClick={() => navigate(-1)}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--text-muted)", fontSize: "12px", fontWeight: "700", cursor: "pointer", marginBottom: "8px" }}
          >
            <ArrowLeft size={14} /> BACK TO ORDERS
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h1>Order Details</h1>
            <span className={`status-badge ${getStatusColor(globalStatus)}`} style={{ textTransform: "capitalize", fontSize: "12px" }}>
              {globalStatus}
            </span>
          </div>
          <p style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            Order ID: <span style={{ fontWeight: "800", color: "var(--text-main)" }}>#ORD{order?.orderid}</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button style={{
            display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "white", border: "1px solid var(--border)", borderRadius: "8px", fontWeight: "bold", color: "var(--text-main)", cursor: "pointer"
          }}>
            <Printer size={16} /> Print Invoice
          </button>
        </div>
      </div>

      {/* Global Order Summary */}
      <div className="section-card" style={{ padding: "25px", marginBottom: "25px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Total Amount</p>
            <p style={{ fontSize: "24px", fontWeight: "900", color: "var(--primary)" }}>₹{globalTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Payment Method</p>
            <span className={`status-badge ${order?.paymentstatus?.toLowerCase() === "paid" ? "status-delivered" : order?.paymentstatus?.toLowerCase() === "failed" ? "status-cancelled" : "status-pending"}`} style={{ textTransform: "capitalize" }}>
              {order?.paymentstatus || "Pending"}
            </span>
          </div>
          <div>
            <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Order Type</p>
            <p style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", textTransform: "capitalize" }}>{order?.ordertype || "Normal"}</p>
          </div>
          <div>
            <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Items Count</p>
            <p style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)" }}>{items.length}</p>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-main)" }}>Ordered Items</h3>
        
        {items.map((item, index) => (
          <div key={item.orderitemid} className="section-card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", background: "#f8fbf6", borderBottom: "1px solid #edf2e9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Package size={20} style={{ color: "var(--text-muted)" }} />
                <h4 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)" }}>Item #{index + 1}</h4>
              </div>
              <span className={`status-badge ${getStatusColor(item.itemstatus)}`} style={{ textTransform: "capitalize" }}>
                {item.itemstatus}
              </span>
            </div>
            
            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "30px" }}>
                
                {/* Desktop: 3 columns layout. Mobile: stack */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", margin: "-10px" }}>
                  
                  {/* Column 1: Product Information */}
                  <div style={{ flex: "1 1 300px", padding: "10px", minWidth: 0 }}>
                    <h5 style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                      <ShoppingCart size={14} /> Product Details
                    </h5>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <div style={{ width: "80px", height: "80px", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden", flexShrink: 0, padding: "4px", background: "white" }}>
                        <img
                          src={getImageUrl(item.product?.productimage || item.giftpack?.giftpackimage || item.giftcard?.image)}
                          alt={item.product?.productname || item.giftpack?.giftpackname || item.giftcard?.title || 'Item Image'}
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <p style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-main)", lineHeight: "1.3" }}>
                          {item.product?.productname || item.giftpack?.giftpackname || item.giftcard?.title || 'Unknown Item'}
                        </p>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)" }}>Qty: {item.quantity}</p>
                        <p style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)" }}>₹{item.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })} / each</p>
                        <p style={{ fontSize: "14px", fontWeight: "900", color: "var(--primary)", marginTop: "4px" }}>Total: ₹{item.totalprice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>

                        {item.giftmessage && (
                          <div style={{ marginTop: "12px", padding: "12px", background: "#fefce8", border: "1px solid #fef08a", borderRadius: "8px" }}>
                            <p style={{ fontSize: "10px", fontWeight: "800", color: "#a16207", textTransform: "uppercase", marginBottom: "4px" }}>Gift Message:</p>
                            <p style={{ fontSize: "13px", color: "#854d0e", fontStyle: "italic" }}>"{item.giftmessage}"</p>
                          </div>
                        )}

                        {item.giftpackproducts && item.giftpackproducts.length > 0 && (
                          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", borderBottom: "1px solid var(--border)", paddingBottom: "4px" }}>Items Included (Per Pack):</p>
                            
                            {item.giftpack && (
                              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fbf6", padding: "8px", borderRadius: "8px", border: "1px solid #edf2e9" }}>
                                <img src={getImageUrl(item.giftpack.giftpackimage)} alt="" style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover", border: "1px solid var(--border)" }} />
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)" }}>{item.giftpack.giftpackname} (Box)</p>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
                                    <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)" }}>Qty: 1</span>
                                    <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--primary)" }}>₹{item.giftpack.giftpackprice?.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {item.giftpackproducts.map((gp, idx) => (
                              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fbf6", padding: "8px", borderRadius: "8px", border: "1px solid #edf2e9" }}>
                                <img src={getImageUrl(gp.productimage)} alt="" style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover", border: "1px solid var(--border)" }} />
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)" }}>{gp.productname}</p>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
                                    <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)" }}>Qty: {gp.quantity}</span>
                                    <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--primary)" }}>₹{gp.totalprice?.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Shipping Address */}
                  <div style={{ flex: "1 1 250px", padding: "10px", minWidth: 0, borderLeft: "1px solid #edf2e9" }}>
                    <h5 style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                      <MapPin size={14} /> Delivery Address
                    </h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <p style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-main)" }}>{item.address?.fullname}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>
                        <Mail size={14} />
                        <span>{item.address?.email}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>
                        <Phone size={14} />
                        <span>{item.address?.mobilenumber}</span>
                      </div>
                      <p style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-muted)", lineHeight: "1.6", marginTop: "8px" }}>
                        {item.address?.addressline}{item.address?.landmark ? `, ${item.address?.landmark}` : ''}<br />
                        {item.address?.city}, {item.address?.district}<br />
                        {item.address?.state} - {item.address?.pincode}
                      </p>
                    </div>
                  </div>

                  {/* Column 3: Order Timeline or Subscription Data */}
                  <div style={{ flex: "1 1 250px", padding: "10px", minWidth: 0, borderLeft: "1px solid #edf2e9" }}>
                    {(item.ordertype !== 'monthly') ? (
                      <>
                        <h5 style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                          <Clock size={14} /> Status Timeline
                        </h5>
                        {renderStepper(item.itemstatus)}
                      </>
                    ) : (
                      <>
                        <h5 style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                          <Clock size={14} /> Subscription Details
                        </h5>
                        <div style={{ background: "#f8fbf6", padding: "16px", borderRadius: "12px", border: "1px solid #edf2e9" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div>
                              <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase" }}>Grams/Day</span>
                              <p style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-main)" }}>{item.gramsperday}g</p>
                            </div>
                            <div>
                              <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase" }}>Days/Month</span>
                              <p style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-main)" }}>{item.dayspermonth} Days</p>
                            </div>
                            <div>
                              <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase" }}>Family Members</span>
                              <p style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-main)" }}>{item.familymembers}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase" }}>Qty/Person</span>
                              <p style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-main)" }}>{item.quantitypersonkg} kg</p>
                            </div>
                            <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #e5e7eb", paddingTop: "12px", marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Monthly Qty</span>
                              <span style={{ fontSize: "16px", fontWeight: "900", color: "var(--primary)" }}>{item.totalquantitykg} kg</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDetail;
