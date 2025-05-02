const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const User = require('../models/User');


// GET API

router.get('/',async (req,res)=>{
    try{
        const polls = await Poll.find();
        res.json(polls);
    } catch (error) {
        console.error('Error fetching polls:', error);
        res.status(500).json({ message: 'Server error' });
      }
})


// POST API 
router.post('/', async (req, res) => {
  try {
    const { question, options, userId } = req.body;
//User 
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newPoll = new Poll({
      question,
      options,
       createdBy: userId,
    });

    const savedPoll = await newPoll.save();
    res.status(201).json(savedPoll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// PUT API
router.put('/:id', async (req, res) => {
  try {
    const { question, options } = req.body;
    const updatedPoll = await Poll.findByIdAndUpdate(
      req.params.id,
      { question, options },
      { new: true, runValidators: true }
    );

    if (!updatedPoll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    res.json(updatedPoll);
  } catch (err) {
    console.error('Error updating poll:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;


