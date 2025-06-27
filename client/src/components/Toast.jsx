import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'success', isVisible, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheck className="text-green-400" />;
      case 'error':
        return <FaExclamationTriangle className="text-red-400" />;
      case 'info':
        return <FaInfoCircle className="text-blue-400" />;
      default:
        return <FaCheck className="text-green-400" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/30 border-green-800';
      case 'error':
        return 'bg-red-900/30 border-red-800';
      case 'info':
        return 'bg-blue-900/30 border-blue-800';
      default:
        return 'bg-green-900/30 border-green-800';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg border ${getBgColor()} backdrop-blur-sm`}
        >
          <div className="flex items-center space-x-3">
            {getIcon()}
            <span className="text-white flex-1">{message}</span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
