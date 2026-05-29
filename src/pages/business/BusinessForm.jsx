import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Save,
  User,
  Store,
  MapPin,
  ShieldCheck,
  CreditCard,
  Upload,
  ArrowRight,
  ArrowLeft,
  X,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import "./Business.css";
import { API } from "../../service/api_service";
import { APIROUTES } from "../../routes/api_routes";

const BusinessForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locationData, setLocationData] = useState({});

  useEffect(() => {
    fetch("/location/india_states_districts.json")
      .then((res) => res.json())
      .then((data) => setLocationData(data))
      .catch((err) => console.error("Error loading location data:", err));
  }, []);

  const [formData, setFormData] = useState({
    ownername: "",
    designation: "",
    mobile: "",
    whatsapp: "",
    email: "",
    basicinfoid: 0,

    businessname: "",
    legalbusinessname: "",
    description: "",
    opentime: "",
    closetime: "",
    businessimage: "",
    businessinfoid: 0,

    addressline: "",
    landmark: "",
    city: "",
    district: "",
    districtid: 8,
    state: "Tamil Nadu",
    stateid: 1,
    country: "India",
    pincode: "",
    latitude: 11.3667,
    longitude: 77.7867,
    addressid: 0,

    accountholdername: "",
    accountnumber: "",
    bankname: "",
    branchname: "",
    ifsc: "",
    passbook: "",
    bankid: 0,
  });

  const tabs = [
    { id: "basic", label: "Basic Info", icon: <User size={18} /> },
    { id: "shop", label: "Shop Details", icon: <Store size={18} /> },
    { id: "address", label: "Address", icon: <MapPin size={18} /> },
    { id: "bank", label: "Bank Details", icon: <CreditCard size={18} /> },
  ];

  useEffect(() => {
    if (isEdit) {
      const loadBusinessData = async () => {
        setLoading(true);
        try {
          const payload = { bid: Number(id) };

          // 1. Get Basic Info
          let basic = {};
          try {
            const res = await API.post(APIROUTES.GETBASICINFO, payload);

            if (res.data && res.data.statusCode === 200 && res.data.data) {
              basic = res.data.data;
            }
          } catch (e) {
            console.error("Error getting basic info:", e);
          }

          // 2. Get Business / Shop Info
          let shop = {};
          try {
            const res = await API.post(APIROUTES.GETBUSINESSINFO, payload);
            if (res.data && res.data.statusCode === 200 && res.data.data) {
              shop = res.data.data;
            }
          } catch (e) {
            console.error("Error getting business info:", e);
          }

          // 3. Get Address Info
          let address = {};
          try {
            const res = await API.post(APIROUTES.GETADDRESSINFO, payload);
            if (res.data && res.data.statusCode === 200 && res.data.data) {
              address = res.data.data;
            }
          } catch (e) {
            console.error("Error getting address info:", e);
          }

          // 4. Get Bank Info
          let bank = {};
          try {
            const res = await API.post(APIROUTES.GETBANKINFO, payload);
            if (res.data && res.data.statusCode === 200 && res.data.data) {
              bank = res.data.data;
            }
          } catch (e) {
            console.error("Error getting bank info:", e);
          }

          // Update state with everything we loaded
          setFormData({
            ownername: basic.ownername || "",
            designation: basic.designation || "",
            mobile: basic.mobile || "",
            whatsapp: basic.whatsapp || "",
            email: basic.email || "",
            basicinfoid: basic.basicinfoid || 0,

            businessname: shop.businessname || "",
            legalbusinessname: shop.legalbusinessname || "",
            description: shop.description || "",
            opentime: shop.opentime || "",
            closetime: shop.closetime || "",
            businessimage: shop.businessimage || "",
            businessinfoid: shop.businessinfoid || 0,

            addressline: address.addressline || "",
            landmark: address.landmark || "",
            city: address.city || "",
            district: address.district || "",
            districtid: address.districtid || 8,
            state: address.state || "Tamil Nadu",
            stateid: address.stateid || 1,
            country: address.country || "India",
            pincode: address.pincode || "",
            latitude: address.latitude || 11.3667,
            longitude: address.longitude || 77.7867,
            addressid: address.addressid || 0,

            accountholdername: bank.accountholdername || "",
            accountnumber: bank.accountnumber || "",
            bankname: bank.bankname || "",
            branchname: bank.branchname || "",
            ifsc: bank.ifsc || "",
            passbook: bank.passbook || "",
            bankid: bank.bankid || 0,
          });
        } catch (error) {
          console.error("Error loading edit business details:", error);
        } finally {
          setLoading(false);
        }
      };
      loadBusinessData();
    }
  }, [id, isEdit]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const bid = Number(id);

      // 1. Save Basic Info
      const basicPayload = {
        bid: bid,
        basicinfoid: formData.basicinfoid || 0,
        ownername: formData.ownername,
        designation: formData.designation,
        mobile: formData.mobile,
        whatsapp: formData.whatsapp,
        email: formData.email,
      };
      console.log(`-------------------${JSON.stringify(basicPayload)}`);

      await API.post(APIROUTES.ADDBASICINFO, basicPayload);

      // 2. Save Business Info (multipart/form-data)
      const businessFormData = new FormData();
      businessFormData.append("bid", bid.toString());
      if (formData.businessinfoid) {
        businessFormData.append("businessinfoid", formData.businessinfoid.toString());
      }
      businessFormData.append("businessname", formData.businessname);
      businessFormData.append("legalbusinessname", formData.legalbusinessname);
      businessFormData.append("description", formData.description);
      businessFormData.append("opentime", formData.opentime);
      businessFormData.append("closetime", formData.closetime);
      if (formData.businessimage instanceof File) {
        businessFormData.append("businessimage", formData.businessimage);
      }
      await API.post(APIROUTES.ADDBUSINESSINFO, businessFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 3. Save Address Info
      const addressPayload = {
        bid: bid,
        addressid: formData.addressid || 0,
        addressline: formData.addressline,
        landmark: formData.landmark,
        city: formData.city,
        district: formData.district,
        districtid: Number(formData.districtid) || 8,
        state: formData.state,
        stateid: Number(formData.stateid) || 1,
        country: formData.country,
        pincode: Number(formData.pincode) || 0,
        latitude: Number(formData.latitude) || 11.3667,
        longitude: Number(formData.longitude) || 77.7867,
      };
      await API.post(APIROUTES.ADDADDRESSINFO, addressPayload);

      // 4. Save Bank Info (multipart/form-data)
      const bankFormData = new FormData();
      bankFormData.append("bid", bid.toString());
      if (formData.bankid) {
        bankFormData.append("bankid", formData.bankid.toString());
      }
      bankFormData.append("accountholdername", formData.accountholdername);
      bankFormData.append("accountnumber", formData.accountnumber);
      bankFormData.append("bankname", formData.bankname);
      bankFormData.append("branchname", formData.branchname);
      bankFormData.append("ifsc", formData.ifsc);
      if (formData.passbook instanceof File) {
        bankFormData.append("passbook", formData.passbook);
      }
      
      const bankApiRoute = formData.bankid ? APIROUTES.UPDATEBANKINFO : APIROUTES.ADDBANKINFO;
      await API.post(bankApiRoute, bankFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Business updated successfully!");
      navigate("/business");
    } catch (error) {
      console.error("Error saving business info:", error);
      alert("Error saving business information. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const FormActions = () => (
    <div className="section-footer-actions">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => navigate(-1)}
        disabled={saving}
      >
        <X size={16} /> Discard
      </button>
      <button
        type="button"
        className="btn-primary"
        onClick={handleSave}
        disabled={saving}
      >
        <Save size={16} /> <span>{saving ? "Saving..." : "Save & Finish"}</span>
      </button>
    </div>
  );

  const getBusinessImageUrl = () => {
    if (!formData.businessimage) return "";
    if (formData.businessimage instanceof File) {
      return URL.createObjectURL(formData.businessimage);
    }
    if (formData.businessimage.startsWith("http")) {
      return formData.businessimage;
    }
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}${formData.businessimage}`;
  };

  const getPassbookImageUrl = () => {
    if (!formData.passbook) return "";
    if (formData.passbook instanceof File) {
      return URL.createObjectURL(formData.passbook);
    }
    if (formData.passbook.startsWith("http")) {
      return formData.passbook;
    }
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}${formData.passbook}`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <section className="section-form-card animate-fadeIn">
            <div className="section-title">
              <User size={18} />
              <h2>Basic Details</h2>
            </div>
            <div className="form-grid">
              <div className="field-group">
                <label className="field-label">
                  Owner Name <span>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter owner full name"
                  value={formData.ownername}
                  onChange={(e) =>
                    setFormData({ ...formData, ownername: e.target.value })
                  }
                  required
                />
              </div>
              <div className="field-group">
                <label className="field-label">Designation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="E.g. CEO, Founder"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                />
              </div>
              <div className="field-group">
                <label className="field-label">
                  Mobile Number <span>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                  required
                />
              </div>
              <div className="field-group">
                <label className="field-label">Whatsapp Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp: e.target.value })
                  }
                />
              </div>
              <div className="field-group full">
                <label className="field-label">Email Id</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="example@business.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
            <FormActions />
          </section>
        );
      case "shop":
        return (
          <section className="section-form-card animate-fadeIn">
            <div className="section-title">
              <Store size={18} />
              <h2>Shop Details</h2>
            </div>
            <div className="form-grid">
              <div className="field-group full">
                <label className="field-label">Business Image</label>
                <div
                  className="upload-field"
                  onClick={() =>
                    document.getElementById("businessimage-input").click()
                  }
                  style={{
                    position: "relative",
                    cursor: "pointer",
                    overflow: "hidden",
                    minHeight: "150px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <input
                    type="file"
                    id="businessimage-input"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormData({
                          ...formData,
                          businessimage: e.target.files[0],
                        });
                      }
                    }}
                  />
                  {formData.businessimage ? (
                    <img
                      src={getBusinessImageUrl()}
                      alt="Business image"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        maxHeight: "150px",
                      }}
                    />
                  ) : (
                    <>
                      <ImageIcon
                        size={24}
                        style={{ color: "#ccc", marginBottom: "10px" }}
                      />
                      <p
                        style={{ fontSize: "13px", fontWeight: 600, margin: 0 }}
                      >
                        Click to upload business photo
                      </p>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#999",
                          marginTop: "4px",
                        }}
                      >
                        Max size 2MB • PNG, JPG
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">
                  Business Name <span>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Display name"
                  value={formData.businessname}
                  onChange={(e) =>
                    setFormData({ ...formData, businessname: e.target.value })
                  }
                  required
                />
              </div>
              <div className="field-group">
                <label className="field-label">
                  Legal Business Name <span>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="As per registration"
                  value={formData.legalbusinessname}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      legalbusinessname: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="field-group full">
                <label className="field-label">Business Description</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Tell us about your business..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                ></textarea>
              </div>
              <div className="field-group">
                <label className="field-label">Opening Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.opentime}
                  onChange={(e) =>
                    setFormData({ ...formData, opentime: e.target.value })
                  }
                />
              </div>
              <div className="field-group">
                <label className="field-label">Closing Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.closetime}
                  onChange={(e) =>
                    setFormData({ ...formData, closetime: e.target.value })
                  }
                />
              </div>
            </div>
            <FormActions />
          </section>
        );
      case "address":
        return (
          <section className="section-form-card animate-fadeIn">
            <div className="section-title">
              <MapPin size={18} />
              <h2>Address Details</h2>
            </div>
            <div className="form-grid">
              <div className="field-group full">
                <label className="field-label">
                  Address Line <span>*</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Door No, Building, Street Name..."
                  value={formData.addressline}
                  onChange={(e) =>
                    setFormData({ ...formData, addressline: e.target.value })
                  }
                  required
                ></textarea>
              </div>
              <div className="field-group">
                <label className="field-label">Landmark</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="E.g. Near Water Tank"
                  value={formData.landmark}
                  onChange={(e) =>
                    setFormData({ ...formData, landmark: e.target.value })
                  }
                />
              </div>
              <div className="field-group">
                <label className="field-label">
                  City <span>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  required
                />
              </div>
              <div className="field-group">
                <label className="field-label">
                  District <span>*</span>
                </label>
                <input
                  type="text"
                  list="district-options"
                  className="form-input"
                  placeholder="Select or type District"
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      district: e.target.value,
                      districtid: 8,
                    })
                  }
                  required
                />
                <datalist id="district-options">
                  {formData.state && locationData[formData.state]
                    ? locationData[formData.state].map((dist) => (
                        <option key={dist} value={dist} />
                      ))
                    : null}
                </datalist>
              </div>
              <div className="field-group">
                <label className="field-label">
                  State <span>*</span>
                </label>
                <input
                  type="text"
                  list="state-options"
                  className="form-input"
                  placeholder="Select or type State"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      state: e.target.value,
                      stateid: 1,
                      district: "", // reset district on state change
                    })
                  }
                  required
                />
                <datalist id="state-options">
                  {Object.keys(locationData).map((st) => (
                    <option key={st} value={st} />
                  ))}
                </datalist>
              </div>
              <div className="field-group">
                <label className="field-label">
                  Country <span>*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  required
                >
                  <option value="India">India</option>
                </select>
              </div>
              <div className="field-group full">
                <label className="field-label">
                  Pincode <span>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="XXXXXX"
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({ ...formData, pincode: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <FormActions />
          </section>
        );
      case "bank":
        return (
          <section className="section-form-card animate-fadeIn">
            <div className="section-title">
              <CreditCard size={18} />
              <h2>Bank Details</h2>
            </div>
            <div className="form-grid">
              <div className="field-group full">
                <label className="field-label">
                  Cheque or Passbook Image <span>*</span>
                </label>
                <div
                  className="upload-field"
                  onClick={() =>
                    document.getElementById("passbook-input").click()
                  }
                  style={{
                    position: "relative",
                    cursor: "pointer",
                    overflow: "hidden",
                    minHeight: "150px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <input
                    type="file"
                    id="passbook-input"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormData({
                          ...formData,
                          passbook: e.target.files[0],
                        });
                      }
                    }}
                  />
                  {formData.passbook ? (
                    <img
                      src={getPassbookImageUrl()}
                      alt="Passbook image"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        maxHeight: "150px",
                      }}
                    />
                  ) : (
                    <>
                      <FileText
                        size={24}
                        style={{ color: "#ccc", marginBottom: "10px" }}
                      />
                      <p
                        style={{ fontSize: "13px", fontWeight: 600, margin: 0 }}
                      >
                        Click to upload Passbook/Cheque
                      </p>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#999",
                          marginTop: "4px",
                        }}
                      >
                        Scan copy of front page
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">
                  Account Holder Name <span>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="As per bank records"
                  value={formData.accountholdername}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accountholdername: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="field-group">
                <label className="field-label">
                  Account Number <span>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter bank account number"
                  value={formData.accountnumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountnumber: e.target.value })
                  }
                  required
                />
              </div>
              <div className="field-group">
                <label className="field-label">
                  Bank Name <span>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="E.g. HDFC Bank"
                  value={formData.bankname}
                  onChange={(e) =>
                    setFormData({ ...formData, bankname: e.target.value })
                  }
                  required
                />
              </div>
              <div className="field-group">
                <label className="field-label">
                  Branch Name <span>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Branch location"
                  value={formData.branchname}
                  onChange={(e) =>
                    setFormData({ ...formData, branchname: e.target.value })
                  }
                  required
                />
              </div>
              <div className="field-group full">
                <label className="field-label">
                  IFSC Code <span>*</span>
                </label>
                <input
                  type="text"
                  className="form-input uppercase"
                  placeholder="HDFC0001234"
                  value={formData.ifsc}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ifsc: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>
            </div>
            <FormActions />
          </section>
        );
      default:
        return null;
    }
  };

  const handleNext = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id);
  };

  const handlePrev = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
  };

  return (
    <div className="business-form-container">
      <div className="page-header">
        <div className="header-left-group">
          <button className="back-btn" onClick={() => navigate("/business")}>
            <ChevronLeft size={20} />
          </button>
          <div className="header-text">
            <h1>{isEdit ? "Edit Business" : "Add New Business"}</h1>
            <p>
              {isEdit
                ? `Modifying details for Business ID: ${id}`
                : "Create a new business profile in your directory."}
            </p>
          </div>
        </div>
      </div>

      <div className="form-tabs-wrapper">
        <div className="form-tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              {activeTab === tab.id && <div className="tab-indicator" />}
            </button>
          ))}
        </div>

        <div className="tab-content-area">
          {loading ? (
            <div
              style={{
                padding: "80px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "15px",
              }}
            >
              <span>Loading business details...</span>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>

        <div className="tab-navigation-buttons">
          <button
            type="button"
            className={`btn-nav ${activeTab === tabs[0].id ? "disabled" : ""}`}
            onClick={handlePrev}
            disabled={activeTab === tabs[0].id}
          >
            <ArrowLeft size={18} /> Previous
          </button>

          {activeTab !== tabs[tabs.length - 1].id ? (
            <button type="button" className="btn-nav next" onClick={handleNext}>
              Next <ArrowRight size={18} />
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessForm;
