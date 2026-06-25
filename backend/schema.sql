-- =========================================
-- SATCHEL & CO — Database Schema
-- Run this entire file in phpMyAdmin (SQL tab)
-- or via: mysql -u root -p < schema.sql
-- =========================================

CREATE DATABASE IF NOT EXISTS bags_db;
USE bags_db;

-- ---------- USERS ----------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- PRODUCTS ----------
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(20) PRIMARY KEY,        -- matches frontend slugs e.g. 'tote-01'
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    colors VARCHAR(255),               -- comma-separated hex values
    details TEXT,                      -- pipe-separated bullet points
    stock INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- CART ----------
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id VARCHAR(20) NOT NULL,
    color VARCHAR(20),
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ---------- ORDERS ----------
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------- ORDER ITEMS ----------
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id VARCHAR(20) NOT NULL,
    color VARCHAR(20),
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =========================================
-- SEED DATA — the 8 bags from script.js
-- =========================================
INSERT INTO products (id, name, category, price, description, colors, details) VALUES
('tote-01', 'The Harlow Tote', 'Tote', 128.00,
 'A roomy, structured tote in full-grain leather, built for the daily commute. Interior zip pocket, magnetic close, and a base that won''t slouch.',
 '#A8703D,#241910,#7C8A72',
 'Full-grain leather|14" laptop fits inside|Magnetic snap closure|Made in small batches'),

('cross-01', 'The Wren Crossbody', 'Crossbody', 86.00,
 'Compact and light, with an adjustable strap long enough to wear three ways. Just enough room for the essentials.',
 '#7C5A3C,#241910,#B08D57',
 'Vegetable-tanned leather|Adjustable 22"-48" strap|Card slot inside|Brass hardware'),

('back-01', 'The Foster Backpack', 'Backpack', 154.00,
 'A minimal leather backpack that goes from studio to weekend trip. Padded straps, a laptop sleeve, and room to spare.',
 '#241910,#3E3128,#A8703D',
 'Water-resistant lining|Fits 15" laptop|Padded adjustable straps|Top handle + backpack straps'),

('clutch-01', 'The Linden Clutch', 'Clutch', 64.00,
 'An evening clutch with a hidden wrist strap. Holds a phone, cards, and not much else, on purpose.',
 '#241910,#9A3B1E,#B08D57',
 'Smooth nappa leather|Detachable wrist strap|Satin interior lining'),

('tote-02', 'The Briar Market Tote', 'Tote', 112.00,
 'An open-top tote with reinforced stitched handles, sized for a grocery run or a stack of folders.',
 '#7C8A72,#A8703D,#241910',
 'Reinforced stitched handles|Open top, wide base|Machine-washable canvas blend'),

('cross-02', 'The Marlowe Saddle Bag', 'Crossbody', 94.00,
 'A classic saddle silhouette with a flap closure and a strap that sits perfectly at the hip.',
 '#A8703D,#7C5A3C,#241910',
 'Flap closure with brass buckle|Adjustable crossbody strap|Interior zip pocket'),

('back-02', 'The Asher Daypack', 'Backpack', 138.00,
 'A slim daypack that doesn''t bulk up your silhouette. Drawstring top, one front pocket, no clutter.',
 '#3E3128,#241910,#B08D57',
 'Drawstring top closure|Single front pocket|Leather base panel'),

('weekend-01', 'The Holt Weekender', 'Travel', 198.00,
 'A duffel built to be checked, gate-checked, or thrown over a shoulder. Wide mouth, sturdy base feet.',
 '#241910,#7C5A3C,#A8703D',
 'Detachable shoulder strap|Wide-mouth zip opening|Reinforced base feet');
