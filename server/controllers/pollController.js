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

    // Add user to votedUsers array using $addToSet to avoid duplicates
    // and increment vote count atomically
    await Poll.findByIdAndUpdate(
      pollId, 
      { 
        $inc: { [`options.${poll.options.indexOf(option)}.votes`]: 1 },
        $addToSet: { votedUsers: req.user.id }
      }
    );

    // Fetch the updated poll to return
    const updatedPoll = await Poll.findById(pollId).populate('createdBy', 'username email');

    // Calculate total votes for frontend convenience
    const totalVotes = updatedPoll.options.reduce((sum, opt) => sum + opt.votes, 0);

    // Emit real-time vote update to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('voteUpdated', {
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

module.exports = {
  createPoll,
  getAllPolls,
  getUserPolls,
  getVotedPolls,
  votePoll
};
