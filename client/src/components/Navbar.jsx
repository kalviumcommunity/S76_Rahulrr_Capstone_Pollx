import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPoll, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
  
  return (
    <nav className="bg-black py-4 px-6 md:px-12 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <FaPoll className="text-[#FF2D2D] text-2xl" />
          <span className="text-2xl font-bold text-white">Poll<span className="text-[#FF2D2D]">X</span></span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {isLoggedIn ? (
            // Navigation items for logged-in users
            <>
              <Link to="/polls" className="text-white hover:text-[#FF2D2D] transition">Browse Polls</Link>
              <Link to="/dashboard" className="text-white hover:text-[#FF2D2D] transition">Dashboard</Link>
              <Link to="/my-polls" className="text-white hover:text-[#FF2D2D] transition">My Polls</Link>
              <Link to="/create-poll" className="text-white hover:text-[#FF2D2D] transition">Create Poll</Link>
            </>
          ) : (
            // Navigation items for visitors
            <>
              <Link to="/polls" className="text-white hover:text-[#FF2D2D] transition">Browse Polls</Link>
              <a href="#features" className="text-white hover:text-[#FF2D2D] transition">Features</a>
              <a href="#how-it-works" className="text-white hover:text-[#FF2D2D] transition">How It Works</a>
              <a href="#categories" className="text-white hover:text-[#FF2D2D] transition">Categories</a>
              <a href="#testimonials" className="text-white hover:text-[#FF2D2D] transition">Testimonials</a>
            </>
          )}
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            // User profile and logout for logged-in users
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <FaUser className="text-[#FF2D2D]" />
                <span>{currentUser?.username || 'User'}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-[#FF2D2D] hover:bg-red-700 transition text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            // Login and signup for visitors
            <>
              <Link to="/login" className="px-4 py-2 rounded hover:bg-[#2B2B2B] transition border border-white text-white">
                Login
              </Link>
              <Link to="/signup" className="px-4 py-2 rounded bg-[#FF2D2D] hover:bg-red-700 transition text-white">
                Sign Up
              </Link>
            </>
          )}
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
          {isLoggedIn ? (
            // Mobile nav for logged-in users
            <>
              <Link to="/polls" className="block text-white hover:text-[#FF2D2D] transition">Browse Polls</Link>
              <Link to="/dashboard" className="block text-white hover:text-[#FF2D2D] transition">Dashboard</Link>
              <Link to="/my-polls" className="block text-white hover:text-[#FF2D2D] transition">My Polls</Link>
              <Link to="/create-poll" className="block text-white hover:text-[#FF2D2D] transition">Create Poll</Link>
              <div className="pt-2 space-y-2">
                <div className="flex items-center space-x-2 text-white">
                  <FaUser className="text-[#FF2D2D]" />
                  <span>{currentUser?.username || 'User'}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 rounded bg-[#FF2D2D] hover:bg-red-700 transition text-white text-center"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            // Mobile nav for visitors
            <>
              <Link to="/polls" className="block text-white hover:text-[#FF2D2D] transition">Browse Polls</Link>
              <a href="#features" className="block text-white hover:text-[#FF2D2D] transition">Features</a>
              <a href="#how-it-works" className="block text-white hover:text-[#FF2D2D] transition">How It Works</a>
              <a href="#categories" className="block text-white hover:text-[#FF2D2D] transition">Categories</a>
              <a href="#testimonials" className="block text-white hover:text-[#FF2D2D] transition">Testimonials</a>
              <div className="pt-2 space-y-2">
                <Link to="/login" className="block w-full px-4 py-2 rounded hover:bg-black transition border border-white text-white text-center">
                  Login
                </Link>
                <Link to="/signup" className="block w-full px-4 py-2 rounded bg-[#FF2D2D] hover:bg-red-700 transition text-white text-center">
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
