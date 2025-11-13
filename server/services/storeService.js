const { pool } = require('../config/database');

class StoreService {
  async getAllStores(filters = {}, sort = {}) {
    let query = `
      SELECT s.id, s.name, s.email, s.address, s.average_rating, s.total_ratings, s.created_at,
             u.name as owner_name, u.email as owner_email
      FROM stores s
      LEFT JOIN users u ON s.id = u.store_id AND u.role = 'store_owner'
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (filters.name) {
      paramCount++;
      query += ` AND s.name ILIKE $${paramCount}`;
      params.push(`%${filters.name}%`);
    }

    if (filters.email) {
      paramCount++;
      query += ` AND s.email ILIKE $${paramCount}`;
      params.push(`%${filters.email}%`);
    }

    if (filters.address) {
      paramCount++;
      query += ` AND s.address ILIKE $${paramCount}`;
      params.push(`%${filters.address}%`);
    }

    if (filters.minRating) {
      paramCount++;
      query += ` AND s.average_rating >= $${paramCount}`;
      params.push(filters.minRating);
    }

    const sortField = sort.field || 'created_at';
    const sortOrder = sort.order === 'desc' ? 'DESC' : 'ASC';
    
    const validSortFields = ['name', 'email', 'address', 'average_rating', 'total_ratings', 'created_at'];
    if (validSortFields.includes(sortField)) {
      query += ` ORDER BY s.${sortField} ${sortOrder}`;
    } else {
      query += ` ORDER BY s.created_at DESC`;
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  async getStoreById(id) {
    const query = `
      SELECT s.id, s.name, s.email, s.address, s.average_rating, s.total_ratings, s.created_at,
             u.id as owner_id, u.name as owner_name, u.email as owner_email
      FROM stores s
      LEFT JOIN users u ON s.id = u.store_id AND u.role = 'store_owner'
      WHERE s.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async createStore(storeData) {
    const { name, email, address } = storeData;
    
    const existingStore = await pool.query(
      'SELECT id FROM stores WHERE email = $1',
      [email]
    );

    if (existingStore.rows.length > 0) {
      throw new Error('Store with this email already exists');
    }

    const query = `
      INSERT INTO stores (name, email, address)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, address, average_rating, total_ratings, created_at
    `;

    const result = await pool.query(query, [name, email, address]);
    return result.rows[0];
  }

  async updateStore(id, storeData) {
    const { name, email, address } = storeData;
    
    if (email) {
      const existingStore = await pool.query(
        'SELECT id FROM stores WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (existingStore.rows.length > 0) {
        throw new Error('Store with this email already exists');
      }
    }

    const fields = [];
    const params = [];
    let paramCount = 0;

    if (name) {
      paramCount++;
      fields.push(`name = $${paramCount}`);
      params.push(name);
    }

    if (email) {
      paramCount++;
      fields.push(`email = $${paramCount}`);
      params.push(email);
    }

    if (address) {
      paramCount++;
      fields.push(`address = $${paramCount}`);
      params.push(address);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    paramCount++;
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `
      UPDATE stores SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, address, average_rating, total_ratings, updated_at
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  async deleteStore(id) {
    const result = await pool.query(
      'DELETE FROM stores WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rows.length > 0;
  }

  async searchStores(searchTerm, userId = null) {
    let query = `
      SELECT s.id, s.name, s.email, s.address, s.average_rating, s.total_ratings, s.created_at
    `;

    if (userId) {
      query += `, r.rating as user_rating`;
    }

    query += `
      FROM stores s
    `;

    if (userId) {
      query += `
        LEFT JOIN ratings r ON s.id = r.store_id AND r.user_id = $2
      `;
    }

    query += `
      WHERE s.name ILIKE $1 OR s.address ILIKE $1
      ORDER BY s.average_rating DESC, s.total_ratings DESC, s.name ASC
    `;

    const params = [`%${searchTerm}%`];
    if (userId) {
      params.push(userId);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  async getStoresForUser(userId, filters = {}) {
    let query = `
      SELECT s.id, s.name, s.email, s.address, s.average_rating, s.total_ratings, s.created_at,
             r.rating as user_rating, r.created_at as rating_date
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id AND r.user_id = $1
      WHERE 1=1
    `;
    
    const params = [userId];
    let paramCount = 1;

    if (filters.name) {
      paramCount++;
      query += ` AND s.name ILIKE $${paramCount}`;
      params.push(`%${filters.name}%`);
    }

    if (filters.address) {
      paramCount++;
      query += ` AND s.address ILIKE $${paramCount}`;
      params.push(`%${filters.address}%`);
    }

    if (filters.minRating) {
      paramCount++;
      query += ` AND s.average_rating >= $${paramCount}`;
      params.push(filters.minRating);
    }

    if (filters.hasUserRating !== undefined) {
      if (filters.hasUserRating) {
        query += ` AND r.rating IS NOT NULL`;
      } else {
        query += ` AND r.rating IS NULL`;
      }
    }

    query += ` ORDER BY s.average_rating DESC, s.total_ratings DESC, s.name ASC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  async getStoreRatings(storeId) {
    const query = `
      SELECT r.id, r.rating, r.created_at, r.updated_at,
             u.id as user_id, u.name as user_name, u.email as user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query, [storeId]);
    return result.rows;
  }

  async getStoreStats() {
    const totalStoresResult = await pool.query(
      'SELECT COUNT(*) as total FROM stores'
    );
    
    const avgRatingResult = await pool.query(`
      SELECT AVG(average_rating) as avg_rating 
      FROM stores 
      WHERE total_ratings > 0
    `);

    const topRatedResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM stores 
      WHERE average_rating >= 4.0 AND total_ratings > 0
    `);

    const recentStoresResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM stores 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    return {
      total: parseInt(totalStoresResult.rows[0].total),
      averageRating: parseFloat(avgRatingResult.rows[0].avg_rating) || 0,
      highlyRated: parseInt(topRatedResult.rows[0].count),
      recentlyAdded: parseInt(recentStoresResult.rows[0].count)
    };
  }

  async getStoresByOwner(ownerId) {
    const query = `
      SELECT s.id, s.name, s.email, s.address, s.average_rating, s.total_ratings, s.created_at
      FROM stores s
      JOIN users u ON s.id = u.store_id
      WHERE u.id = $1 AND u.role = 'store_owner'
    `;

    const result = await pool.query(query, [ownerId]);
    return result.rows;
  }
}

module.exports = new StoreService();