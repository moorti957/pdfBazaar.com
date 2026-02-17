import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CustomerPage.css';

const CustomerPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    newThisMonth: 0
  });

  const customersPerPage = 10;

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
    fetchCustomerStats();
  }, []);

  // Filter customers when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/customers');
      if (response.data.success) {
        setCustomers(response.data.customers);
        setFilteredCustomers(response.data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers/stats');
      if (response.data.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching customer stats:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateWithTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/customers/${customerId}`);
        if (response.data.success) {
          alert('Customer deleted successfully!');
          fetchCustomers();
          fetchCustomerStats();
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete customer');
      }
    }
  };

  const handleBlockCustomer = async (customerId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    const action = newStatus === 'blocked' ? 'block' : 'unblock';
    
    if (window.confirm(`Are you sure you want to ${action} this customer?`)) {
      try {
        const response = await axios.put(`http://localhost:5000/api/customers/${customerId}/status`, {
          status: newStatus
        });
        
        if (response.data.success) {
          alert(`Customer ${action}ed successfully!`);
          fetchCustomers();
        }
      } catch (error) {
        console.error('Error updating customer status:', error);
        alert('Failed to update customer status');
      }
    }
  };

  // Pagination logic
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Address', 'Join Date', 'Status', 'Total Orders', 'Total Spent'];
    const csvContent = [
      headers.join(','),
      ...filteredCustomers.map(customer => [
        `"${customer.name || ''}"`,
        `"${customer.email || ''}"`,
        `"${customer.phone || ''}"`,
        `"${customer.address || ''}"`,
        `"${formatDate(customer.createdAt)}"`,
        `"${customer.status || 'active'}"`,
        `"${customer.totalOrders || 0}"`,
        `"$${customer.totalSpent?.toFixed(2) || '0.00'}"`
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="customer-page">
      {/* Header */}
      <header className="customer-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
        <h1>Customer Management</h1>
      </header>

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon total-customers">👥</div>
          <div className="stat-info">
            <h3>{stats.totalCustomers}</h3>
            <p>Total Customers</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon active-customers">✅</div>
          <div className="stat-info">
            <h3>{stats.activeCustomers}</h3>
            <p>Active Customers</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon new-customers">🆕</div>
          <div className="stat-info">
            <h3>{stats.newThisMonth}</h3>
            <p>New This Month</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon total-orders">📦</div>
          <div className="stat-info">
            <h3>${stats.totalRevenue?.toFixed(2) || '0.00'}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="action-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search customers by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              ✕
            </button>
          )}
        </div>
        
        <div className="action-buttons">
          <button className="btn-export" onClick={handleExportCSV}>
            📥 Export CSV
          </button>
          <button className="btn-refresh" onClick={fetchCustomers} disabled={loading}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="customers-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-container">
            <div className="empty-icon">👤</div>
            <h3>No customers found</h3>
            <p>{searchTerm ? 'Try a different search term' : 'No customers in the database yet'}</p>
          </div>
        ) : (
          <>
            <div className="customers-table-container">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact Info</th>
                    <th>Join Date</th>
                    <th>Status</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers.map((customer) => (
                    <tr key={customer._id || customer.id}>
                      <td>
                        <div className="customer-info-cell">
                          <div className="customer-avatar">
                            {customer.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="customer-name-email">
                            <strong>{customer.name || 'Unknown Customer'}</strong>
                            <small>ID: {customer._id?.substring(0, 8) || 'N/A'}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div className="contact-email">{customer.email || 'No email'}</div>
                          <div className="contact-phone">{customer.phone || 'No phone'}</div>
                        </div>
                      </td>
                      <td>
                        <div className="join-date">
                          {formatDate(customer.createdAt)}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${customer.status || 'active'}`}>
                          {customer.status || 'active'}
                        </span>
                      </td>
                      <td>
                        <div className="orders-count">
                          <span className="count-number">{customer.totalOrders || 0}</span>
                          <span className="count-label">orders</span>
                        </div>
                      </td>
                      <td>
                        <div className="total-spent">
                          <strong>${customer.totalSpent?.toFixed(2) || '0.00'}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          <button 
                            className="btn-view" 
                            onClick={() => handleViewDetails(customer)}
                            title="View Details"
                          >
                            👁️ View
                          </button>
                          <button 
                            className={`btn-status ${customer.status === 'blocked' ? 'btn-unblock' : 'btn-block'}`}
                            onClick={() => handleBlockCustomer(customer._id, customer.status)}
                            title={customer.status === 'blocked' ? 'Unblock Customer' : 'Block Customer'}
                          >
                            {customer.status === 'blocked' ? '✅ Unblock' : '⛔ Block'}
                          </button>
                          <button 
                            className="btn-delete" 
                            onClick={() => handleDeleteCustomer(customer._id)}
                            title="Delete Customer"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                
                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                    <button
                      key={pageNumber}
                      className={`page-btn ${currentPage === pageNumber ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>
                
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}

            {/* Summary */}
            <div className="table-summary">
              Showing {indexOfFirstCustomer + 1} to {Math.min(indexOfLastCustomer, filteredCustomers.length)} of {filteredCustomers.length} customers
            </div>
          </>
        )}
      </div>

      {/* Customer Details Modal */}
      {showModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="customer-details-grid">
                <div className="detail-section">
                  <h3>Basic Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Full Name:</span>
                    <span className="detail-value">{selectedCustomer.name || 'Not provided'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedCustomer.email || 'Not provided'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{selectedCustomer.phone || 'Not provided'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value status-${selectedCustomer.status || 'active'}`}>
                      {selectedCustomer.status || 'active'}
                    </span>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h3>Address</h3>
                  <div className="detail-row">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{selectedCustomer.address || 'Not provided'}</span>
                  </div>
                  {selectedCustomer.city && (
                    <div className="detail-row">
                      <span className="detail-label">City:</span>
                      <span className="detail-value">{selectedCustomer.city}</span>
                    </div>
                  )}
                  {selectedCustomer.country && (
                    <div className="detail-row">
                      <span className="detail-label">Country:</span>
                      <span className="detail-value">{selectedCustomer.country}</span>
                    </div>
                  )}
                  {selectedCustomer.zipCode && (
                    <div className="detail-row">
                      <span className="detail-label">ZIP Code:</span>
                      <span className="detail-value">{selectedCustomer.zipCode}</span>
                    </div>
                  )}
                </div>
                
                <div className="detail-section">
                  <h3>Activity</h3>
                  <div className="detail-row">
                    <span className="detail-label">Member Since:</span>
                    <span className="detail-value">{formatDateWithTime(selectedCustomer.createdAt)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Last Active:</span>
                    <span className="detail-value">
                      {selectedCustomer.lastActive ? formatDateWithTime(selectedCustomer.lastActive) : 'Unknown'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total Orders:</span>
                    <span className="detail-value">{selectedCustomer.totalOrders || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total Spent:</span>
                    <span className="detail-value">${selectedCustomer.totalSpent?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                
                {selectedCustomer.notes && (
                  <div className="detail-section full-width">
                    <h3>Notes</h3>
                    <div className="notes-content">
                      {selectedCustomer.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className={`btn-modal ${selectedCustomer.status === 'blocked' ? 'btn-unblock' : 'btn-block'}`}
                onClick={() => {
                  handleBlockCustomer(selectedCustomer._id, selectedCustomer.status);
                  setShowModal(false);
                }}
              >
                {selectedCustomer.status === 'blocked' ? '✅ Unblock Customer' : '⛔ Block Customer'}
              </button>
              <button className="btn-modal btn-close" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPage;