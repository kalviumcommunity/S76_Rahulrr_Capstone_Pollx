const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

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
const pollRoutes = require('./routes/pollRoutes');
const DatabaseWatcher = require('./services/DatabaseWatcher');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "https://pollx.netlify.app",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  // Add additional configuration for better reliability
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// Make io instance available globally
app.set('io', io);

const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://pollx.netlify.app', 'https://s76-rahulrr-capstone-pollx.onrender.com']
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5000'],
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

app.use('/auth', authRoutes);
app.use('/polls', pollRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Send a welcome event to the newly connected client
  socket.emit('welcome', {
    message: 'Connected to PollX server',
    socketId: socket.id,
    timestamp: new Date()
  });
  
  // Listen for client-specific events
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });
  
  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room: ${roomId}`);
  });

  // Handle heartbeat to maintain connection
  socket.on('heartbeat', (data) => {
    socket.emit('heartbeat', { received: true, timestamp: new Date() });
  });

  // Handle poll subscription for real-time updates
  socket.on('subscribeToPoll', (pollId) => {
    socket.join(`poll_${pollId}`);
    console.log(`Socket ${socket.id} subscribed to poll updates: ${pollId}`);
  });

  socket.on('unsubscribeFromPoll', (pollId) => {
    socket.leave(`poll_${pollId}`);
    console.log(`Socket ${socket.id} unsubscribed from poll updates: ${pollId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

connectDB();

// Initialize database watcher after database connection
mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connected successfully');
  
  // Initialize database change watcher
  const dbWatcher = new DatabaseWatcher(io);
  console.log('🔍 Database watcher initialized');
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
});