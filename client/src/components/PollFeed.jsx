import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import PollCard from './PollCard';
import socket from '../socket';
import { useToast } from '../context/ToastContext';
import { FaPoll, FaSpinner, FaExclamationTriangle, FaFilter } from 'react-icons/fa';

const PollFeed = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showLiveNotifications, setShowLiveNotifications] = useState(
    localStorage.getItem('showLiveNotifications') !== 'false' // Default to true
  );
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const API_URL = import.meta.env.PROD 
    ? 'https://s76-rahulrr-capstone-pollx.onrender.com'
    : 'http://localhost:5000';

  const categories = ['All', 'Technology', 'Sports', 'Entertainment', 'Politics', 'Education', 'Health', 'Business', 'Science', 'Travel', 'Dating', 'Food & Dining', 'Fashion', 'Other'];
  const highlightPollId = searchParams.get('highlight');

  // Toggle live notifications function
  const toggleLiveNotifications = () => {
    const newState = !showLiveNotifications;
    setShowLiveNotifications(newState);
    localStorage.setItem('showLiveNotifications', newState.toString());
    
    if (newState) {
      showToast('🔔 Live notifications enabled!', 'success');
    } else {
      showToast('🔕 Live notifications disabled', 'info');
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [selectedCategory]);

  // Scroll to highlighted poll when polls are loaded
  useEffect(() => {
    if (highlightPollId && polls.length > 0) {
      setTimeout(() => {
        const pollElement = document.getElementById(`poll-${highlightPollId}`);
        if (pollElement) {
          pollElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a highlight effect
          pollElement.style.border = '2px solid #FF2D2D';
          setTimeout(() => {
            pollElement.style.border = '';
          }, 3000);
        }
      }, 100);
    }
  }, [highlightPollId, polls]);

  // Real-time vote updates
  useEffect(() => {
    // Listen for vote updates
    const handleVoteUpdate = (data) => {
      console.log('Received vote update:', data);
      setPolls(prevPolls => 
        prevPolls.map(poll => 
          poll._id === data.pollId ? data.poll : poll
        )
      );
    };

    socket.on('voteUpdated', handleVoteUpdate);

    // Cleanup listener on unmount
    return () => {
      socket.off('voteUpdated', handleVoteUpdate);
    };
  }, []);

  // Real-time poll creation updates
  useEffect(() => {
    // Listen for new polls
    const handlePollCreated = (data) => {
      console.log('Received new poll:', data);
      // Only add the poll if it matches the current category filter or if showing all categories
      if (selectedCategory === 'All' || data.poll.category === selectedCategory) {
        setPolls(prevPolls => [data.poll, ...prevPolls]);
      }
    };

    // Listen for poll deletions
    const handlePollDeleted = (data) => {
      console.log('Poll deleted:', data);
      setPolls(prevPolls => prevPolls.filter(poll => poll._id !== data.pollId));
      showToast('A poll was removed from the database', 'info');
    };

    // Listen for poll updates
    const handlePollUpdated = (data) => {
      console.log('Poll updated:', data);
      setPolls(prevPolls => 
        prevPolls.map(poll => 
          poll._id === data.pollId ? data.poll : poll
        )
      );
      
      // Only show notifications if user has them enabled
      if (showLiveNotifications) {
        // More engaging and varied messages
        const messages = [
          `🗳️ "${data.pollTitle}" just got a new vote!`,
          '📊 Live vote update!',
          '🔥 Someone just voted!',
          '⚡ Poll activity happening now!',
          '👥 Community is voting!'
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        showToast(randomMessage, 'info');
      }
    };

    socket.on('pollCreated', handlePollCreated);
    socket.on('pollDeleted', handlePollDeleted);
    socket.on('pollUpdated', handlePollUpdated);

    // Cleanup listener on unmount
    return () => {
      socket.off('pollCreated', handlePollCreated);
      socket.off('pollDeleted', handlePollDeleted);
      socket.off('pollUpdated', handlePollUpdated);
    };
  }, [selectedCategory]);

  // Real-time comment updates
  useEffect(() => {
    const handleCommentAdded = (data) => {
      console.log('Received comment update:', data);
      setPolls(prevPolls => 
        prevPolls.map(poll => {
          if (poll._id === data.pollId) {
            return {
              ...poll,
              comments: poll.comments ? [...poll.comments, data.comment] : [data.comment]
            };
          }
          return poll;
        })
      );
    };

    const handleCommentHearted = (data) => {
      console.log('Received comment heart update:', data);
      setPolls(prevPolls => 
        prevPolls.map(poll => {
          if (poll._id === data.pollId) {
            return {
              ...poll,
              comments: poll.comments ? poll.comments.map(comment => 
                comment._id === data.commentId 
                  ? { ...comment, hearts: data.hearts, heartedBy: data.comment.heartedBy }
                  : comment
              ) : []
            };
          }
          return poll;
        })
      );
    };

    socket.on('commentAdded', handleCommentAdded);
    socket.on('commentHearted', handleCommentHearted);

    return () => {
      socket.off('commentAdded', handleCommentAdded);
      socket.off('commentHearted', handleCommentHearted);
    };
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const categoryParam = selectedCategory === 'All' ? '' : `?category=${selectedCategory}`;
      const response = await axios.get(`${API_URL}/polls${categoryParam}`);
      // Handle both old and new response formats
      const pollsData = response.data.polls || response.data || [];
      setPolls(pollsData);
    } catch (error) {
      console.error('Error fetching polls:', error);
      setError('Failed to load polls. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-grow py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner className="text-4xl text-[#FF2D2D] animate-spin mb-4" />
            <h2 className="text-xl text-white mb-2">Loading Polls...</h2>
            <p className="text-gray-400">Please wait while we fetch the latest polls.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-8 text-center max-w-md mx-auto">
              <FaExclamationTriangle className="text-4xl text-red-400 mb-4 mx-auto" />
              <h2 className="text-xl text-white mb-2 font-bold">Oops! Something went wrong</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={fetchPolls}
                className="px-6 py-3 bg-[#FF2D2D] text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <FaPoll className="text-3xl text-[#FF2D2D] mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Community Polls
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover what the community is talking about. Vote on polls and see real-time results.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
            <span className="text-gray-500">
              {polls.length} {polls.length === 1 ? 'poll' : 'polls'} available
            </span>
            <button
              onClick={toggleLiveNotifications}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                showLiveNotifications 
                  ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
                  : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
              }`}
              title={showLiveNotifications ? 'Disable live notifications' : 'Enable live notifications'}
            >
              <span>{showLiveNotifications ? '🔔' : '🔕'}</span>
              <span>{showLiveNotifications ? 'Live Updates ON' : 'Live Updates OFF'}</span>
            </button>
            {polls.length > 0 && (
              <span className="text-gray-500">
                • Updated just now
              </span>
            )}
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <FaFilter className="text-[#FF2D2D] mr-2" />
            <span className="text-white font-medium">Filter by Category</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => {
              const getCategoryColor = (cat) => {
                if (cat === 'All') return selectedCategory === cat ? 'bg-[#FF2D2D] text-white' : 'bg-[#2B2B2B] text-gray-300 hover:bg-gray-700 border border-gray-600';
                if (cat === 'Technology') return selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-[#2B2B2B] text-gray-300 hover:bg-blue-600/20 border border-blue-600/50';
                if (cat === 'Sports') return selectedCategory === cat ? 'bg-green-600 text-white' : 'bg-[#2B2B2B] text-gray-300 hover:bg-green-600/20 border border-green-600/50';
                if (cat === 'Entertainment') return selectedCategory === cat ? 'bg-purple-600 text-white' : 'bg-[#2B2B2B] text-gray-300 hover:bg-purple-600/20 border border-purple-600/50';
                if (cat === 'Politics') return selectedCategory === cat ? 'bg-red-700 text-white' : 'bg-[#2B2B2B] text-gray-300 hover:bg-red-700/20 border border-red-700/50';
                if (cat === 'Education') return selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-[#2B2B2B] text-gray-300 hover:bg-indigo-600/20 border border-indigo-600/50';
                if (cat === 'Health') return selectedCategory === cat ? 'bg-pink-600 text-white' : 'bg-[#2B2B2B] text-gray-300 hover:bg-pink-600/20 border border-pink-600/50';
                if (cat === 'Business') return selectedCategory === cat ? 'bg-yellow-600 text-white' : 'bg-[#2B2B2B] text-gray-300 hover:bg-yellow-600/20 border border-yellow-600/50';
                return selectedCategory === cat ? 'bg-[#FF2D2D] text-white' : 'bg-[#2B2B2B] text-gray-300 hover:bg-gray-700 border border-gray-600';
              };
              
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${getCategoryColor(category)}`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Polls Grid */}
        {polls.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="bg-[#2B2B2B] border border-gray-700 rounded-lg p-12 text-center max-w-md mx-auto">
              <FaPoll className="text-5xl text-gray-600 mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-white mb-2">No Polls Yet</h3>
              <p className="text-gray-400 mb-6">
                Be the first to create a poll and start the conversation!
              </p>
              <button
                onClick={() => window.location.href = '/create-poll'}
                className="px-6 py-3 bg-[#FF2D2D] text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Create First Poll
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:gap-8"
          >
            {polls.map((poll, index) => (
              <motion.div 
                key={poll._id || index} 
                variants={itemVariants}
                id={`poll-${poll._id}`}
              >
                <PollCard 
                  poll={poll} 
                  showActions={false}
                  onVote={(updatedPoll) => {
                    // Update the poll in the list when a vote is cast
                    setPolls(prevPolls => 
                      prevPolls.map(p => p._id === updatedPoll._id ? updatedPoll : p)
                    );
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Refresh Button */}
        {polls.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <button
              onClick={fetchPolls}
              className="px-6 py-3 bg-[#2B2B2B] border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Refresh Polls
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PollFeed;
