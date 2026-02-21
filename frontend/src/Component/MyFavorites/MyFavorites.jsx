import React, { useEffect, useState } from "react";

import { FaHeart } from "react-icons/fa";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: { "Content-Type": "application/json" }
});

const MyFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Filter favorites when category or search term changes
  useEffect(() => {
    let filtered = favorites;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(pdf => pdf.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(pdf => 
        pdf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pdf.description && pdf.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredFavorites(filtered);
  }, [favorites, selectedCategory, searchTerm]);

  // Extract unique categories from favorites
  useEffect(() => {
    const uniqueCategories = [...new Set(favorites
      .filter(pdf => pdf.category)
      .map(pdf => pdf.category)
    )];
    setCategories(uniqueCategories);
  }, [favorites]);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get("/api/favorites", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setFavorites(res.data.favorites);
      }
    } catch (err) {
      console.error("Favorite fetch error:", err);
      setError("Failed to load favorites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (pdfId) => {
    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/api/favorites/toggle",
        { pdfId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFavorites(prev => prev.filter(pdf => pdf._id !== pdfId));
    } catch (err) {
      console.error("Remove error:", err);
      alert("Failed to remove from favorites");
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
            // Verify Payment
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

            // Download after successful payment
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
    } finally {
      setShowPayModal(false);
    }
  };

  const handlePreview = (pdfUrl) => {
    setPreviewPdfUrl(`http://localhost:5000${pdfUrl}`);
    setShowPreviewModal(true);
  };

  const handleDownload = async (pdfUrl, title) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to download PDFs");
        return;
      }

      const link = document.createElement("a");
      link.href = `http://localhost:5000${pdfUrl}`;
      link.download = `${title.replace(/\s+/g, "-")}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      alert("Download failed. Please try again.");
    }
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
    setLoading(true);
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
    <section className="pdfs-page">
      {/* Header */}
      <div className="pdfs-header">
        <div className="header-left">
          <h1>❤️ My Favorite PDFs</h1>
          <p className="subtitle">All your saved documents in one place</p>
        </div>
        
        <div className="header-right">
          <button 
            className="refresh-btn" 
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh Favorites"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{favorites.length}</span>
          <span className="stat-label">Total Favorites</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{filteredFavorites.length}</span>
          <span className="stat-label">Showing</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{categories.length}</span>
          <span className="stat-label">Categories</span>
        </div>
      </div>

      {/* Filters Section - Only show if there are favorites */}
      {favorites.length > 0 && (
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search favorites by name or description..."
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
              All Favorites
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
      )}

      {error && (
        <div className="error-message">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
          <div className="error-actions">
            <button onClick={fetchFavorites} className="retry-btn">Retry</button>
            <button onClick={() => setError('')} className="dismiss-btn">Dismiss</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading Favorites...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💔</div>
          <h3>No Favorites Yet</h3>
          <p>You haven't saved any PDFs to your favorites.</p>
          <p className="empty-subtext">Browse PDFs and click the heart icon to add them here!</p>
          <button 
            className="clear-filters-btn"
            onClick={() => window.location.href = '/pdfs'}
          >
            Browse PDFs
          </button>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No Matching Favorites</h3>
          <p>
            {searchTerm 
              ? `No favorites found for "${searchTerm}"`
              : `No favorites found in ${selectedCategory} category`
            }
          </p>
          <button 
            className="clear-filters-btn"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="pdfs-container">
            {filteredFavorites.map((pdf) => (
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
                        ₹{pdf.price || 0}
                      </span>
                    </div>
                    {pdf.stock && (
                      <div className="stat">
                        <span className="stat-value">{pdf.stock} in stock</span>
                      </div>
                    )}
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

                {/* Remove Heart Button */}
                <button
  className="favorite-btn active"
  onClick={() => removeFavorite(pdf._id)}
  title="Remove from favorites"
>
  <FaHeart className="heart-icon active" />
</button>

                {/* Purchase message */}
                <div className="plan-restriction">
                  <small>💰 Purchase required for download</small>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pagination-info1">
            <p>
              Showing {filteredFavorites.length} of {favorites.length} favorites
              {selectedCategory !== 'all' && ` in ${selectedCategory} category`}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
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
                Back to Favorites
              </button>
              
              <div className="action-buttons">
                <button
                  className="pay-btn"
                  onClick={() => {
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

export default MyFavorites;