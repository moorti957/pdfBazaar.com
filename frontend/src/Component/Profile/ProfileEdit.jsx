import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave, faTimes, faCalendarAlt, faPhone, faMapMarkerAlt, faUserShield, faGlobe, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './ProfileEdit.css';

const ProfileEdit = () => {
  // Initial user data based on your screenshots
  const initialUserData = {
    firstName: 'Natashia',
    lastName: 'Khaleira',
    email: 'info@binary-fusion.com',
    phone: '(+62) 821 2554-5846',
    userRole: 'Admin',
    dateOfBirth: '12-10-1990',
    country: 'United Kingdom',
    city: 'Leeds, East London',
    postalCode: 'ERT 1254',
    profilePicture: 'https://via.placeholder.com/150',
    location: 'Leeds, United Kingdom'
  };

  const [userData, setUserData] = useState(initialUserData);
  const [editedData, setEditedData] = useState(initialUserData);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Handle input changes for edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open edit popup
  const openEditPopup = () => {
    setEditedData(userData);
    setShowEditPopup(true);
  };

  // Close edit popup
  const closeEditPopup = () => {
    setShowEditPopup(false);
  };

  // Save changes
  const handleSave = () => {
    setUserData(editedData);
    setShowEditPopup(false);
    console.log('Saved data:', editedData);
    alert('Profile updated successfully!');
  };

  return (
    <div className="profile-container">
      {/* Header Section */}
      <header className="profile-header">
        <div className="container">
          <h1 className="page-title">My Profile</h1>
        </div>
      </header>

      <main className="profile-main container">
        {/* Profile Summary Card */}
        <div className="profile-summary-card">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              <img 
                src={userData.profilePicture} 
                alt="Profile" 
                className="profile-avatar"
              />
            </div>
            <div className="profile-basic-info">
              <h2 className="profile-name">{userData.firstName} {userData.lastName}</h2>
              <div className="role-badge">{userData.userRole}</div>
              <div className="location-info">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>{userData.location}</span>
              </div>
            </div>
          </div>
          <button className="edit-profile-btn" onClick={openEditPopup}>
            <FontAwesomeIcon icon={faEdit} />
            Edit Profile
          </button>
        </div>

        {/* Personal Information Card */}
        <div className="info-card">
          <div className="card-header">
            <h3 className="card-title">Personal Information</h3>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-group">
                <label className="info-label">First Name</label>
                <div className="info-value">{userData.firstName}</div>
              </div>
              <div className="info-group">
                <label className="info-label">Last Name</label>
                <div className="info-value">{userData.lastName}</div>
              </div>
              <div className="info-group">
                <label className="info-label">Date of Birth</label>
                <div className="info-value">
                  <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
                  {userData.dateOfBirth}
                </div>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-group">
                <label className="info-label">Email Address</label>
                <div className="info-value">
                  <FontAwesomeIcon icon={faEnvelope} className="icon" />
                  {userData.email}
                </div>
              </div>
              <div className="info-group">
                <label className="info-label">Phone Number</label>
                <div className="info-value">
                  <FontAwesomeIcon icon={faPhone} className="icon" />
                  {userData.phone}
                </div>
              </div>
              <div className="info-group">
                <label className="info-label">User Role</label>
                <div className="info-value role-display">
                  <FontAwesomeIcon icon={faUserShield} className="icon" />
                  {userData.userRole}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="info-card">
          <div className="card-header">
            <h3 className="card-title">Address</h3>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-group">
                <label className="info-label">Country</label>
                <div className="info-value">
                  <FontAwesomeIcon icon={faGlobe} className="icon" />
                  {userData.country}
                </div>
              </div>
              <div className="info-group">
                <label className="info-label">City</label>
                <div className="info-value">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="icon" />
                  {userData.city}
                </div>
              </div>
              <div className="info-group">
                <label className="info-label">Postal Code</label>
                <div className="info-value">{userData.postalCode}</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Popup Modal */}
      {showEditPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                <FontAwesomeIcon icon={faEdit} />
                Edit Personal Information
              </h2>
              <button className="modal-close" onClick={closeEditPopup}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-body">
              <div className="edit-form-grid">
                {/* Left Column */}
                <div className="edit-form-column">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={editedData.firstName}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={editedData.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editedData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="text"
                      name="dateOfBirth"
                      value={editedData.dateOfBirth}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="edit-form-column">
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={editedData.lastName}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">User Role</label>
                    <select
                      name="userRole"
                      value={editedData.userRole}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="Admin">Admin</option>
                      <option value="User">User</option>
                      <option value="Editor">Editor</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      value={editedData.city}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={editedData.postalCode}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Country Field (Full Width) */}
              <div className="form-group full-width">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  name="country"
                  value={editedData.country}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={closeEditPopup}>
                Cancel
              </button>
              <button className="btn btn-save" onClick={handleSave}>
                <FontAwesomeIcon icon={faSave} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileEdit;