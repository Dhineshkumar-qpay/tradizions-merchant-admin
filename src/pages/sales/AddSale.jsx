import React, { useState, useEffect } from "react";
import { formatIndianAmount } from "../../utils/formatters";
import { ArrowLeft, Save, ShoppingBag, Search } from "lucide-react";
import { API } from "../../service/api_service";
import { APIROUTES } from "../../routes/api_routes";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../Orders.css";
import "../business/Business.css";

const AddSale = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  // Basic Info
  const [orderId, setOrderId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [orderSearchLoading, setOrderSearchLoading] = useState(false);
  const [orderLookupLoading, setOrderLookupLoading] = useState(false);
  const [orderSearchResults, setOrderSearchResults] = useState([]);
  const [foundOrder, setFoundOrder] = useState(null);
  const [orderSaleItems, setOrderSaleItems] = useState([]);

  useEffect(() => {
    const value = orderId.trim();
    if (!value || foundOrder) {
      setOrderSearchResults([]);
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        setOrderLookupLoading(true);
        const res = await API.post(APIROUTES.SEARCHORDERS, { search: value });
        if (res.data?.statusCode === 200) {
          setOrderSearchResults(res.data.data || []);
        }
      } catch {
        setOrderSearchResults([]);
      } finally {
        setOrderLookupLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [orderId, foundOrder]);

  const searchOrder = async (requestedOrderId = orderId) => {
    if (!requestedOrderId.trim()) {
      toast.error("Enter an order ID first");
      return;
    }
    try {
      setOrderSearchLoading(true);
      const res = await API.post(APIROUTES.SEARCHORDER, { orderid: requestedOrderId.trim() });
      if (res.data?.statusCode === 200) {
        const order = res.data.data;
        const supplierRes = await API.post(APIROUTES.GETORDERSUPPLIERS, {
          orderid: order.orderid,
        });
        const supplierItems = supplierRes.data?.statusCode === 200
          ? supplierRes.data.data?.items || []
          : [];
        setFoundOrder(order);
        setOrderSearchResults([]);
        setOrderSaleItems((order.items || []).map((item) => {
          const supplierItem = supplierItems.find((entry) => (
            String(entry.orderitemid) === String(item.orderitemid)
          ));
          const options = (supplierItem?.suppliers || item.supplieroptions || []).map((supplier) => ({
            id: supplier.supplierproductid || supplier.id,
            supplierid: supplier.supplierid,
            suppliername: supplier.suppliername,
            productid: supplier.productid,
            productname: supplier.productname,
            remainingweight: supplier.remainingweight,
            unit: supplier.unit,
            perproductkgprice: supplier.perproductkgprice,
          }));
          const selectedOption = options.length === 1 ? options[0] : null;
          return {
            id: item.orderitemid,
            productid: item.productid,
            productname: item.product?.productname || "Product",
            orderquantitygrams: Number(item.orderquantitygrams || 0),
            orderprice: Number(item.orderprice || 0),
            supplieroptions: options,
            supplierid: selectedOption?.supplierid || "",
            supplierproductid: selectedOption?.id || "",
            quantity: Number(item.orderquantitygrams || 0),
            unit: "grams",
            price: selectedOption ? (Number(selectedOption.perproductkgprice || 0) / 1000) : 0,
            selectedProduct: selectedOption,
          };
        }));
        setOrderId(String(order.orderid));
        setCustomerName(order.user?.username || order.user?.phone || "");
        if (order.createdAt) setSaleDate(new Date(order.createdAt).toISOString().split("T")[0]);
        toast.success("Order found and details populated");
      }
    } catch (error) {
      setFoundOrder(null);
      toast.error(error?.response?.data?.message || "Order not found");
    } finally {
      setOrderSearchLoading(false);
    }
  };

  useEffect(() => {
    const orderIdFromUrl = searchParams.get("orderId");
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
      searchOrder(orderIdFromUrl);
    }
  }, [searchParams]);

  const selectOrderSupplier = (itemIndex, supplierid) => {
    const nextItems = [...orderSaleItems];
    const item = nextItems[itemIndex];
    const matchingOption = item.supplieroptions.find((option) => String(option.supplierid) === String(supplierid));

    if (matchingOption) {
      nextItems[itemIndex] = {
        ...item,
        supplierid,
        supplierproductid: matchingOption.id,
        selectedProduct: matchingOption,
        price: Number(matchingOption.perproductkgprice || 0) / 1000,
      };
      setOrderSaleItems(nextItems);
    }
  };

  const formatStock = (weight, unit) => {
    if (!weight) return "0 KG";
    const w = parseFloat(weight);
    if (unit === "kg") {
      const kg = Math.floor(w);
      const grams = Math.round((w - kg) * 1000);
      return `${kg} KG ${grams > 0 ? grams + " G" : ""}`;
    } else {
      const kg = Math.floor(w / 1000);
      const grams = Math.round(w % 1000);
      return kg > 0 ? `${kg} KG ${grams > 0 ? grams + " G" : ""}` : `${grams} G`;
    }
  };

  // Calculate Grand Total
  let grandTotal = 0;
  orderSaleItems.forEach((item) => {
    grandTotal += (Number(item.quantity) || 0) * (Number(item.price) || 0);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!orderId.trim() || !customerName.trim() || !saleDate) {
      toast.error("Please fill Order ID, Customer Name, and Sale Date");
      return;
    }

    const payloadItems = [];

    if (foundOrder) {
      for (const item of orderSaleItems) {
        if (!item.supplierid || !item.supplierproductid) {
          toast.error(`Select a supplier for ${item.productname}`);
          return;
        }

        const quantity = Number(item.quantity);
        const price = Number(item.price);
        if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price < 0) {
          toast.error(`Invalid quantity or price for ${item.productname}`);
          return;
        }

        const supplierProduct = item.selectedProduct;
        const availableGrams = supplierProduct
          ? String(supplierProduct.unit).toLowerCase() === "kg"
            ? Number(supplierProduct.remainingweight) * 1000
            : Number(supplierProduct.remainingweight)
          : 0;
        if (supplierProduct && quantity > availableGrams) {
          toast.error(`Insufficient stock for ${item.productname}. Available stock is ${formatStock(supplierProduct.remainingweight, supplierProduct.unit)}.`);
          return;
        }

        payloadItems.push({
          supplierid: Number(item.supplierid),
          supplierproductid: Number(item.supplierproductid),
          quantity,
          unit: "grams",
          price,
        });
      }
    }

    if (payloadItems.length === 0) {
      toast.error("Please add at least one valid product to the sale");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        orderid: orderId,
        customername: customerName,
        saledate: saleDate,
        items: payloadItems
      };

      const res = await API.post(APIROUTES.ADDSALE, payload);

      if (res.data && res.data.statusCode === 200) {
        toast.success("Sale created successfully");
        navigate("/sales");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create sale");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="orders-mgmt-container">
      <div className="page-header">
        <div className="header-text" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={() => navigate("/sales")}
            className="btn-secondary"
            style={{ padding: '8px' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Add New Sale</h1>
            <p>Record a new manual sale transaction.</p>
          </div>
        </div>
      </div>

      <div className="section-form-card" style={{ marginBottom: '24px' }}>
        <div className="section-title">
          <ShoppingBag size={18} />
          <h2>Order Information</h2>
        </div>

        <div className="form-grid">
          <div className="field-group">
            <label className="field-label">Order ID <span>*</span></label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => { setOrderId(e.target.value); setFoundOrder(null); setOrderSaleItems([]); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); searchOrder(); } }}
                className="form-input"
                placeholder="Enter order ID"
              />
              <button type="button" onClick={searchOrder} disabled={orderSearchLoading} className="btn-secondary" title="Search order">
                {orderSearchLoading ? <span className="circular-loader" /> : <Search size={17} />}
              </button>
            </div>
            {orderLookupLoading && <div className="search-loading"><span className="circular-loader" /> Searching orders...</div>}
            {orderSearchResults.length > 0 && (
              <div className="search-dropdown">
                {orderSearchResults.map((order) => (
                  <button
                    type="button"
                    className="search-dropdown-option"
                    key={order.orderid}
                    onClick={() => {
                      setOrderId(String(order.orderid));
                      searchOrder(String(order.orderid));
                    }}
                  >
                    <strong>Order #{order.orderid}</strong>
                    <span>{order.customername} · {order.itemcount} item(s)</span>
                  </button>
                ))}
              </div>
            )}
            {foundOrder && <small style={{ color: "var(--primary-dark)" }}>Order found with {foundOrder.items?.length || 0} item(s)</small>}
          </div>

          <div className="field-group">
            <label className="field-label">Customer Name <span>*</span></label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="form-input"
              placeholder="e.g. Ravi Kumar"
            />
          </div>

          <div className="field-group">
            <label className="field-label">Sale Date <span>*</span></label>
            <input
              type="date"
              required
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {foundOrder ? (
        <section className="section-form-card" style={{ marginBottom: '24px' }}>
          <div className="section-title">
            <ShoppingBag size={18} />
            <h2>Order Items</h2>
          </div>
          <div className="table-responsive">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Order Quantity</th>
                  <th>Order Price</th>
                  <th>Supplier</th>
                  <th>Supplier Stock</th>
                  <th>Sale Price / Gram</th>
                </tr>
              </thead>
              <tbody>
                {orderSaleItems.map((item, itemIndex) => {
                  const selectedProduct = item.selectedProduct;
                  return (
                    <tr key={item.id}>
                      <td>{item.productname}</td>
                      <td>{item.orderquantitygrams.toFixed(2)} g</td>
                      <td>₹{formatIndianAmount(item.orderprice, 2)}</td>
                      <td>
                        {item.supplieroptions.length === 1 ? (
                          <span>{item.supplieroptions[0].suppliername}</span>
                        ) : item.supplieroptions.length > 1 ? (
                          <select
                            value={item.supplierid}
                            onChange={(e) => selectOrderSupplier(itemIndex, e.target.value)}
                            className="form-select"
                          >
                            <option value="">Select Supplier</option>
                            {item.supplieroptions.map((supplier) => (
                              <option key={supplier.supplierid} value={supplier.supplierid}>
                                {supplier.suppliername}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>No supplier linked</span>
                        )}
                      </td>
                      <td>{selectedProduct ? formatStock(selectedProduct.remainingweight, selectedProduct.unit) : "-"}</td>
                      <td>{selectedProduct ? `₹${formatIndianAmount(Number(item.price), 4)}` : "Select supplier"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="section-title" style={{ marginBottom: '15px' }}>
          <h2>Sale Items</h2>
        </div>
      )}

      {/* Grand Total Footer */}
      <div className="section-form-card" style={{ marginBottom: '24px', backgroundColor: '#f9fafb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'var(--text-color)' }}>Sale Summary</h2>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>Grand Total</span>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)' }}>
              ₹{formatIndianAmount(grandTotal, 2)}
            </div>
          </div>
        </div>
      </div>

      <div className="section-footer-actions" style={{ justifyContent: 'flex-end', padding: '20px 0', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary"
          style={{ padding: '12px 24px', fontSize: '16px' }}
        >
          {submitting ? (
            <span>Processing...</span>
          ) : (
            <>
              <Save size={20} />
              <span>Create Sale</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AddSale;
