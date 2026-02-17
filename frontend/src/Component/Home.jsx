import React from "react";
import HeroSection from "./HeroSection/HeroSection";
import FeaturesSection from "./FeaturesSection/FeaturesSection";
import PopularPDFs from "./PopularPDFs/PopularPDFs";
import Testimonials from "./Testimonials/Testimonials";
import SubscribeSection from "./SubscribeSection/SubscribeSection";
import BackToTop from "./BackToTop/BackToTop";
import PDFCard from "./PDFCard/PDFCard";


const Home = () => {
  return (
    <>
      <HeroSection/>
      <FeaturesSection/>
      <PDFCard/>
      <Testimonials/>
      <SubscribeSection/>
      <BackToTop/>
    </>
  );
};

export default Home;
