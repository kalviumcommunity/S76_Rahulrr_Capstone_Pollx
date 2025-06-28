import React from 'react';
import { FaPoll, FaGithub, FaHeart, FaCode, FaRocket } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-t from-black to-gray-900 text-white py-16 px-6 md:px-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-3 mb-6"
            >
              <div className="relative">
                <FaPoll className="text-3xl text-gradient" />
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full opacity-20 animate-pulse-subtle"></div>
              </div>
              <span className="text-3xl font-bold">
                Poll<span className="text-gradient">X</span>
              </span>
            </motion.div>
            
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              The modern social polling platform where <span className="text-gradient font-semibold">opinions matter</span>. 
              Create engaging polls, gather real-time insights, and connect with your audience like never before.
            </p>
            
            <div className="flex items-center space-x-2 text-gray-400 mb-6">
              <FaRocket className="text-red-400" />
              <span className="text-sm">Powered by AI • Real-time Analytics • Social Sharing</span>
            </div>
            
            {/* Developer Credit */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center space-x-2 p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-700"
            >
              <span className="text-gray-300">Built with</span>
              <FaHeart className="text-red-500 animate-pulse" />
              <span className="text-gray-300">by</span>
              <a 
                href="https://github.com/rahulrr-coder" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gradient font-semibold hover:scale-105 transition-transform"
              >
                <FaGithub />
                <span>rahulrr-coder</span>
              </a>
            </motion.div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-gradient">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <a href="/" className="text-gray-300 hover:text-red-400 transition-colors flex items-center space-x-2 group">
                  <span className="w-1 h-1 bg-red-400 rounded-full group-hover:w-2 transition-all"></span>
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a href="/polls" className="text-gray-300 hover:text-red-400 transition-colors flex items-center space-x-2 group">
                  <span className="w-1 h-1 bg-red-400 rounded-full group-hover:w-2 transition-all"></span>
                  <span>Browse Polls</span>
                </a>
              </li>
              <li>
                <a href="/create-poll" className="text-gray-300 hover:text-red-400 transition-colors flex items-center space-x-2 group">
                  <span className="w-1 h-1 bg-red-400 rounded-full group-hover:w-2 transition-all"></span>
                  <span>Create Poll</span>
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-300 hover:text-red-400 transition-colors flex items-center space-x-2 group">
                  <span className="w-1 h-1 bg-red-400 rounded-full group-hover:w-2 transition-all"></span>
                  <span>Features</span>
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-gray-300 hover:text-red-400 transition-colors flex items-center space-x-2 group">
                  <span className="w-1 h-1 bg-red-400 rounded-full group-hover:w-2 transition-all"></span>
                  <span>How It Works</span>
                </a>
              </li>
            </ul>
          </div>
          
          {/* Legal & Support */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-gradient">Legal & Support</h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center space-x-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                  <span>Terms of Service</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center space-x-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a href="https://github.com/rahulrr-coder" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center space-x-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center space-x-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                  <span>Contact</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="border-t border-gray-800 mt-12 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-gray-400 text-sm">
              <span>© {new Date().getFullYear()} PollX. All rights reserved.</span>
              <span className="hidden md:block">•</span>
              <span className="flex items-center space-x-1">
                <FaCode className="text-xs" />
                <span>v1.0-beta</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://github.com/rahulrr-coder"
                target="_blank"
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors"
                title="GitHub"
              >
                <FaGithub className="text-xl" />
              </motion.a>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium"
              >
                Made with React & AI
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
