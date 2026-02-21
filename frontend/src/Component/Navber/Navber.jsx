import React, { useState, useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import "./Navber.css";
import { assets } from "../../assets/assets";
import { UserContext } from "../../context/UserContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useContext(UserContext);
  const dropdownRef = useRef(null);
  const profileImgRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
    if (isOpen) setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        profileImgRef.current && 
        !profileImgRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <img src={assets.logo} className="logo-img" alt="" /> 
          PdfBazaar<span>.</span>
        </Link>

        {/* Hamburger Icon */}
        <div className="menu-icon" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Nav Links */}
        <ul className={isOpen ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={toggleMenu}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/pdfs" className="nav-link" onClick={toggleMenu}>
              PDFs
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/favorites" className="nav-link" onClick={toggleMenu}>
              My Favorites
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className="nav-link" onClick={toggleMenu}>
              Contact
            </Link>
          </li>

          {/* Login/Profile */}
          <li className="nav-item">
            {user ? (
              <div className="profile-menu">
                <img
                  ref={profileImgRef}
                  src={
                    user?.avatar
                      ? `http://localhost:5000${user.avatar}`
                      : "https://i.pravatar.cc/150?img=12"
                  }
                  alt="profile"
                  className="navbar-profile-img"
                  onClick={handleProfileClick}
                  title="View Profile"
                />

                {/* Overlay for mobile */}
                {showDropdown && window.innerWidth <= 768 && (
                  <div 
                    className="dropdown-overlay" 
                    onClick={() => setShowDropdown(false)}
                  />
                )}

                {/* Dropdown Menu */}
                {showDropdown && (
  <div className="dropdown" ref={dropdownRef}>
    {/* Header with greeting */}
    {/* <p>
      Welcome Back, <span>{user.name || user.email.split('@')[0]}</span>
    </p>
     */}
    {/* User Info Section */}
    <div className="user-info">
      <img
        src={
          user?.avatar
            ? `http://localhost:5000${user.avatar}`
            : "https://i.pravatar.cc/150?img=12"
        }
        alt="profile"
        className="user-avatar-large"
      />
      <div className="user-details">
        <h4>{user.name || "User"}</h4>
        <p>{user.email}</p>
        <p style={{ fontSize: '12px', color: '#38bdf8', marginTop: '5px' }}>
          Premium Member
        </p>
      </div>
    </div>
    
    {/* Menu Items */}
    <div className="dropdown-menu-items">
      <Link 
        to="/profile" 
        className="dropdown-item profile-item"
        onClick={() => {
          setShowDropdown(false);
          if (isOpen) setIsOpen(false);
        }}
      >
        My Profile
      </Link>
      <Link 
        to="/favorites" 
        className="dropdown-item"
        onClick={() => {
          setShowDropdown(false);
          if (isOpen) setIsOpen(false);
        }}
      >
        <span style={{ marginRight: '12px' }}>⭐</span>
        Favorites
        <span style={{ fontSize: '12px', marginLeft: '10px', color: '#94a3b8' }}>
          8 items
        </span>
      </Link>
      <Link 
        to="/settings" 
        className="dropdown-item settings-item"
        onClick={() => {
          setShowDropdown(false);
          if (isOpen) setIsOpen(false);
        }}
      >
        Account Settings
      </Link>
    </div>
    
    {/* Logout Button */}
    <button className="logout-button" onClick={handleLogout}>
      Logout
    </button>
  </div>
)}
              </div>
            ) : (
              <Link to="/login" className="nav-btn" onClick={toggleMenu}>
                <FaUserCircle style={{ marginRight: "8px" }} />
                Login / Signup
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;