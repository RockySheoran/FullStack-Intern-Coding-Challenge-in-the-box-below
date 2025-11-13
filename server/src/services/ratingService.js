const { pool } = require('../config/database');

class RatingService {
  async submitRating(userId, storeId, rating) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const storeExists = await client.query(
        'SELECT id FROM stores WHERE id = $1',
        [storeId]
      );

      if (storeExists.rows.length === 0) {
        throw new Error('Store not found');
      }

      const existingRating = await client.query(
        'SELECT id, rating FROM ratings WHERE user_id = $1 AND store_id = $2',
        [userId, storeId]
      );

      let result;
      if (existingRating.rows.length > 0) {
        result = await client.query(
          'UPDATE ratings SET rating = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND store_id = $3 RETURNING *',
          [rating, userId, storeId]
        );
      } else {
        result = await client.query(
          'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) RETURNING *',
          [userId, storeId, rating]
        );
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateRating(ratingId, userId, newRating) {
    const result = await pool.query(
      'UPDATE ratings SET rating = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
      [newRating, ratingId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Rating not found or access denied');
    }

    return result.rows[0];
  }

  async deleteRating(ratingId, userId) {
    const result = await pool.query(
      'DELETE FROM ratings WHERE id = $1 AND user_id = $2 RETURNING *',
      [ratingId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Rating not found or access denied');
    }

    return result.rows[0];
  }

  async getUserRating(userId, storeId) {
    const result = await pool.query(
      'SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    return result.rows[0];
  }

  async getUserRatings(userId, filters = {}) {
    let query = `
      SELECT r.id, r.rating, r.created_at, r.updated_at,
             s.id as store_id, s.name as store_name, s.address as store_address, s.average_rating as store_average_rating
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = $1
    `;
    
    const params = [userId];
    let paramCount = 1;

    if (filters.storeId) {
      paramCount++;
      query += ` AND r.store_id = $${paramCount}`;
      params.push(filters.storeId);
    }

    if (filters.minRating) {
      paramCount++;
      query += ` AND r.rating >= $${paramCount}`;
      params.push(filters.minRating);
    }

    if (filters.maxRating) {
      paramCount++;
      query += ` AND r.rating <= $${paramCount}`;
      params.push(filters.maxRating);
    }

    query += ` ORDER BY r.updated_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  async getStoreRatings(storeId, filters = {}) {
    let query = `
      SELECT r.id, r.rating, r.created_at, r.updated_at,
             u.id as user_id, u.name as user_name, u.email as user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
    `;
    
    const params = [storeId];
    let paramCount = 1;

    if (filters.minRating) {
      paramCount++;
      query += ` AND r.rating >= $${paramCount}`;
      params.push(filters.minRating);
    }

    if (filters.maxRating) {
      paramCount++;
      query += ` AND r.rating <= $${paramCount}`;
      params.push(filters.maxRating);
    }

    const sortField = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
    
    const validSortFields = ['rating', 'created_at', 'updated_at'];
    if (validSortFields.includes(sortField)) {
      query += ` ORDER BY r.${sortField} ${sortOrder}`;
    } else {
      query += ` ORDER BY r.created_at DESC`;
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  async getStoreRatingStats(storeId) {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_ratings,
        AVG(rating::DECIMAL) as average_rating,
        MIN(rating) as min_rating,
        MAX(rating) as max_rating,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star
      FROM ratings 
      WHERE store_id = $1
    `;

    const result = await pool.query(statsQuery, [storeId]);
    const stats = result.rows[0];

    return {
      total_ratings: parseInt(stats.total_ratings),
      average_rating: parseFloat(stats.average_rating) || 0,
      min_rating: parseInt(stats.min_rating) || 0,
      max_rating: parseInt(stats.max_rating) || 0,
      distribution: {
        1: parseInt(stats.one_star),
        2: parseInt(stats.two_star),
        3: parseInt(stats.three_star),
        4: parseInt(stats.four_star),
        5: parseInt(stats.five_star)
      }
    };
  }

  async getRatingStats() {
    const totalRatingsResult = await pool.query(
      'SELECT COUNT(*) as total FROM ratings'
    );
    
    const avgRatingResult = await pool.query(`
      SELECT AVG(rating::DECIMAL) as avg_rating 
      FROM ratings
    `);

    const ratingDistributionResult = await pool.query(`
      SELECT 
        rating,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ratings)), 2) as percentage
      FROM ratings 
      GROUP BY rating 
      ORDER BY rating
    `);

    const recentRatingsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM ratings 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    const topRatedStoresResult = await pool.query(`
      SELECT s.id, s.name, s.average_rating, s.total_ratings
      FROM stores s
      WHERE s.total_ratings >= 3
      ORDER BY s.average_rating DESC, s.total_ratings DESC
      LIMIT 10
    `);

    return {
      total: parseInt(totalRatingsResult.rows[0].total),
      averageRating: parseFloat(avgRatingResult.rows[0].avg_rating) || 0,
      distribution: ratingDistributionResult.rows.reduce((acc, row) => {
        acc[row.rating] = {
          count: parseInt(row.count),
          percentage: parseFloat(row.percentage)
        };
        return acc;
      }, {}),
      recent: parseInt(recentRatingsResult.rows[0].count),
      topStores: topRatedStoresResult.rows
    };
  }

  async validateRating(rating) {
    const numRating = parseInt(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    return numRating;
  }

  async getUserRatingHistory(userId, limit = 50) {
    const query = `
      SELECT r.id, r.rating, r.created_at, r.updated_at,
             s.id as store_id, s.name as store_name, s.address as store_address
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = $1
      ORDER BY r.updated_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  async getStoreOwnerRatingsSummary(storeId) {
    const ratingsQuery = `
      SELECT r.id, r.rating, r.created_at, r.updated_at,
             u.name as user_name, u.email as user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
    `;

    const ratings = await pool.query(ratingsQuery, [storeId]);
    const stats = await this.getStoreRatingStats(storeId);

    return {
      ratings: ratings.rows,
      stats
    };
  }
}

module.exports = new RatingService();