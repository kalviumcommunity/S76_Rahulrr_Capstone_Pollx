const express = require('express');
const router = express.Router();
const { generatePoll } = require('../controllers/aiController');
const { ensureAuth } = require('../middleware/authMiddleware');

// Generate poll with AI - requires authentication
router.post('/generate-poll', ensureAuth, generatePoll);

module.exports = router;
