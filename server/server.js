const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Load environment variables first
require('dotenv').config(); // This will load from server/.env

const connectDB = require('./config/db.js');
const passport = require('passport');

// Use dotenv to load environment variables from .env file
require('dotenv').config({ path: './config/.env' });

// Import the Google OAuth2 strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Import User model
const User = require('./models/User');

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

// Configure passport
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true
},
async (req, accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: profile.emails[0].value });
    
    if (!user) {
      // Create a new user if it doesn't exist
      user = new User({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value,
        profilePicture: profile.photos[0].value
      });
      await user.save();
    } else {
      // Update user info if they exist but don't have a googleId
      if (!user.googleId) {
        user.googleId = profile.id;
        user.profilePicture = profile.photos[0].value;
        await user.save();
      }
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

connectDB();

app.use('/auth', authRoutes);

app.listen(PORT, () => {

  console.log(`Server is running at http://localhost:${PORT}`)
});