import React, { useState } from "react";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill all fields");
      return;
    }
    // Mock form submission
    alert(`Thank you, ${formData.name}! We have received your message.`);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section className="contact-page">
      <h1>Contact Us</h1>
      <p className="subtitle">We would love to hear from you!</p>

      <div className="contact-container">
        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            required
          ></textarea>
          <button type="submit" className="submit-btn">Send Message</button>
        </form>

        <div className="contact-info">
          <h2>Our Contact Info</h2>
          <p>Email: support@pdfbazaar.com</p>
          <p>Phone: +91 9876543210</p>
          <p>Address: 123, Tech Street, India</p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
