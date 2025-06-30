const express = require('express');
const router = express.Router();
const { createPoll, getAllPolls, getUserPolls, getVotedPolls, votePoll, addComment, getComments, toggleCommentHeart, deletePoll } = require('../controllers/pollController');
const { ensureAuth } = require('../middleware/authMiddleware');

// POST /polls - Create a new poll (protected route)
router.post('/', ensureAuth, createPoll);

// GET /polls - Get all polls (public route)
router.get('/', getAllPolls);

// GET /polls/my-polls - Get polls created by authenticated user (protected route)
router.get('/my-polls', ensureAuth, getUserPolls);

// GET /polls/voted - Get polls that authenticated user has voted on (protected route)
router.get('/voted', ensureAuth, getVotedPolls);

// GET /polls/:pollId - Get a single poll by ID (public route)
router.get('/:pollId', async (req, res) => {
  try {
    const Poll = require('../models/Poll');
    const poll = await Poll.findById(req.params.pollId).populate('createdBy', 'username profilePicture');
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    res.json({ poll });
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ error: 'Failed to fetch poll' });
  }
});

// POST /polls/:pollId/vote - Vote on a poll (protected route)
router.post('/:pollId/vote', ensureAuth, votePoll);

// POST /polls/:pollId/comments - Add a comment to a poll (protected route)
router.post('/:pollId/comments', ensureAuth, addComment);

// GET /polls/:pollId/comments - Get comments for a poll (public route)
router.get('/:pollId/comments', getComments);

// POST /polls/:pollId/comments/:commentId/heart - Toggle heart on a comment (protected route)
router.post('/:pollId/comments/:commentId/heart', ensureAuth, toggleCommentHeart);

// DELETE /polls/:pollId - Delete a poll (protected route - owner only)
router.delete('/:pollId', ensureAuth, deletePoll);

module.exports = router;
