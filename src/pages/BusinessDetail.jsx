import React from "react";
import {
  ChevronLeft,
  Save,
  Building,
  User,
  MapPin,
  ShieldCheck,
  CreditCard,
  Phone,
  Mail,
  Store,
  FileText,
  Clock,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import "./BusinessDetail.css";

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="business-detail-container">
      <div className="breadcrumb">
        <span>Catalog</span>
        <ChevronLeft
          size={14}
          style={{ transform: "rotate(180deg)", margin: "0 8px" }}
        />
        <span>Business</span>
        <ChevronLeft
          size={14}
          style={{ transform: "rotate(180deg)", margin: "0 8px" }}
        />
        <span className="current">{id || "Register New"}</span>
      </div>

      <div className="page-header-actions">
        <div className="header-title-group">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1>{id ? "Business Profile" : "Register Business"}</h1>
            <p>Complete documentation for institutional verification.</p>
          </div>
        </div>
        <div className="btn-group">
          <button className="btn-secondary">Discard Changes</button>
          <button className="btn-primary">
            <Save size={18} />
            <span>Save Business Data</span>
          </button>
        </div>
      </div>

      <div className="detail-form-layout">
        <div className="form-main-content">
          {/* Basic Details */}
          <section className="form-section-card">
            <div className="section-header">
              <User size={20} />
              <h3>Basic Information</h3>
            </div>
            <div className="form-grid">
              <div className="input-field">
                <label>Owner Full Name</label>
                <input
                  type="text"
                  placeholder="Enter owner name"
                  defaultValue="Ramesh Kumar"
                />
              </div>
              <div className="input-field">
                <label>Business / Legal Name</label>
                <input
                  type="text"
                  placeholder="Enter legal business name"
                  defaultValue="Organic Millets Farm"
                />
              </div>
              <div className="input-field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="contact@business.com"
                  defaultValue="ramesh@organicfarm.com"
                />
              </div>
              <div className="input-field">
                <label>Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 XXXXX XXXXX"
                  defaultValue="+91 98765 43210"
                />
              </div>
            </div>
          </section>

          {/* Shop Details */}
          <section className="form-section-card">
            <div className="section-header">
              <Store size={20} />
              <h3>Shop Details</h3>
            </div>
            <div className="form-grid">
              <div className="input-field">
                <label>Shop Name (Display Name)</label>
                <input
                  type="text"
                  placeholder="Enter shop name"
                  defaultValue="Millets Farm Store"
                />
              </div>
              <div className="input-field">
                <label>Business Type</label>
                <select defaultValue="Wholesale">
                  <option>Retail</option>
                  <option>Wholesale</option>
                  <option>Manufacturer</option>
                </select>
              </div>
              <div className="input-field full">
                <label>Business Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe the business offerings..."
                ></textarea>
              </div>
              <div className="input-field">
                <label>Opening Hours</label>
                <div className="flex-inputs">
                  <input type="time" defaultValue="09:00" />
                  <span>to</span>
                  <input type="time" defaultValue="21:00" />
                </div>
              </div>
              <div className="input-field">
                <label>GST Number (Optional)</label>
                <input type="text" placeholder="22AAAAA0000A1Z5" />
              </div>
            </div>
          </section>

          {/* Address Details */}
          <section className="form-section-card">
            <div className="section-header">
              <MapPin size={20} />
              <h3>Address Information</h3>
            </div>
            <div className="form-grid">
              <div className="input-field full">
                <label>Street Address</label>
                <input
                  type="text"
                  placeholder="Shop No, Building, Street"
                  defaultValue="No 42, Green Valley Street"
                />
              </div>
              <div className="input-field">
                <label>City</label>
                <input type="text" placeholder="City" defaultValue="Salem" />
              </div>
              <div className="input-field">
                <label>State</label>
                <input
                  type="text"
                  placeholder="State"
                  defaultValue="Tamil Nadu"
                />
              </div>
              <div className="input-field">
                <label>Pincode</label>
                <input type="text" placeholder="636001" defaultValue="636005" />
              </div>
              <div className="input-field">
                <label>Country</label>
                <input
                  type="text"
                  placeholder="India"
                  defaultValue="India"
                  readOnly
                />
              </div>
            </div>
          </section>
        </div>

        <div className="form-side-content">
          {/* KYC Verification */}
          <section className="form-section-card high-priority">
            <div className="section-header">
              <ShieldCheck size={20} />
              <h3>KYC Verification</h3>
            </div>
            <div className="stack-fields">
              <div className="input-field">
                <label>PAN Number</label>
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  className="uppercase"
                />
              </div>
              <div className="input-field">
                <label>Aadhaar Number</label>
                <input type="text" placeholder="XXXX XXXX XXXX" />
              </div>
              <div className="file-upload-box">
                <FileText size={24} />
                <p>Upload Identity Proof</p>
                <span>PDF, JPG or PNG (Max 2MB)</span>
              </div>
              <div className="verification-status">
                <div className="dot pulse shadow-pending"></div>
                <span>Verification in Progress</span>
              </div>
            </div>
          </section>

          {/* Bank Details */}
          <section className="form-section-card">
            <div className="section-header">
              <CreditCard size={20} />
              <h3>Bank Information</h3>
            </div>
            <div className="stack-fields">
              <div className="input-field">
                <label>Account Holder Name</label>
                <input type="text" placeholder="Name as per Passbook" />
              </div>
              <div className="input-field">
                <label>Bank Name</label>
                <input type="text" placeholder="e.g., HDFC Bank" />
              </div>
              <div className="input-field">
                <label>Account Number</label>
                <input type="password" placeholder="••••••••••••" />
              </div>
              <div className="input-field">
                <label>IFSC Code</label>
                <input
                  type="text"
                  placeholder="HDFC0001234"
                  className="uppercase"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetail;
