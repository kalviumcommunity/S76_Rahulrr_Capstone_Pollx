const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: true 
  },
  votes: { 
    type: Number, 
    default: 0 
  },
});

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [optionSchema],
    validate: {
      validator: function(options) {
        return options.length >= 2 && options.length <= 4;
      },
      message: 'Poll must have between 2 and 4 options'
    }
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,  
  },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Sports', 'Entertainment', 'Politics', 'Education', 'Health', 'Business', 'Other'],
    default: 'Other'
  },
  votedUsers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Poll', pollSchema);

