const { pool } = require('../config/database');
const storeService = require('../services/storeService');

const storeController = {
  // Get all stores
  getStores: async (req, res) => {
    try {
      const { name, address, minRating, sortBy, sortOrder, search, hasUserRating } = req.query;
      const userId = req.user.role === 'user' ? req.user.id : null;
      
      let stores;
      
      if (search) {
        stores = await storeService.searchStores(search, userId);
      } else if (req.user.role === 'user') {
        const filters = { name, address, minRating, hasUserRating };
        stores = await storeService.getStoresForUser(userId, filters);
      } else {
        const filters = { name, address, minRating };
        const sort = { field: sortBy, order: sortOrder };
        stores = await storeService.getAllStores(filters, sort);
      }

      res.json({
        success: true,
        data: {
          stores,
          total: stores.length
        }
      });
    } catch (error) {
      console.error('Get stores error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching stores'
      });
    }
  },

  // Get store by ID
  getStoreById: async (req, res) => {
    try {
      const { id } = req.params;
      const store = await storeService.getStoreById(id);

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }

      let additionalData = {};

      if (req.user.role === 'user') {
        const userRatingResult = await pool.query(
          'SELECT rating, created_at FROM ratings WHERE user_id = $1 AND store_id = $2',
          [req.user.id, id]
        );
        
        additionalData.userRating = userRatingResult.rows[0] || null;
      }

      if (req.user.role === 'admin' || (req.user.role === 'store_owner' && req.user.store_id == id)) {
        const ratings = await storeService.getStoreRatings(id);
        additionalData.ratings = ratings;
      }

      res.json({
        success: true,
        data: {
          store,
          ...additionalData
        }
      });
    } catch (error) {
      console.error('Get store by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching store details'
      });
    }
  },

  // Create new store
  createStore: async (req, res) => {
    try {
      const { name, email, address } = req.body;

      // Check if store owner already has a store
      if (req.user.role === 'store_owner' && req.user.store_id) {
        return res.status(400).json({
          success: false,
          message: 'You already have a store associated with your account'
        });
      }

      const store = await storeService.createStore({
        name, email, address
      });

      // If the creator is a store owner, associate them with the store
      if (req.user.role === 'store_owner') {
        await pool.query(
          'UPDATE users SET store_id = $1 WHERE id = $2',
          [store.id, req.user.id]
        );
      }

      res.status(201).json({
        success: true,
        message: 'Store created successfully',
        data: { store }
      });
    } catch (error) {
      console.error('Create store error:', error);
      
      if (error.message === 'Store with this email already exists') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while creating store'
      });
    }
  },

  // Update store
  updateStore: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, address } = req.body;

      const existingStore = await storeService.getStoreById(id);
      if (!existingStore) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }

      const updatedStore = await storeService.updateStore(id, {
        name, email, address
      });

      res.json({
        success: true,
        message: 'Store updated successfully',
        data: { store: updatedStore }
      });
    } catch (error) {
      console.error('Update store error:', error);
      
      if (error.message === 'Store with this email already exists') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while updating store'
      });
    }
  },

  // Delete store
  deleteStore: async (req, res) => {
    try {
      const { id } = req.params;

      const deleted = await storeService.deleteStore(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }

      res.json({
        success: true,
        message: 'Store deleted successfully'
      });
    } catch (error) {
      console.error('Delete store error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting store'
      });
    }
  },

  // Get store ratings
  getStoreRatings: async (req, res) => {
    try {
      const { id } = req.params;
      
      const store = await storeService.getStoreById(id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }

      if (req.user.role === 'store_owner' && req.user.store_id != id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - you can only view ratings for your own store'
        });
      }

      const ratings = await storeService.getStoreRatings(id);

      res.json({
        success: true,
        data: {
          store: {
            id: store.id,
            name: store.name,
            average_rating: store.average_rating,
            total_ratings: store.total_ratings
          },
          ratings
        }
      });
    } catch (error) {
      console.error('Get store ratings error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching store ratings'
      });
    }
  }
};

module.exports = storeController;