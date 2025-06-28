import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorksSection from '../components/HowItWorksSection';
import CategoriesSection from '../components/CategoriesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import CTASection from '../components/CTASection';
import MinimalFooter from '../components/MinimalFooter';

const LandingPage = () => {
  return (
    <div className="font-sans bg-[#2B2B2B] min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CategoriesSection />
      <TestimonialsSection />
      <CTASection />
      <MinimalFooter />
    </div>
  );
};

export default LandingPage;
