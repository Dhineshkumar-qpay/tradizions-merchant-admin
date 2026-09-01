import React, { useState, useEffect } from "react";
import { Star, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";
import "../../../pages/ListProducts.css";

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectCount, setSelectCount] = useState("10");

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await API.post(APIROUTES.GETALLREVIEWS);
      if (response.data && response.data.statusCode === 200) {
        setReviews(response.data.data || []);
      } else {
        toast.error(response.data?.message || "Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const paginatedReviews = selectCount === "All"
    ? reviews
    : reviews.slice(
        (currentPage - 1) * Number(selectCount),
        currentPage * Number(selectCount),
      );

  const totalPages = selectCount === "All" ? 1 : Math.ceil(reviews.length / Number(selectCount));

  const toggleStatus = async (reviewid, currentIsActive) => {
    const newIsActive = !currentIsActive;
    try {
      setReviews((prev) =>
        prev.map((r) =>
          r.reviewid === reviewid ? { ...r, isActive: newIsActive } : r,
        ),
      );

      const response = await API.post(APIROUTES.ACTIVEREVIEW, {
        reviewid,
        isActive: newIsActive,
      });

      if (response.data && response.data.statusCode === 200) {
        toast.success(response.data.message || `Review status updated`);
      } else {
        setReviews((prev) =>
          prev.map((r) =>
            r.reviewid === reviewid ? { ...r, isActive: currentIsActive } : r,
          ),
        );
        toast.error(response.data?.message || "Failed to update review status");
      }
    } catch (error) {
      console.error("Toggle review status error:", error);
      setReviews((prev) =>
        prev.map((r) =>
          r.reviewid === reviewid ? { ...r, isActive: currentIsActive } : r,
        ),
      );
      toast.error("Error updating review status");
    }
  };

  const handleDelete = async (reviewid, username) => {
    if (!window.confirm(`Are you sure you want to delete review by ${username || "this user"}?`)) return;

    try {
      const response = await API.post(APIROUTES.DELETEREVIEW, { reviewid });
      if (response.data && response.data.statusCode === 200) {
        toast.success(response.data.message || "Review deleted successfully");
        setReviews((prev) => prev.filter((r) => r.reviewid !== reviewid));
      } else {
        toast.error(response.data?.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Delete review error:", error);
      toast.error("Error deleting review");
    }
  };

  return (
    <div className="list-products-container">
      <div className="page-header-actions">
        <div>
          <h1>Website Reviews</h1>
          <p>Monitor and manage customer reviews across the platform.</p>
        </div>
      </div>

      <div className="table-wrapper section-card">
        <div className="table-controls" style={{ justifyContent: "flex-end" }}>
          <div className="filter-item" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Show Count
            </label>
            <select
              className="form-select"
              value={selectCount}
              onChange={(e) => {
                setSelectCount(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "14px" }}
            >
              <option value="10">10 Entries</option>
              <option value="20">20 Entries</option>
              <option value="50">50 Entries</option>
              <option value="All">All Reviews</option>
            </select>
          </div>
        </div>

        <div className="table-responsive thin-scrollbar">
          {isLoading ? (
            <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              No reviews found.
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>User Info</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Visibility</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReviews.map((review, index) => (
                  <tr key={review.reviewid}>
                    <td>
                      {(currentPage - 1) * (selectCount === "All" ? 10 : Number(selectCount)) + index + 1}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="table-img-placeholder" style={{ borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: "bold" }}>
                          {(review.username || "U").charAt(0)}
                        </div>
                        <div className="p-cell-info">
                          <span className="p-name">{review.username || "Anonymous"}</span>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", fontWeight: "600" }}>
                            {review.email || "No email"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            style={{
                              color: i < Math.floor(review.rating || 0) ? "var(--accent)" : "#e2e8f0",
                              fill: i < Math.floor(review.rating || 0) ? "var(--accent)" : "none"
                            }}
                          />
                        ))}
                        <span style={{ fontSize: "12px", fontWeight: "bold", marginLeft: "4px" }}>
                          {review.rating || 0}
                        </span>
                      </div>
                    </td>
                    <td>
                      <p style={{ fontSize: "13.5px", color: "var(--text-muted)", maxWidth: "300px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={review.review}>
                        {review.review || "—"}
                      </p>
                    </td>
                    <td>
                      <span className={`status-badge ${review.isActive ? "status-active" : "status-inactive"}`}>
                        {review.isActive ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td>
                      <div className="action-cell" style={{ justifyContent: "flex-end", alignItems: "center", gap: "15px" }}>
                        <button
                          type="button"
                          onClick={() => toggleStatus(review.reviewid, review.isActive)}
                          style={{
                            width: "36px", height: "20px", borderRadius: "10px", padding: "2px",
                            background: review.isActive ? "var(--success)" : "#e2e8f0",
                            transition: "all 0.3s ease", display: "flex", cursor: "pointer",
                            border: "none", alignItems: "center"
                          }}
                        >
                          <span style={{
                            width: "16px", height: "16px", borderRadius: "50%", background: "white",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "all 0.3s ease",
                            transform: review.isActive ? "translateX(16px)" : "translateX(0)"
                          }} />
                        </button>
                        <button className="action-btn delete" title="Delete Review" onClick={() => handleDelete(review.reviewid, review.username)}>
                          <Trash2 size={16} />
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
            Showing <strong>{paginatedReviews.length}</strong> of{" "}
            <strong>{reviews.length}</strong> reviews
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

export default ReviewList;
