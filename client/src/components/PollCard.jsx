import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaClock, FaEdit, FaTrash, FaVoteYea, FaCheck, FaSpinner, FaTag } from 'react-icons/fa';
import { votePoll } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import CommentsSection from './CommentsSection';

const PollCard = ({ poll, showActions = false, onEdit, onDelete, onVote, disableVoting = false }) => {
  const { isLoggedIn } = useAuth();
  const [voting, setVoting] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState(null);
  const [localPoll, setLocalPoll] = useState(poll);
  const [hasVoted, setHasVoted] = useState(() => {
    // Check if user has already voted on this poll (from localStorage)
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
    return votedPolls[poll._id] || false;
  });

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
    if (!localPoll.options || !Array.isArray(localPoll.options)) return 0;
    return localPoll.options.reduce((total, option) => total + (option.votes || 0), 0);
  };

  const handleVote = async (optionId) => {
    if (voting || hasVoted || disableVoting || !isLoggedIn) return;

    try {
      setVoting(true);
      setVotedOptionId(optionId);

      // Call the voting API
      const response = await votePoll(poll._id, optionId);
      
      if (response.success && response.poll) {
        // Update local state with the new poll data
        setLocalPoll(response.poll);
        
        // Mark as voted in localStorage
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
        votedPolls[poll._id] = optionId;
        localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
        
        setHasVoted(true);
        
        // Call parent component's onVote if provided
        if (onVote) {
          onVote(response.poll);
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      // Show error message (you could add a toast notification here)
      if (error.error === 'Access denied. No token provided.') {
        alert('Please log in to vote on polls.');
      } else if (error.error === 'You have already voted on this poll') {
        // User already voted, update UI to reflect this
        setHasVoted(true);
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
        votedPolls[poll._id] = true; // Mark as voted without specific option
        localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
        alert('You have already voted on this poll.');
      } else {
        alert(error.error || 'Failed to record vote. Please try again.');
      }
    } finally {
      setVoting(false);
      setVotedOptionId(null);
    }
  };

  const isOptionVoted = (optionId) => {
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
    return votedPolls[poll._id] === optionId;
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
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white leading-relaxed flex-1">
            {localPoll.question}
          </h3>
          
          {/* Category Badge */}
          {localPoll.category && (
            <span className={`ml-4 px-3 py-1 text-white text-xs font-medium rounded-full whitespace-nowrap flex items-center ${
              localPoll.category === 'Technology' ? 'bg-blue-600' :
              localPoll.category === 'Sports' ? 'bg-green-600' :
              localPoll.category === 'Entertainment' ? 'bg-purple-600' :
              localPoll.category === 'Politics' ? 'bg-red-700' :
              localPoll.category === 'Education' ? 'bg-indigo-600' :
              localPoll.category === 'Health' ? 'bg-pink-600' :
              localPoll.category === 'Business' ? 'bg-yellow-600' :
              'bg-[#FF2D2D]'
            }`}>
              <FaTag className="mr-1" />
              {localPoll.category}
            </span>
          )}
        </div>
        
        {/* Poll Options */}
        <div className="space-y-3">
          {localPoll.options && localPoll.options.map((option, index) => {
            const isVotedOption = isOptionVoted(option._id);
            const isCurrentVoting = voting && votedOptionId === option._id;
            
            return (
              <motion.div 
                key={option._id || index} 
                whileHover={!hasVoted && !disableVoting ? { scale: 1.02 } : {}}
                className={`bg-gray-800 rounded-lg p-4 border transition-all duration-200 ${
                  isVotedOption 
                    ? 'border-[#FF2D2D] bg-red-900/20' 
                    : hasVoted || disableVoting || !isLoggedIn
                      ? 'border-gray-600'
                      : 'border-gray-600 hover:border-gray-500 cursor-pointer'
                }`}
                onClick={!hasVoted && !disableVoting && isLoggedIn ? () => handleVote(option._id) : undefined}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <span className="text-gray-200 font-medium flex-1">{option.text}</span>
                    
                    {/* Vote Button or Status */}
                    {!disableVoting && (
                      <div className="ml-4">
                        {isCurrentVoting ? (
                          <FaSpinner className="text-[#FF2D2D] animate-spin" />
                        ) : isVotedOption ? (
                          <div className="flex items-center text-[#FF2D2D]">
                            <FaCheck className="mr-1" />
                            <span className="text-sm font-medium">Voted</span>
                          </div>
                        ) : hasVoted ? (
                          <span className="text-gray-500 text-sm">—</span>
                        ) : !isLoggedIn ? (
                          <motion.a
                            href="/login"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <FaVoteYea className="mr-1" />
                            Login to Vote
                          </motion.a>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center px-3 py-1 bg-[#FF2D2D] text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(option._id);
                            }}
                          >
                            <FaVoteYea className="mr-1" />
                            Vote
                          </motion.button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {option.votes !== undefined && (
                    <span className="text-[#FF2D2D] font-bold text-sm ml-4">
                      {option.votes} votes
                    </span>
                  )}
                </div>
                
                {/* Vote Progress Bar */}
                {option.votes !== undefined && getTotalVotes() > 0 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(option.votes / getTotalVotes()) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isVotedOption 
                            ? 'bg-gradient-to-r from-[#FF2D2D] to-red-400' 
                            : 'bg-gradient-to-r from-[#FF2D2D] to-red-600'
                        }`}
                      ></motion.div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{((option.votes / getTotalVotes()) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Voting Status */}
      {hasVoted && !disableVoting && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-800 rounded-lg">
          <div className="flex items-center text-green-400">
            <FaCheck className="mr-2" />
            <span className="text-sm font-medium">Thank you for voting!</span>
          </div>
        </div>
      )}

      {/* Poll Metadata */}
      <div className="flex justify-between items-center text-sm text-gray-400 border-t border-gray-600 pt-4">
        <div className="flex items-center space-x-4">
          {localPoll.createdBy && (
            <div className="flex items-center space-x-2">
              <FaUser className="text-xs text-[#FF2D2D]" />
              <span>{localPoll.createdBy.username || localPoll.createdBy.email || 'Anonymous'}</span>
            </div>
          )}
          
          {localPoll.createdAt && (
            <div className="flex items-center space-x-2">
              <FaClock className="text-xs text-[#FF2D2D]" />
              <span>{formatDate(localPoll.createdAt)}</span>
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
              onClick={() => onEdit(localPoll)}
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
              onClick={() => onDelete(localPoll)}
              className="flex items-center px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaTrash className="mr-2" />
              Delete
            </motion.button>
          )}
        </div>
      )}

      {/* Comments Section */}
      <CommentsSection 
        pollId={localPoll._id} 
        initialCommentCount={localPoll.comments?.length || 0}
      />
    </motion.div>
  );
};

export default PollCard;
