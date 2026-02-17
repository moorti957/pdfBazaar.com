import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('Weekly');
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
  totalSell: 0,
  totalOrders: 0,
  totalRevenue: 0
});


  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'product', name: 'Product', icon: '📦' },
    { id: 'customer', name: 'Customer', icon: '👥' },
    { id: 'pricing-plans', name: 'Pricing Plans', icon: '💰' }
  ];

  const topSellingProducts = [
    { name: "Light", percentage: 65 },
    { name: "Dark", percentage: 35 }
  ];

  const activeOrders = [
    { country: "United States", percentage: 43 },
    { country: "Canada", percentage: 78 },
    { country: "Mexico", percentage: 58 },
    { country: "Turkey", percentage: 40 },
    { country: "Australia", percentage: 60 }
  ];

  // Fetch top products on component mount
  useEffect(() => {
    fetchTopProducts();
    fetchDashboardStats();
  }, []);

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products/top');
      if (response.data.success) {
        setTopProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching top products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/dashboard/stats');

    if (response.data.success) {
      setStats({
        totalSell: response.data.totalSell || 0,
        totalOrders: response.data.totalOrders || 0,
        totalRevenue: response.data.totalRevenue || 0,
        totalPlans: response.data.totalPlans || 0
      });
    }

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
  }
};

  // Menu item click handler
  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
    
    // Navigate based on menu item
    switch(itemName) {
      case 'Product':
        navigate('/products');
        break;
      case 'Customer':
        navigate('/customers');
        break;
      case 'Pricing Plans':
        navigate('/pricing-plans');
        break;
      // Dashboard stays on current page
      default:
        // Stay on dashboard
        break;
    }
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get status color class
  const getStatusColor = (stock) => {
    if (stock > 10) return "in-stock";
    if (stock > 0) return "low-stock";
    return "out-of-stock";
  };

  // Get status text based on stock
  const getStatusText = (stock) => {
    if (stock > 10) return "In Stock";
    if (stock > 0) return "Low Stock";
    return "Out of stock";
  };

  return (
    <div className="admin-panel">
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo">AdminPanel</div>
        </div>
        <div className="navbar-right">
          <button className="btn-notification">
            <i className="bell-icon">🔔</i>
            <span className="notification-badge">3</span>
          </button>
          <div className="user-profile">
            <div className="avatar">SA</div>
            <span>Sam Admin</span>
          </div>
        </div>
      </nav>

      <div className="main-container">
        {/* Sidebar - 20% width */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>Menu</h3>
          </div>
          <nav className="sidebar-menu">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`menu-item ${activeMenuItem === item.name ? 'active' : ''}`}
                onClick={() => handleMenuItemClick(item.name)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-text">{item.name}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="help-section">
              <div className="help-icon">❓</div>
              <div>
                <p className="help-title">Need help?</p>
                <p className="help-subtitle">Check our docs</p>
              </div>
            </div>
            <button className="upgrade-btn">
              <span className="upgrade-icon">🚀</span>
              <span>Upgrade to PRO</span>
            </button>
          </div>
        </aside>

        {/* Main Content - 80% width */}
        <main className="main-content">
          <header className="content-header">
            <h1>Admin Overview</h1>
            <div className="header-actions">
              <button className="btn-primary" onClick={() => navigate('/products')}>
                Add New Product
              </button>
              <button className="btn-secondary">Export</button>
            </div>
          </header>
          
          <div className="dashboard-content">
            <div className="left-column">
              <section className="top-products">
                <div className="section-header">
                  <h2>Top Products</h2>
                  <button className="see-all-btn" onClick={() => navigate('/products')}>
                    See All
                  </button>
                </div>
                
                {loading ? (
                  <div className="loading-section">
                    <div className="loading-spinner"></div>
                    <p>Loading top products...</p>
                  </div>
                ) : topProducts.length === 0 ? (
                  <div className="empty-section">
                    <div className="empty-icon">📦</div>
                    <p>No products found</p>
                  </div>
                ) : (
                  <div className="products-list">
                    {topProducts.map((product, index) => (
                      <div key={product._id || product.id} className="product-card">
                        <div className="product-info">
                          <h4>{product.name}</h4>
                          <div className="product-details">
                            <span className="price">${product.price.toFixed(2)}</span>
                            <span className={`status ${getStatusColor(product.stock)}`}>
                              {getStatusText(product.stock)}
                            </span>
                            <span className="date">
                              {formatDate(product.createdAt || new Date())}
                            </span>
                            <span className="sold">Sold: {product.sold || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              
              <section className="top-selling">
                <h2>Top selling products</h2>
                <div className="selling-bars">
                  {topSellingProducts.map((product, index) => (
                    <div key={index} className="selling-item">
                      <span className="product-name">{product.name}</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${product.percentage}%` }}
                        ></div>
                      </div>
                      <span className="percentage">{product.percentage}%</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            
            <div className="right-column">
              <div className="stats-cards">
                <div className="stat-card_1">
                  <div className="stat-header">
                     <h3>{stats.totalSell}</h3>
                    <span className="stat-trend positive">7.42%</span>
                  </div>
                  <p className="stat-label">Total Sell</p>
                </div>
                
                <div className="stat-card_1">
                  <h3>{stats.totalOrders}</h3>
                  <p className="stat-label">Total Order</p>
                </div>
                
                <div className="stat-card_1">
                          <h3>{stats.totalPlans}</h3>
                       <p className="stat-label">Total Plans</p>
                       </div>

              </div>
              
              <section className="sales-section">
                <div className="section-header">
                  <h2>Sales</h2>
                  <div className="time-filter">
                    <button 
                      className={`time-btn ${timeRange === 'Weekly' ? 'active' : ''}`}
                      onClick={() => setTimeRange('Weekly')}
                    >
                      Weekly
                    </button>
                    <button 
                      className={`time-btn ${timeRange === 'Monthly' ? 'active' : ''}`}
                      onClick={() => setTimeRange('Monthly')}
                    >
                      Monthly
                    </button>
                    <button 
                      className={`time-btn ${timeRange === 'Yearly' ? 'active' : ''}`}
                      onClick={() => setTimeRange('Yearly')}
                    >
                      Yearly
                    </button>
                  </div>
                </div>
                <div className="chart-placeholder">
                  <div className="chart-bars">
                    {[65, 40, 75, 50, 60, 80, 45].map((height, index) => (
                      <div key={index} className="chart-bar" style={{ height: `${height}%` }}></div>
                    ))}
                  </div>
                </div>
                <div className="chart-footer">
                  <span>All Categories</span>
                  <button className="report-link">Year full report →</button>
                </div>
              </section>
              
              <section className="active-orders">
                <div className="section-header">
                  <h2>Active Orders</h2>
                  <button className="see-all-btn" onClick={() => navigate('/orders')}>
                    See All
                  </button>
                </div>
                <div className="orders-list">
                  {activeOrders.map((order, index) => (
                    <div key={index} className="order-item">
                      <span className="country">{order.country}</span>
                      <div className="order-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${order.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="order-percentage">{order.percentage}%</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;