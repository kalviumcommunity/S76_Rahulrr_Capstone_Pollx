import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import PollCard from './PollCard';
import { FaPoll, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const PollFeed = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.PROD 
    ? 'https://s76-rahulrr-capstone-pollx.onrender.com'
    : 'http://localhost:5000';

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/polls`);
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
            {polls.length > 0 && (
              <span className="text-gray-500">
                • Updated just now
              </span>
            )}
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
              <motion.div key={poll._id || index} variants={itemVariants}>
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
