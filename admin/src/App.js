import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import AdminPanel from './Component/Admin/AdminPanel';
import ProductPage from './Component/Admin/ProductPage';
import CustomerPage from './Component/Admin/CustomerPage';
import PricingPlansDashboard from './Component/Admin/PricingPlansDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AdminPanel />} />
          <Route path="/products" element={<ProductPage/>} />
          <Route path="/customers" element={<CustomerPage/>} />
          <Route path="/pricing-plans" element={<PricingPlansDashboard/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;