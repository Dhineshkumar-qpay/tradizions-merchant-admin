import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Edit2,
  Store,
  User,
  MapPin,
  ShieldCheck,
  CreditCard,
  Clock,
  Image as ImageIcon,
  FileText,
  Briefcase,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import "./Business.css";
import { API } from "../../service/api_service";
import { APIROUTES } from "../../routes/api_routes";

const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [biz, setBiz] = useState({
    id: id,
    basic: {
      owner: "",
      designation: "",
      mobile: "",
      whatsapp: "",
      email: "",
    },
    shop: {
      name: "Loading...",
      legalName: "",
      description: "",
      category: "General",
      openTime: "",
      closeTime: "",
      image: null,
    },
    address: {
      line: "",
      landmark: "",
      city: "",
      district: "",
      state: "",
      country: "",
      pincode: "",
    },
    bank: {
      holder: "",
      account: "",
      name: "",
      branch: "",
      ifsc: "",
      cheque: null,
    },
  });

  useEffect(() => {
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

        setBiz({
          id: id,
          basic: {
            owner: basic.ownername || "N/A",
            designation: basic.designation || "N/A",
            mobile: basic.mobile || "N/A",
            whatsapp: basic.whatsapp || "N/A",
            email: basic.email || "N/A",
          },
          shop: {
            name: shop.businessname || "Unnamed Business",
            legalName: shop.legalbusinessname || "N/A",
            description: shop.description || "No description provided.",
            category: "General",
            openTime: shop.opentime || "N/A",
            closeTime: shop.closetime || "N/A",
            image: shop.businessimage || null,
          },
          address: {
            line: address.addressline || "N/A",
            landmark: address.landmark || "N/A",
            city: address.city || "N/A",
            district: address.district || "N/A",
            state: address.state || "N/A",
            country: address.country || "N/A",
            pincode: address.pincode || "N/A",
          },
          bank: {
            holder: bank.accountholdername || "N/A",
            account: bank.accountnumber || "N/A",
            name: bank.bankname || "N/A",
            branch: bank.branchname || "N/A",
            ifsc: bank.ifsc || "N/A",
            cheque: bank.passbook || null,
          },
        });
      } catch (error) {
        console.error("Error loading business details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBusinessData();
  }, [id]);

  const getBusinessImageUrl = () => {
    if (!biz.shop.image) return "";
    if (biz.shop.image.startsWith("http")) return biz.shop.image;
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}${biz.shop.image}`;
  };

  const getPassbookImageUrl = () => {
    if (!biz.bank.cheque) return "";
    if (biz.bank.cheque.startsWith("http")) return biz.bank.cheque;
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}${biz.bank.cheque}`;
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "100px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "16px",
        }}
      >
        <span>Loading business details...</span>
      </div>
    );
  }

  return (
    <div className="business-details-container">
      <div className="page-header">
        <div className="header-left-group">
          <button className="back-btn" onClick={() => navigate("/business")}>
            <ChevronLeft size={20} />
          </button>
          <div className="header-text">
            <div className="title-row">
              <h1>{biz.shop.name}</h1>
            </div>
            <p>Business ID: {biz.id}</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => navigate(`/business/edit/${biz.id}`)}
          >
            <Edit2 size={18} /> Edit Business
          </button>
        </div>
      </div>

      <div className="details-grid">
        {/* Section 1: Basic Details */}
        <div className="detail-card">
          <div className="card-header">
            <User size={18} />
            <h3>Basic Details</h3>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Owner Name</span>
                <span className="value">{biz.basic.owner}</span>
              </div>
              <div className="info-item">
                <span className="label">Designation</span>
                <span className="value">{biz.basic.designation}</span>
              </div>
              <div className="info-item">
                <span className="label">Mobile Number</span>
                <span className="value">{biz.basic.mobile}</span>
              </div>
              <div className="info-item">
                <span className="label">Whatsapp Number</span>
                <span className="value">{biz.basic.whatsapp}</span>
              </div>
              <div className="info-item full">
                <span className="label">Email Id</span>
                <span className="value">{biz.basic.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Shop Details */}
        <div className="detail-card">
          <div className="card-header">
            <Store size={18} />
            <h3>Shop Details</h3>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Business Name</span>
                <span className="value">{biz.shop.name}</span>
              </div>
              <div className="info-item">
                <span className="label">Legal Business Name</span>
                <span className="value">{biz.shop.legalName}</span>
              </div>
              <div className="info-item full">
                <span className="label">Business Description</span>
                <span className="value">{biz.shop.description}</span>
              </div>
              <div className="info-item">
                <span className="label">Business Category</span>
                <span className="value">{biz.shop.category}</span>
              </div>
              <div className="info-item">
                <span className="label">Opening Time</span>
                <span className="value">
                  <Clock size={12} style={{ marginRight: "5px" }} />{" "}
                  {biz.shop.openTime}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Closing Time</span>
                <span className="value">
                  <Clock size={12} style={{ marginRight: "5px" }} />{" "}
                  {biz.shop.closeTime}
                </span>
              </div>
              <div className="info-item full">
                <span className="label">Business Image</span>
                {biz.shop.image ? (
                  <div
                    style={{
                      marginTop: "10px",
                      maxWidth: "200px",
                      height: "120px",
                      overflow: "hidden",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <img
                      src={getBusinessImageUrl()}
                      alt="Business logo"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="img-placeholder"
                    style={{
                      maxWidth: "200px",
                      height: "120px",
                      marginTop: "10px",
                    }}
                  >
                    <ImageIcon size={20} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Address Details */}
        <div className="detail-card">
          <div className="card-header">
            <MapPin size={18} />
            <h3>Address Details</h3>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-item full">
                <span className="label">Address Line</span>
                <span
                  className="value"
                  style={{ display: "block", whiteSpace: "pre-wrap" }}
                >
                  {biz.address.line}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Landmark</span>
                <span className="value">{biz.address.landmark}</span>
              </div>
              <div className="info-item">
                <span className="label">City</span>
                <span className="value">{biz.address.city}</span>
              </div>
              <div className="info-item">
                <span className="label">District</span>
                <span className="value">{biz.address.district}</span>
              </div>
              <div className="info-item">
                <span className="label">State</span>
                <span className="value">{biz.address.state}</span>
              </div>
              <div className="info-item">
                <span className="label">Country</span>
                <span className="value">{biz.address.country}</span>
              </div>
              <div className="info-item">
                <span className="label">Pincode</span>
                <span className="value">{biz.address.pincode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Bank Details */}
        <div className="detail-card full-width">
          <div className="card-header">
            <CreditCard size={18} />
            <h3>Bank Details</h3>
          </div>
          <div className="card-body">
            <div className="info-grid bank-info-grid">
              <div className="info-item">
                <span className="label">Account Holder Name</span>
                <span className="value">{biz.bank.holder}</span>
              </div>
              <div className="info-item">
                <span className="label">Account Number</span>
                <span className="value">{biz.bank.account}</span>
              </div>
              <div className="info-item">
                <span className="label">Bank Name</span>
                <span className="value">{biz.bank.name}</span>
              </div>
              <div className="info-item">
                <span className="label">Branch Name</span>
                <span className="value">{biz.bank.branch}</span>
              </div>
              <div className="info-item">
                <span className="label">IFSC Code</span>
                <span className="value" style={{ textTransform: "uppercase" }}>
                  {biz.bank.ifsc}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Proof (Cheque/Passbook)</span>
                {biz.bank.cheque ? (
                  <div
                    style={{
                      marginTop: "10px",
                      maxWidth: "200px",
                      height: "120px",
                      overflow: "hidden",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <img
                      src={getPassbookImageUrl()}
                      alt="Bank proof"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="img-placeholder"
                    style={{ height: "50px", marginTop: "10px" }}
                  >
                    <FileText size={16} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;
