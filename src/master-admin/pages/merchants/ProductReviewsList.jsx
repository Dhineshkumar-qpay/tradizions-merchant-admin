import React, { useState, useEffect } from "react";
import {
  Star,
  Search,
  Loader2,
  Calendar,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";
import "../../../pages/ListProducts.css"; // Ensure exact style matching

const ProductReviewsList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBid, setSelectedBid] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectCount, setSelectCount] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all businesses on component mount
  useEffect(() => {
    const fetchBusinesses = async () => {
      setIsLoadingBusinesses(true);
      try {
        const response = await API.post(APIROUTES.GETBUSINESS);
        if (response.data && response.data.statusCode === 200) {
          const list = response.data.data || [];
          setBusinesses(list);
          if (list.length > 0) {
            setSelectedBid(list[0].bid);
          }
        } else {
          toast.error(response.data?.message || "Failed to fetch businesses");
        }
      } catch (error) {
        console.error("Fetch businesses error:", error);
      } finally {
        setIsLoadingBusinesses(false);
      }
    };

    fetchBusinesses();
  }, []);

  // Fetch ratings whenever selectedBid changes
  useEffect(() => {
    const fetchRatings = async () => {
      if (!selectedBid) return;
      setIsLoadingReviews(true);
      try {
        const response = await API.post(APIROUTES.PRODUCTRATINGS, {
          bid: parseInt(selectedBid),
        });
        if (response.data && response.data.statusCode === 200) {
          setReviews(response.data.data || []);
        } else {
          toast.error(response.data?.message || "Failed to fetch ratings");
        }
      } catch (error) {
        console.error("Fetch ratings error:", error);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchRatings();
  }, [selectedBid]);

  // Handle status update via ACTIVERATINGSTATUS API using toggle switch button
  const handleStatusToggle = async (item) => {
    const toggledStatus = item.status === "active" ? "inactive" : "active";

    // Optimistically update UI
    setReviews((prev) =>
      prev.map((r) =>
        r.reviewid === item.reviewid ? { ...r, status: toggledStatus } : r,
      ),
    );

    try {
      const response = await API.post(APIROUTES.ACTIVERATINGSTATUS, {
        bid: parseInt(item.bid),
        productid: parseInt(item.productid),
        status: toggledStatus,
      });

      if (response.data && response.data.statusCode === 200) {
        toast.success(`Review status updated to ${toggledStatus}`);
      } else {
        toast.error(response.data?.message || "Failed to update review status");
        setReviews((prev) =>
          prev.map((r) =>
            r.reviewid === item.reviewid ? { ...r, status: item.status } : r,
          ),
        );
      }
    } catch (error) {
      console.error("Status toggle error:", error);
      setReviews((prev) =>
        prev.map((r) =>
          r.reviewid === item.reviewid ? { ...r, status: item.status } : r,
        ),
      );
    }
  };

  // Search filtering
  const filteredReviews = reviews.filter(
    (review) =>
      (review.name && review.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.productname && review.productname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.review && review.review.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.title && review.title.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const displayedReviews =
    selectCount === "All"
      ? filteredReviews
      : filteredReviews.slice(
          (currentPage - 1) * Number(selectCount),
          currentPage * Number(selectCount)
        );

  const totalPages = selectCount === "All" ? 1 : Math.ceil(filteredReviews.length / Number(selectCount));

  return (
    <div className="list-products-container">
      <div className="page-header-actions">
        <div>
          <h1>Product Ratings & Reviews</h1>
          <p>Select a business to view and manage customer feedback and active ratings.</p>
        </div>
        <div className="header-controls-group">
          <div className="business-filter-container">
            <span className="business-filter-label">Business:</span>
            <select
              className="form-select business-filter-select"
              value={selectedBid}
              onChange={(e) => {
                setSelectedBid(e.target.value);
                setCurrentPage(1);
              }}
              disabled={isLoadingBusinesses}
            >
              {isLoadingBusinesses ? (
                <option>Loading businesses...</option>
              ) : businesses.length === 0 ? (
                <option>No businesses available</option>
              ) : (
                businesses.map((b) => (
                  <option key={b.bid} value={b.bid}>
                    {b.businessname || `Business #${b.bid}`}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="table-wrapper section-card">
        <div
          className="table-controls"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 20px",
            gap: "15px",
          }}
        >
          <div className="search-box" style={{ flex: 1, maxWidth: "400px" }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div
            className="filter-item"
            style={{ display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <label
              style={{
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              Show Count
            </label>
            <select
              className="form-select"
              value={selectCount}
              onChange={(e) => {
                setSelectCount(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                minWidth: "130px",
                fontSize: "14px",
              }}
            >
              <option value="10">10 Entries</option>
              <option value="20">20 Entries</option>
              <option value="30">30 Entries</option>
              <option value="40">40 Entries</option>
              <option value="50">50 Entries</option>
              <option value="All">All Reviews</option>
            </select>
          </div>
        </div>

        <div className="table-responsive thin-scrollbar">
          {isLoadingReviews ? (
            <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : displayedReviews.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--text-muted)",
              }}
            >
              No product ratings found.
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>Customer Details</th>
                  <th>Product Item</th>
                  <th>Rating</th>
                  <th>Feedback / Review</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedReviews.map((review, index) => (
                  <tr key={review.reviewid || index}>
                    <td>
                      {(currentPage - 1) * (selectCount === "All" ? 10 : Number(selectCount)) + index + 1}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#f0f7e9", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: "800", fontSize: "14px", textTransform: "uppercase" }}>
                          {(review.name || "U").charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "14px" }}>
                            {review.name || "Anonymous"}
                          </div>
                          {review.email && (
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                              <Mail size={12} /> {review.email}
                            </div>
                          )}
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                            <Calendar size={12} /> {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="p-cell-info">
                        <span className="p-name">{review.productname || `Product #${review.productid}`}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            style={{ color: i < (review.rating || 0) ? "var(--accent)" : "#e0e6ed", fill: i < (review.rating || 0) ? "var(--accent)" : "none" }}
                          />
                        ))}
                      </div>
                      {review.title && (
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)", marginTop: "4px", fontStyle: "italic" }}>
                          "{review.title}"
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500", lineHeight: "1.5" }}>
                        {review.review || "No written review provided."}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${review.status === "active" ? "status-active" : "status-out"}`}>
                        {review.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          onClick={() => handleStatusToggle(review)}
                          style={{
                            position: "relative",
                            display: "inline-flex",
                            height: "24px",
                            width: "44px",
                            flexShrink: 0,
                            cursor: "pointer",
                            borderRadius: "9999px",
                            border: "none",
                            transition: "background-color 0.2s",
                            backgroundColor: review.status === "active" ? "var(--primary)" : "#e5e7eb",
                          }}
                        >
                          <span
                            style={{
                              pointerEvents: "none",
                              display: "inline-block",
                              height: "20px",
                              width: "20px",
                              borderRadius: "50%",
                              backgroundColor: "white",
                              transform: review.status === "active" ? "translateX(20px)" : "translateX(2px)",
                              transition: "transform 0.2s",
                              marginTop: "2px"
                            }}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="pagination-footer">
          <p>
            Showing <strong>{displayedReviews.length}</strong> of{" "}
            <strong>{filteredReviews.length}</strong> reviews
          </p>
          <div className="page-controls">
            <button
              className="btn-page"
              disabled={currentPage === 1 || selectCount === "All"}
              onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
            >
              <ChevronLeft size={18} />
            </button>
            <button className="btn-page active">{currentPage}</button>
            <button
              className="btn-page"
              disabled={currentPage === totalPages || selectCount === "All"}
              onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReviewsList;
