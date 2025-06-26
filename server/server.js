const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Load environment variables first - only load once
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = [
  'DB_URL',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'SESSION_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  console.error('Available environment variables:', Object.keys(process.env).filter(key => key.includes('GOOGLE') || key.includes('JWT') || key.includes('DB') || key.includes('SESSION')));
  process.exit(1);
}

console.log('All required environment variables are loaded');
console.log('Environment check:');
console.log('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing');
console.log('- GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing');
console.log('- GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);
console.log('- NODE_ENV:', process.env.NODE_ENV);

const connectDB = require('./config/db.js');
const passport = require('passport');

// Import the Google OAuth2 strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Import User model
const User = require('./models/User');

const authRoutes = require('./routes/routes');

const app = express();

const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://pollx.netlify.app', 'https://s76-rahulrr-capstone-pollx.onrender.com']
    : ['http://localhost:5173', 'http://localhost:5000'],
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