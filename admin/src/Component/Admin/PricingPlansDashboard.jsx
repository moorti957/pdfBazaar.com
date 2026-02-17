import React, { useState, useEffect } from 'react';
import './PricingPlansDashboard.css';
import { useNavigate } from 'react-router-dom';

const PricingPlansDashboard = () => {
    const navigate = useNavigate(); 
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalCustomers: 0,
    avgPurchaseValue: 0
  });

  // ये फंक्शन आपके backend से डेटा fetch करेगा
  const fetchPurchases = async () => {
  try {
    setLoading(true);

    const response = await fetch('http://localhost:5000/api/payment/purchases');
    const data = await response.json();

    console.log("PURCHASE API RESPONSE:", data);

    const purchaseArray = Array.isArray(data) 
      ? data 
      : Array.isArray(data.purchases) 
        ? data.purchases 
        : [];

    setPurchases(purchaseArray);
    calculateStats(purchaseArray);

  } catch (error) {
    console.error('Error fetching purchases:', error);
    setPurchases([]);
  } finally {
    setLoading(false);
  }
};


  const calculateStats = (purchaseData) => {
    const totalRevenue = purchaseData.reduce((sum, purchase) => sum + purchase.price, 0);
    const activeSubscriptions = purchaseData.filter(p => p.status === 'Active').length;
    const totalCustomers = new Set(purchaseData.map(p => p.userId)).size;
    const avgPurchaseValue = totalRevenue / purchaseData.length || 0;

    setStats({
      totalRevenue,
      activeSubscriptions,
      totalCustomers,
      avgPurchaseValue: avgPurchaseValue.toFixed(2)
    });
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || purchase.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const StatusBadge = ({ status }) => {
    let className = 'status-badge ';
    if (status === 'Active') className += 'status-active';
    else if (status === 'Expired') className += 'status-expired';
    else className += 'status-cancelled';
    
    return <span className={className}>{status}</span>;
  };

  const refreshData = () => {
    fetchPurchases();
  };

  const exportData = () => {
    const csvContent = [
      ['ID', 'Customer', 'Email', 'Plan', 'Price', 'Status', 'Purchase Date', 'Expiry Date'],
      ...purchases.map(p => [
        p.id,
        p.customerName,
        p.email,
        p.planName,
        `$${p.price}`,
        p.status,
        p.purchaseDate,
        p.expiryDate
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricing-plans-export.csv';
    a.click();
  };

  return (
    <div className="ppd-pricing-dashboard">
  {/* Header */}
  <div className="ppd-dashboard-header">
    <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
    <div className="ppd-header-content">
      <h1 className="ppd-dashboard-title"> Pricing Management</h1>
      {/* <p className="ppd-dashboard-subtitle">Manage all purchased plans from your website</p> */}
    </div>
    <div className="ppd-header-actions">
      <button className="ppd-btn ppd-btn-primary" onClick={refreshData}>
        🔄 Refresh Data
      </button>
      <button className="ppd-btn ppd-btn-secondary" onClick={exportData}>
        📥 Export CSV
      </button>
    </div>
  </div>

  {/* Stats Cards */}
  <div className="ppd-stats-container">
    <div className="ppd-stat-card">
      <div className="ppd-stat-icon">💰</div>
      <div className="ppd-stat-content">
        <h3 className="ppd-stat-title">Total Revenue</h3>
        <p className="ppd-stat-value">₹{stats.totalRevenue}</p>
        <p className="ppd-stat-desc">All-time earnings</p>
      </div>
    </div>

    <div className="ppd-stat-card">
      <div className="ppd-stat-icon">👥</div>
      <div className="ppd-stat-content">
        <h3 className="ppd-stat-title">Active Plans</h3>
        <p className="ppd-stat-value">{stats.activeSubscriptions}</p>
        <p className="ppd-stat-desc">Currently active</p>
      </div>
    </div>

    <div className="ppd-stat-card">
      <div className="ppd-stat-icon">👤</div>
      <div className="ppd-stat-content">
        <h3 className="ppd-stat-title">Customers</h3>
        <p className="ppd-stat-value">{stats.totalCustomers}</p>
        <p className="ppd-stat-desc">Total customers</p>
      </div>
    </div>

    <div className="ppd-stat-card">
      <div className="ppd-stat-icon">📈</div>
      <div className="ppd-stat-content">
        <h3 className="ppd-stat-title">Avg. Value</h3>
        <p className="ppd-stat-value">₹{stats.avgPurchaseValue}</p>
        <p className="ppd-stat-desc">Per purchase</p>
      </div>
    </div>
  </div>

  {/* Main Content */}
  <div className="ppd-main-content">
    {/* Purchases Table Section */}
    <div className="ppd-table-section">
      <div className="ppd-section-header">
        <h2 className="ppd-section-title">Purchased Plans</h2>
        <div className="ppd-filters">
          <div className="ppd-search-box">
            <span className="ppd-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search customers or plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ppd-search-input"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="ppd-filter-select"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="ppd-loading-state">
          <div className="ppd-loading-spinner"></div>
          <p>Loading purchase data...</p>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="ppd-empty-state">
          <div className="ppd-empty-icon">📭</div>
          <p>No purchases found</p>
        </div>
      ) : (
        <div className="ppd-table-container">
          <table className="ppd-purchases-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Plan</th>
                <th>Price</th>
                <th>Status</th>
                <th>Purchase Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="ppd-table-row">
                  <td>
                    <div className="ppd-customer-cell">
                      <div className="ppd-customer-avatar">
                        {purchase.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="ppd-customer-name">{purchase.customerName}</p>
                        <p className="ppd-customer-email">{purchase.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="ppd-plan-tag">{purchase.planName}</span>
                  </td>
                  <td className="ppd-price-cell">
                    <span className="ppd-price-amount">₹{purchase.price}</span>
                  </td>
                  <td>
                    <StatusBadge status={purchase.status} />
                  </td>
                  <td>
                    <span className="ppd-date-text">{purchase.purchaseDate}</span>
                  </td>
                  <td>
                    <button
                      className="ppd-btn-view"
                      onClick={() => setSelectedPlan(purchase)}
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* Details Sidebar */}
    <div className="ppd-details-sidebar">
      <div className="ppd-sidebar-card">
        <h3 className="ppd-sidebar-title">
          {selectedPlan ? 'Plan Details' : 'Select a Plan'}
        </h3>

        {selectedPlan ? (
          <div className="ppd-plan-details">
            <div className="ppd-detail-header">
              <div className="ppd-detail-avatar">
                {selectedPlan.customerName.charAt(0)}
              </div>
              <div>
                <h4 className="ppd-detail-customer">{selectedPlan.customerName}</h4>
                <p className="ppd-detail-email">{selectedPlan.email}</p>
              </div>
            </div>

            <div className="ppd-detail-section">
              <h5 className="ppd-detail-label">Plan Information</h5>
              <div className="ppd-detail-info">
                <span className="ppd-info-label">Plan:</span>
                <span className="ppd-info-value">{selectedPlan.planName}</span>
              </div>
              <div className="ppd-detail-info">
                <span className="ppd-info-label">Price:</span>
                <span className="ppd-info-value ppd-price-highlight">₹{selectedPlan.price}</span>
              </div>
            </div>

            <div className="ppd-detail-section">
              <h5 className="ppd-detail-label">Dates</h5>
              <div className="ppd-date-grid">
                <div>
                  <p className="ppd-date-label">Purchased:</p>
                  <p className="ppd-date-value">{selectedPlan.purchaseDate}</p>
                </div>
                <div>
                  <p className="ppd-date-label">Expires:</p>
                  <p className="ppd-date-value">{selectedPlan.expiryDate}</p>
                </div>
              </div>
            </div>

            <div className="ppd-detail-section">
              <h5 className="ppd-detail-label">Payment Method</h5>
              <div className="ppd-payment-method">
                <span className="ppd-payment-icon">💳</span>
                <span>{selectedPlan.paymentMethod}</span>
              </div>
            </div>

            <div className="ppd-detail-section">
              <h5 className="ppd-detail-label">Features Included</h5>
              <ul className="ppd-features-list">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="ppd-feature-item">
                    <span className="ppd-feature-check">✅</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="ppd-detail-section">
              <h5 className="ppd-detail-label">Status</h5>
              <StatusBadge status={selectedPlan.status} />
            </div>

            <div className="ppd-detail-actions">
              <button className="ppd-btn-action ppd-btn-edit">✏️ Edit Plan</button>
              <button className="ppd-btn-action ppd-btn-renew">🔄 Renew</button>
            </div>
          </div>
        ) : (
          <div className="ppd-empty-details">
            <div className="ppd-empty-details-icon">📋</div>
            <p>Select a purchase from the table to view details</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="ppd-sidebar-card">
        <h3 className="ppd-sidebar-title">📊 Quick Stats</h3>
        <div className="ppd-quick-stats">
          <div className="ppd-quick-stat">
            <span className="ppd-stat-number">{filteredPurchases.length}</span>
            <span className="ppd-stat-label">Filtered Plans</span>
          </div>
          <div className="ppd-quick-stat">
            <span className="ppd-stat-number">
              {filteredPurchases.filter(p => p.status === 'Active').length}
            </span>
            <span className="ppd-stat-label">Active Now</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};

export default PricingPlansDashboard;