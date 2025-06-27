const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware to ensure user is authenticated via JWT
const ensureAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);
    
    const token = authHeader?.split(' ')[1];
    console.log('Extracted token:', token ? token.substring(0, 20) + '...' : 'None');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }
    
    const verified = jwt.verify(token, JWT_SECRET);
    console.log('Token verified, user ID:', verified.id);
    
    const user = await User.findById(verified.id);
    
    if (!user) {
      console.log('User not found for ID:', verified.id);
      return res.status(401).json({ 
        error: 'User not found' 
      });
    }
    
    console.log('User authenticated:', user.username);
    req.user = { id: user._id, email: user.email, username: user.username };
    next();
  } catch (err) {
    console.log('Token verification error:', err.message);
    res.status(401).json({ 
      error: 'Invalid token' 
    });
  }
};

module.exports = {
  ensureAuth
};
