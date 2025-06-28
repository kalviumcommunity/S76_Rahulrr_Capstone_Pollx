const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRY = '7d'; // Token expires in 7 days instead of 24 hours

// Production-safe logging utility
const safeLog = {
  info: (message, data = null) => {
    if (process.env.NODE_ENV === 'production') {
      console.log(`[AUTH] ${message}`);
    } else {
      console.log(`[AUTH] ${message}`, data || '');
    }
  },
  error: (message, error = null) => {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[AUTH ERROR] ${message}`, error?.message || '');
    } else {
      console.error(`[AUTH ERROR] ${message}`, error || '');
    }
  }
};

const signupSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const signup = async (req, res) => {
    try {
        const { error } = signupSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
        
        safeLog.info('User registered successfully', process.env.NODE_ENV !== 'production' ? user.email : 'Email hidden');
        
        // Return user data with token
        const userData = {
            id: user._id,
            username: user.username,
            email: user.email
        };
        
        res.json({ token, user: userData });
    } catch (err) {
        safeLog.error('Signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
        
        safeLog.info('User logged in successfully', process.env.NODE_ENV !== 'production' ? user.email : 'Email hidden');
        
        // Return user data with token
        const userData = {
            id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture
        };
        
        res.json({ token, user: userData });
    } catch (err) {
        safeLog.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Handle Google authentication success
const googleAuthSuccess = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        
        const user = req.user;
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
        
        safeLog.info('Google auth successful', process.env.NODE_ENV !== 'production' ? user.email : 'Email hidden');
        
        // User data to return
        const userData = {
            id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture
        };
        
        // Redirect to frontend with token (avoid logging the full URL with token)
        const frontendURL = process.env.NODE_ENV === 'production' 
            ? 'https://pollx.netlify.app'
            : 'http://localhost:5173';
        
        safeLog.info('Redirecting to frontend after Google auth');
        res.redirect(`${frontendURL}/auth-success?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
    } catch (err) {
        safeLog.error('Google auth error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Handle Google authentication failure
const googleAuthFailure = (req, res) => {
    const frontendURL = process.env.NODE_ENV === 'production' 
        ? 'https://pollx.netlify.app'
        : 'http://localhost:5173';
    res.redirect(`${frontendURL}/login?error=google_auth_failed`);
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        safeLog.info('Access denied - no token provided');
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        safeLog.info('Token verified successfully');
        next();
    } catch (err) {
        safeLog.error('Invalid token provided:', err);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        safeLog.error('Get current user error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    signup,
    login,
    googleAuthSuccess,
    googleAuthFailure,
    verifyToken,
    getCurrentUser
};
