-- ============================================================================
-- Leo's Cafe - Initial Seed Data
-- Run AFTER prisma migrate deploy (or db push)
-- This creates sample menu categories and items so the app renders immediately.
-- ============================================================================

-- Sample Categories
INSERT INTO categories (id, name, slug, image_url, sort_order, is_active, created_at)
VALUES
  ('cat-beverages', 'Beverages', 'beverages', 'https://res.cloudinary.com/demo/image/upload/v1/samples/food/beverages.jpg', 1, true, NOW()),
  ('cat-burgers',   'Burgers',   'burgers',   'https://res.cloudinary.com/demo/image/upload/v1/samples/food/burger.jpg',    2, true, NOW()),
  ('cat-pizza',     'Pizza',     'pizza',     'https://res.cloudinary.com/demo/image/upload/v1/samples/food/pizza.jpg',     3, true, NOW()),
  ('cat-desserts',  'Desserts',  'desserts',  'https://res.cloudinary.com/demo/image/upload/v1/samples/food/dessert.jpg',   4, true, NOW())
ON CONFLICT DO NOTHING;

-- Sample Menu Items
INSERT INTO menu_items (id, category_id, name, slug, description, price, image_url, is_available, ratings_avg, ratings_count, is_active, created_at, updated_at)
VALUES
  ('item-latte',       'cat-beverages', 'Café Latte',       'cafe-latte',       'Rich espresso with steamed milk',               350.00, 'https://res.cloudinary.com/demo/image/upload/v1/samples/food/beverages.jpg', true, 4.50, 0, true, NOW(), NOW()),
  ('item-cappuccino',  'cat-beverages', 'Cappuccino',        'cappuccino',        'Espresso with equal parts steamed & foamed milk', 320.00, 'https://res.cloudinary.com/demo/image/upload/v1/samples/food/beverages.jpg', true, 4.30, 0, true, NOW(), NOW()),
  ('item-leo-burger',  'cat-burgers',   'Leo Special Burger','leo-special-burger','Double patty with special Leo sauce',            750.00, 'https://res.cloudinary.com/demo/image/upload/v1/samples/food/burger.jpg',    true, 4.70, 0, true, NOW(), NOW()),
  ('item-cheese-burger','cat-burgers',  'Classic Cheese Burger','classic-cheese-burger','Juicy beef patty with cheddar',           650.00, 'https://res.cloudinary.com/demo/image/upload/v1/samples/food/burger.jpg',    true, 4.50, 0, true, NOW(), NOW()),
  ('item-margherita',  'cat-pizza',     'Margherita Pizza',  'margherita-pizza',  'Fresh tomato sauce, mozzarella, basil',          850.00, 'https://res.cloudinary.com/demo/image/upload/v1/samples/food/pizza.jpg',     true, 4.20, 0, true, NOW(), NOW()),
  ('item-chocolate-cake','cat-desserts','Chocolate Lava Cake','chocolate-lava-cake','Warm chocolate cake with molten center',        400.00, 'https://res.cloudinary.com/demo/image/upload/v1/samples/food/dessert.jpg',   true, 4.80, 0, true, NOW(), NOW())
ON CONFLICT DO NOTHING;
