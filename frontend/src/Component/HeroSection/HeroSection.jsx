import React from "react";
import { Link } from "react-router-dom";
import "./HeroSection.css";

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>
          Welcome to <span>PdfBazaar</span>
        </h1>
        <p>
          Buy, unlock, and read premium PDFs instantly. Your one-stop destination
          for study materials, eBooks, and digital notes.
        </p>

        <div className="hero-buttons">
          <Link to="/pdfs" className="btn-primary">
            Explore PDFs
          </Link>
          <Link to="/login" className="btn-secondary">
            Join Now
          </Link>
        </div>
      </div>

      <div className="hero-image">
        <img
          src="https://cdn-icons-png.flaticon.com/512/4113/4113006.png"
          alt="PDF Illustration"
        />
      </div>
    </section>
  );
};

export default HeroSection;
