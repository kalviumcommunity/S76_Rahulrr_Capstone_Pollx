import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaClock, FaEdit, FaTrash } from 'react-icons/fa';

const PollCard = ({ poll, showActions = false, onEdit, onDelete, onVote }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTotalVotes = () => {
    if (!poll.options || !Array.isArray(poll.options)) return 0;
    return poll.options.reduce((total, option) => total + (option.votes || 0), 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      className="bg-[#2B2B2B] border border-gray-700 rounded-lg p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-gray-600"
    >
      {/* Poll Question */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-white leading-relaxed">
          {poll.question}
        </h3>
        
        {/* Poll Options */}
        <div className="space-y-3">
          {poll.options && poll.options.map((option, index) => (
            <motion.div 
              key={index} 
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-200 font-medium">{option.text}</span>
                {option.votes !== undefined && (
                  <span className="text-[#FF2D2D] font-bold text-sm">
                    {option.votes} votes
                  </span>
                )}
              </div>
              
              {/* Vote Progress Bar */}
              {option.votes !== undefined && getTotalVotes() > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#FF2D2D] to-red-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(option.votes / getTotalVotes()) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{((option.votes / getTotalVotes()) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Poll Metadata */}
      <div className="flex justify-between items-center text-sm text-gray-400 border-t border-gray-600 pt-4">
        <div className="flex items-center space-x-4">
          {poll.createdBy && (
            <div className="flex items-center space-x-2">
              <FaUser className="text-xs text-[#FF2D2D]" />
              <span>{poll.createdBy.username || poll.createdBy.email || 'Anonymous'}</span>
            </div>
          )}
          
          {poll.createdAt && (
            <div className="flex items-center space-x-2">
              <FaClock className="text-xs text-[#FF2D2D]" />
              <span>{formatDate(poll.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Total Votes */}
        <div className="text-[#FF2D2D] font-bold">
          {getTotalVotes()} total votes
        </div>
      </div>

      {/* Action Buttons for My Polls */}
      {showActions && (
        <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-600">
          {onEdit && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(poll)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaEdit className="mr-2" />
              Edit
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(poll)}
              className="flex items-center px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaTrash className="mr-2" />
              Delete
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default PollCard;
