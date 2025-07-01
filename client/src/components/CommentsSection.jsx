import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaRegHeart, FaComment, FaUser, FaClock, FaSort, FaSpinner } from 'react-icons/fa';
import { addComment, getComments, toggleCommentHeart } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import socket from '../socket';

const CommentsSection = ({ pollId, initialCommentCount = 0 }) => {
  const { isLoggedIn, user } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' or 'popular'
  const [commentCount, setCommentCount] = useState(initialCommentCount);

  // Fetch comments when expanded
  useEffect(() => {
    if (isExpanded && comments.length === 0) {
      fetchComments();
    }
  }, [isExpanded, pollId]);

  // Real-time comment updates
  useEffect(() => {
    const handleCommentAdded = (data) => {
      if (data.pollId === pollId) {
        setComments(prevComments => [data.comment, ...prevComments]);
        setCommentCount(data.totalComments);
      }
    };

    const handleCommentHearted = (data) => {
      if (data.pollId === pollId) {
        setComments(prevComments =>
          prevComments.map(comment =>
            comment._id === data.commentId
              ? { ...comment, hearts: data.hearts, heartedBy: data.comment.heartedBy }
              : comment
          )
        );
      }
    };

    socket.on('commentAdded', handleCommentAdded);
    socket.on('commentHearted', handleCommentHearted);

    return () => {
      socket.off('commentAdded', handleCommentAdded);
      socket.off('commentHearted', handleCommentHearted);
    };
  }, [pollId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getComments(pollId);
      setComments(response.comments || []);
      setCommentCount(response.totalComments || 0);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isLoggedIn) return;

    try {
      setSubmitting(true);
      setError('');
      const response = await addComment(pollId, newComment.trim());
      setNewComment('');
      showToast('Comment added successfully!', 'success');
      // Comment will be added via real-time update
    } catch (error) {
      console.error('Error adding comment:', error);
      const errorMsg = error.error || 'Failed to add comment';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleHeart = async (commentId) => {
    if (!isLoggedIn) {
      showToast('Please log in to heart comments', 'info');
      return;
    }

    try {
      const response = await toggleCommentHeart(pollId, commentId);
      const message = response.hasHearted ? 'Comment hearted!' : 'Heart removed';
      showToast(message, 'success');
      // Heart update will be handled via real-time update
    } catch (error) {
      console.error('Error toggling heart:', error);
      showToast('Failed to update heart', 'error');
    }
  };

  const getSortedComments = () => {
    const sorted = [...comments];
    if (sortBy === 'popular') {
      return sorted.sort((a, b) => (b.hearts || 0) - (a.hearts || 0));
    }
    return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const isHeartedByUser = (comment) => {
    return user && comment.heartedBy && comment.heartedBy.includes(user.id);
  };

  return (
    <div className="mt-6 border-t border-gray-600 pt-4">
      {/* Comments Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
        >
          <FaComment className="text-[#FF2D2D]" />
          <span>
            {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
          </span>
          <span className={`ml-2 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Add Comment Form */}
            {isLoggedIn ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="flex flex-col space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#FF2D2D] focus:ring-1 focus:ring-[#FF2D2D] resize-none"
                    rows="3"
                    maxLength={500}
                    disabled={submitting}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {newComment.length}/500 characters
                    </span>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submitting}
                      className="px-4 py-2 bg-[#FF2D2D] text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {submitting ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <span>Post Comment</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-gray-800 border border-gray-600 rounded-lg text-center">
                <p className="text-gray-400 mb-3">Please log in to comment</p>
                <a
                  href="/login"
                  className="inline-block px-4 py-2 bg-[#FF2D2D] text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Log In
                </a>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Sort Options */}
            {comments.length > 1 && (
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center text-gray-400 text-sm">
                  <FaSort className="mr-2" />
                  <span>Sort by:</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSortBy('newest')}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      sortBy === 'newest'
                        ? 'bg-[#FF2D2D] text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      sortBy === 'popular'
                        ? 'bg-[#FF2D2D] text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Popular
                  </button>
                </div>
              </div>
            )}

            {/* Comments List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="text-2xl text-[#FF2D2D] animate-spin mr-3" />
                <span className="text-gray-400">Loading comments...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <FaComment className="text-4xl text-gray-600 mb-3 mx-auto" />
                <p className="text-gray-400">No comments yet</p>
                <p className="text-gray-500 text-sm">Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getSortedComments().map((comment) => (
                  <motion.div
                    key={comment._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <FaUser className="text-[#FF2D2D] text-sm" />
                          <span className="text-gray-300 font-medium">
                            {comment.commentedBy?.username || comment.commentedBy?.email || 'Anonymous'}
                          </span>
                          <FaClock className="text-gray-500 text-xs" />
                          <span className="text-gray-500 text-xs">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-200 leading-relaxed">{comment.text}</p>
                      </div>
                    </div>

                    {/* Heart Button */}
                    <div className="flex items-center justify-end mt-3">
                      <button
                        onClick={() => handleToggleHeart(comment._id)}
                        disabled={!isLoggedIn}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                          isHeartedByUser(comment)
                            ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-red-400'
                        } ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <motion.div
                          whileHover={isLoggedIn ? { scale: 1.1 } : {}}
                          whileTap={isLoggedIn ? { scale: 0.9 } : {}}
                        >
                          {isHeartedByUser(comment) ? (
                            <FaHeart className="text-red-400" />
                          ) : (
                            <FaRegHeart />
                          )}
                        </motion.div>
                        <span>{comment.hearts || 0}</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommentsSection;
