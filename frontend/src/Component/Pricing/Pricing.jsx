import React, { useState } from "react";
import "./Pricing.css";

const pricingPlans = [
  {
    name: "Basic",
    price: "₹1",
    features: ["Access to 5 PDFs", "Basic Support", "Free Updates"],
    description: "Perfect for beginners who want to explore our PDF library.",
    popular: false,
  },
  {
    name: "Standard",
    price: "₹1",
    features: ["Access to 15 PDFs", "Priority Support", "Free Updates", "Download Option"],
    description: "Great for regular learners who need more resources.",
    popular: true,
  },
  {
    name: "Premium",
    price: "₹1",
    features: ["Unlimited PDFs", "24/7 Support", "Premium Updates", "Download Option", "Early Access"],
    description: "Best for professionals and serious learners.",
    popular: false,
  },
];

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    paymentMethod: "creditCard",
  });

  // STEP 1: Alert Popup State
  const [alertPopup, setAlertPopup] = useState({
    show: false,
    type: "success",   // success | error
    message: ""
  });

  const handleBuyClick = (plan) => {
    setSelectedPlan(plan);
    setShowPopup(true);
    // Reset form data
    setFormData({
      name: "",
      email: "",
      phone: "",
      paymentMethod: "creditCard",
    });
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedPlan(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const getAmount = (price) => {
    return Number(price.replace("₹", ""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const amount = getAmount(selectedPlan.price);

      const res = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      // STEP 2 Change 1: Order create failed alert
      if (!data.success) {
        setAlertPopup({
          show: true,
          type: "error",
          message: "Order create failed ❌"
        });
        return;
      }

      const options = {
        key: "rzp_live_S8RMHt15gvcs1p", // 👈 TEST KEY use karo
        amount: data.order.amount,
        currency: "INR",
        name: "PDF Learning Platform",
        description: selectedPlan.name + " Plan Purchase",
        order_id: data.order.id,

        // STEP 2 Change 2: Payment Successful alert
        handler: async function (response) {
          setAlertPopup({
            show: true,
            type: "success",
            message: "Payment Successful ✅"
          });

          // 🔥 SAVE PAYMENT + SUBSCRIPTION IN MONGODB
          await fetch("http://localhost:5000/api/payment/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            

              userId: localStorage.getItem("userId"),
              planName: selectedPlan.name,
              amount: amount,
            }),
          });

          // STEP 2 Change 3: Subscription Activated alert
          setAlertPopup({
            show: true,
            type: "success",
            message: "Subscription Activated 🎉"
          });
          closePopup();
        },

        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },

        theme: { color: "#2563eb" },
      };

      // STEP 2 Change 5: Razorpay SDK failed to load alert
      if (!window.Razorpay) {
        setAlertPopup({
          show: true,
          type: "error",
          message: "Razorpay SDK failed to load"
        });
        return;
      }

      const razor = new window.Razorpay(options);
      razor.open();

    } catch (error) {
      console.error(error);
      // STEP 2 Change 4: Payment Failed alert
      setAlertPopup({
        show: true,
        type: "error",
        message: "Payment Failed ❌"
      });
    }
  };

  return (
    <section className="pricing-page">
      <h1>Pricing Plans</h1>
      <p className="subtitle">Choose the plan that fits your learning needs</p>

      <div className="pricing-container">
        {pricingPlans.map((plan, index) => (
          <div 
            className={`pricing-card ${plan.popular ? "popular" : ""}`} 
            key={index}
          >
            {plan.popular && <div className="popular-badge">Most Popular</div>}
            <h2 className="plan-name">{plan.name}</h2>
            <p className="plan-price">{plan.price}<span className="price-period">/month</span></p>
            <ul className="plan-features">
              {plan.features.map((feature, i) => (
                <li key={i}>
                  <span className="feature-check">✓</span> {feature}
                </li>
              ))}
            </ul>
            <button 
              className={`buy-btn ${plan.popular ? "popular-btn" : ""}`}
              onClick={() => handleBuyClick(plan)}
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>

      {/* Popup Modal */}
      {showPopup && selectedPlan && (
        <div className="popup-overlay">
          <div className="popup-container">
            <button className="close-btn_1" onClick={closePopup}>×</button>
            <div className="popup-content">
              <div className="plan-details">
                <h2>{selectedPlan.name} Plan</h2>
                <div className="plan-price-large">{selectedPlan.price}<span>/month</span></div>
                <p className="plan-description">{selectedPlan.description}</p>
                
                <div className="features-list">
                  <h3>Plan Features:</h3>
                  <ul>
                    {selectedPlan.features.map((feature, i) => (
                      <li key={i}>
                        <span className="feature-icon">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="plan-benefits">
                  <h3>Benefits:</h3>
                  <p>• Instant access after payment</p>
                  <p>• Cancel anytime</p>
                  <p>• 30-day money-back guarantee</p>
                </div>
              </div>
              
              <div className="purchase-form">
                <h2>Complete Your Purchase</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Payment Method</label>
                    <div className="payment-options">
                      <label className="payment-option">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="creditCard"
                          checked={formData.paymentMethod === "creditCard"}
                          onChange={handleInputChange}
                        />
                        <span>Credit/Debit Card</span>
                      </label>
                      <label className="payment-option">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={formData.paymentMethod === "upi"}
                          onChange={handleInputChange}
                        />
                        <span>UPI</span>
                      </label>
                      <label className="payment-option">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="netBanking"
                          checked={formData.paymentMethod === "netBanking"}
                          onChange={handleInputChange}
                        />
                        <span>Net Banking</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="order-summary">
                    <h3>Order Summary</h3>
                    <div className="summary-row">
                      <span>Plan:</span>
                      <span>{selectedPlan.name}</span>
                    </div>
                    <div className="summary-row">
                      <span>Price:</span>
                      <span>{selectedPlan.price}/month</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>{selectedPlan.price}</span>
                    </div>
                  </div>
                  
                  <button type="submit" className="submit-btn">
                    Complete Purchase
                  </button>
                  
                  <p className="secure-note">
                    🔒 Your payment is secure and encrypted
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Alert Popup JSX */}
      {alertPopup.show && (
        <div className="popup-overlay">
          <div className={`popup-box ${alertPopup.type}`}>
            <div className="popup-icon">
              {alertPopup.type === "success" ? "✅" : "❌"}
            </div>
            <h3>{alertPopup.type === "success" ? "Success" : "Error"}</h3>
            <p>{alertPopup.message}</p>
            <button
              className="popup-btn"
              onClick={() => setAlertPopup({ ...alertPopup, show: false })}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Pricing;