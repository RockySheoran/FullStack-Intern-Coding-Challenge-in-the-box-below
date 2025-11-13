const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  validateRegistration, 
  validateLogin, 
  validatePasswordUpdate 
} = require('../middleware/validation');
const authController = require('../controllers/authController');

// Authentication routes - only routing and middleware
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.put('/password', authenticateToken, validatePasswordUpdate, authController.updatePassword);
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;