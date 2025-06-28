const mongoose = require('mongoose');

// Environment variables are already loaded in server.js, no need to load again here

const connectDB = async () => {
    try {
        // Production-safe logging
        const isProduction = process.env.NODE_ENV === 'production';
        
        // Connection options for older Mongoose version (5.x)
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferMaxEntries: 0,
            bufferCommands: false,
        };
        
        // Ensure DB_URL is available
        if (!process.env.DB_URL) {
            throw new Error('DB_URL environment variable is not set');
        }
        
        await mongoose.connect(process.env.DB_URL, options);
        
        if (!isProduction) {
            console.log('Database connected successfully');
        }
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;