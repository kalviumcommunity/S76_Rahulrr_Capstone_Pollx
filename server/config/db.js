const mongoose = require('mongoose');

require('dotenv').config({path:'./config/.env'});

const connectDB = async () => {
    try {
        // Add back the options as we're using an older version of Mongoose (5.x)
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log('Database connected successfully');
    } catch (err) {
        console.log('Database connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;