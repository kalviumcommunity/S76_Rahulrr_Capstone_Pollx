import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPoll, FaUser, FaSignOutAlt, FaBars, FaTimes, FaPlus, FaHome, FaChartBar, FaChevronDown, FaCog, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { isLoggedIn, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeProfileDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = async () => {
    try {
      closeProfileDropdown();
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
  
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/80 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={isLoggedIn ? "/polls" : "/"} 
            className="flex items-center space-x-3 group"
          >
            <div className="relative">
              <FaPoll className="text-2xl text-gradient group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <span className="text-2xl font-bold">
              Poll<span className="text-gradient">X</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isLoggedIn ? (
              <>
                <NavLink to="/polls" icon={FaHome}>Browse</NavLink>
                <NavLink to="/dashboard" icon={FaChartBar}>Dashboard</NavLink>
                <NavLink to="/my-polls" icon={FaPoll}>My Polls</NavLink>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/create-poll" 
                    className="btn-primary flex items-center space-x-2"
                  >
                    <FaPlus className="text-sm" />
                    <span>Create Poll</span>
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <NavLink to="/polls">Browse Polls</NavLink>
                <a href="#features" className="nav-link">Features</a>
                <a href="#how-it-works" className="nav-link">How It Works</a>
                <a href="#categories" className="nav-link">Categories</a>
              </>
            )}
          </div>
          
          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                {/* Profile Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                    <FaUser className="text-white text-xs" />
                  </div>
                  <span className="text-gray-300 font-medium">
                    {currentUser?.username || 'User'}
                  </span>
                  <FaChevronDown className={`text-gray-400 text-xs transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                            <FaUser className="text-white text-lg" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">{currentUser?.username || 'User'}</p>
                            <p className="text-gray-300 text-sm">{currentUser?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link 
                          to="/dashboard"
                          onClick={closeProfileDropdown}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        >
                          <FaChartBar className="text-gray-400" />
                          <span>Dashboard</span>
                        </Link>
                        <Link 
                          to="/my-polls"
                          onClick={closeProfileDropdown}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        >
                          <FaPoll className="text-gray-400" />
                          <span>My Polls</span>
                        </Link>
                        <div className="border-t border-gray-700 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-red-900/30 hover:text-red-400 transition-colors"
                        >
                          <FaSignOutAlt className="text-gray-400" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login" className="btn-outline">
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/signup" className="btn-primary">
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-gray-800 bg-black/95 backdrop-blur-md"
          >
            <div className="px-4 py-6 space-y-4">
              {isLoggedIn ? (
                <>
                  <MobileNavLink to="/polls" icon={FaHome}>Browse Polls</MobileNavLink>
                  <MobileNavLink to="/dashboard" icon={FaChartBar}>Dashboard</MobileNavLink>
                  <MobileNavLink to="/my-polls" icon={FaPoll}>My Polls</MobileNavLink>
                  <MobileNavLink to="/create-poll" icon={FaPlus}>Create Poll</MobileNavLink>
                  
                  <div className="pt-4 border-t border-gray-800">
                    {/* Profile Card */}
                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-4 border border-gray-700">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                          <FaUser className="text-white text-lg" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{currentUser?.username || 'User'}</p>
                          <p className="text-gray-400 text-sm">{currentUser?.email}</p>
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="space-y-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-red-900/20 border border-red-800/30 text-red-400 hover:bg-red-900/30 transition-colors text-sm"
                        >
                          <FaSignOutAlt className="text-xs" />
                          <span>Sign Out</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <MobileNavLink to="/polls">Browse Polls</MobileNavLink>
                  <a href="#features" className="mobile-nav-link">Features</a>
                  <a href="#how-it-works" className="mobile-nav-link">How It Works</a>
                  <a href="#categories" className="mobile-nav-link">Categories</a>
                  
                  <div className="pt-4 border-t border-gray-800 space-y-3">
                    <Link to="/login" className="btn-outline w-full text-center block">
                      Login
                    </Link>
                    <Link to="/signup" className="btn-primary w-full text-center block">
                      Sign Up
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Desktop Navigation Link Component
const NavLink = ({ to, icon: Icon, children, ...props }) => (
  <Link
    to={to}
    className="nav-link flex items-center space-x-2 group"
    {...props}
  >
    {Icon && <Icon className="text-sm group-hover:text-red-400 transition-colors" />}
    <span>{children}</span>
  </Link>
);

// Mobile Navigation Link Component  
const MobileNavLink = ({ to, icon: Icon, children, ...props }) => (
  <Link
    to={to}
    className="mobile-nav-link flex items-center space-x-3"
    {...props}
  >
    {Icon && (
      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
        <Icon className="text-gray-400 text-sm" />
      </div>
    )}
    <span>{children}</span>
  </Link>
);

export default Navbar;
