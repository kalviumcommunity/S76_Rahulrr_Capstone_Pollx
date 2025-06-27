const express = require('express');
const router = express.Router();
const { createPoll, getAllPolls, getUserPolls, getVotedPolls, votePoll } = require('../controllers/pollController');
const { ensureAuth } = require('../middleware/authMiddleware');

// POST /polls - Create a new poll (protected route)
router.post('/', ensureAuth, createPoll);

// GET /polls - Get all polls (public route)
router.get('/', getAllPolls);

// GET /polls/my-polls - Get polls created by authenticated user (protected route)
router.get('/my-polls', ensureAuth, getUserPolls);

// GET /polls/voted - Get polls that the authenticated user has voted on (protected route)
router.get('/voted', ensureAuth, getVotedPolls);

// POST /polls/:pollId/vote - Vote on a poll (protected route)
router.post('/:pollId/vote', ensureAuth, votePoll);

module.exports = router;
