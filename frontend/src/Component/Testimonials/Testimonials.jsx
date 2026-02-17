import React from "react";
import "./Testimonials.css";

const testimonials = [
  {
    id: 1,
    name: "Riya Sharma",
    role: "Student",
    review:
      "PdfBazaar se mujhe React.js ki book mili aur explanation bahut easy tha. Highly recommend!",
    img: "https://randomuser.me/api/portraits/women/79.jpg",
    rating: 5,
  },
  {
    id: 2,
    name: "Arjun Mehta",
    role: "Web Developer",
    review:
      "JavaScript Mastery PDF ne meri coding skill next level par pahucha di. Totally worth it!",
    img: "https://randomuser.me/api/portraits/men/44.jpg",
    rating: 4,
  },
  {
    id: 3,
    name: "Sneha Patel",
    role: "Designer",
    review:
      "Website ka design aur PDF unlock system dono hi smooth hain. Bahut accha experience!",
    img: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="testimonials-section">
      <h2>
        What Our <span>Users Say</span>
      </h2>
      <p className="testimonials-subtitle">
        Thousands of learners are already enjoying our PDFs!
      </p>

      <div className="testimonial-container">
        {testimonials.map((user) => (
          <div className="testimonial-card" key={user.id}>
            <img src={user.img} alt={user.name} className="user-img" />
            <h3>{user.name}</h3>
            <p className="role">{user.role}</p>
            <p className="review">“{user.review}”</p>
            <div className="stars">
              {"⭐".repeat(user.rating)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
