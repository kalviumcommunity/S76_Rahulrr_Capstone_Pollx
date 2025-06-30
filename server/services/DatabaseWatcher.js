const mongoose = require('mongoose');

class DatabaseWatcher {
  constructor(io) {
    this.io = io;
    this.watchPolls();
  }

  watchPolls() {
    const db = mongoose.connection.db;
    
    if (!db) {
      console.log('Database not connected yet, retrying in 2 seconds...');
      setTimeout(() => this.watchPolls(), 2000);
      return;
    }

    try {
      // Watch the polls collection for changes
      const pollChangeStream = db.collection('polls').watch([
        {
          $match: {
            'operationType': { $in: ['delete', 'insert', 'update', 'replace'] }
          }
        }
      ]);

      console.log('📡 MongoDB Change Stream initialized for polls collection');

      pollChangeStream.on('change', (change) => {
        console.log('🔄 Database change detected:', change.operationType);
        
        switch (change.operationType) {
          case 'delete':
            console.log('🗑️ Poll deleted:', change.documentKey._id);
            this.io.emit('pollDeleted', {
              pollId: change.documentKey._id,
              message: 'Poll was deleted',
              updatedAt: new Date()
            });
            break;
            
          case 'insert':
            console.log('📝 New poll inserted via database');
            // For inserts, we need to fetch the full document
            this.handlePollInsert(change.fullDocument);
            break;
            
          case 'update':
          case 'replace':
            console.log('✏️ Poll updated via database');
            this.handlePollUpdate(change.documentKey._id);
            break;
        }
      });

      pollChangeStream.on('error', (error) => {
        console.error('❌ Change stream error:', error);
        // Attempt to restart the change stream
        setTimeout(() => this.watchPolls(), 5000);
      });

    } catch (error) {
      console.error('❌ Failed to initialize change stream:', error);
      // Retry in 5 seconds
      setTimeout(() => this.watchPolls(), 5000);
    }
  }

  async handlePollInsert(fullDocument) {
    try {
      // Populate the document with user data
      const Poll = require('../models/Poll');
      const poll = await Poll.findById(fullDocument._id)
        .populate('createdBy', 'username email')
        .populate('comments.commentedBy', 'username email');

      if (poll) {
        this.io.emit('pollCreated', {
          poll: poll,
          message: 'New poll created (database)',
          createdAt: new Date()
        });
        console.log('📡 Poll creation broadcasted via change stream');
      }
    } catch (error) {
      console.error('Error handling poll insert:', error);
    }
  }

  async handlePollUpdate(pollId) {
    try {
      // Fetch the updated poll
      const Poll = require('../models/Poll');
      const poll = await Poll.findById(pollId)
        .populate('createdBy', 'username email')
        .populate('comments.commentedBy', 'username email');

      if (poll) {
        // Calculate total votes
        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
        
        this.io.emit('pollUpdated', {
          pollId: poll._id,
          poll: poll,
          totalVotes: totalVotes,
          updateType: 'vote', // This helps frontend distinguish types of updates
          pollTitle: poll.question.substring(0, 50) + (poll.question.length > 50 ? '...' : ''),
          updatedAt: new Date()
        });
        console.log('📡 Poll update broadcasted via change stream');
      } else {
        // Poll was deleted
        this.io.emit('pollDeleted', {
          pollId: pollId,
          message: 'Poll was deleted',
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error handling poll update:', error);
    }
  }
}

module.exports = DatabaseWatcher;
