const fs = require("fs");
const path = require("path");

const pagesDir = path.join(__dirname, "src", "pages");

// Common Pagination string
const paginationCode = `
          {totalPages > 0 && (
            <div className="pagination-footer">
              <div className="rows-count-selector">
                <span>Show</span>
                <select
                  className="items-per-page-dropdown"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
              </div>
              <p>
                Showing <strong>{filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to{" "}
                <strong>{Math.min(currentPage * itemsPerPage, filteredData.length)}</strong> of <strong>{filteredData.length}</strong> entries
              </p>
              <div className="page-controls">
                <button className="btn-page" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={18} /></button>
                <button className="btn-page active">{currentPage}</button>
                <button className="btn-page" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={18} /></button>
              </div>
            </div>
          )}
`;

const usersJsx = `import React, { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./Subcategories.css"; 
import "./Users.css";

const TradizionsUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const endpoint = APIROUTES.GETALLUSERS || "/admin/getallusers";
      const response = await API.post(endpoint);
      if (response.data && response.data.statusCode === 200) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = users.filter((u) =>
    (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="subcat-mgmt-container users-mgmt-container">
      <div className="page-header">
        <div className="header-text">
          <h1>User List (Tradizions)</h1>
          <p>Manage your platform administrators and customer accounts.</p>
        </div>
      </div>

      <div className="subcat-dashboard-grid vertical-stack">
        <div className="table-card section-card full-width-card">
          <div className="table-filters subcat-filters">
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search by Name or Email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="table-responsive thin-scrollbar">
            <table className="category-table subcat-table users-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Profile</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((user, i) => (
                  <tr key={i} className="user-row">
                    <td><span className="user-id-tag">{(currentPage - 1) * itemsPerPage + i + 1}</span></td>
                    <td>
                      <div className="profile-cell">
                        <span className="name">{user.username || "—"}</span>
                        <span className="order-name" style={{fontSize:'12px', color:'#888'}}>{user.ordercount || "0"} Orders</span>
                      </div>
                    </td>
                    <td><span className="email-text">{user.email || "—"}</span></td>
                    <td><span className="phone-text">{user.phone || "—"}</span></td>
                    <td><span className="date-text">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</span></td>
                  </tr>
                ))}
                {paginatedData.length === 0 && !isLoading && (
                  <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
${paginationCode}
        </div>
      </div>
    </div>
  );
};
export default TradizionsUsers;
`;

const contactsJsx = `import React, { useState, useEffect } from "react";
import { Search, Eye, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./Subcategories.css";
import "./Contact.css";

const TradizionsContacts = () => {
  const [inquiries, setInquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailDrawer, setShowDetailDrawer] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      const endpoint = APIROUTES.GETCONTACTS || "/contact/get-contacts";
      const res = await API.post(endpoint, { type: "normal" });
      if (res.data && res.data.statusCode === 200) {
        setInquiries(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this contact?")) {
        try {
            const endpoint = APIROUTES.DELETECONTACT || "/delete-contactus";
            await API.post(endpoint, { contactid: id });
            setInquiries(inquiries.filter(i => i.contactid !== id));
        } catch (e) { console.error(e); }
    }
  };

  const filteredData = inquiries.filter(inq =>
    (inq.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inq.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="subcat-mgmt-container contact-page-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Contacts (Tradizions)</h1>
          <p>Manage customer messages and inquiries.</p>
        </div>
      </div>

      <div className="subcat-dashboard-grid vertical-stack">
        <div className="table-card section-card full-width-card">
          <div className="table-filters subcat-filters">
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="table-responsive thin-scrollbar">
            <table className="category-table subcat-table contact-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((inq, i) => (
                  <tr key={i} className="contact-row">
                    <td><span className="id-badge-text">{(currentPage - 1) * itemsPerPage + i + 1}</span></td>
                    <td><div className="name-cell"><span className="name-text">{inq.name}</span></div></td>
                    <td><span className="email-text">{inq.email}</span></td>
                    <td><span className="phone-text">{inq.phone}</span></td>
                    <td><span className="description-text">{inq.description}</span></td>
                    <td><span className="date-text">{inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : "—"}</span></td>
                    <td>
                      <div className="action-cell">
                        <button className="action-btn view" onClick={() => setShowDetailDrawer(inq)}><Eye size={16} /></button>
                        <button className="action-btn delete" onClick={() => handleDelete(inq.contactid)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
${paginationCode}
        </div>
      </div>
      
      {showDetailDrawer && (
        <div className="modal-overlay" onClick={() => setShowDetailDrawer(null)}>
          <div className="modal-drawer slide-left" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="header-title"><h2>Inquiry Details</h2></div>
              <button className="close-btn" onClick={() => setShowDetailDrawer(null)}><X size={20} /></button>
            </div>
            <div className="drawer-content" style={{padding: '20px'}}>
               <p><strong>Name:</strong> {showDetailDrawer.name}</p>
               <p><strong>Email:</strong> {showDetailDrawer.email}</p>
               <p><strong>Phone:</strong> {showDetailDrawer.phone}</p>
               <p><strong>Message:</strong> {showDetailDrawer.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TradizionsContacts;
`;

const goalsJsx = `import React, { useState, useEffect } from "react";
import { Search, Trash2, Plus, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./Subcategories.css";

const TradizionsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({ goalname: "", description: "", goalimage: null });
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    try {
      const res = await API.post(APIROUTES.GETHEALTHGOALS || "/goal/gethealth-goals");
      if (res.data && res.data.statusCode === 200) { setGoals(res.data.data || []); }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this health goal?")) {
      try {
        await API.post(APIROUTES.DELETEHEALTHGOAL || "/goal/delete-goal", { goalid: id });
        setGoals(goals.filter(g => g.goalid !== id));
      } catch (e) { console.error(e); }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("goalname", formData.goalname);
      data.append("description", formData.description);
      if (formData.goalimage) data.append("goalimage", formData.goalimage);
      
      await API.post(APIROUTES.ADDHEALTHGOAL || "/goal/addhealth-goal", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFormData({ goalname: "", description: "", goalimage: null });
      fetchGoals();
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const filteredData = goals.filter(g => (g.goalname || "").toLowerCase().includes(searchTerm.toLowerCase()));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="subcat-mgmt-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Health Goals</h1>
          <p>Manage health goals and their details.</p>
        </div>
      </div>

      <div className="subcat-dashboard-grid vertical-stack">
        {/* Form ABOVE */}
        <div className="form-card section-card full-width-card">
          <div className="card-header-premium">
            <Plus size={18} />
            <h2>Create Health Goal</h2>
          </div>
          <form onSubmit={handleAddSubmit} className="subcategory-form-panel">
            <div className="subcategory-horizontal-form" style={{flexWrap: 'wrap'}}>
              <div className="form-group-custom">
                <label>Goal Name *</label>
                <input type="text" placeholder="e.g. Weight Loss" required value={formData.goalname} onChange={e => setFormData({...formData, goalname: e.target.value})} />
              </div>
              <div className="form-group-custom" style={{flex: 2}}>
                <label>Description *</label>
                <input type="text" placeholder="Enter description..." required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="form-group-custom">
                <label>Goal Image</label>
                <input type="file" onChange={e => setFormData({...formData, goalimage: e.target.files[0]})} />
              </div>
              <button type="submit" className="btn-primary form-grid-submit" disabled={loading}>
                <Save size={16} />
                <span>{loading ? "SAVING..." : "ADD GOAL"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Table BELOW */}
        <div className="table-card section-card full-width-card">
          <div className="table-filters subcat-filters">
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search goals..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="table-responsive thin-scrollbar">
            <table className="category-table subcat-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Image</th>
                  <th>Goal Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((g, i) => (
                  <tr key={g.goalid || i}>
                    <td><span className="id-badge-text">{(currentPage - 1) * itemsPerPage + i + 1}</span></td>
                    <td>
                      {g.goalimage ? (
                        <img src={process.env.NEXT_PUBLIC_IMAGE_URL ? process.env.NEXT_PUBLIC_IMAGE_URL + g.goalimage : g.goalimage} alt={g.goalname} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '8px' }} />
                      ) : ( <div style={{width: 50, height: 50, backgroundColor: '#eee', borderRadius: '8px'}} /> )}
                    </td>
                    <td><span className="name-text">{g.goalname}</span></td>
                    <td><span style={{fontSize: '13px', color: '#666'}}>{g.description}</span></td>
                    <td>
                      <div className="action-cell">
                        <button className="action-btn delete" onClick={() => handleDelete(g.goalid)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
${paginationCode}
        </div>
      </div>
    </div>
  );
};
export default TradizionsGoals;
`;

const bannersJsx = `import React, { useState, useEffect } from "react";
import { Search, Trash2, Plus, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./Subcategories.css";

const TradizionsBanners = () => {
  const [banners, setBanners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({ bannername: "", description: "", bannerimage: null });
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    try {
      const res = await API.post(APIROUTES.GETALLBANNER || "/banner/get-all-banner");
      if (res.data && res.data.statusCode === 200) { setBanners(res.data.data || []); }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this banner?")) {
      try {
        await API.post(APIROUTES.DELETEBANNER || "/banner/delete-banner", { bannerid: id });
        setBanners(banners.filter(b => b.bannerid !== id));
      } catch (e) { console.error(e); }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("bannername", formData.bannername);
      data.append("description", formData.description);
      if (formData.bannerimage) data.append("bannerimage", formData.bannerimage);
      
      await API.post(APIROUTES.ADDBANNER || "/banner/addbanner", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFormData({ bannername: "", description: "", bannerimage: null });
      fetchBanners();
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const filteredData = banners.filter(b => (b.bannername || "").toLowerCase().includes(searchTerm.toLowerCase()));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="subcat-mgmt-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Seasonal Banners</h1>
          <p>Manage seasonal promotional banners.</p>
        </div>
      </div>

      <div className="subcat-dashboard-grid vertical-stack">
        <div className="form-card section-card full-width-card">
          <div className="card-header-premium">
            <Plus size={18} />
            <h2>Create Banner</h2>
          </div>
          <form onSubmit={handleAddSubmit} className="subcategory-form-panel">
            <div className="subcategory-horizontal-form" style={{flexWrap: 'wrap'}}>
              <div className="form-group-custom">
                <label>Banner Name *</label>
                <input type="text" required value={formData.bannername} onChange={e => setFormData({...formData, bannername: e.target.value})} placeholder="e.g. Pongal Offer" />
              </div>
              <div className="form-group-custom" style={{flex: 2}}>
                <label>Description *</label>
                <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Enter description..." />
              </div>
              <div className="form-group-custom">
                <label>Banner Image *</label>
                <input type="file" required onChange={e => setFormData({...formData, bannerimage: e.target.files[0]})} />
              </div>
              <button type="submit" className="btn-primary form-grid-submit" disabled={loading}>
                <Save size={16} />
                <span>{loading ? "SAVING..." : "ADD BANNER"}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="table-card section-card full-width-card">
          <div className="table-filters subcat-filters">
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search banners..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="table-responsive thin-scrollbar">
            <table className="category-table subcat-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Image</th>
                  <th>Banner Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((b, i) => (
                  <tr key={b.bannerid || i}>
                    <td><span className="id-badge-text">{(currentPage - 1) * itemsPerPage + i + 1}</span></td>
                    <td>
                      {b.bannerimage ? (
                        <img src={process.env.NEXT_PUBLIC_IMAGE_URL ? process.env.NEXT_PUBLIC_IMAGE_URL + b.bannerimage : b.bannerimage} alt={b.bannername} style={{ width: 100, height: 50, objectFit: 'cover', borderRadius: '8px' }} />
                      ) : ( <div style={{width: 100, height: 50, backgroundColor: '#eee', borderRadius: '8px'}} /> )}
                    </td>
                    <td><span className="name-text">{b.bannername}</span></td>
                    <td><span style={{fontSize: '13px', color: '#666'}}>{b.description}</span></td>
                    <td>
                      <div className="action-cell">
                        <button className="action-btn delete" onClick={() => handleDelete(b.bannerid)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
${paginationCode}
        </div>
      </div>
    </div>
  );
};
export default TradizionsBanners;
`;

const kuralJsx = `import React, { useState, useEffect } from "react";
import { Search, Upload, ChevronLeft, ChevronRight, Plus, Save } from "lucide-react";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./Subcategories.css";

const TradizionsKural = () => {
  const [kurals, setKurals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [jsonFile, setJsonFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => { fetchKurals(); }, []);

  const fetchKurals = async () => {
    try {
      const res = await API.post(APIROUTES.GETKURALS || "/kural/get-kural");
      if (res.data && res.data.statusCode === 200) { setKurals(res.data.data || []); }
    } catch (error) { console.error(error); }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!jsonFile) return alert("Please select a JSON file.");
    setLoading(true);
    try {
      const data = new FormData();
      data.append("kurals", jsonFile);
      
      await API.post(APIROUTES.ADDKURAL || "/kural/add-kural", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setJsonFile(null);
      e.target.reset();
      fetchKurals();
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const filteredData = kurals.filter(k => 
    (k.kural || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (k.meaning || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="subcat-mgmt-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Thinam Oru Kural</h1>
          <p>Upload JSON and view daily kurals.</p>
        </div>
      </div>

      <div className="subcat-dashboard-grid vertical-stack">
        <div className="form-card section-card full-width-card">
          <div className="card-header-premium">
            <Upload size={18} />
            <h2>Upload JSON Data</h2>
          </div>
          <form onSubmit={handleAddSubmit} className="subcategory-form-panel">
            <div className="subcategory-horizontal-form">
              <div className="form-group-custom" style={{flex: 1}}>
                <label>JSON File (kurals) *</label>
                <input type="file" accept=".json" required onChange={e => setJsonFile(e.target.files[0])} />
                <span style={{fontSize:'11px', color:'#888', marginTop:'4px', display:'block'}}>Only .json format is allowed.</span>
              </div>
              <button type="submit" className="btn-primary form-grid-submit" disabled={loading}>
                <Save size={16} />
                <span>{loading ? "UPLOADING..." : "UPLOAD KURAL"}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="table-card section-card full-width-card">
          <div className="table-filters subcat-filters">
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search kurals..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="table-responsive thin-scrollbar">
            <table className="category-table subcat-table">
              <thead>
                <tr>
                  <th style={{width: '60px'}}>S.No</th>
                  <th>Kural</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((k, i) => (
                  <tr key={k.kuralid || i}>
                    <td><span className="id-badge-text">{(currentPage - 1) * itemsPerPage + i + 1}</span></td>
                    <td><span className="name-text" style={{whiteSpace: 'pre-line'}}>{k.kural}</span></td>
                    <td><span style={{fontSize: '13px', color: '#666', whiteSpace: 'pre-line'}}>{k.meaning}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
${paginationCode}
        </div>
      </div>
    </div>
  );
};
export default TradizionsKural;
`;

fs.writeFileSync(path.join(pagesDir, "TradizionsUsers.jsx"), usersJsx);
fs.writeFileSync(path.join(pagesDir, "TradizionsContacts.jsx"), contactsJsx);
fs.writeFileSync(path.join(pagesDir, "TradizionsGoals.jsx"), goalsJsx);
fs.writeFileSync(path.join(pagesDir, "TradizionsBanners.jsx"), bannersJsx);
fs.writeFileSync(path.join(pagesDir, "TradizionsKural.jsx"), kuralJsx);

console.log("Pages regenerated successfully with Subcategory style.");
