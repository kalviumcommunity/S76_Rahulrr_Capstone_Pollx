import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPoll, FaUser, FaSignOutAlt, FaBars, FaTimes, FaPlus, FaHome, FaChartBar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
              <div className="flex items-center space-x-4">
                {/* User Avatar */}
                <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-gray-800/50 border border-gray-700">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                    <FaUser className="text-white text-xs" />
                  </div>
                  <span className="text-gray-300 font-medium">
                    {currentUser?.username || 'User'}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="btn-outline flex items-center space-x-2"
                >
                  <FaSignOutAlt className="text-sm" />
                  <span>Logout</span>
                </motion.button>
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
                    <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gray-800/50">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                        <FaUser className="text-white text-sm" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{currentUser?.username || 'User'}</p>
                        <p className="text-gray-400 text-sm">{currentUser?.email}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="w-full mt-4 btn-outline flex items-center justify-center space-x-2"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </motion.button>
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
