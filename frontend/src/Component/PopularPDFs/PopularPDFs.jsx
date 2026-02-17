import React from "react";
import "./PopularPDFs.css";
import { Link } from "react-router-dom";

const pdfData = [
  {
    id: 1,
    title: "JavaScript Mastery Guide",
    price: "₹199",
    img: "https://cdn-icons-png.flaticon.com/512/5968/5968292.png",
  },
  {
    id: 2,
    title: "React.js for Beginners",
    price: "₹249",
    img: "https://cdn-icons-png.flaticon.com/512/1126/1126012.png",
  },
  {
    id: 3,
    title: "Node.js Crash Course",
    price: "₹179",
    img: "https://cdn-icons-png.flaticon.com/512/919/919825.png",
  },
  {
    id: 4,
    title: "HTML & CSS Design Book",
    price: "₹149",
    img: "https://cdn-icons-png.flaticon.com/512/919/919826.png",
  },
];

const PopularPDFs = () => {
  return (
    <section className="popular-section">
      <h2>Popular <span>PDFs</span></h2>
      <p className="popular-subtitle">
        Unlock premium PDFs trusted by thousands of learners.
      </p>

      <div className="pdf-container">
        {pdfData.map((pdf) => (
         <Link to={'/pdfs'}> <div className="pdf-card" key={pdf.id}>
            <img src={pdf.img} alt={pdf.title} />
            <h3>{pdf.title}</h3>
            <p className="pdf-price">{pdf.price}</p>
            <button className="buy-btn">Buy Now</button>
          </div></Link>
        ))}
      </div>
    </section>
  );
};

export default PopularPDFs;
