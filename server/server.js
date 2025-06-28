const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const MongoStore = require('connect-mongo');
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
  'SESSION_SECRET',
  'GEMINI_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Available environment variables:', Object.keys(process.env).filter(key => 
    key.includes('GOOGLE') || key.includes('JWT') || key.includes('DB') || key.includes('SESSION') || key.includes('GEMINI')
  ));
  console.error('Please check your environment variables in the deployment platform');
  process.exit(1);
}

console.log('All required environment variables are loaded');

// Only log environment details in development
if (process.env.NODE_ENV !== 'production') {
  console.log('Environment check:');
  console.log('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing');
  console.log('- GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing');
  console.log('- GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);
  console.log('- NODE_ENV:', process.env.NODE_ENV);
} else {
  console.log('Production environment - environment variables validated');
}

const connectDB = require('./config/db.js');
const passport = require('passport');

// Import the Google OAuth2 strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Import User model
const User = require('./models/User');

const authRoutes = require('./routes/routes');
const pollRoutes = require('./routes/pollRoutes');
const aiRoutes = require('./routes/aiRoutes');
const DatabaseWatcher = require('./services/DatabaseWatcher');

// Production-safe logging utility
const safeLog = {
  info: (message, data = null) => {
    if (process.env.NODE_ENV === 'production') {
      console.log(`[INFO] ${message}`);
    } else {
      console.log(`[INFO] ${message}`, data || '');
    }
  },
  error: (message, error = null) => {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[ERROR] ${message}`, error?.message || '');
    } else {
      console.error(`[ERROR] ${message}`, error || '');
    }
  },
  auth: (message, userId = null) => {
    if (process.env.NODE_ENV === 'production') {
      console.log(`[AUTH] ${message}${userId ? ` for user ${userId}` : ''}`);
    } else {
      console.log(`[AUTH] ${message}`, userId || '');
    }
  }
};

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? [
          "https://pollx.netlify.app",
          "https://s76-rahulrr-capstone-pollx.onrender.com",
          "https://pollx-frontend.netlify.app"
        ]
      : [
          "http://localhost:5173", 
          "http://localhost:5174",
          "http://localhost:5175",
          "http://localhost:3000",
          "http://127.0.0.1:5173"
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
  reconnectionDelay: 1000,
  allowEIO3: true // Support for older clients
});

// Make io instance available globally
app.set('io', io);

const PORT = process.env.PORT || 5000;


// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          'https://pollx.netlify.app',
          'https://s76-rahulrr-capstone-pollx.onrender.com',
          'https://pollx-frontend.netlify.app' // In case of different domain
        ]
      : [
          'http://localhost:5173',
          'http://localhost:5174', 
          'http://localhost:5175',
          'http://localhost:5000',
          'http://localhost:3000',
          'http://127.0.0.1:5173'
        ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      safeLog.error(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Support legacy browsers
};

app.use(cors(corsOptions));

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Socket.IO compatibility
  crossOriginEmbedderPolicy: false // Allow embedded content
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all requests
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Configure session middleware with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'pollX_session_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DB_URL || process.env.MONGO_URI,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
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

// Apply auth rate limiter to auth routes
app.use('/auth', authLimiter, authRoutes);
app.use('/polls', pollRoutes);
app.use('/api', aiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('./package.json').version
  });
});

// Simple ping endpoint for monitoring
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'PollX API Server is running!',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// General 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  safeLog.info('User connected', process.env.NODE_ENV !== 'production' ? socket.id : '[ID Hidden]');
  
  // Send a welcome event to the newly connected client
  socket.emit('welcome', {
    message: 'Connected to PollX server',
    socketId: socket.id,
    timestamp: new Date()
  });
  
  // Listen for client-specific events
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    safeLog.info(`Socket joined room: ${roomId}`, process.env.NODE_ENV !== 'production' ? socket.id : null);
  });
  
  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    safeLog.info(`Socket left room: ${roomId}`, process.env.NODE_ENV !== 'production' ? socket.id : null);
  });

  // Handle heartbeat to maintain connection
  socket.on('heartbeat', (data) => {
    socket.emit('heartbeat', { received: true, timestamp: new Date() });
  });

  // Handle poll subscription for real-time updates
  socket.on('subscribeToPoll', (pollId) => {
    socket.join(`poll_${pollId}`);
    safeLog.info(`Socket subscribed to poll updates: ${pollId}`, process.env.NODE_ENV !== 'production' ? socket.id : null);
  });

  socket.on('unsubscribeFromPoll', (pollId) => {
    socket.leave(`poll_${pollId}`);
    safeLog.info(`Socket unsubscribed from poll updates: ${pollId}`, process.env.NODE_ENV !== 'production' ? socket.id : null);
  });
  
  socket.on('disconnect', () => {
    safeLog.info('User disconnected', process.env.NODE_ENV !== 'production' ? socket.id : null);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    safeLog.error('Socket error:', error);
  });
});

connectDB().catch(err => {
  safeLog.error('Database connection failed:', err);
  process.exit(1);
});

// Initialize database watcher after database connection
mongoose.connection.once('open', () => {
  safeLog.info('MongoDB connected successfully');
  
  // Initialize database change watcher
  try {
    const dbWatcher = new DatabaseWatcher(io);
    safeLog.info('Database watcher initialized');
  } catch (error) {
    safeLog.error('Database watcher failed to initialize:', error);
  }
});

// Handle database connection errors
mongoose.connection.on('error', (err) => {
  safeLog.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  safeLog.info('MongoDB disconnected');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 Ping endpoint: http://localhost:${PORT}/ping`);
  }
}).on('error', (err) => {
  safeLog.error('Server failed to start:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  safeLog.info('Received SIGINT. Graceful shutdown initiated...');
  server.close(() => {
    safeLog.info('HTTP server closed');
    mongoose.connection.close(false, () => {
      safeLog.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGTERM', () => {
  safeLog.info('Received SIGTERM. Graceful shutdown initiated...');
  server.close(() => {
    safeLog.info('HTTP server closed');
    mongoose.connection.close(false, () => {
      safeLog.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  safeLog.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  safeLog.error('Unhandled Rejection:', { reason, promise: promise.toString() });
  process.exit(1);
});