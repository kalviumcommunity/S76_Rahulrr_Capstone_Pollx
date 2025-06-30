import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaClock, FaCheck, FaTag } from 'react-icons/fa';
import { formatSocialTimestamp, formatDetailedTimestamp } from '../utils/timeUtils';
import CommentsSection from './CommentsSection';

const AnsweredPollCard = ({ poll }) => {
  const formatDate = (dateString) => {
    return formatSocialTimestamp(dateString);
  };

  const getTotalVotes = () => {
    if (!poll.options || !Array.isArray(poll.options)) return 0;
    return poll.options.reduce((total, option) => total + (option.votes || 0), 0);
  };

  const getVotedOption = () => {
    // Check localStorage for which option was voted on
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
    const votedOptionId = votedPolls[poll._id];
    
    if (votedOptionId && typeof votedOptionId === 'string') {
      return poll.options.find(option => option._id === votedOptionId);
    }
    return null;
  };

  const votedOption = getVotedOption();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#2B2B2B] border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all duration-200"
    >
      {/* Poll Question */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 mr-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-white font-medium leading-relaxed flex-1">
              {poll.question}
            </h3>
            
            {/* Category Badge */}
            {poll.category && (
              <span className={`ml-2 px-2 py-1 text-white text-xs font-medium rounded-full whitespace-nowrap flex items-center ${
                poll.category === 'Technology' ? 'bg-blue-600' :
                poll.category === 'Sports' ? 'bg-green-600' :
                poll.category === 'Entertainment' ? 'bg-purple-600' :
                poll.category === 'Politics' ? 'bg-red-700' :
                poll.category === 'Education' ? 'bg-indigo-600' :
                poll.category === 'Health' ? 'bg-pink-600' :
                poll.category === 'Business' ? 'bg-yellow-600' :
                'bg-[#FF2D2D]'
              }`}>
                <FaTag className="mr-1" />
                {poll.category}
              </span>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-400 whitespace-nowrap">
          <span 
            className="cursor-help" 
            title={formatDetailedTimestamp(poll.createdAt)}
          >
            {formatDate(poll.createdAt)}
          </span>
        </div>
      </div>
      
      {/* Poll Metadata */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
        <div className="flex items-center space-x-4">
          {poll.createdBy && (
            <div className="flex items-center space-x-2">
              <FaUser className="text-xs text-red-400" />
              <span>{poll.createdBy.username || poll.createdBy.email || 'Anonymous'}</span>
            </div>
          )}
        </div>
        
        <div className="text-red-400 font-medium">
          {getTotalVotes()} total votes
        </div>
      </div>
      
      {/* Show options with vote counts (enhanced view) */}
      <div className="space-y-2">
        {poll.options?.map((option, optionIndex) => {
          const isVotedOption = votedOption && votedOption._id === option._id;
          const percentage = getTotalVotes() > 0 ? ((option.votes || 0) / getTotalVotes()) * 100 : 0;
          
          return (
            <motion.div 
              key={optionIndex} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: optionIndex * 0.1 }}
              className={`rounded-lg p-3 text-sm transition-all duration-300 ${
                isVotedOption 
                  ? 'bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-600/50 shadow-lg shadow-green-500/10' 
                  : 'bg-gray-800/70 border border-gray-700/50'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`flex items-center ${isVotedOption ? 'text-green-100 font-semibold' : 'text-gray-200'}`}>
                  {isVotedOption && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                    >
                      <FaCheck className="inline mr-2 text-green-400 text-sm" />
                    </motion.div>
                  )}
                  {option.text}
                </span>
                <span className={`font-bold text-sm ${isVotedOption ? 'text-green-400' : 'text-red-400'}`}>
                  {option.votes || 0}
                </span>
              </div>
              
              {/* Enhanced progress bar */}
              <div className="w-full bg-gray-700/50 rounded-full h-2 mb-1 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: optionIndex * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                  className={`h-2 rounded-full ${
                    isVotedOption 
                      ? 'bg-gradient-to-r from-green-400 via-green-500 to-green-600 shadow-sm' 
                      : 'bg-gradient-to-r from-red-400 via-red-500 to-red-600'
                  }`}
                ></motion.div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className={`text-xs font-medium ${isVotedOption ? 'text-green-400' : 'text-gray-500'}`}>
                  {percentage.toFixed(1)}%
                </div>
                {isVotedOption && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xs text-green-400 font-medium px-2 py-0.5 bg-green-900/30 rounded-full border border-green-600/30"
                  >
                    Your Choice
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Comments Section */}
      <CommentsSection 
        pollId={poll._id} 
        initialCommentCount={poll.comments?.length || 0}
      />
    </motion.div>
  );
};

export default AnsweredPollCard;
