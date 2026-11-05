import React from "react";
import HeroSection from "../../components/home/HeroSection";
import Features from "../../components/home/Features";
import DashboardPreview from "../../components/home/DashboardPreview";

const Home = () => {
  return (
    <>
      <HeroSection />
      <DashboardPreview />
      <Features />
    </>
  );
};

export default Home;
