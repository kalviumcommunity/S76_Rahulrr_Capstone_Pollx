require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db.js');

const authRoutes = require('./routes/routes');

const app = express();

const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'pollX_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

connectDB();

app.use('/auth', authRoutes);

app.listen(PORT, () => {

  console.log(`Server is running at http://localhost:${PORT}`)
});