import React, { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
import "./BackToTop.css";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const toggleVisible = () => {
    const scrolled = document.documentElement.scrollTop;
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrolled / windowHeight) * 100;
    
    if (scrolled > 300) {
      setVisible(true);
    } else {
      setVisible(false);
    }
    
    setScrollProgress(Math.min(scrollPercent, 100));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisible);
    return () => window.removeEventListener("scroll", toggleVisible);
  }, []);

  return (
    <button
      className="back-to-top"
      onClick={scrollToTop}
      style={{ 
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
        transform: `scale(${visible ? 1 : 0.8})`
      }}
    >
      {/* Water fill container */}
      <div className="water-fill-container">
        {/* Outer circle */}
        <div className="water-outer-circle">
          {/* Water fill - rises as scroll increases */}
          <div 
            className="water-fill" 
            style={{ 
              height: `${scrollProgress}%`,
              bottom: '0'
            }}
          >
            {/* Water waves effect */}
            <div className="water-wave wave-1"></div>
            <div className="water-wave wave-2"></div>
            <div className="water-wave wave-3"></div>
          </div>
          
          {/* Inner circle for arrow */}
          <div className="water-inner-circle">
            <FaArrowUp className="water-arrow" />
          </div>
          
          {/* Progress text (optional) */}
          {/* <div className="progress-text">
            {Math.round(scrollProgress)}%
          </div> */}
        </div>
      </div>
    </button>
  );
};


export default BackToTop;