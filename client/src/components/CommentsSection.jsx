import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaRegHeart, FaComment, FaUser, FaSort, FaSpinner, FaPaperPlane } from 'react-icons/fa';
import { addComment, getComments, toggleCommentHeart } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatSocialTimestamp, formatDetailedTimestamp } from '../utils/timeUtils';
import socket from '../socket';

const CommentsSection = ({ pollId, initialCommentCount = 0 }) => {
  const { isLoggedIn, user } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' or 'popular'
  const [commentCount, setCommentCount] = useState(initialCommentCount);

  // Always fetch comments on mount - no more friction
  useEffect(() => {
    fetchComments();
  }, [pollId]);

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

  const isHeartedByUser = (comment) => {
    return user && comment.heartedBy && comment.heartedBy.includes(user.id);
  };

  // Show preview of comments (first 2) vs all comments
  const displayedComments = showAllComments ? getSortedComments() : getSortedComments().slice(0, 2);

  return (
    <div className="mt-6 border-t border-gray-600 pt-4">
      {/* Add Comment Form - Always Visible */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmitComment} className="mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
              <FaUser className="text-white text-xs" />
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 resize-none text-sm"
                rows="2"
                maxLength={500}
                disabled={submitting}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {newComment.length}/500
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1.5 text-sm"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin text-xs" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="text-xs" />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-4 p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-center">
          <p className="text-gray-400 text-sm mb-2">
            <a href="/login" className="text-red-400 hover:text-red-300 font-medium">
              Log in
            </a>
            {' '}to join the conversation
          </p>
        </div>
      )}

      {error && (
        <div className="mb-3 p-2 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Comments Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-gray-400">
          <FaComment className="text-red-400 text-sm" />
          <span className="text-sm font-medium">
            {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
          </span>
        </div>

        {/* Sort Options - Only show if there are multiple comments */}
        {comments.length > 1 && (
          <div className="flex items-center space-x-2">
            <FaSort className="text-gray-500 text-xs" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded text-gray-300 text-xs px-2 py-1 focus:outline-none focus:border-red-400"
            >
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        )}
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <FaSpinner className="text-lg text-red-400 animate-spin mr-2" />
          <span className="text-gray-400 text-sm">Loading comments...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6">
          <FaComment className="text-2xl text-gray-600 mb-2 mx-auto" />
          <p className="text-gray-500 text-sm">No comments yet</p>
          <p className="text-gray-600 text-xs">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedComments.map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3"
            >
              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                  <FaUser className="text-white text-xs" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-gray-300 font-medium text-sm">
                      {comment.commentedBy?.username || comment.commentedBy?.email || 'Anonymous'}
                    </span>
                    <span 
                      className="text-gray-500 text-xs cursor-help"
                      title={formatDetailedTimestamp(comment.createdAt)}
                    >
                      {formatSocialTimestamp(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed break-words">
                    {comment.text}
                  </p>
                  
                  {/* Heart Button */}
                  <div className="flex items-center justify-end mt-2">
                    <button
                      onClick={() => handleToggleHeart(comment._id)}
                      disabled={!isLoggedIn}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-all duration-200 ${
                        isHeartedByUser(comment)
                          ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-red-400'
                      } ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <motion.div
                        whileHover={isLoggedIn ? { scale: 1.1 } : {}}
                        whileTap={isLoggedIn ? { scale: 0.9 } : {}}
                      >
                        {isHeartedByUser(comment) ? (
                          <FaHeart className="text-red-400 text-xs" />
                        ) : (
                          <FaRegHeart className="text-xs" />
                        )}
                      </motion.div>
                      <span>{comment.hearts || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Show More/Less Button */}
          {comments.length > 2 && (
            <button
              onClick={() => setShowAllComments(!showAllComments)}
              className="w-full py-2 text-gray-400 hover:text-gray-300 text-sm font-medium transition-colors"
            >
              {showAllComments 
                ? `Show less comments` 
                : `View ${comments.length - 2} more comment${comments.length - 2 === 1 ? '' : 's'}`
              }
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
