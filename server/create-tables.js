const { pool } = require('./config/database');

const createTables = async () => {
  try {
    console.log('Creating database tables...');

    // Create ENUM type for user roles
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('admin', 'user', 'store_owner');
      EXCEPTION
        WHEN duplicate_object THEN 
          RAISE NOTICE 'user_role type already exists, skipping';
      END $$;
    `);
    console.log('✅ User role enum created/verified');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL CHECK (LENGTH(name) >= 20 AND LENGTH(name) <= 60),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL CHECK (LENGTH(address) <= 400),
        role user_role NOT NULL DEFAULT 'user',
        store_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Create stores table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL CHECK (LENGTH(address) <= 400),
        average_rating DECIMAL(2,1) DEFAULT 0.0 CHECK (average_rating >= 0 AND average_rating <= 5),
        total_ratings INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Stores table created');

    // Create ratings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        store_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, store_id)
      );
    `);
    console.log('✅ Ratings table created');

    // Add foreign key constraints (ignore if they already exist)
    try {
      await pool.query(`
        ALTER TABLE users ADD CONSTRAINT fk_users_store 
        FOREIGN KEY (store_id) REFERENCES stores(id);
      `);
      console.log('✅ Users-Stores foreign key added');
    } catch (e) {
      console.log('ℹ️ Users-Stores foreign key already exists');
    }

    try {
      await pool.query(`
        ALTER TABLE ratings ADD CONSTRAINT fk_ratings_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      `);
      console.log('✅ Ratings-Users foreign key added');
    } catch (e) {
      console.log('ℹ️ Ratings-Users foreign key already exists');
    }

    try {
      await pool.query(`
        ALTER TABLE ratings ADD CONSTRAINT fk_ratings_store 
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
      `);
      console.log('✅ Ratings-Stores foreign key added');
    } catch (e) {
      console.log('ℹ️ Ratings-Stores foreign key already exists');
    }

    // Create indexes for better performance
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON ratings(store_id);`);
    console.log('✅ Indexes created');

    // Insert a test admin user
    const adminExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@storerating.com']
    );

    if (adminExists.rows.length === 0) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('AdminPass123!', 10);
      
      await pool.query(`
        INSERT INTO users (name, email, password, address, role) 
        VALUES ($1, $2, $3, $4, $5)
      `, [
        'System Administrator User',
        'admin@storerating.com',
        hashedPassword,
        '123 Admin Street, Admin City, AC 12345',
        'admin'
      ]);
      console.log('✅ Admin user created (email: admin@storerating.com, password: AdminPass123!)');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('📝 You can now test registration and login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
};

createTables();