const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requireUserOrAdmin, requireStoreOwnerOrAdmin } = require('../middleware/auth');
const { validateStoreCreation } = require('../middleware/validation');
const storeController = require('../controllers/storeController');

// Store routes - only routing and middleware
router.get('/', authenticateToken, storeController.getStores);
router.get('/:id', authenticateToken, storeController.getStoreById);
router.post('/', authenticateToken, requireStoreOwnerOrAdmin, validateStoreCreation, storeController.createStore);
router.put('/:id', authenticateToken, requireAdmin, storeController.updateStore);
router.delete('/:id', authenticateToken, requireAdmin, storeController.deleteStore);
router.get('/:id/ratings', authenticateToken, requireUserOrAdmin, storeController.getStoreRatings);

module.exports = router;