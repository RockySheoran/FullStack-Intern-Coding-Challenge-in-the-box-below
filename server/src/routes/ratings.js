const express = require('express');
const router = express.Router();
const { authenticateToken, requireUser, requireStoreOwner, requireUserOrAdmin, requireStoreOwnerOrAdmin } = require('../middleware/auth');
const { validateRating } = require('../middleware/validation');
const ratingController = require('../controllers/ratingController');

// Rating routes - only routing and middleware
router.post('/', authenticateToken, requireUser, validateRating, ratingController.submitRating);
router.put('/:id', authenticateToken, requireUser, ratingController.updateRating);
router.delete('/:id', authenticateToken, requireUser, ratingController.deleteRating);
router.get('/user/:userId', authenticateToken, ratingController.getUserRatings);
router.get('/store/:storeId', authenticateToken, requireStoreOwnerOrAdmin, ratingController.getStoreRatings);
router.get('/user/:userId/store/:storeId', authenticateToken, ratingController.getUserRating);
router.get('/my-ratings', authenticateToken, requireUser, ratingController.getMyRatings);
router.get('/my-store/summary', authenticateToken, requireStoreOwner, ratingController.getStoreOwnerSummary);
router.get('/stats', authenticateToken, requireUserOrAdmin, ratingController.getRatingStats);

module.exports = router;