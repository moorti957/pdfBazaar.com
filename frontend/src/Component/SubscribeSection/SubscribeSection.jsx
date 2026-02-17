import React, { useState } from "react";
import "./SubscribeSection.css";

const SubscribeSection = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing: ${email}`);
      setEmail("");
    } else {
      alert("Please enter a valid email address");
    }
  };

  return (
    <section className="subscribe-section">
      <div className="subscribe-content">
        <h2>Stay Updated!</h2>
        <p>Subscribe to our newsletter and never miss new PDFs and offers.</p>

        <form onSubmit={handleSubscribe} className="subscribe-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </section>
  );
};

export default SubscribeSection;
