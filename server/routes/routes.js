const express = require('express');
const passport = require('passport');
const router = express.Router();

const authController = require('../controllers/auth');

// Traditional authentication routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/auth/google/failure',
        session: false 
    }),
    authController.googleAuthSuccess
);

router.get('/google/failure', authController.googleAuthFailure);

// Protected route to get current user
router.get('/me', authController.verifyToken, authController.getCurrentUser);

// Route to verify token validity
router.get('/verify-token', authController.verifyToken, (req, res) => {
  res.status(200).json({ valid: true });
});

module.exports = router;