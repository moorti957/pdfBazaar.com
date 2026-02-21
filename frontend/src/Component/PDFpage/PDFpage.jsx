import React, { useState, useEffect } from "react";
import "./PDFpage.css";
import { Link } from "react-router-dom";
import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.code === 'ERR_NETWORK') {
      alert('Cannot connect to server. Please make sure backend is running on http://localhost:5000');
    }
    return Promise.reject(error);
  }
);

const PDFs = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filteredPdfs, setFilteredPdfs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [favorites, setFavorites] = useState([]);

  
  // User plan and download count state
  const [userPlan, setUserPlan] = useState("free");
  const [downloadCount, setDownloadCount] = useState(0);
  const [downloadLimit, setDownloadLimit] = useState(2);
 const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  // Check backend status on mount
  useEffect(() => {
    checkBackendStatus();
  }, []);

  // Fetch PDF products from backend
  useEffect(() => {
    fetchPDFs();
  }, []);

  const handlePayAndDownload = async (pdf) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      // PDF की FULL PRICE लें (बिना किसी discount के)
      const amount = pdf.price;

      console.log("FULL PAYMENT AMOUNT:", amount);

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
        handler: async function (response) {
          console.log("RAZORPAY RESPONSE 👉", response);

          try {
            // 1️⃣ VERIFY PAYMENT
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

            // 2️⃣ INCREMENT DOWNLOAD COUNT
            await api.post(
              "/api/download-check/increment-download",
              {},
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );

            alert("Payment Successful 🎉 Download Starting...");

            // 3️⃣ DOWNLOAD
            handleDownload(pdf.pdfUrl, pdf.name);

          } catch (err) {
            console.error("VERIFY ERROR:", err.response?.data || err);
            alert("Payment done but verification failed");
          }
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
    try{
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get("/api/subscriptions/my-plan", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success && res.data.plan) {
        const plan = res.data.plan.planName;
        setUserPlan(plan);

        // Set download limits based on plan
        if (plan === "premium") setDownloadLimit(999999);
        else if (plan === "standard") setDownloadLimit(15);
        else if (plan === "basic") setDownloadLimit(5);
        else setDownloadLimit(2);
      }
    } catch (err) {
      console.error(err);
      setUserPlan("free");
    }
  };

  useEffect(() => {
    fetchUserPlan();
  }, []);

  // Filter PDFs when category or search term changes
  useEffect(() => {
    let filtered = pdfs;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(pdf => pdf.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(pdf => 
        pdf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pdf.description && pdf.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    filtered = filtered.filter(pdf => pdf.pdfUrl);
    
    setFilteredPdfs(filtered);
  }, [pdfs, selectedCategory, searchTerm]);

  const checkBackendStatus = async () => {
    try {
      const response = await api.get('/');
      if (response.data.success) {
        setBackendStatus('running');
        console.log('Backend status:', response.data);
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
      
      const response = await api.get('/api/products');
      
      if (response.data.success) {
        setPdfs(response.data.products);
        
        const uniqueCategories = [...new Set(response.data.products
          .filter(product => product.category)
          .map(product => product.category)
        )];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.code === 'ERR_NETWORK') {
        setError('Cannot connect to backend server. Please make sure it is running on http://localhost:5000');
      } else {
        setError('Failed to load PDFs. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // SIMPLE PRICE DISPLAY - NO DISCOUNTS
  const getPriceDisplay = (price) => {
    if (!price) return "₹0";
    return `₹${price}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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

  const handleRefresh = () => {
    fetchPDFs();
    fetchUserPlan();
  };

  const handleDownload = async (pdfUrl, title) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to download PDFs");
        return;
      }

      // Check if user can download
      const res = await api.post(
        "/api/download-check",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        const link = document.createElement("a");
        link.href = `http://localhost:5000${pdfUrl}`;
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

const handlePreview = (pdfUrl) => {
  setPreviewPdfUrl(`http://localhost:5000${pdfUrl}`);
  setShowPreviewModal(true);
};
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

const fetchFavorites = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await api.get("/api/favorites", {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.data.success) {
    setFavorites(
  res.data.favorites.map(f => 
    typeof f === "object" ? f._id : f
  )
);
  }
};

useEffect(() => {
  fetchFavorites();
}, []);

const toggleFavorite = async (pdfId) => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    return;
  }

  if (!pdfId) {
    console.error("PDF ID is missing!");
    alert("Invalid PDF ID");
    return;
  }

  console.log("Sending PDF ID:", pdfId);   // 🔍 DEBUG

  // ✅ Instant UI update
  const isFav = favorites.includes(pdfId);

  if (isFav) {
    setFavorites(prev => prev.filter(id => id !== pdfId));
  } else {
    setFavorites(prev => [...prev, pdfId]);
  }

  try {
    const res = await api.post(
      "/api/favorites/toggle",
      { pdfId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Server Response:", res.data);  // 🔍 DEBUG

    // ✅ Always sync with backend response
    if (res.data.success) {
     setFavorites(
  res.data.favorites.map(f =>
    typeof f === "object" ? f._id : f
  )
);
    }

  } catch (error) {
    console.error("Favorite Error:", error.response?.data || error);

    // ❌ If error, revert UI change
    if (isFav) {
      setFavorites(prev => [...prev, pdfId]);
    } else {
      setFavorites(prev => prev.filter(id => id !== pdfId));
    }

    alert(error.response?.data?.message || "Something went wrong");
  }
};







  return (
    <section className="pdfs-page">
      <div className="pdfs-header">
        <div className="header-left">
          <h1>📚 All PDF Documents</h1>
          <p className="subtitle">Browse and purchase PDFs at full price</p>
          
          {/* User Plan Display */}
          
        </div>
        
        <div className="header-right">
          <button 
            className="refresh-btn" 
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh PDFs"
          >
             {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{filteredPdfs.length}</span>
          <span className="stat-label">Available PDFs</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{pdfs.filter(p => p.pdfUrl).length}</span>
          <span className="stat-label">Total PDFs</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{categories.length}</span>
          <span className="stat-label">Categories</span>
        </div>
      
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search PDFs by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="category-filters">
          <button
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All PDFs
          </button>
          
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {getCategoryIcon(category)} {category}
            </button>
          ))}
        </div>
      </div>

      {error && (
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
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading PDFs...</p>
          <p className="loading-subtext">Checking backend connection...</p>
        </div>
      ) : filteredPdfs.length === 0 ? (
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
          {backendStatus === 'stopped' && (
            <div className="backend-help">
              <p>To start backend server:</p>
              <code>
                cd backend<br />
                npm run dev
              </code>
            </div>
          )}
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
            {filteredPdfs.map((pdf) => (
              <div key={pdf._id || pdf.id} className="pdf-card">
                <div className="pdf-card-header">
                  <div className="pdf-category">
                    {getCategoryIcon(pdf.category)} {pdf.category}
                  </div>
                  <div className="pdf-date">
                    {formatDate(pdf.createdAt)}
                  </div>
                </div>
                
                <div className="pdf-card-body">
                  {pdf.imageUrl ? (
                    <img 
                      src={`http://localhost:5000${pdf.imageUrl}`} 
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
                        {getPriceDisplay(pdf.price)}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{pdf.stock} in stock</span>
                    </div>
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
                    🛒 Purchase
                  </button>
                </div>
                <button
  className={`favorite-btn ${favorites.includes(pdf._id) ? "active" : ""}`}
  onClick={() => toggleFavorite(pdf._id)}
>
  {favorites.includes(pdf._id) ? "❤️" : "🤍"}
</button>

                
                {/* Simple message for all users */}
                <div className="plan-restriction">
                  <small>💰 Purchase required for download</small>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pagination-info">
            <p>
              Showing {filteredPdfs.length} of {pdfs.filter(p => p.pdfUrl).length} PDFs
              {selectedCategory !== 'all' && ` in ${selectedCategory} category`}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
        </>
      )}

      {/* Upload CTA */}
      <div className="upload-cta">
        <p>Want to add more PDFs?</p>
        <Link to="/products" className="upload-link">
          📤 Go to Product Management
        </Link>
      </div>
      
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
            </div>x``

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
                    <div className="detail-label">Price</div>
                    <div className="detail-value full-price">₹{selectedPdf.price}</div>
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
                </div>
              </div>

              {/* Right Column: Payment Details */}
              <div className="payment-column">
                <div className="section-title">
                  <span className="section-icon">💳</span>
                  <h4>Payment Details</h4>
                </div>

                {/* Price Breakdown - SIMPLIFIED */}
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
                  onClick={() => {
                    console.log("PAY BUTTON CLICKED");
                    handlePayAndDownload(selectedPdf);
                  }}
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
        onContextMenu={(e) => e.preventDefault()} // right click disable
      >
        {/* PDF IFRAME */}
        <iframe
          src={`${previewPdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          title="PDF Preview"
        />

        {/* 🔥 WATERMARK (PREVIEW ONLY) */}
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

export default PDFs;