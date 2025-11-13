const ratingService = require('../services/ratingService');

const ratingController = {
  // Submit new rating
  submitRating: async (req, res) => {
    try {
      const { store_id, rating } = req.body;
      const userId = req.user.id;

      const validatedRating = await ratingService.validateRating(rating);
      const result = await ratingService.submitRating(userId, store_id, validatedRating);

      res.status(201).json({
        success: true,
        message: 'Rating submitted successfully',
        data: { rating: result }
      });
    } catch (error) {
      console.error('Submit rating error:', error);
      
      if (error.message === 'Store not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message === 'Rating must be between 1 and 5') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while submitting rating'
      });
    }
  },

  // Update rating
  updateRating: async (req, res) => {
    try {
      const { id } = req.params;
      const { rating } = req.body;
      const userId = req.user.id;

      const validatedRating = await ratingService.validateRating(rating);
      const result = await ratingService.updateRating(id, userId, validatedRating);

      res.json({
        success: true,
        message: 'Rating updated successfully',
        data: { rating: result }
      });
    } catch (error) {
      console.error('Update rating error:', error);
      
      if (error.message === 'Rating not found or access denied') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message === 'Rating must be between 1 and 5') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while updating rating'
      });
    }
  },

  // Delete rating
  deleteRating: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await ratingService.deleteRating(id, userId);

      res.json({
        success: true,
        message: 'Rating deleted successfully'
      });
    } catch (error) {
      console.error('Delete rating error:', error);
      
      if (error.message === 'Rating not found or access denied') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting rating'
      });
    }
  },

  // Get user ratings
  getUserRatings: async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (req.user.role !== 'admin' && req.user.id != userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - you can only view your own ratings'
        });
      }

      const { storeId, minRating, maxRating } = req.query;
      const filters = { storeId, minRating, maxRating };
      
      const ratings = await ratingService.getUserRatings(userId, filters);

      res.json({
        success: true,
        data: {
          ratings,
          total: ratings.length
        }
      });
    } catch (error) {
      console.error('Get user ratings error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching user ratings'
      });
    }
  },

  // Get store ratings
  getStoreRatings: async (req, res) => {
    try {
      const { storeId } = req.params;
      
      if (req.user.role === 'store_owner' && req.user.store_id != storeId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - you can only view ratings for your own store'
        });
      }

      const { minRating, maxRating, sortBy, sortOrder } = req.query;
      const filters = { minRating, maxRating, sortBy, sortOrder };
      
      const ratings = await ratingService.getStoreRatings(storeId, filters);
      const stats = await ratingService.getStoreRatingStats(storeId);

      res.json({
        success: true,
        data: {
          ratings,
          stats,
          total: ratings.length
        }
      });
    } catch (error) {
      console.error('Get store ratings error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching store ratings'
      });
    }
  },

  // Get my ratings
  getMyRatings: async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit } = req.query;
      
      const ratings = await ratingService.getUserRatingHistory(userId, limit ? parseInt(limit) : 50);

      res.json({
        success: true,
        data: {
          ratings,
          total: ratings.length
        }
      });
    } catch (error) {
      console.error('Get my ratings error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching your ratings'
      });
    }
  },

  // Get store owner summary
  getStoreOwnerSummary: async (req, res) => {
    try {
      const storeId = req.user.store_id;
      
      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'No store associated with your account'
        });
      }

      const summary = await ratingService.getStoreOwnerRatingsSummary(storeId);

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Get store owner summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching store summary'
      });
    }
  },

  // Get rating statistics
  getRatingStats: async (req, res) => {
    try {
      const stats = await ratingService.getRatingStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get rating stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching rating statistics'
      });
    }
  },

  // Get user rating for specific store
  getUserRating: async (req, res) => {
    try {
      const { userId, storeId } = req.params;
      
      if (req.user.role !== 'admin' && req.user.id != userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - you can only view your own ratings'
        });
      }

      const rating = await ratingService.getUserRating(userId, storeId);

      if (!rating) {
        return res.status(404).json({
          success: false,
          message: 'Rating not found'
        });
      }

      res.json({
        success: true,
        data: { rating }
      });
    } catch (error) {
      console.error('Get user store rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching rating'
      });
    }
  }
};

module.exports = ratingController;