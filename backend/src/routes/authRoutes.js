const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateRegistration, validatePasswordChange } = require('../middlewares/validator');

// Normal User Registration
router.post('/register', validateRegistration, authController.register);

// Unified Login for all roles
router.post('/login', authController.login);

// Update Password
router.put('/change-password', authMiddleware, validatePasswordChange, authController.changePassword);

// Get current profile
router.get('/me', authMiddleware, authController.getProfile);

module.exports = router;
