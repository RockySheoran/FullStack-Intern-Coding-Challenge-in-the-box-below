const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { testConnection } = require('./src/config/database');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const storeRoutes = require('./src/routes/stores');
const ratingRoutes = require('./src/routes/ratings');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Store Rating System API is running',
    timestamp: new Date().toISOString()
  });
});

const startServer = async () => {
  try {
    console.log('Testing database connection...');
    await testConnection();
    console.log('Database connected successfully');
  } catch (error) {
    console.warn('Database connection failed, but server will continue:', error.message);
  }
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API available at: http://localhost:${PORT}/api`);
  });
};

startServer();

module.exports = app;