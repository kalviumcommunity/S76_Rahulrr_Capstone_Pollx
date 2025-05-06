import React, { useState } from 'react';
import { FaPoll } from 'react-icons/fa';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className="bg-black py-4 px-6 md:px-12 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FaPoll className="text-[#FF2D2D] text-2xl" />
          <span className="text-2xl font-bold text-white">Poll<span className="text-[#FF2D2D]">X</span></span>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-white hover:text-[#FF2D2D] transition">Features</a>
          <a href="#how-it-works" className="text-white hover:text-[#FF2D2D] transition">How It Works</a>
          <a href="#categories" className="text-white hover:text-[#FF2D2D] transition">Categories</a>
          <a href="#testimonials" className="text-white hover:text-[#FF2D2D] transition">Testimonials</a>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <button className="px-4 py-2 rounded hover:bg-[#2B2B2B] transition border border-white text-white">
            Login
          </button>
          <button className="px-4 py-2 rounded bg-[#FF2D2D] hover:bg-red-700 transition text-white">
            Sign Up
          </button>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {!isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="mt-4 md:hidden bg-[#2B2B2B] py-4 px-6 space-y-4 rounded-lg">
          <a href="#features" className="block text-white hover:text-[#FF2D2D] transition">Features</a>
          <a href="#how-it-works" className="block text-white hover:text-[#FF2D2D] transition">How It Works</a>
          <a href="#categories" className="block text-white hover:text-[#FF2D2D] transition">Categories</a>
          <a href="#testimonials" className="block text-white hover:text-[#FF2D2D] transition">Testimonials</a>
          <div className="pt-2 space-y-2">
            <button className="w-full px-4 py-2 rounded hover:bg-black transition border border-white text-white">
              Login
            </button>
            <button className="w-full px-4 py-2 rounded bg-[#FF2D2D] hover:bg-red-700 transition text-white">
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
