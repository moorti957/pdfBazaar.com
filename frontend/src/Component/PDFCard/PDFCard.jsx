import React, { useState, useEffect } from "react";
import "./PDFCard.css";
import { Link } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

const PDFCard = () => {
  const [pdfs, setPdfs] = useState([]);
  const [filteredPdfs, setFilteredPdfs] = useState([]);
  const [displayPdfs, setDisplayPdfs] = useState([]); // New state for displayed PDFs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  // PDFpage se liye gaya states
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [userPlan, setUserPlan] = useState("free");
  const [downloadCount, setDownloadCount] = useState(0);
  const [downloadLimit, setDownloadLimit] = useState(2);
  
  // New state for showing more PDFs
  const [showAll, setShowAll] = useState(false);
  const [maxDisplayLimit, setMaxDisplayLimit] = useState(3); // Maximum 3 PDFs initially

  useEffect(() => {
    checkBackendStatus();
    fetchPDFs();
    fetchUserPlan();
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
        pdf.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pdf.tags && pdf.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Filter only PDFs that have pdfUrl
    filtered = filtered.filter(pdf => pdf.pdfUrl || pdf.pdf || pdf.file);

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
        case "popular":
          return (b.views || 0) - (a.views || 0);
        default:
          return 0;
      }
    });

    setFilteredPdfs(filtered);
    
    // Set display PDFs (maximum 3 initially)
    if (showAll) {
      setDisplayPdfs(filtered);
    } else {
      setDisplayPdfs(filtered.slice(0, maxDisplayLimit));
    }
  }, [pdfs, selectedCategory, searchTerm, sortBy, showAll, maxDisplayLimit]);

  // Toggle show all PDFs
  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  // PDFpage se liye gaya functions
  const handlePayAndDownload = async (pdf) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      let amount = 0;

      if (userPlan === "premium") {
        amount = 0;
      } else {
        const priceStr = getDiscountedPrice(pdf.price);
        amount = Number(priceStr.replace("₹", ""));
      }

      console.log("FINAL PAY AMOUNT:", amount);

      if (!amount || amount <= 0 || isNaN(amount)) {
        handleDownload(pdf);
        return;
      }

      const res = await api.post(
        "/api/payment/create-order",
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("PAYMENT API:", res.data);

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
        handler: function (response) {
          alert("Payment Successful 🎉");
          handleDownload(pdf);
        },
        theme: { color: "#4f46e5" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

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
          setDownloadLimit(0);
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

  const getDiscountedPrice = (price) => {
    if (!price) return "₹0";
    
    let numPrice = Number(price);
    if (isNaN(numPrice)) numPrice = 0;

    if (userPlan === "premium") {
      return "FREE";
    }

    let finalPrice = numPrice;

    if (userPlan === "standard") {
      finalPrice = numPrice * 0.5;
    }

    if (userPlan === "basic") {
      finalPrice = numPrice * 0.25;
    }

    return `₹${finalPrice.toFixed(2)}`;
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
    const icons = {
      "skincare": "🧴",
      "haircare": "💇‍♀️",
      "makeup": "💄",
      "fragrance": "🌸",
      "wellness": "🌿",
      "health": "🏥",
      "education": "📚",
      "business": "💼",
      "technology": "💻",
      "finance": "💰"
    };
    return icons[category?.toLowerCase()] || "📄";
  };

  const getFileSize = (size) => {
    if (!size) return "Unknown size";
    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const handlePreview = (pdf) => {
    const url = pdf.pdfUrl || pdf.pdf || pdf.file;
    if (!url) return;
    
    const fullUrl = url.startsWith("http") ? url : `http://localhost:5000${url}`;
    window.open(fullUrl, "_blank");
  };

  const handleDownload = async (pdf) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to download PDFs");
        return;
      }

      // PDFpage style download check
      const res = await api.post(
        "/api/download-check",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const url = pdf.pdfUrl || pdf.pdf || pdf.file;
        const fullUrl = url.startsWith("http") ? url : `http://localhost:5000${url}`;
        const link = document.createElement("a");
        link.href = fullUrl;
        link.download = `${pdf.name || "document"}.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        fetchUserPlan(); // Update download count
      }
    } catch (err) {
      console.error('Download error:', err);
      alert(err.response?.data?.message || "Download not allowed. Check your plan limits.");
    }
  };

  const handleRefresh = () => {
    fetchPDFs();
    fetchUserPlan();
  };

  // PDF Card Component (PDFpage style)
  const PDFCardItem = ({ pdf }) => {
    const imageSrc = pdf.imageUrl || pdf.image || pdf.thumbnail || pdf.cover || "";

    return (
      <div className="pdf-card">
        <div className="pdf-card-header">
          <span className="pdf-category">
            {getCategoryIcon(pdf.category)} {pdf.category || "Uncategorized"}
          </span>
          {pdf.featured && <span className="pdf-featured">⭐ Featured</span>}
          <span className="pdf-date">
            {formatDate(pdf.createdAt || pdf.date)}
          </span>
        </div>

        <div className="pdf-card-body">
          {/* Image */}
          {imageSrc ? (
            <img
              src={imageSrc.startsWith("http") ? imageSrc : `http://localhost:5000${imageSrc}`}
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

          <h3 className="pdf-title">{pdf.name || "Untitled Document"}</h3>
          
          {/* Tags (PDFCard feature) */}
          {pdf.tags && pdf.tags.length > 0 && (
            <div className="pdf-tags">
              {pdf.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="pdf-tag">#{tag}</span>
              ))}
              {pdf.tags.length > 3 && (
                <span className="pdf-tag-more">+{pdf.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* PDFpage style stats */}
          <div className="pdf-stats">
            <div className="stat">
              <span className={`stat-value ${userPlan === "premium" ? "free-price" : ""}`}>
                {getDiscountedPrice(pdf.price)}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Stock:</span>
              <span className="stat-value">{pdf.stock || "Unlimited"}</span>
            </div>
          </div>
        </div>

        <div className="pdf-card-footer">
          {/* Action Buttons (Combined both) */}
          <div className="action-buttons">
            <button className="btn-preview" onClick={() => handlePreview(pdf)}>
               Preview
            </button>
            
            {userPlan === "premium" ? (
              <button className="download-btn" onClick={() => handleDownload(pdf)}>
                ⬇ Download Free
              </button>
            ) : (
              <button 
                className="btn-purchase" 
                onClick={() => {
                  setSelectedPdf(pdf);
                  setShowPayModal(true);
                }}
              >
                {getDiscountedPrice(pdf.price)}
              </button>
            )}
          </div>
        </div>

        {/* Plan restriction message (PDFpage feature) */}
        {userPlan === "free" && downloadCount >= downloadLimit && (
          <div className="plan-restriction">
            <small> Download limit reached. Upgrade plan.</small>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="pdfs-page_1">
      {/* Error Display (PDFpage style) */}
      {error && (
        <div className="error-message">
          <div className="error-content">
            <span className="error-icon"></span>
            <span className="error-text">{error}</span>
          </div>
          <div className="error-actions">
            <button onClick={fetchPDFs} className="retry-btn">Retry</button>
            <button onClick={() => setError('')} className="dismiss-btn">Dismiss</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading documents...</p>
            <p className="loading-subtext">Checking backend connection...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon"></div>
            <h3>Connection Error</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={fetchPDFs}>
               Retry
            </button>
          </div>
        ) : displayPdfs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h3>No documents found</h3>
            <p>
              {searchTerm 
                ? `No PDFs found for "${searchTerm}"`
                : selectedCategory !== 'all'
                  ? `No PDFs found in ${selectedCategory} category`
                  : backendStatus === 'stopped'
                    ? 'Backend server is not running.'
                    : 'No PDFs available.'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button 
                className="btn-clear-filters"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchTerm("");
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="pdfs-grid">
              {displayPdfs.map((pdf) => (
                <PDFCardItem key={pdf._id || pdf.id} pdf={pdf} />
              ))}
            </div>
            
            {/* Show More/Less Button */}
            {filteredPdfs.length > maxDisplayLimit && (
              <div className="show-more-container">
                <button 
                  className="show-more-btn" 
                  onClick={toggleShowAll}
                >
                  {showAll ? (
                    <>
                      <span className="btn-icon"></span>
                      Show Less (Show only {maxDisplayLimit})
                    </>
                  ) : (
                    <>
                      <span className="btn-icon"></span>
                      Show All {filteredPdfs.length} PDFs
                      <span className="btn-subtext">
                        (Currently showing {displayPdfs.length} of {filteredPdfs.length})
                      </span>
                    </>
                  )}
                </button>
                
                {/* Summary Text */}
                <div className="pdf-summary">
                  <p>
                    <strong>{displayPdfs.length}</strong> PDFs showing
                    {!showAll && filteredPdfs.length > maxDisplayLimit && (
                      <> out of <strong>{filteredPdfs.length}</strong> total</>
                    )}
                    {selectedCategory !== 'all' && ` in ${selectedCategory} category`}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pay Modal (PDFpage style - SAME MODAL) */}
      {showPayModal && selectedPdf && (
        <div className="pay-modal-overlay">
          <div className="pay-modal">
            {/* Modal Header */}
            <div className="pay-modal-header">
              <div className="header-icon">💰</div>
              <div className="header-text">
                <h3>Complete Your Purchase</h3>
                <p>Confirm payment to download your PDF</p>
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
                      src={`http://localhost:5000${selectedPdf.imageUrl}`} 
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
                    <div className="detail-label">Original Price</div>
                    <div className="detail-value original-price">₹{selectedPdf.price}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Stock Available</div>
                    <div className="detail-value stock-info">{selectedPdf.stock} copies</div>
                  </div>
                  {selectedPdf.description && (
                    <div className="detail-item full-width">
                      <div className="detail-label">Description</div>
                      <div className="detail-value description">{selectedPdf.description}</div>
                    </div>
                  )}
                  
                  {/* Tags display */}
                  {selectedPdf.tags && selectedPdf.tags.length > 0 && (
                    <div className="detail-item full-width">
                      <div className="detail-label">Tags</div>
                      <div className="detail-value tags">
                        {selectedPdf.tags.map((tag, index) => (
                          <span key={index} className="tag-badge">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Plan & Payment Details */}
              <div className="payment-column">
                <div className="section-title">
                  <span className="section-icon">👤</span>
                  <h4>Your Plan Benefits</h4>
                </div>

                {/* Current Plan Display */}
                <div className={`plan-display ${userPlan}`}>
                  <div className="plan-header">
                    <div className="plan-icon">
                      {userPlan === "premium" ? "⭐" : 
                       userPlan === "standard" ? "🥈" : 
                       userPlan === "basic" ? "🥉" : "🎯"}
                    </div>
                    <div className="plan-info">
                      <div className="plan-name">{userPlan.toUpperCase()} PLAN</div>
                      <div className="plan-desc">
                        {userPlan === "premium" ? "Full Access" : 
                         userPlan === "standard" ? "Standard Access" : 
                         userPlan === "basic" ? "Basic Access" : "Free Tier"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="plan-stats">
                    <div className="plan-stat">
                      <span className="stat-label">Downloads Used</span>
                      <span className="stat-value">{downloadCount}/{downloadLimit}</span>
                    </div>
                    <div className="plan-stat">
                      <span className="stat-label">Discount Applied</span>
                      <span className="stat-value discount-highlight">
                        {userPlan === "premium" ? "100%" : 
                         userPlan === "standard" ? "50%" : 
                         userPlan === "basic" ? "75%" : "0%"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="price-breakdown">
                  <div className="section-title">
                    <span className="section-icon"></span>
                    <h4>Payment Summary</h4>
                  </div>
                  
                  <div className="breakdown-item">
                    <span>Original Price</span>
                    <span>₹{selectedPdf.price}</span>
                  </div>
                  
                  {userPlan !== "free" && (
                    <div className="breakdown-item discount-line">
                      <span>
                        {userPlan === "standard" ? "Standard Plan Discount (50%)" :
                         userPlan === "basic" ? "Basic Plan Discount (75%)" : 
                         "Premium Plan Discount (100%)"}
                      </span>
                      <span className="discount-amount">
                        -₹{(selectedPdf.price * 
                          (userPlan === "standard" ? 0.5 : 
                           userPlan === "basic" ? 0.75 : 
                           userPlan === "premium" ? 1 : 0)).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="breakdown-total">
                    <span>Total Payable</span>
                    <span className="total-amount">
                      {getDiscountedPrice(selectedPdf.price)}
                      {userPlan === "premium" && <span className="free-badge">FREE</span>}
                    </span>
                  </div>
                </div>

                {/* Security & Info */}
                <div className="payment-info">
                  <div className="info-item">
                    <span className="info-icon"></span>
                    <span className="info-text">Secure payment via Razorpay</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon"></span>
                    <span className="info-text">Instant download after payment</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon"></span>
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
                {userPlan !== "premium" && (
                  <button 
                    className="view-plans-btn"
                    onClick={() => {
                      setShowPayModal(false);
                      window.location.href = '/pricing';
                    }}
                  >
                    
                    Upgrade Plan
                  </button>
                )}
                
                <button
                  className="pay-btn"
                  onClick={() => handlePayAndDownload(selectedPdf)}
                  disabled={userPlan === "free" && downloadCount >= downloadLimit}
                >
              
                  {userPlan === "premium" ? "Download Free PDF" : "Pay & Download Now"}
                  {userPlan !== "premium" && (
                    <span className="btn-subtext">via Razorpay</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

     
    </section>
  );
};

export default PDFCard;