const mongoose = require('mongoose');

require('dotenv').config({path:'./config/.env'});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,          // Use new URL parser
            useUnifiedTopology: true,       // Use new server discovery engine
            useCreateIndex: true,           // Use createIndex instead of ensureIndex
            useFindAndModify: false         // Use new findOneAndUpdate() and findOneAndDelete() 
        });
        console.log('Database connected successfully');
    } catch (err) {
        console.log('Database connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;