const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

// Ensure environment variables are loaded
require('dotenv').config({ path: '../.env' });

const generateToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined in environment variables');
    throw new Error('JWT configuration error');
  }
  
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      store_id: user.store_id 
    },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

const hashPassword = async (password) => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
  return await bcrypt.hash(password, rounds);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }
    
    const decoded = jwt.verify(token, jwtSecret);
    
    const result = await pool.query(
      'SELECT id, email, role, store_id FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

const requireAdmin = requireRole(['admin']);
const requireUser = requireRole(['user']);
const requireStoreOwner = requireRole(['store_owner']);
const requireUserOrAdmin = requireRole(['user', 'admin']);
const requireStoreOwnerOrAdmin = requireRole(['store_owner', 'admin']);

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  authenticateToken,
  requireRole,
  requireAdmin,
  requireUser,
  requireStoreOwner,
  requireUserOrAdmin,
  requireStoreOwnerOrAdmin
};