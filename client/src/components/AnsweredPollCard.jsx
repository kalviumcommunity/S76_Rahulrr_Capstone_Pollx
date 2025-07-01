import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaClock, FaCheck, FaTag } from 'react-icons/fa';
import CommentsSection from './CommentsSection';

const AnsweredPollCard = ({ poll }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          {formatDate(poll.createdAt)}
        </div>
      </div>
      
      {/* Your Vote (if available) */}
      {votedOption && (
        <div className="mb-3 p-2 bg-green-900/20 border border-green-800 rounded-md">
          <div className="flex items-center text-green-400 text-sm">
            <FaCheck className="mr-2" />
            <span>You voted for: <strong>"{votedOption.text}"</strong></span>
          </div>
        </div>
      )}
      
      {/* Poll Metadata */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center space-x-4">
          {poll.createdBy && (
            <div className="flex items-center space-x-2">
              <FaUser className="text-xs text-[#FF2D2D]" />
              <span>{poll.createdBy.username || poll.createdBy.email || 'Anonymous'}</span>
            </div>
          )}
        </div>
        
        <div className="text-[#FF2D2D] font-medium">
          {getTotalVotes()} total votes
        </div>
      </div>
      
      {/* Show options with vote counts (compact view) */}
      <div className="mt-3 space-y-1">
        {poll.options?.map((option, optionIndex) => {
          const isVotedOption = votedOption && votedOption._id === option._id;
          const percentage = getTotalVotes() > 0 ? ((option.votes || 0) / getTotalVotes()) * 100 : 0;
          
          return (
            <div key={optionIndex} className="bg-gray-800 rounded-md p-2 text-sm">
              <div className="flex justify-between items-center mb-1">
                <span className={`text-gray-200 ${isVotedOption ? 'font-medium' : ''}`}>
                  {isVotedOption && <FaCheck className="inline mr-1 text-green-400" />}
                  {option.text}
                </span>
                <span className="text-[#FF2D2D] font-medium">{option.votes || 0} votes</span>
              </div>
              
              {/* Mini progress bar */}
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    isVotedOption 
                      ? 'bg-gradient-to-r from-green-400 to-green-600' 
                      : 'bg-gradient-to-r from-[#FF2D2D] to-red-600'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                {percentage.toFixed(1)}%
              </div>
            </div>
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
