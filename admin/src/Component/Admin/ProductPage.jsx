import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductPage.css';

const ProductPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    image: null,
    pdf: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await axios.get('http://localhost:5000/api/products');
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage('❌ Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Validation
      if (!formData.name || !formData.name.trim()) {
        setMessage('❌ Product name is required');
        setLoading(false);
        return;
      }
      
      if (!formData.price || parseFloat(formData.price) <= 0) {
        setMessage('❌ Valid price is required');
        setLoading(false);
        return;
      }
      
      if (!formData.category) {
        setMessage('❌ Please select a category');
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('price', parseFloat(formData.price).toFixed(2));
      formDataToSend.append('description', formData.description?.trim() || '');
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock || 0);
      
      if (formData.image) {
        if (formData.image.size > 50 * 1024 * 1024) {
          setMessage('❌ Image file too large (max 50MB)');
          setLoading(false);
          return;
        }
        formDataToSend.append('image', formData.image);
      }
      
      if (formData.pdf) {
        if (formData.pdf.size > 50 * 1024 * 1024) {
          setMessage('❌ PDF file too large (max 50MB)');
          setLoading(false);
          return;
        }
        formDataToSend.append('pdf', formData.pdf);
      }

      console.log('🚀 Sending to server...');
      
      const response = await axios.post(
        'http://localhost:5000/api/products', 
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000
        }
      );

      console.log('✅ Server response:', response.data);

      if (response.data.success) {
        setMessage('✅ Product added successfully!');
        
        // Reset form
        setFormData({
          name: '',
          price: '',
          description: '',
          category: '',
          stock: '',
          image: null,
          pdf: null
        });
        
        // Clear file inputs
        document.getElementById('image').value = '';
        document.getElementById('pdf').value = '';
        
        // Refresh products list
        await fetchProducts();
        
        // Show success for 3 seconds
        setTimeout(() => {
          setMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Full error:', error);
      
      let errorMessage = 'Error adding product';
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = 'Bad request. Please check your data.';
        } else if (error.response.status === 413) {
          errorMessage = 'File too large. Maximum size is 50MB.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Make sure backend is running on http://localhost:5000';
      }
      
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return 'status-in-stock';
      case 'Out of stock': return 'status-out-of-stock';
      case 'Low stock': return 'status-low-stock';
      default: return '';
    }
  };

  return (
    <div className="product-page">
      {/* Header */}
      <header className="product-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
        <h1>Product Management</h1>
      </header>

      <div className="product-container">
        {/* Product Form */}
        <div className="product-form-section">
          <h2>Add New Product</h2>
          
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                />
              </div>
              
              <div className="form-group">
                <label>Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Enter product description"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="skincare">Skincare</option>
                  <option value="haircare">Haircare</option>
                  <option value="makeup">Makeup</option>
                  <option value="fragrance">Fragrance</option>
                  <option value="wellness">Wellness</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Product Image</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="image" className="file-upload-label">
                    {formData.image ? formData.image.name : 'Choose image file'}
                  </label>
                </div>
                <small className="file-hint">Max size: 50MB</small>
              </div>
              
              <div className="form-group">
                <label>Product PDF (Manual/Brochure)</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="pdf"
                    name="pdf"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="pdf" className="file-upload-label">
                    {formData.pdf ? formData.pdf.name : 'Choose PDF file'}
                  </label>
                </div>
                <small className="file-hint">Max size: 50MB</small>
              </div>
            </div>

            {message && (
              <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/')}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>

        {/* Product List Section */}
        <div className="product-list-section">
          <div className="section-header">
            <h2>Recent Products</h2>
            <button 
              className="refresh-btn"
              onClick={fetchProducts}
              disabled={productsLoading}
            >
              🔄 Refresh
            </button>
          </div>
          
          {productsLoading ? (
            <div className="loading-products">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-products">
              <div className="empty-icon">📦</div>
              <p>No products found. Add your first product!</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.slice(0, 5).map((product) => (
                <div key={product._id || product.id} className="product-card">
                  <div className="product-card-header">
                    <h3 className="product-name">{product.name}</h3>
                    <span className={`product-status ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </div>
                  
                  <div className="product-card-body">
                    <div className="product-info-row">
                      <span className="info-label">Price:</span>
                      <span className="info-value">${product.price.toFixed(2)}</span>
                    </div>
                    
                    <div className="product-info-row">
                      <span className="info-label">Category:</span>
                      <span className="info-value category-badge">
                        {product.category}
                      </span>
                    </div>
                    
                    <div className="product-info-row">
                      <span className="info-label">Stock:</span>
                      <span className="info-value">{product.stock} units</span>
                    </div>
                    
                    <div className="product-info-row">
                      <span className="info-label">Sold:</span>
                      <span className="info-value">{product.sold || 0} units</span>
                    </div>
                    
                    {product.description && (
                      <div className="product-description">
                        <span className="info-label">Description:</span>
                        <p className="description-text">{product.description}</p>
                      </div>
                    )}
                    
                    <div className="product-files">
                      {product.imageUrl && (
                        <a 
                          href={`http://localhost:5000${product.imageUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="file-link"
                        >
                          📷 View Image
                        </a>
                      )}
                      
                      {product.pdfUrl && (
                        <a 
                          href={`http://localhost:5000${product.pdfUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="file-link"
                        >
                          📄 View PDF
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="product-card-footer">
                    <span className="product-date">
                      Added: {formatDate(product.createdAt || product.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {products.length > 5 && (
            <div className="view-all-container">
              <button className="view-all-btn" onClick={() => {
                // You can implement a separate view all page here
                console.log('View all products');
              }}>
                View All Products ({products.length})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;