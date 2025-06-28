const Poll = require('../models/Poll');
const User = require('../models/User');

// Create a new poll
const createPoll = async (req, res) => {
  try {
    const { question, options, category } = req.body;

    // Validation
    if (!question || !question.trim()) {
      return res.status(400).json({ 
        error: 'Question is required' 
      });
    }

    if (!options || !Array.isArray(options)) {
      return res.status(400).json({ 
        error: 'Options must be an array' 
      });
    }

    if (options.length < 2 || options.length > 4) {
      return res.status(400).json({ 
        error: 'Poll must have between 2 and 4 options' 
      });
    }

    // Validate category
    const validCategories = ['Technology', 'Sports', 'Entertainment', 'Politics', 'Education', 'Health', 'Business', 'Other'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ 
        error: 'Invalid category' 
      });
    }

    // Validate that all options have text
    const validOptions = options.filter(option => option && option.trim());
    if (validOptions.length !== options.length) {
      return res.status(400).json({ 
        error: 'All options must have text' 
      });
    }

    // Check if user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Create poll with formatted options
    const formattedOptions = validOptions.map(option => ({
      text: option.trim(),
      votes: 0
    }));

    const newPoll = new Poll({
      question: question.trim(),
      options: formattedOptions,
      category: category || 'Other',
      createdBy: req.user.id
    });

    const savedPoll = await newPoll.save();
    
    // Populate the createdBy field for response
    await savedPoll.populate('createdBy', 'username email');

    // Emit real-time poll creation to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('pollCreated', {
        poll: savedPoll,
        message: 'New poll created',
        createdAt: new Date()
      });
      console.log('New poll broadcasted:', savedPoll.question);
    }

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      poll: savedPoll
    });

  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Get all polls
const getAllPolls = async (req, res) => {
  try {
    const { category } = req.query;
    
    // Build filter object
    const filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    const polls = await Poll.find(filter)
      .populate('createdBy', 'username email')
      .populate('comments.commentedBy', 'username email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      polls
    });
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Get polls created by the authenticated user
const getUserPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ createdBy: req.user.id })
      .populate('createdBy', 'username email')
      .populate('comments.commentedBy', 'username email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      polls
    });
  } catch (error) {
    console.error('Error fetching user polls:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Get polls that the authenticated user has voted on
const getVotedPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ votedUsers: req.user.id })
      .populate('createdBy', 'username email')
      .populate('comments.commentedBy', 'username email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      polls
    });
  } catch (error) {
    console.error('Error fetching voted polls:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Vote on a poll
const votePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionId } = req.body;

    // Validation
    if (!optionId) {
      return res.status(400).json({ 
        error: 'Option ID is required' 
      });
    }

    // Find the poll
    const poll = await Poll.findById(pollId).populate('createdBy', 'username email');
    if (!poll) {
      return res.status(404).json({ 
        error: 'Poll not found' 
      });
    }

    // Find the option by its _id
    const option = poll.options.id(optionId);
    if (!option) {
      return res.status(404).json({ 
        error: 'Option not found' 
      });
    }

    // Check if user has already voted on this poll
    if (poll.votedUsers.includes(req.user.id)) {
      return res.status(400).json({ 
        error: 'You have already voted on this poll' 
      });
    }

    // Use findOneAndUpdate with atomic operations to prevent race conditions
    const updatedPoll = await Poll.findOneAndUpdate(
      { 
        _id: pollId,
        votedUsers: { $ne: req.user.id } // Double-check user hasn't voted
      },
      { 
        $inc: { [`options.${poll.options.indexOf(option)}.votes`]: 1 },
        $addToSet: { votedUsers: req.user.id }
      },
      { 
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'username email');

    // If updatedPoll is null, it means the user already voted (race condition)
    if (!updatedPoll) {
      return res.status(400).json({ 
        error: 'You have already voted on this poll' 
      });
    }

    // Calculate total votes for frontend convenience
    const totalVotes = updatedPoll.options.reduce((sum, opt) => sum + opt.votes, 0);

    // Emit real-time vote update to all connected clients
    const io = req.app.get('io');
    if (io) {
      // Broadcast to all clients
      io.emit('voteUpdated', {
        pollId: updatedPoll._id,
        poll: updatedPoll,
        totalVotes: totalVotes,
        updatedAt: new Date()
      });
      
      // Also broadcast to specific poll room if using rooms
      io.to(`poll_${updatedPoll._id}`).emit('pollVoteUpdate', {
        pollId: updatedPoll._id,
        poll: updatedPoll,
        totalVotes: totalVotes,
        updatedAt: new Date()
      });
      
      console.log('Vote update broadcasted for poll:', updatedPoll.question);
    } else {
      console.log('Socket.IO instance not found');
    }

    // Return the updated poll
    res.json({
      success: true,
      message: 'Vote recorded successfully',
      poll: updatedPoll
    });

  } catch (error) {
    console.error('Error voting on poll:', error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid poll ID format' 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Add a comment to a poll
const addComment = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { text } = req.body;

    // Validation
    if (!text || !text.trim()) {
      return res.status(400).json({ 
        error: 'Comment text is required' 
      });
    }

    if (text.trim().length > 500) {
      return res.status(400).json({ 
        error: 'Comment must be 500 characters or less' 
      });
    }

    // Find the poll
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ 
        error: 'Poll not found' 
      });
    }

    // Create new comment
    const newComment = {
      text: text.trim(),
      commentedBy: req.user.id,
      createdAt: new Date()
    };

    // Add comment to poll
    poll.comments.push(newComment);
    await poll.save();

    // Populate the newly added comment for response
    await poll.populate('comments.commentedBy', 'username email');
    
    // Get the last comment (the one we just added)
    const addedComment = poll.comments[poll.comments.length - 1];

    // Emit real-time comment update to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('commentAdded', {
        pollId: poll._id,
        comment: addedComment,
        totalComments: poll.comments.length,
        updatedAt: new Date()
      });
      console.log('Comment added broadcasted for poll:', poll.question);
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: addedComment,
      totalComments: poll.comments.length
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid poll ID format' 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Get comments for a poll
const getComments = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Find the poll and populate comments
    const poll = await Poll.findById(pollId)
      .populate('comments.commentedBy', 'username email')
      .select('comments');

    if (!poll) {
      return res.status(404).json({ 
        error: 'Poll not found' 
      });
    }

    // Sort comments by newest first
    const sortedComments = poll.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Implement pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedComments = sortedComments.slice(startIndex, endIndex);

    res.json({
      success: true,
      comments: paginatedComments,
      totalComments: poll.comments.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(poll.comments.length / limit),
      hasMore: endIndex < poll.comments.length
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid poll ID format' 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Toggle heart on a comment
const toggleCommentHeart = async (req, res) => {
  try {
    const { pollId, commentId } = req.params;

    // Find the poll
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ 
        error: 'Poll not found' 
      });
    }

    // Find the comment
    const comment = poll.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ 
        error: 'Comment not found' 
      });
    }

    // Check if user has already hearted this comment
    const hasHearted = comment.heartedBy.includes(req.user.id);

    if (hasHearted) {
      // Remove heart
      comment.heartedBy.pull(req.user.id);
      comment.hearts = Math.max(0, comment.hearts - 1);
    } else {
      // Add heart
      comment.heartedBy.push(req.user.id);
      comment.hearts += 1;
    }

    await poll.save();

    // Populate comment data for response
    await poll.populate('comments.commentedBy', 'username email');
    const updatedComment = poll.comments.id(commentId);

    // Emit real-time heart update to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('commentHearted', {
        pollId: poll._id,
        commentId: commentId,
        comment: updatedComment,
        hearts: updatedComment.hearts,
        hasHearted: !hasHearted,
        updatedAt: new Date()
      });
      console.log('Comment heart update broadcasted for poll:', poll.question);
    }

    res.json({
      success: true,
      message: hasHearted ? 'Heart removed successfully' : 'Heart added successfully',
      comment: updatedComment,
      hearts: updatedComment.hearts,
      hasHearted: !hasHearted
    });

  } catch (error) {
    console.error('Error toggling comment heart:', error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid ID format' 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Delete a poll (admin or owner only)
const deletePoll = async (req, res) => {
  try {
    const { pollId } = req.params;

    // Find the poll
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ 
        error: 'Poll not found' 
      });
    }

    // Check if user is the owner of the poll
    if (poll.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        error: 'Access denied. You can only delete your own polls' 
      });
    }

    // Delete the poll
    await Poll.findByIdAndDelete(pollId);

    // Emit real-time poll deletion to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('pollDeleted', {
        pollId: pollId,
        message: 'Poll was deleted by owner',
        updatedAt: new Date()
      });
      console.log('Poll deletion broadcasted for poll:', poll.question);
    }

    res.json({
      success: true,
      message: 'Poll deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting poll:', error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid poll ID format' 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

module.exports = {
  createPoll,
  getAllPolls,
  getUserPolls,
  getVotedPolls,
  votePoll,
  addComment,
  getComments,
  toggleCommentHeart,
  deletePoll
};
