import React, { useState, useEffect } from "react";
import { Plus, Trash2, ArrowLeft, Save, ShoppingBag, Store } from "lucide-react";
import { API } from "../../service/api_service";
import { APIROUTES } from "../../routes/api_routes";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../Orders.css";
import "../business/Business.css";

const AddSale = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Basic Info
  const [orderId, setOrderId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  const [suppliersList, setSuppliersList] = useState([]);
  const [productsMap, setProductsMap] = useState({}); // supplierid -> products array

  // Dynamic Supplier Groups
  const [supplierGroups, setSupplierGroups] = useState([
    {
      id: Date.now(), // unique key
      supplierid: "",
      products: []
    }
  ]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await API.post(APIROUTES.GETALLSUPPLIERS, { status: "active" });
      if (res.data && res.data.statusCode === 200) {
        setSuppliersList(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch suppliers");
    }
  };

  const fetchSupplierProducts = async (supplierid) => {
    if (!supplierid || productsMap[supplierid]) return; // Already fetched
    try {
      const res = await API.post(APIROUTES.GETALLSUPPLIERPRODUCTS, { supplierid });
      if (res.data && res.data.statusCode === 200) {
        setProductsMap(prev => ({
          ...prev,
          [supplierid]: res.data.data
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch products for supplier");
    }
  };

  const handleSupplierChange = (groupIndex, supplierid) => {
    const newGroups = [...supplierGroups];
    newGroups[groupIndex].supplierid = supplierid;
    newGroups[groupIndex].products = []; // Reset products if supplier changes
    setSupplierGroups(newGroups);
    if (supplierid) {
      fetchSupplierProducts(supplierid);
    }
  };

  const addSupplierGroup = () => {
    setSupplierGroups([
      ...supplierGroups,
      {
        id: Date.now(),
        supplierid: "",
        products: []
      }
    ]);
  };

  const removeSupplierGroup = (groupIndex) => {
    const newGroups = [...supplierGroups];
    newGroups.splice(groupIndex, 1);
    setSupplierGroups(newGroups);
  };

  const addProductRow = (groupIndex) => {
    const newGroups = [...supplierGroups];
    newGroups[groupIndex].products.push({
      id: Date.now(),
      supplierproductid: "",
      quantity: "",
      unit: "kg",
      price: ""
    });
    setSupplierGroups(newGroups);
  };

  const removeProductRow = (groupIndex, productIndex) => {
    const newGroups = [...supplierGroups];
    newGroups[groupIndex].products.splice(productIndex, 1);
    setSupplierGroups(newGroups);
  };

  const handleProductChange = (groupIndex, productIndex, field, value) => {
    const newGroups = [...supplierGroups];
    const prod = newGroups[groupIndex].products[productIndex];
    prod[field] = value;
    
    if (field === 'supplierproductid') {
      const availableProducts = productsMap[newGroups[groupIndex].supplierid] || [];
      const selectedProduct = availableProducts.find(p => p.id.toString() === prod.supplierproductid?.toString());
      
      if (selectedProduct) {
        let basePricePerKg = parseFloat(selectedProduct.perproductkgprice);
        if (!basePricePerKg || isNaN(basePricePerKg)) {
          const dbTotalWeight = parseFloat(selectedProduct.totalweight);
          const dbTotalPrice = parseFloat(selectedProduct.totalprice);
          if (dbTotalWeight > 0) {
            if (selectedProduct.unit.toLowerCase() === 'kg') {
              basePricePerKg = dbTotalPrice / dbTotalWeight;
            } else {
              basePricePerKg = (dbTotalPrice / dbTotalWeight) * 1000;
            }
          }
        }
        
        prod.price = (basePricePerKg || 0).toFixed(2);
      }
    }

    setSupplierGroups(newGroups);
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
  supplierGroups.forEach(group => {
    group.products.forEach(p => {
      const qty = parseFloat(p.quantity) || 0;
      const price = parseFloat(p.price) || 0;
      const rowTotal = p.unit === 'grams' ? qty * (price / 1000) : qty * price;
      grandTotal += rowTotal;
    });
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!orderId.trim() || !customerName.trim() || !saleDate) {
      toast.error("Please fill Order ID, Customer Name, and Sale Date");
      return;
    }

    const payloadItems = [];

    for (const group of supplierGroups) {
      if (!group.supplierid) continue;

      for (const prod of group.products) {
        if (!prod.supplierproductid) continue;

        const q = parseFloat(prod.quantity);
        if (isNaN(q) || q <= 0) {
          toast.error("Quantity must be greater than 0");
          return;
        }

        const price = parseFloat(prod.price);
        if (isNaN(price) || price < 0) {
          toast.error("Price must be valid");
          return;
        }

        // Stock validation before submission
        const availableProducts = productsMap[group.supplierid] || [];
        const productDetails = availableProducts.find(p => p.id.toString() === prod.supplierproductid.toString());

        if (productDetails) {
          const requestedUnit = prod.unit;
          const productUnit = productDetails.unit.toLowerCase();
          let requestedGrams = requestedUnit === "kg" ? q * 1000 : q;
          let availableGrams = productUnit === "kg" ? parseFloat(productDetails.remainingweight) * 1000 : parseFloat(productDetails.remainingweight);

          if (requestedGrams > availableGrams) {
            toast.error(`Insufficient stock for ${productDetails.productname}. Available stock is ${formatStock(productDetails.remainingweight, productUnit)}.`);
            return;
          }
        }

        // Check duplicate product in same supplier block
        const isDuplicate = payloadItems.some(item =>
          item.supplierid.toString() === group.supplierid.toString() &&
          item.supplierproductid.toString() === prod.supplierproductid.toString()
        );

        if (isDuplicate) {
          toast.error("Duplicate product found in the same supplier. Please combine quantities.");
          return;
        }

        let submitPrice = price;
        if (prod.unit === 'grams') {
           submitPrice = price / 1000;
        }

        payloadItems.push({
          supplierid: parseInt(group.supplierid),
          supplierproductid: parseInt(prod.supplierproductid),
          quantity: q,
          unit: prod.unit,
          price: submitPrice
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
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="form-input"
              placeholder="e.g. ORD-1001"
            />
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

      <div className="section-title" style={{ marginBottom: '15px' }}>
        <h2>Sale Items</h2>
      </div>

      {supplierGroups.map((group, groupIndex) => (
        <div key={group.id} className="section-form-card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--primary)' }}>
          <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={18} />
              <h2>Supplier {groupIndex + 1}</h2>
            </div>
            {supplierGroups.length > 1 && (
              <button
                type="button"
                onClick={() => removeSupplierGroup(groupIndex)}
                className="btn-secondary"
                style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
              >
                <Trash2 size={16} /> Remove Supplier
              </button>
            )}
          </div>

          <div className="field-group" style={{ marginBottom: '20px' }}>
            <label className="field-label">Select Supplier <span>*</span></label>
            <select
              value={group.supplierid}
              onChange={(e) => handleSupplierChange(groupIndex, e.target.value)}
              className="form-select"
              style={{ maxWidth: '400px' }}
            >
              <option value="">Select Supplier</option>
              {suppliersList.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {group.supplierid && (
            <div className="table-responsive">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Available Stock</th>
                    <th style={{ width: '200px' }}>Quantity & Unit</th>
                    <th>Price (₹)</th>
                    <th>Total (₹)</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {group.products.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                        No products added. Click "+ Add Product" below.
                      </td>
                    </tr>
                  ) : (
                    group.products.map((prod, prodIndex) => {
                      const availableProducts = productsMap[group.supplierid] || [];
                      const selectedProduct = availableProducts.find(p => p.id.toString() === prod.supplierproductid.toString());

                      const qty = parseFloat(prod.quantity) || 0;
                      const price = parseFloat(prod.price) || 0;
                      const total = prod.unit === 'grams' ? qty * (price / 1000) : qty * price;

                      return (
                        <tr key={prod.id}>
                          <td>
                            <select
                              value={prod.supplierproductid}
                              onChange={(e) => handleProductChange(groupIndex, prodIndex, 'supplierproductid', e.target.value)}
                              className="form-select"
                            >
                              <option value="">Select Product</option>
                              {availableProducts.map(p => (
                                <option key={p.id} value={p.id}>{p.productname}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            {selectedProduct ? (
                              <span style={{ fontWeight: '500', color: 'var(--primary-dark)' }}>
                                {formatStock(selectedProduct.remainingweight, selectedProduct.unit)}
                              </span>
                            ) : "-"}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={prod.quantity}
                                onChange={(e) => handleProductChange(groupIndex, prodIndex, 'quantity', e.target.value)}
                                className="form-input"
                                placeholder="0"
                                style={{ width: '80px' }}
                              />
                              <select
                                value={prod.unit}
                                onChange={(e) => handleProductChange(groupIndex, prodIndex, 'unit', e.target.value)}
                                className="form-select"
                                style={{ width: '80px' }}
                              >
                                <option value="kg">kg</option>
                                <option value="grams">grams</option>
                              </select>
                            </div>
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={prod.price}
                              onChange={(e) => handleProductChange(groupIndex, prodIndex, 'price', e.target.value)}
                              className="form-input"
                              placeholder="0.00"
                              style={{ width: '100px' }}
                            />
                          </td>
                          <td>
                            <span style={{ fontWeight: '600' }}>₹{total.toFixed(2)}</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeProductRow(groupIndex, prodIndex)}
                              className="action-btn delete"
                              title="Remove Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => addProductRow(groupIndex)}
                  className="btn-secondary"
                  style={{ fontSize: '13px', padding: '6px 12px' }}
                >
                  <Plus size={14} /> Add Product
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <button
          type="button"
          onClick={addSupplierGroup}
          className="btn-secondary"
          style={{ padding: '10px 20px', borderStyle: 'dashed', borderWidth: '2px' }}
        >
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      {/* Grand Total Footer */}
      <div className="section-form-card" style={{ marginBottom: '24px', backgroundColor: '#f9fafb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'var(--text-color)' }}>Sale Summary</h2>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>Grand Total</span>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)' }}>
              ₹{grandTotal.toFixed(2)}
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
