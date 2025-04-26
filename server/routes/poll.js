const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');

// POST API 
router.post('/', async (req, res) => {
  try {
    const { question, options } = req.body;

    const newPoll = new Poll({
      question,
      options,
    });

    const savedPoll = await newPoll.save();
    res.status(201).json(savedPoll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
