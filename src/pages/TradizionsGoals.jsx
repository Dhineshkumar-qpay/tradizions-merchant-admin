import React, { useState, useEffect } from "react";
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
      
      await API.post(APIROUTES.ADDHEALTHGOAL || "/goal/addhealth-goal", data);
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
export default TradizionsGoals;
