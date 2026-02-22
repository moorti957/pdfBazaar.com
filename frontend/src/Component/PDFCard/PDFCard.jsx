import React, { useState, useEffect } from "react";
import "./Pdfcard1.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import API from "../../config/api";

const api = axios.create({
  baseURL: API,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

const PDFCard = () => {
  const [pdfs, setPdfs] = useState([]);
  const [filteredPdfs, setFilteredPdfs] = useState([]);
  const [displayPdfs, setDisplayPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [userPlan, setUserPlan] = useState("free");
  const [downloadCount, setDownloadCount] = useState(0);
  const [downloadLimit, setDownloadLimit] = useState(2);
  const [showAll, setShowAll] = useState(false);
  const [maxDisplayLimit, setMaxDisplayLimit] = useState(3); // Show only 3 PDFs initially
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    checkBackendStatus();
    fetchPDFs();
    fetchUserPlan();
    fetchFavorites();
  }, []);

  useEffect(() => {
    let filtered = [...pdfs];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(pdf => pdf.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(pdf =>
        pdf.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdf.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter only PDFs that have pdfUrl
    filtered = filtered.filter(pdf => pdf.pdfUrl);

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
        case "oldest":
          return new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date);
        case "price_asc":
          return (a.price || 0) - (b.price || 0);
        case "price_desc":
          return (b.price || 0) - (a.price || 0);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        default:
          return 0;
      }
    });

    setFilteredPdfs(filtered);
    
    // Set display PDFs - Show only 3 initially
    if (showAll) {
      setDisplayPdfs(filtered);
    } else {
      setDisplayPdfs(filtered.slice(0, maxDisplayLimit));
    }
  }, [pdfs, selectedCategory, searchTerm, sortBy, showAll, maxDisplayLimit]);

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get("/api/favorites", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setFavorites(res.data.favorites.map(f => typeof f === "object" ? f._id : f));
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };

  const toggleFavorite = async (pdfId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    const isFav = favorites.includes(pdfId);

    // Instant UI update
    if (isFav) {
      setFavorites(prev => prev.filter(id => id !== pdfId));
    } else {
      setFavorites(prev => [...prev, pdfId]);
    }

    try {
      await api.post(
        "/api/favorites/toggle",
        { pdfId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error("Favorite Error:", error);
      // Revert on error
      if (isFav) {
        setFavorites(prev => [...prev, pdfId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== pdfId));
      }
    }
  };

  const handlePayAndDownload = async (pdf) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const amount = pdf.price;

      const res = await api.post(
        "/api/payment/create-order",
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { order, key } = res.data;

      if (!order || !key) {
        alert("Payment initialization failed");
        return;
      }

      const options = {
        key,
        amount: order.amount,
        currency: "INR",
        name: "PDF Store",
        description: pdf.name,
        order_id: order.id,
        handler: async function (response) {
          try {
            await api.post(
              "/api/payment/verify-pdf-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                pdfId: pdf._id,
                pdfName: pdf.name,
                amount: amount
              },
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );

            alert("Payment Successful! Download Starting...");
            handleDownload(pdf.pdfUrl, pdf.name);
          } catch (err) {
            console.error("VERIFY ERROR:", err);
            alert("Payment done but verification failed");
          }
        },
        theme: { color: "#4f46e5" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setShowPayModal(false);
    } catch (err) {
      console.error("PAYMENT ERROR:", err);
      alert("Payment failed");
    }
  };

  const fetchUserPlan = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserPlan("free");
        setDownloadCount(0);
        return;
      }

      const res = await api.get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setUserPlan(res.data.user.plan || "free");
        setDownloadCount(res.data.user.pdfDownloadCount || 0);
        
        if (res.data.user.plan === "premium") {
          setDownloadLimit(999999);
        } else if (res.data.user.plan === "standard") {
          setDownloadLimit(15);
        } else if (res.data.user.plan === "basic") {
          setDownloadLimit(5);
        } else {
          setDownloadLimit(2);
        }
      }
    } catch (err) {
      console.error('Error fetching user plan:', err);
      setUserPlan("free");
      setDownloadCount(0);
    }
  };

  const checkBackendStatus = async () => {
    try {
      const response = await api.get('/');
      if (response.data.success) {
        setBackendStatus('running');
      }
    } catch (error) {
      console.error('Backend check failed:', error);
      setBackendStatus('stopped');
    }
  };

  const fetchPDFs = async () => {
    try {
      setLoading(true);
      setError("");
      
      await checkBackendStatus();
      
      const res = await api.get("/api/products");
      
      if (res.data.success) {
        setPdfs(res.data.products);
        
        const cats = [
          ...new Set(res.data.products.map(p => p.category).filter(Boolean)),
        ];
        setCategories(cats);
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'skincare': return '🧴';
      case 'haircare': return '💇';
      case 'makeup': return '💄';
      case 'fragrance': return '🌸';
      case 'wellness': return '🌿';
      default: return '📄';
    }
  };

  const handlePreview = (pdfUrl) => {
    setPreviewPdfUrl(`${API}${pdfUrl}`);
    setShowPreviewModal(true);
  };

  const handleDownload = async (pdfUrl, title) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to download PDFs");
        return;
      }

      const res = await api.post(
        "/api/download-check",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const link = document.createElement("a");
        link.href = `${API}${pdfUrl}`;
        link.download = `${title.replace(/\s+/g, "-")}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        fetchUserPlan();
      }
    } catch (err) {
      console.error('Download error:', err);
      alert(err.response?.data?.message || "Download not allowed. Check your plan limits.");
    }
  };

  const handleRefresh = () => {
    fetchPDFs();
    fetchUserPlan();
    fetchFavorites();
  };

  // Block print/save shortcuts in preview modal
  useEffect(() => {
    const blockKeys = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "p" || e.key === "s")
      ) {
        e.preventDefault();
      }
    };

    if (showPreviewModal) {
      window.addEventListener("keydown", blockKeys);
    }

    return () => window.removeEventListener("keydown", blockKeys);
  }, [showPreviewModal]);

  return (
    <section className="pdfs-page1">
      {/* Header - Commented out as per your code */}
      {/* Header JSX remains commented */}

      {/* Stats Bar - Commented out as per your code */}
      {/* Stats Bar JSX remains commented */}

      {/* Filters Section - Commented out as per your code */}
      {/* Filters Section JSX remains commented */}

      {/* Error Display */}
      {/* {error && (
        <div className="error-message">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
          <div className="error-actions">
            <button onClick={fetchPDFs} className="retry-btn">Retry</button>
            <button onClick={() => setError('')} className="dismiss-btn">Dismiss</button>
          </div>
        </div>
      )} */}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading PDFs...</p>
          <p className="loading-subtext">Checking backend connection...</p>
        </div>
      ) : displayPdfs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No PDFs Found</h3>
          <p>
            {searchTerm 
              ? `No PDFs found for "${searchTerm}"`
              : selectedCategory !== 'all'
                ? `No PDFs found in ${selectedCategory} category`
                : backendStatus === 'stopped'
                  ? 'Backend server is not running. Please start the backend.'
                  : 'No PDFs available. Please upload some PDFs first.'
            }
          </p>
          {(searchTerm || selectedCategory !== 'all') && (
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="pdfs-container">
            {displayPdfs.map((pdf) => (
              <div key={pdf._id} className="pdf-card">
                <div className="pdf-card-header">
                  <div className="pdf-category">
                    {getCategoryIcon(pdf.category)} {pdf.category || "PDF"}
                  </div>
                  <div className="pdf-date">
                    {formatDate(pdf.createdAt)}
                  </div>
                </div>

                <div className="pdf-card-body">
                  {pdf.imageUrl ? (
                    <img
                      src={`${API}${pdf.imageUrl}`}
                      alt={pdf.name}
                      className="pdf-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://cdn-icons-png.flaticon.com/512/337/337946.png";
                      }}
                    />
                  ) : (
                    <div className="pdf-image-placeholder">
                      {getCategoryIcon(pdf.category)}
                    </div>
                  )}

                  <h3 className="pdf-title">{pdf.name}</h3>

                  <div className="pdf-stats">
                    <div className="stat">
                      <span className="stat-value price-display">
                        ₹{pdf.price || 0}
                      </span>
                    </div>
                    {pdf.stock && (
                      <div className="stat">
                        <span className="stat-value">{pdf.stock} in stock</span>
                      </div>
                    )}
                    <div className="stat">
                      <span className="stat-value">{pdf.sold || 0} sold</span>
                    </div>
                  </div>
                </div>

                <div className="pdf-card-footer">
                  <button
                    className="preview-btn"
                    onClick={() => handlePreview(pdf.pdfUrl)}
                    title="Preview PDF"
                    disabled={!pdf.pdfUrl}
                  >
                    Preview
                  </button>

                  <button
                    className="download-btn"
                    onClick={() => {
                      setSelectedPdf(pdf);
                      setShowPayModal(true);
                    }}
                    disabled={!pdf.pdfUrl}
                  >
                    Purchase
                  </button>
                </div>

                {/* Favorite Button */}
                <button
  className={`favorite-btn ${favorites.includes(pdf._id) ? "active" : ""}`}
  onClick={() => toggleFavorite(pdf._id)}
  title={
    favorites.includes(pdf._id)
      ? "Remove from favorites"
      : "Add to favorites"
  }
>
  {favorites.includes(pdf._id) ? (
    <FaHeart className="heart-icon active" />
  ) : (
    <FaRegHeart className="heart-icon" />
  )}
</button>

                
                {userPlan === "free" && downloadCount >= downloadLimit && (
                  <div className="plan-restriction">
                    <small>⚠️ Download limit reached. Upgrade plan.</small>
                  </div>
                )}
                {userPlan !== "free" && (
                  <div className="plan-restriction">
                    <small>💰 Purchase required for download</small>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          
          {filteredPdfs.length > maxDisplayLimit && (
            <div className="show-more-wrapper">
              <button 
                className="show-more-btn"
                onClick={toggleShowAll}
              >
                {showAll ? (
                  <>
                    <span className="btn-icon">↑</span>
                    Show Less (Hide {filteredPdfs.length - maxDisplayLimit} PDFs)
                  </>
                ) : (
                  <>
                    <span className="btn-icon">↓</span>
                    Show All {filteredPdfs.length} PDFs
                    <span className="btn-badge">+{filteredPdfs.length - maxDisplayLimit} more</span>
                  </>
                )}
              </button>
              
              {/* Summary Text */}
              <div className="pagination-info">
                <p className="show-more-text">
                  <span className="highlight">{displayPdfs.length}</span> of <span className="highlight">{filteredPdfs.length}</span> PDFs showing
                  {selectedCategory !== 'all' && ` in ${selectedCategory} category`}
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>
            </div>
          )}
          
          {/* If exactly 3 PDFs or less, still show total count */}
          {filteredPdfs.length <= maxDisplayLimit && filteredPdfs.length > 0 && (
            <div className="pagination-info simple">
              <p>
                Showing all {filteredPdfs.length} PDFs
                {selectedCategory !== 'all' && ` in ${selectedCategory} category`}
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>
          )}
        </>
      )}

      {/* Payment Modal */}
      {showPayModal && selectedPdf && (
        <div className="pay-modal-overlay">
          <div className="pay-modal">
            {/* Modal Header */}
            <div className="pay-modal-header">
              <div className="header-icon">💰</div>
              <div className="header-text">
                <h3>Complete Your Purchase</h3>
                <p>Pay full price to download your PDF</p>
              </div>
              <button 
                className="close-modal" 
                onClick={() => setShowPayModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Two-column layout */}
            <div className="pay-modal-content">
              {/* Left Column: PDF Details */}
              <div className="details-column">
                <div className="section-title">
                  <span className="section-icon">📄</span>
                  <h4>PDF Details</h4>
                </div>
                
                <div className="pdf-preview">
                  {selectedPdf.imageUrl ? (
                    <img 
                      src={`${API}${selectedPdf.imageUrl}`}
                      alt={selectedPdf.name}
                      className="pdf-preview-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://cdn-icons-png.flaticon.com/512/337/337946.png";
                      }}
                    />
                  ) : (
                    <div className="pdf-preview-placeholder">
                      <span className="pdf-icon">📄</span>
                    </div>
                  )}
                  <div className="pdf-preview-info">
                    <h5>{selectedPdf.name}</h5>
                    <div className="pdf-meta">
                      <span className="category-badge">
                        {getCategoryIcon(selectedPdf.category)} {selectedPdf.category}
                      </span>
                      <span className="date-stamp">
                        📅 {formatDate(selectedPdf.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-label">Price</div>
                    <div className="detail-value full-price">₹{selectedPdf.price}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Stock Available</div>
                    <div className="detail-value stock-info">{selectedPdf.stock || 0} copies</div>
                  </div>
                  {selectedPdf.description && (
                    <div className="detail-item full-width">
                      <div className="detail-label">Description</div>
                      <div className="detail-value description">{selectedPdf.description}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Payment Details */}
              <div className="payment-column">
                <div className="section-title">
                  <span className="section-icon">💳</span>
                  <h4>Payment Details</h4>
                </div>

                {/* Price Breakdown */}
                <div className="price-breakdown">
                  <div className="section-title">
                    <span className="section-icon">🧾</span>
                    <h4>Payment Summary</h4>
                  </div>
                  
                  <div className="breakdown-item">
                    <span>PDF Price</span>
                    <span>₹{selectedPdf.price}</span>
                  </div>
                  
                  <div className="breakdown-total">
                    <span>Total Payable</span>
                    <span className="total-amount">
                      ₹{selectedPdf.price}
                    </span>
                  </div>

                  <div className="no-discount-notice">
                    <span className="notice-icon">⚠️</span>
                    <span className="notice-text">
                      No discounts applied. All PDFs are charged at full price.
                    </span>
                  </div>
                </div>

                {/* Security & Info */}
                <div className="payment-info">
                  <div className="info-item">
                    <span className="info-icon">🔒</span>
                    <span className="info-text">Secure payment via Razorpay</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">📥</span>
                    <span className="info-text">Instant download after payment</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">🔄</span>
                    <span className="info-text">Full refund within 7 days if unsatisfied</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pay-modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowPayModal(false)}
              >
                <span className="btn-icon">←</span>
                Back to PDFs
              </button>
              
              <div className="action-buttons">
                <button
                  className="pay-btn"
                  onClick={() => handlePayAndDownload(selectedPdf)}
                  disabled={userPlan === "free" && downloadCount >= downloadLimit}
                >
                  <span className="btn-icon">💳</span>
                  Pay ₹{selectedPdf.price} & Download
                  <span className="btn-subtext">via Razorpay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="preview-modal-overlay">
          <div className="preview-modal">
            {/* HEADER */}
            <div className="preview-header">
              <h3>📄 PDF Preview</h3>
              <button
                className="close-btn"
                onClick={() => setShowPreviewModal(false)}
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div
              className="preview-body"
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* PDF IFRAME */}
              <iframe
                src={`${previewPdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                title="PDF Preview"
              />

              {/* WATERMARK */}
              <div className="pdf-watermark">
                © yourwebsite.com
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PDFCard;
