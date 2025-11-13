const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateUserCreation } = require('../middleware/validation');
const adminController = require('../controllers/adminController');

// Apply middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Admin routes - only routing and middleware
router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', validateUserCreation, adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;