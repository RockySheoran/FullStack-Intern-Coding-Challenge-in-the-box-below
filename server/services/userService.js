const { pool } = require('../config/database');
const { hashPassword } = require('../middleware/auth');

class UserService {
  async getAllUsers(filters = {}, sort = {}) {
    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.store_id, u.created_at,
             s.name as store_name, s.average_rating as store_rating
      FROM users u
      LEFT JOIN stores s ON u.store_id = s.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (filters.name) {
      paramCount++;
      query += ` AND u.name ILIKE $${paramCount}`;
      params.push(`%${filters.name}%`);
    }

    if (filters.email) {
      paramCount++;
      query += ` AND u.email ILIKE $${paramCount}`;
      params.push(`%${filters.email}%`);
    }

    if (filters.address) {
      paramCount++;
      query += ` AND u.address ILIKE $${paramCount}`;
      params.push(`%${filters.address}%`);
    }

    if (filters.role) {
      paramCount++;
      query += ` AND u.role = $${paramCount}`;
      params.push(filters.role);
    }

    const sortField = sort.field || 'created_at';
    const sortOrder = sort.order === 'desc' ? 'DESC' : 'ASC';
    
    const validSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    if (validSortFields.includes(sortField)) {
      query += ` ORDER BY u.${sortField} ${sortOrder}`;
    } else {
      query += ` ORDER BY u.created_at DESC`;
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  async getUserById(id) {
    const query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.store_id, u.created_at,
             s.name as store_name, s.average_rating as store_rating
      FROM users u
      LEFT JOIN stores s ON u.store_id = s.id
      WHERE u.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async createUser(userData) {
    const { name, email, password, address, role, store_id } = userData;
    
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await hashPassword(password);

    const query = `
      INSERT INTO users (name, email, password, address, role, store_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, address, role, store_id, created_at
    `;

    const result = await pool.query(query, [
      name, email, hashedPassword, address, role, store_id || null
    ]);

    return result.rows[0];
  }

  async updateUser(id, userData) {
    const { name, email, address, role, store_id } = userData;
    
    if (email) {
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
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

    if (role) {
      paramCount++;
      fields.push(`role = $${paramCount}`);
      params.push(role);
    }

    if (store_id !== undefined) {
      paramCount++;
      fields.push(`store_id = $${paramCount}`);
      params.push(store_id);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    paramCount++;
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `
      UPDATE users SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, address, role, store_id, updated_at
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  async deleteUser(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rows.length > 0;
  }

  async getUserStats() {
    const totalUsersResult = await pool.query(
      'SELECT COUNT(*) as total FROM users'
    );
    
    const usersByRoleResult = await pool.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);

    const recentUsersResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    return {
      total: parseInt(totalUsersResult.rows[0].total),
      byRole: usersByRoleResult.rows.reduce((acc, row) => {
        acc[row.role] = parseInt(row.count);
        return acc;
      }, {}),
      recentSignups: parseInt(recentUsersResult.rows[0].count)
    };
  }

  async searchUsers(searchTerm) {
    const query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.store_id, u.created_at,
             s.name as store_name, s.average_rating as store_rating
      FROM users u
      LEFT JOIN stores s ON u.store_id = s.id
      WHERE u.name ILIKE $1 OR u.email ILIKE $1 OR u.address ILIKE $1
      ORDER BY u.name ASC
    `;

    const result = await pool.query(query, [`%${searchTerm}%`]);
    return result.rows;
  }
}

module.exports = new UserService();