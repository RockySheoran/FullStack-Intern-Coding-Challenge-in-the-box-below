const { Pool } = require('pg');
require('dotenv').config();

const setupDatabase = async () => {
  // Try different common passwords
  const passwords = [
    process.env.DB_PASSWORD,
  ];

  let defaultPool = null;
  let workingPassword = null;

  console.log('Trying to connect to PostgreSQL...');
  
  // Try each password until one works
  for (const pwd of passwords) {
    try {
      console.log(`Trying password: ${pwd ? '***' : '(empty)'}`);
      defaultPool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: pwd,
      });
      
      // Test the connection
      await defaultPool.query('SELECT 1');
      workingPassword = pwd;
      console.log('✅ Connection successful!');
      break;
    } catch (error) {
      console.log(`❌ Failed with this password`);
      if (defaultPool) {
        await defaultPool.end();
        defaultPool = null;
      }
    }
  }

  if (!defaultPool || workingPassword === null) {
    console.error('❌ Could not connect with any common passwords.');
    console.error('Please check your PostgreSQL installation and password.');
    process.exit(1);
  }

  try {
    
    // Check if database exists
    const dbCheck = await defaultPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'store_rating_db']
    );

    if (dbCheck.rows.length === 0) {
      console.log('Creating database...');
      await defaultPool.query(`CREATE DATABASE ${process.env.DB_NAME || 'store_rating_db'}`);
      console.log('Database created successfully!');
    } else {
      console.log('Database already exists.');
    }

    await defaultPool.end();

    // Now connect to our database to create tables
    const appPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'store_rating_db',
      user: process.env.DB_USER || 'postgres',
      password: workingPassword,
    });

    console.log(`✅ Using password for database operations: ${workingPassword ? '***' : '(empty)'}`);
    
    // Update .env file with working password
    if (workingPassword !== process.env.DB_PASSWORD) {
      console.log('💡 Consider updating your .env file with the working password');
    }

    console.log('Setting up tables...');

    // Create ENUM type
    await appPool.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('admin', 'user', 'store_owner');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create users table
    await appPool.query(`
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

    // Create stores table
    await appPool.query(`
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

    // Create ratings table
    await appPool.query(`
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

    // Add foreign key constraints (if they don't exist)
    try {
      await appPool.query(`
        ALTER TABLE users ADD CONSTRAINT fk_users_store 
        FOREIGN KEY (store_id) REFERENCES stores(id);
      `);
    } catch (e) {
      // Constraint might already exist
    }

    try {
      await appPool.query(`
        ALTER TABLE ratings ADD CONSTRAINT fk_ratings_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      `);
    } catch (e) {
      // Constraint might already exist
    }

    try {
      await appPool.query(`
        ALTER TABLE ratings ADD CONSTRAINT fk_ratings_store 
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
      `);
    } catch (e) {
      // Constraint might already exist
    }

    // Create indexes
    await appPool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await appPool.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`);
    await appPool.query(`CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);`);
    await appPool.query(`CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);`);
    await appPool.query(`CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON ratings(store_id);`);

    console.log('Database setup completed successfully!');
    await appPool.end();

  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
};

setupDatabase();