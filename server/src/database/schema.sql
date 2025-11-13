-- Create database
CREATE DATABASE store_rating_db;

-- Use the database
\c store_rating_db;

-- Create ENUM for user roles
CREATE TYPE user_role AS ENUM ('admin', 'user', 'store_owner');

-- Create users table
CREATE TABLE users (
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

-- Create stores table
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL CHECK (LENGTH(address) <= 400),
    average_rating DECIMAL(2,1) DEFAULT 0.0 CHECK (average_rating >= 0 AND average_rating <= 5),
    total_ratings INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ratings table
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    store_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, store_id)
);

-- Add foreign key constraints
ALTER TABLE users ADD CONSTRAINT fk_users_store FOREIGN KEY (store_id) REFERENCES stores(id);
ALTER TABLE ratings ADD CONSTRAINT fk_ratings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ratings ADD CONSTRAINT fk_ratings_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_store_id ON ratings(store_id);
CREATE INDEX idx_ratings_user_store ON ratings(user_id, store_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update store average rating
CREATE OR REPLACE FUNCTION update_store_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE stores 
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating::DECIMAL), 0) 
            FROM ratings 
            WHERE store_id = COALESCE(NEW.store_id, OLD.store_id)
        ),
        total_ratings = (
            SELECT COUNT(*) 
            FROM ratings 
            WHERE store_id = COALESCE(NEW.store_id, OLD.store_id)
        )
    WHERE id = COALESCE(NEW.store_id, OLD.store_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers for rating updates
CREATE TRIGGER update_store_rating_on_insert AFTER INSERT ON ratings FOR EACH ROW EXECUTE FUNCTION update_store_rating();
CREATE TRIGGER update_store_rating_on_update AFTER UPDATE ON ratings FOR EACH ROW EXECUTE FUNCTION update_store_rating();
CREATE TRIGGER update_store_rating_on_delete AFTER DELETE ON ratings FOR EACH ROW EXECUTE FUNCTION update_store_rating();