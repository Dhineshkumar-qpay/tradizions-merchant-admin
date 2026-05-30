import React, { useState, useEffect } from "react";
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
      const res = await API.post(APIROUTES.GETKURALS);
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

      await API.post(APIROUTES.ADDKURAL, data);
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
              <div className="form-group-custom" style={{ flex: 1 }}>
                <label>JSON File (kurals) *</label>
                <input type="file" accept=".json" required onChange={e => setJsonFile(e.target.files[0])} />
                <span style={{ fontSize: '11px', color: '#888', marginTop: '4px', display: 'block' }}>Only .json format is allowed.</span>
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
                  <th style={{ width: '60px' }}>S.No</th>
                  <th>Kural</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((k, i) => (
                  <tr key={k.kuralid || i}>
                    <td><span className="id-badge-text">{(currentPage - 1) * itemsPerPage + i + 1}</span></td>
                    <td><span className="name-text" style={{ whiteSpace: 'pre-line' }}>{k.kural}</span></td>
                    <td><span style={{ fontSize: '13px', color: '#666', whiteSpace: 'pre-line' }}>{k.meaning}</span></td>
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
                  <option value={30}>30</option>
                  <option value={40}>40</option>
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
export default TradizionsKural;
