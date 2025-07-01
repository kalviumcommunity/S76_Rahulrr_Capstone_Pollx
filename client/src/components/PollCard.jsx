import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, FaClock, FaVoteYea, FaCheck, FaSpinner, FaTag, 
  FaFire, FaChartBar, FaShare, FaLink, FaTrash, FaEllipsisV,
  FaHeart, FaComment, FaWhatsapp, FaTwitter, FaInstagram, FaLinkedin
} from 'react-icons/fa';
import { votePoll } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import CommentsSection from './CommentsSection';
import { isExpired, getTimeRemaining } from '../utils/pollExpiry';

const PollCard = ({ poll, showActions = false, onDelete, onVote, disableVoting = false }) => {
  const { isLoggedIn } = useAuth();
  const [voting, setVoting] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState(null);
  const [localPoll, setLocalPoll] = useState(poll);
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [hasVoted, setHasVoted] = useState(() => {
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
    return votedPolls[poll._id] || false;
  });

  const getTotalVotes = () => {
    if (!localPoll.options || !Array.isArray(localPoll.options)) return 0;
    return localPoll.options.reduce((total, option) => total + (option.votes || 0), 0);
  };

  const getVotePercentage = (votes) => {
    const total = getTotalVotes();
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  const handleVote = async (optionId) => {
    if (voting || hasVoted || disableVoting || !isLoggedIn) return;

    if (isExpired(localPoll.expiresAt)) {
      alert('This poll has expired and voting is no longer allowed.');
      return;
    }

    try {
      setVoting(true);
      setVotedOptionId(optionId);

      const response = await votePoll(poll._id, optionId);
      
      if (response.success && response.poll) {
        setLocalPoll(response.poll);
        
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
        votedPolls[poll._id] = optionId;
        localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
        
        setHasVoted(true);
        
        if (onVote) {
          onVote(response.poll);
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      if (error.error === 'Access denied. No token provided.') {
        alert('Please log in to vote on polls.');
      } else if (error.error === 'You have already voted on this poll') {
        setHasVoted(true);
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
        votedPolls[poll._id] = true;
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

  const handleShare = (platform) => {
    const pollUrl = `${window.location.origin}/poll/${poll._id}?src=${platform}`;
    const text = `Check out this poll: "${poll.question}"`;
    const hashtagText = `#PollX #Poll #Vote ${poll.category ? `#${poll.category.replace(/\s+/g, '')}` : ''}`;
    
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(pollUrl);
        alert('Poll link copied to clipboard!');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${pollUrl}`)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text} ${hashtagText}`)}&url=${encodeURIComponent(pollUrl)}`, '_blank');
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we copy the link and show instructions
        navigator.clipboard.writeText(`${text} ${pollUrl} ${hashtagText}`);
        alert('Poll text copied! Paste it in your Instagram story or post.');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pollUrl)}&title=${encodeURIComponent(text)}&summary=${encodeURIComponent(`Vote on this interesting poll: ${poll.question}`)}`, '_blank');
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({
            title: 'PollX Poll',
            text: text,
            url: pollUrl
          });
        }
        break;
    }
    setShowShareMenu(false);
  };

  const isOptionVoted = (optionId) => {
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
    return votedPolls[poll._id] === optionId;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getCategoryBadge = () => {
    const badges = {
      Technology: { emoji: '💻', color: 'badge-category' },
      Sports: { emoji: '⚽', color: 'badge-category' },
      Entertainment: { emoji: '🎬', color: 'badge-category' },
      Politics: { emoji: '🏛️', color: 'badge-category' },
      Education: { emoji: '📚', color: 'badge-category' },
      Health: { emoji: '🏥', color: 'badge-category' },
      Business: { emoji: '💼', color: 'badge-category' },
      Other: { emoji: '📋', color: 'badge-category' }
    };
    
    const badge = badges[localPoll.category] || badges.Other;
    return { ...badge };
  };

  const getTrendingStatus = () => {
    const totalVotes = getTotalVotes();
    const isRecent = new Date() - new Date(localPoll.createdAt) < 24 * 60 * 60 * 1000; // Last 24 hours
    
    if (totalVotes > 50 && isRecent) return { emoji: '🔥', text: 'Trending', class: 'badge-trending' };
    if (totalVotes > 20) return { emoji: '📈', text: 'Popular', class: 'badge-trending' };
    if (isRecent) return { emoji: '✨', text: 'New', class: 'badge-category' };
    return null;
  };

  const getExpiryStatus = () => {
    if (!localPoll.expiresAt) return null;
    
    if (isExpired(localPoll.expiresAt)) {
      return { emoji: '🔒', text: 'Expired', class: 'badge-expiring' };
    }
    
    const remaining = getTimeRemaining(localPoll.expiresAt);
    if (remaining) {
      return { emoji: '⏳', text: `${remaining}`, class: 'badge-expiring' };
    }
    
    return null;
  };

  const pollExpired = isExpired(localPoll.expiresAt);
  const canVote = !hasVoted && !disableVoting && isLoggedIn && !pollExpired;
  const category = getCategoryBadge();
  const trending = getTrendingStatus();
  const expiry = getExpiryStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card group relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-gradient transition-all duration-300">
            {localPoll.question}
          </h3>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`badge ${category.color}`}>
              <span>{category.emoji}</span>
              <span>{localPoll.category}</span>
            </span>
            
            {trending && (
              <span className={`badge ${trending.class}`}>
                <span>{trending.emoji}</span>
                <span>{trending.text}</span>
              </span>
            )}
            
            {expiry && (
              <span className={`badge ${expiry.class}`}>
                <span>{expiry.emoji}</span>
                <span>{expiry.text}</span>
              </span>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <FaEllipsisV />
          </motion.button>
          
          <AnimatePresence>
            {showActionsMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-12 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-20 min-w-48"
              >
                <button
                  onClick={() => setShowShareMenu(true)}
                  className="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-t-xl transition-colors flex items-center space-x-2"
                >
                  <FaShare className="text-sm" />
                  <span>Share Poll</span>
                </button>
                
                {showActions && onDelete && (
                  <button
                    onClick={() => onDelete(poll._id)}
                    className="w-full px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-b-xl transition-colors flex items-center space-x-2"
                  >
                    <FaTrash className="text-sm" />
                    <span>Delete Poll</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Poll Options */}
      <div className="space-y-3 mb-6">
        {localPoll.options && localPoll.options.map((option, index) => {
          const isVotedOption = isOptionVoted(option._id);
          const isCurrentVoting = voting && votedOptionId === option._id;
          const percentage = getVotePercentage(option.votes || 0);
          
          return (
            <motion.div
              key={option._id}
              whileHover={canVote ? { scale: 1.02 } : {}}
              whileTap={canVote ? { scale: 0.98 } : {}}
            >
              <button
                onClick={() => handleVote(option._id)}
                disabled={!canVote || isCurrentVoting}
                className={`poll-option w-full relative overflow-hidden ${
                  isVotedOption ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-500/50' : ''
                } ${!canVote ? 'cursor-default' : 'hover:scale-102'}`}
              >
                {/* Background Bar */}
                {(hasVoted || pollExpired) && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-xl"
                  />
                )}
                
                <div className="relative z-10 flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isVotedOption 
                        ? 'bg-red-500 border-red-500' 
                        : 'border-gray-500 group-hover:border-red-400'
                    }`}>
                      {isCurrentVoting ? (
                        <FaSpinner className="animate-spin text-white text-xs" />
                      ) : isVotedOption ? (
                        <FaCheck className="text-white text-xs" />
                      ) : null}
                    </div>
                    
                    <span className="font-medium text-white text-left">
                      {option.text}
                    </span>
                  </div>
                  
                  {(hasVoted || pollExpired) && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-400">{option.votes || 0} votes</span>
                      <span className="text-red-400 font-semibold">{percentage}%</span>
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
              <FaUser className="text-white text-xs" />
            </div>
            <span>{localPoll.createdBy?.username || 'Anonymous'}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <FaClock className="text-xs" />
            <span>{formatDate(localPoll.createdAt)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <FaChartBar className="text-xs" />
            <span>{getTotalVotes()} votes</span>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            <FaComment className="text-xs" />
            <span>Comments</span>
          </motion.button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 pt-6 border-t border-gray-700"
          >
            <CommentsSection pollId={poll._id} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Menu Modal */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Share this poll</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                >
                  <FaLink className="text-lg" />
                  <span>Copy Link</span>
                </button>
                
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                >
                  <FaWhatsapp className="text-lg text-green-500" />
                  <span>Share on WhatsApp</span>
                </button>
                
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                >
                  <FaTwitter className="text-lg text-blue-400" />
                  <span>Share on Twitter</span>
                </button>
                
                <button
                  onClick={() => handleShare('instagram')}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                >
                  <FaInstagram className="text-lg text-pink-500" />
                  <span>Share on Instagram</span>
                </button>
                
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                >
                  <FaLinkedin className="text-lg text-blue-600" />
                  <span>Share on LinkedIn</span>
                </button>
                
                {navigator.share && (
                  <button
                    onClick={() => handleShare('native')}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                  >
                    <FaShare className="text-lg" />
                    <span>More Options</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PollCard;
