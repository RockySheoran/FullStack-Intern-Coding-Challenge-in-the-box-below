const { pool } = require('../config/database');
const userService = require('../services/userService');

const adminController = {
  // Get dashboard statistics
  getDashboard: async (req, res) => {
    try {
      const userStats = await userService.getUserStats();
      
      const storeStatsResult = await pool.query(
        'SELECT COUNT(*) as total FROM stores'
      );
      
      const ratingStatsResult = await pool.query(
        'SELECT COUNT(*) as total FROM ratings'
      );

      const recentRatingsResult = await pool.query(`
        SELECT COUNT(*) as count 
        FROM ratings 
        WHERE created_at >= NOW() - INTERVAL '30 days'
      `);

      const topRatedStoresResult = await pool.query(`
        SELECT name, average_rating, total_ratings
        FROM stores 
        WHERE total_ratings > 0
        ORDER BY average_rating DESC, total_ratings DESC
        LIMIT 5
      `);

      res.json({
        success: true,
        data: {
          users: userStats,
          stores: {
            total: parseInt(storeStatsResult.rows[0].total)
          },
          ratings: {
            total: parseInt(ratingStatsResult.rows[0].total),
            recent: parseInt(recentRatingsResult.rows[0].count)
          },
          topStores: topRatedStoresResult.rows
        }
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching dashboard data'
      });
    }
  },

  // Get all users with filtering
  getUsers: async (req, res) => {
    try {
      const { name, email, address, role, sortBy, sortOrder, search } = req.query;
      
      let users;
      
      if (search) {
        users = await userService.searchUsers(search);
      } else {
        const filters = { name, email, address, role };
        const sort = { field: sortBy, order: sortOrder };
        users = await userService.getAllUsers(filters, sort);
      }

      res.json({
        success: true,
        data: {
          users,
          total: users.length
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching users'
      });
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      let additionalData = {};
      
      if (user.role === 'store_owner' && user.store_id) {
        const ratingsResult = await pool.query(`
          SELECT r.rating, r.created_at, u.name as user_name, u.email as user_email
          FROM ratings r
          JOIN users u ON r.user_id = u.id
          WHERE r.store_id = $1
          ORDER BY r.created_at DESC
        `, [user.store_id]);
        
        additionalData.storeRatings = ratingsResult.rows;
      }

      if (user.role === 'user') {
        const userRatingsResult = await pool.query(`
          SELECT r.rating, r.created_at, s.name as store_name, s.address as store_address
          FROM ratings r
          JOIN stores s ON r.store_id = s.id
          WHERE r.user_id = $1
          ORDER BY r.created_at DESC
        `, [user.id]);
        
        additionalData.userRatings = userRatingsResult.rows;
      }

      res.json({
        success: true,
        data: {
          user,
          ...additionalData
        }
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching user details'
      });
    }
  },

  // Create new user
  createUser: async (req, res) => {
    try {
      const { name, email, password, address, role, store_id } = req.body;

      if (role === 'store_owner' && store_id) {
        const storeResult = await pool.query(
          'SELECT id FROM stores WHERE id = $1',
          [store_id]
        );

        if (storeResult.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Invalid store ID'
          });
        }

        const existingOwnerResult = await pool.query(
          'SELECT id FROM users WHERE store_id = $1 AND role = $2',
          [store_id, 'store_owner']
        );

        if (existingOwnerResult.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Store already has an owner'
          });
        }
      }

      const user = await userService.createUser({
        name, email, password, address, role, store_id
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Create user error:', error);
      
      if (error.message === 'User with this email already exists') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while creating user'
      });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, address, role, store_id } = req.body;

      const existingUser = await userService.getUserById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (role === 'store_owner' && store_id) {
        const storeResult = await pool.query(
          'SELECT id FROM stores WHERE id = $1',
          [store_id]
        );

        if (storeResult.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Invalid store ID'
          });
        }

        const existingOwnerResult = await pool.query(
          'SELECT id FROM users WHERE store_id = $1 AND role = $2 AND id != $3',
          [store_id, 'store_owner', id]
        );

        if (existingOwnerResult.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Store already has an owner'
          });
        }
      }

      const updatedUser = await userService.updateUser(id, {
        name, email, address, role, store_id
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      console.error('Update user error:', error);
      
      if (error.message === 'User with this email already exists') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while updating user'
      });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      const deleted = await userService.deleteUser(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting user'
      });
    }
  }
};

module.exports = adminController;