import React from "react";
import { FaLock, FaBookOpen, FaBolt, FaUserFriends } from "react-icons/fa";
import "./FeaturesSection.css";

const FeaturesSection = () => {
  return (
    <section className="features-section">
      <h2>Why Choose <span>PdfBazaar</span>?</h2>
      <p className="features-subtitle">
        Experience the next generation of digital learning and eBook shopping.
      </p>

      <div className="features-container">
        <div className="feature-card">
          <FaBookOpen className="feature-icon" />
          <h3>Wide Collection</h3>
          <p>Access thousands of premium PDFs, notes, and eBooks for every subject.</p>
        </div>

        <div className="feature-card">
          <FaLock className="feature-icon" />
          <h3>Secure Access</h3>
          <p>Your purchased PDFs are protected and available only to you.</p>
        </div>

        <div className="feature-card">
          <FaBolt className="feature-icon" />
          <h3>Instant Unlock</h3>
          <p>Unlock and read PDFs instantly after purchase, without any waiting.</p>
        </div>

        <div className="feature-card">
          <FaUserFriends className="feature-icon" />
          <h3>Multi-User System</h3>
          <p>Different users can buy, store, and manage their PDFs easily.</p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
