-- Insert sample data for testing

-- Insert admin user (password: AdminPass123!)
INSERT INTO users (name, email, password, address, role) VALUES 
('System Administrator User', 'admin@storerating.com', '$2b$10$rQZ8kqVZ8kqVZ8kqVZ8kqO8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8', '123 Admin Street, Admin City, AC 12345', 'admin');

-- Insert sample stores
INSERT INTO stores (name, email, address) VALUES 
('Tech Electronics Store', 'contact@techelectronics.com', '456 Technology Avenue, Tech City, TC 67890'),
('Fashion Boutique Central', 'info@fashionboutique.com', '789 Fashion Street, Style City, SC 11111'),
('Grocery Mart Express', 'support@grocerymart.com', '321 Market Road, Food Town, FT 22222'),
('Book Haven Library Store', 'hello@bookhaven.com', '654 Literature Lane, Book City, BC 33333'),
('Sports Equipment Plus', 'sales@sportsequipment.com', '987 Athletic Avenue, Sport Town, ST 44444');

-- Insert store owners (password: StorePass123!)
INSERT INTO users (name, email, password, address, role, store_id) VALUES 
('Tech Store Owner Manager', 'owner1@techelectronics.com', '$2b$10$rQZ8kqVZ8kqVZ8kqVZ8kqO8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8', '456 Technology Avenue, Tech City, TC 67890', 'store_owner', 1),
('Fashion Boutique Owner Manager', 'owner2@fashionboutique.com', '$2b$10$rQZ8kqVZ8kqVZ8kqVZ8kqO8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8', '789 Fashion Street, Style City, SC 11111', 'store_owner', 2),
('Grocery Store Owner Manager', 'owner3@grocerymart.com', '$2b$10$rQZ8kqVZ8kqVZ8kqVZ8kqO8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8', '321 Market Road, Food Town, FT 22222', 'store_owner', 3);

-- Insert sample normal users (password: UserPass123!)
INSERT INTO users (name, email, password, address, role) VALUES 
('Regular Customer John Smith', 'john.smith@email.com', '$2b$10$rQZ8kqVZ8kqVZ8kqVZ8kqO8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8', '111 Customer Street, User City, UC 55555', 'user'),
('Regular Customer Jane Doe', 'jane.doe@email.com', '$2b$10$rQZ8kqVZ8kqVZ8kqVZ8kqO8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8', '222 Shopper Avenue, Buyer Town, BT 66666', 'user'),
('Regular Customer Mike Johnson', 'mike.johnson@email.com', '$2b$10$rQZ8kqVZ8kqVZ8kqVZ8kqO8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8', '333 Consumer Road, Purchase City, PC 77777', 'user');

-- Insert sample ratings
INSERT INTO ratings (user_id, store_id, rating) VALUES 
(4, 1, 5), -- John rates Tech Electronics 5 stars
(4, 2, 4), -- John rates Fashion Boutique 4 stars
(5, 1, 4), -- Jane rates Tech Electronics 4 stars
(5, 3, 5), -- Jane rates Grocery Mart 5 stars
(6, 2, 3), -- Mike rates Fashion Boutique 3 stars
(6, 4, 5); -- Mike rates Book Haven 5 stars