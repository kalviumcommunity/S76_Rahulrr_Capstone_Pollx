import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PollCard from './PollCard';
import { FaPoll, FaSpinner, FaPlus, FaExclamationTriangle } from 'react-icons/fa';

const MyPolls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.PROD 
    ? 'https://s76-rahulrr-capstone-pollx.onrender.com'
    : 'http://localhost:5000';

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchMyPolls();
  }, [navigate]);

  const fetchMyPolls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/polls/my-polls`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Ensure we're working with an array and add total votes calculation
      const pollsData = response.data.polls || response.data || [];
      const pollsWithVotes = pollsData.map(poll => ({
        ...poll,
        totalVotes: poll.options ? poll.options.reduce((total, option) => total + (option.votes || 0), 0) : 0
      }));
      
      setPolls(pollsWithVotes);
    } catch (error) {
      console.error('Error fetching my polls:', error);
      
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      
      setError('Failed to load your polls. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPoll = (poll) => {
    // TODO: Implement edit functionality
    console.log('Edit poll:', poll);
    // For now, just navigate to create poll page
    navigate('/create-poll');
  };

  const handleDeletePoll = async (poll) => {
    if (!window.confirm('Are you sure you want to delete this poll?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/polls/${poll._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove the poll from the list
      setPolls(polls.filter(p => p._id !== poll._id));
    } catch (error) {
      console.error('Error deleting poll:', error);
      alert('Failed to delete poll. Please try again.');
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
            <h2 className="text-xl text-white mb-2">Loading Your Polls...</h2>
            <p className="text-gray-400">Please wait while we fetch your polls.</p>
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
              <h2 className="text-xl text-white mb-2 font-bold">Error Loading Your Polls</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={fetchMyPolls}
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
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div className="mb-4 md:mb-0">
            <div className="flex items-center mb-2">
              <FaPoll className="text-3xl text-[#FF2D2D] mr-3" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                My Polls
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Manage and track your created polls
            </p>
          </div>
          
          <button
            onClick={() => navigate('/create-poll')}
            className="flex items-center px-6 py-3 bg-[#FF2D2D] text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <FaPlus className="mr-2" />
            Create New Poll
          </button>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#2B2B2B] border border-gray-700 rounded-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-2xl font-bold text-[#FF2D2D]">{polls.length}</h3>
              <p className="text-gray-400">Total Polls</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#FF2D2D]">
                {polls.reduce((total, poll) => total + (poll.totalVotes || 0), 0)}
              </h3>
              <p className="text-gray-400">Total Votes</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#FF2D2D]">
                {polls.length > 0 ? Math.round(polls.reduce((total, poll) => total + (poll.totalVotes || 0), 0) / polls.length) : 0}
              </h3>
              <p className="text-gray-400">Avg Votes per Poll</p>
            </div>
          </div>
        </motion.div>

        {/* Polls List */}
        {polls.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="bg-[#2B2B2B] border border-gray-700 rounded-lg p-12 text-center max-w-lg mx-auto">
              <FaPoll className="text-6xl text-gray-600 mb-6 mx-auto" />
              <h3 className="text-2xl font-bold text-white mb-4">No Polls Created Yet</h3>
              <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                You haven't created any polls yet. Start engaging with your audience by creating your first poll and see what they think!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/create-poll')}
                className="flex items-center justify-center px-8 py-4 bg-[#FF2D2D] text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-lg mx-auto"
              >
                <FaPlus className="mr-3" />
                Create Your First Poll
              </motion.button>
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
                  showActions={true}
                  onEdit={handleEditPoll}
                  onDelete={handleDeletePoll}
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
              onClick={fetchMyPolls}
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

export default MyPolls;
