import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaShare, FaUsers, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import PollCard from '../components/PollCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const IndividualPollPage = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const sharedFrom = searchParams.get('src') || 'direct';

  useEffect(() => {
    fetchPoll();
    
    // Show login prompt for shared links if user is not logged in
    if (!isLoggedIn && sharedFrom !== 'direct') {
      setShowLoginPrompt(true);
    }
  }, [pollId, isLoggedIn, sharedFrom]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      const baseURL = process.env.NODE_ENV === 'production'
        ? 'https://s76-rahulrr-capstone-pollx.onrender.com'
        : 'http://localhost:5000';

      const response = await fetch(`${baseURL}/polls/${pollId}`);
      const data = await response.json();

      if (response.ok) {
        setPoll(data.poll);
      } else {
        setError(data.error || 'Poll not found');
      }
    } catch (err) {
      setError('Failed to load poll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId, optionId) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const baseURL = process.env.NODE_ENV === 'production'
        ? 'https://s76-rahulrr-capstone-pollx.onrender.com'
        : 'http://localhost:5000';

      const response = await fetch(`${baseURL}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ optionId })
      });

      const data = await response.json();

      if (response.ok) {
        setPoll(data.poll);
        showToast('Vote submitted successfully!', 'success');
        
        // Update local storage to track voted polls
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
        votedPolls[pollId] = optionId;
        localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
      } else {
        showToast(data.error || 'Failed to vote', 'error');
      }
    } catch (err) {
      showToast('Failed to vote. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading poll...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8"
        >
          <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-4">Poll Not Found</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/polls')}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <FaArrowLeft />
            <span>Browse All Polls</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <FaArrowLeft />
              <span>Back</span>
            </motion.button>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              {sharedFrom !== 'direct' && (
                <span className="flex items-center space-x-1">
                  <FaShare className="text-xs" />
                  <span>Shared via {sharedFrom}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Poll Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PollCard 
            poll={poll} 
            onVote={handleVote}
            disableVoting={!isLoggedIn}
          />
        </motion.div>

        {/* Engagement Stats */}
        {poll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-gray-800/50 rounded-xl p-6 text-center">
              <FaUsers className="text-3xl text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">
                {poll.options?.reduce((total, option) => total + (option.votes || 0), 0) || 0}
              </div>
              <div className="text-gray-400">Total Votes</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 text-center">
              <FaClock className="text-3xl text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">
                {new Date(poll.createdAt).toLocaleDateString()}
              </div>
              <div className="text-gray-400">Created</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 text-center">
              <FaShare className="text-3xl text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">
                {poll.category || 'General'}
              </div>
              <div className="text-gray-400">Category</div>
            </div>
          </motion.div>
        )}

        {/* Related Polls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Explore More Polls</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/polls')}
            className="btn-primary"
          >
            Browse All Polls
          </motion.button>
        </motion.div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowLoginPrompt(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl mb-6">🗳️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Join the Conversation!</h2>
            <p className="text-gray-300 mb-6">
              This poll was shared with you! Sign in to vote and see real-time results.
            </p>
            
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="btn-primary w-full"
              >
                Sign In to Vote
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/signup')}
                className="btn-outline w-full"
              >
                Create Account
              </motion.button>
              
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Just browse for now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default IndividualPollPage;
