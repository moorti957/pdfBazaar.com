import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Component/Home";
import PDFpage from "./Component/PDFpage/PDFpage";
import Pricing from "./Component/Pricing/Pricing";
import Contact from "./Component/Contact/Contact";
import Login from "./Component/Login/Login";
import Navber from "./Component/Navber/Navber";
import Footer from "./Component/Footer/Footer";
import PDFDetail from "./Component/PDFDetail/PDFDetail";
import { UserProvider } from "./context/UserContext";
import Profile from "./Component/Profile/Profile";
import { Profiler } from "react";
import ProfileEdit from "./Component/Profile/ProfileEdit";




function App() {
  return (
    <UserProvider>
      <Navber />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pdfs" element={<PDFpage />} />
        <Route path="/pdfs/:id" element={<PDFDetail />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile/>} />
        {/* <Route path="/admin/login" element={<AdminLogin/>} />
        <Route path="/admin/dashboard" element={<AdminDashboard/>} />
        <Route path="/admin/add-pdf" element={<AddPDF/>} /> */}
        {/* <Route path="/admin/manage-pdfs" element={<ManagePDFs/>} />
        <Route path="/admin/users" element={<ManageUsers/>} /> */}

      </Routes>
      <Footer />
    </UserProvider>
  );
}

export default App;
