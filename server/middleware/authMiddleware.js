const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware to ensure user is authenticated via JWT
const ensureAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Production-safe logging
    if (process.env.NODE_ENV !== 'production') {
      console.log('Auth header present:', !!authHeader);
    }
    
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }
    
    const verified = jwt.verify(token, JWT_SECRET);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Token verified, user ID:', verified.id);
    }
    
    const user = await User.findById(verified.id);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found' 
      });
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('User authenticated:', user.username);
    }
    
    req.user = { id: user._id, email: user.email, username: user.username };
    next();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Token verification error:', err.message);
    }
    res.status(401).json({ 
      error: 'Invalid token' 
    });
  }
};

module.exports = {
  ensureAuth
};
