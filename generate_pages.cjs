const fs = require("fs");
const path = require("path");

const pagesDir = path.join(__dirname, "src", "pages");
const componentsDir = path.join(__dirname, "src", "components");

// Copy UI components if they don't exist, but we must follow Millets-Admin style.
// Since Millets-Admin uses standard CSS, we'll write React files using those CSS classes.

const usersJsx = `
import React, { useState, useEffect } from "react";
import { Search, Filter, UserPlus, Eye, Edit2, Trash2, Shield, ChevronLeft, ChevronRight, X } from "lucide-react";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./Users.css"; // Reuse existing css

const TradizionsUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Assuming APIROUTES.GETALLUSERS is added
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

  const filteredUsers = users.filter((u) =>
    (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="users-mgmt-container">
      <div className="page-header">
        <div className="header-text">
          <h1>User List (Tradizions)</h1>
          <p>Manage your platform administrators and customer accounts.</p>
        </div>
      </div>

      <div className="table-card section-card">
        <div className="table-filters-row">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by Name or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive thin-scrollbar">
          <table className="users-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Profile</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, i) => (
                <tr key={i} className="user-row">
                  <td><span className="user-id-tag">{user.userid || i + 1}</span></td>
                  <td>
                    <div className="profile-cell">
                      <div className="avatar">{(user.username || "U").charAt(0)}</div>
                      <span className="name">{user.username || "—"}</span>
                    </div>
                  </td>
                  <td><span className="email-text">{user.email || "—"}</span></td>
                  <td><span className="phone-text">{user.phone || "—"}</span></td>
                  <td><span className="date-text">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</span></td>
                </tr>
              ))}
              {filteredUsers.length === 0 && !isLoading && (
                <tr><td colSpan="5" style={{textAlign:"center", padding:"20px"}}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default TradizionsUsers;
`;

const contactsJsx = `
import React, { useState, useEffect } from "react";
import { Search, Eye, Trash2, X, MessageCircle, Mail, Phone, User, Calendar } from "lucide-react";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./Contact.css"; // Reuse existing css

const TradizionsContacts = () => {
  const [inquiries, setInquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailDrawer, setShowDetailDrawer] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

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
        } catch (e) {
            console.error(e);
        }
    }
  };

  const filteredInquiries = inquiries.filter(inq =>
    (inq.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inq.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="contact-page-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Contacts (Tradizions)</h1>
          <p>Manage customer messages and inquiries.</p>
        </div>
      </div>

      <div className="table-card section-card">
        <div className="table-filters-row">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive thin-scrollbar">
          <table className="contact-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map((inq, i) => (
                <tr key={i} className="contact-row">
                  <td><span className="id-badge-text">{inq.contactid || i+1}</span></td>
                  <td><div className="name-cell"><span className="name-text">{inq.name}</span></div></td>
                  <td><span className="email-text">{inq.email}</span></td>
                  <td><span className="phone-text">{inq.phone}</span></td>
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

const goalsJsx = `
import React, { useState, useEffect } from "react";
import { Search, Eye, Trash2, X, Plus } from "lucide-react";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./Contact.css"; // Reuse table styles

const TradizionsGoals = () => {
  const [goals, setGoals] = useState([]);
  
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const endpoint = APIROUTES.GETHEALTHGOALS || "/goal/gethealth-goals";
      const res = await API.post(endpoint);
      if (res.data && res.data.statusCode === 200) {
        setGoals(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this goal?")) {
        try {
            const endpoint = APIROUTES.DELETEHEALTHGOAL || "/goal/delete-goal";
            await API.post(endpoint, { goalid: id });
            setGoals(goals.filter(g => g.goalid !== id));
        } catch (e) {
            console.error(e);
        }
    }
  };

  return (
    <div className="contact-page-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Health Goals</h1>
        </div>
      </div>
      <div className="table-card section-card">
        <div className="table-responsive thin-scrollbar">
          <table className="contact-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {goals.map((g, i) => (
                <tr key={i} className="contact-row">
                  <td><img src={g.image} alt={g.title} style={{width: 50, height: 50, objectFit: 'cover'}} /></td>
                  <td>{g.title}</td>
                  <td>{g.description}</td>
                  <td>
                    <button className="action-btn delete" onClick={() => handleDelete(g.goalid)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default TradizionsGoals;
`;

const bannersJsx = `
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import "./Contact.css";

const TradizionsBanners = () => {
  const [banners, setBanners] = useState([
    { id: 1, name: "Pongal Special", description: "Discount banners", image: "https://picsum.photos/seed/ban1/800/400", status: "Active" }
  ]);

  return (
    <div className="contact-page-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Seasonal Banners</h1>
        </div>
      </div>
      <div className="table-card section-card">
        <div className="table-responsive thin-scrollbar">
          <table className="contact-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b, i) => (
                <tr key={i} className="contact-row">
                  <td><img src={b.image} alt={b.name} style={{width: 100, height: 50, objectFit: 'cover'}} /></td>
                  <td>{b.name}</td>
                  <td>{b.description}</td>
                  <td>{b.status}</td>
                  <td>
                    <button className="action-btn delete" onClick={() => setBanners(banners.filter(x=>x.id!==b.id))}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default TradizionsBanners;
`;

const kuralsJsx = `
import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { API } from "../service/api_service";
import { APIROUTES } from "../routes/api_routes";
import "./Contact.css";

const TradizionsKural = () => {
  const [kurals, setKurals] = useState([]);

  useEffect(() => {
    fetchKurals();
  }, []);

  const fetchKurals = async () => {
    try {
      const endpoint = APIROUTES.GETKURALS || "/kural/get-kural";
      const res = await API.post(endpoint);
      if (res.data && res.data.statusCode === 200) {
        setKurals(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="contact-page-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Thinam Oru Kural</h1>
        </div>
      </div>
      <div className="table-card section-card">
        <div className="table-responsive thin-scrollbar">
          <table className="contact-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Kural</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              {kurals.map((k, i) => (
                <tr key={i} className="contact-row">
                  <td>{k.kuralid || i+1}</td>
                  <td>{k.kural}</td>
                  <td>{k.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
fs.writeFileSync(path.join(pagesDir, "TradizionsKural.jsx"), kuralsJsx);

console.log("Pages generated successfully.");
