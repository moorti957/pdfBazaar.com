import React, { useState } from "react";
import "./PurchaseModal.css";

const PurchaseModal = ({ pdf, onClose }) => {
  const [email, setEmail] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);

  const handlePayment = (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email");
      return;
    }

    // Mock payment simulation
    setPaymentDone(true);
    setTimeout(() => {
      alert(`Payment successful! PDF "${pdf.title}" unlocked for ${email}`);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Unlock "{pdf.title}"</h2>
        {!paymentDone ? (
          <form onSubmit={handlePayment}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Pay {pdf.price}</button>
          </form>
        ) : (
          <p>Processing payment...</p>
        )}
      </div>
    </div>
  );
};

export default PurchaseModal;
