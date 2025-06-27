const mongoose = require('mongoose');
const Poll = require('./models/Poll');

// Connect to MongoDB
mongoose.connect('mongodb://rahulrr:homelander@ac-piby2ji-shard-00-01.fbr8iny.mongodb.net:27017,ac-piby2ji-shard-00-02.fbr8iny.mongodb.net:27017,ac-piby2ji-shard-00-00.fbr8iny.mongodb.net:27017/pollx?authSource=admin&replicaSet=atlas-nx830l-shard-0&retryWrites=true&w=majority&ssl=true');

async function updatePollCategories() {
  try {
    // Update specific polls with better categories
    
    // Update "Social platform which you use the most" to Entertainment
    await Poll.findOneAndUpdate(
      { question: "Social platform which you use the most" },
      { category: "Entertainment" }
    );
    
    // Update "Fav Super Heros" to Entertainment  
    await Poll.findOneAndUpdate(
      { question: "Fav Super Heros" },
      { category: "Entertainment" }
    );
    
    // Update "Best OS for desktops" to Technology
    await Poll.findOneAndUpdate(
      { question: "Best OS for desktops" },
      { category: "Technology" }
    );
    
    console.log('Poll categories updated successfully!');
    
    // Fetch and display updated polls
    const polls = await Poll.find({}, 'question category');
    console.log('\nUpdated polls:');
    polls.forEach(poll => {
      console.log(`- ${poll.question} (${poll.category})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating poll categories:', error);
    process.exit(1);
  }
}

updatePollCategories();
