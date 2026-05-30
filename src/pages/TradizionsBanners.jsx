import React, { useState, useEffect } from "react";
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
      const res = await API.post(APIROUTES.GETALLBANNER);
      log("Banners fetched:", res.data);
      if (res.data && res.data.statusCode === 200) { setBanners(res.data.data || []); }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this banner?")) {
      try {
        await API.post(APIROUTES.DELETEBANNER, { bannerid: id });
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

      await API.post(APIROUTES.ADDBANNER, data);
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
            <div className="subcategory-horizontal-form" style={{ flexWrap: 'wrap' }}>
              <div className="form-group-custom">
                <label>Banner Name *</label>
                <input type="text" required value={formData.bannername} onChange={e => setFormData({ ...formData, bannername: e.target.value })} placeholder="e.g. Pongal Offer" />
              </div>
              <div className="form-group-custom" style={{ flex: 2 }}>
                <label>Description *</label>
                <input type="text" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Enter description..." />
              </div>
              <div className="form-group-custom">
                <label>Banner Image *</label>
                <input type="file" required onChange={e => setFormData({ ...formData, bannerimage: e.target.files[0] })} />
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
                      ) : (<div style={{ width: 100, height: 50, backgroundColor: '#eee', borderRadius: '8px' }} />)}
                    </td>
                    <td><span className="name-text">{b.bannername}</span></td>
                    <td><span style={{ fontSize: '13px', color: '#666' }}>{b.description}</span></td>
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

        </div>
      </div>
    </div>
  );
};
export default TradizionsBanners;
