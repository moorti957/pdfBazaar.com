import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

import "./PDFDetail.css";
import PurchaseModal from "../PurchaseModal/PurchaseModal";

const pdfList = [
  {
    id: 1,
    title: "JavaScript Mastery Guide",
    description: "Learn JavaScript from basics to advanced concepts.",
    price: "₹199",
    img: "https://cdn-icons-png.flaticon.com/512/5968/5968292.png",
    content: "This PDF covers ES6, DOM, Async JS, and more."
  },
  {
    id: 2,
    title: "React.js for Beginners",
    description: "Start building interactive UI with React.js today.",
    price: "₹249",
    img: "https://cdn-icons-png.flaticon.com/512/1126/1126012.png",
    content: "Covers Components, Hooks, State Management & Routing."
  },
  {
    id: 3,
    title: "Node.js Crash Course",
    description: "Build backend applications using Node.js.",
    price: "₹179",
    img: "https://cdn-icons-png.flaticon.com/512/919/919825.png",
    content: "Includes Express, REST APIs, MongoDB integration."
  },
  {
    id: 4,
    title: "HTML & CSS Design Book",
    description: "Master web design with HTML & CSS.",
    price: "₹149",
    img: "https://cdn-icons-png.flaticon.com/512/919/919826.png",
    content: "Learn responsive design, Flexbox, Grid & animations."
  },
  {
    id: 5,
    title: "Fullstack Web Dev",
    description: "Learn fullstack web development step by step.",
    price: "₹299",
    img: "https://cdn-icons-png.flaticon.com/512/4140/4140045.png",
    content: "Frontend + Backend + Database + Deployment."
  },
];

const PDFDetail = () => {
  const { id } = useParams();
  const pdf = pdfList.find((item) => item.id === parseInt(id));
  const [showModal, setShowModal] = useState(false); // Modal state

  if (!pdf) {
    return <div style={{ padding: "50px", textAlign: "center" }}>PDF not found!</div>;
  }

  return (
    <section className="pdf-detail">
      <div className="pdf-detail-container">
        <img src={pdf.img} alt={pdf.title} />
        <div className="pdf-detail-info">
          <h1>{pdf.title}</h1>
          <p className="pdf-desc">{pdf.description}</p>
          <p className="pdf-content">{pdf.content}</p>
          <p className="pdf-price">{pdf.price}</p>
          <button className="unlock-btn" onClick={() => setShowModal(true)}>
            Unlock Now
          </button>
          <Link to="/pdfs" className="back-link">← Back to PDFs</Link>
        </div>
      </div>

      {showModal && <PurchaseModal pdf={pdf} onClose={() => setShowModal(false)} />}
    </section>
  );
};

export default PDFDetail;
