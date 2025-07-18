-- ==========================================
-- 1️⃣ Categories
-- ==========================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

-- ==========================================
-- 2️⃣ Products
-- ==========================================
CREATE TABLE products (
  id TEXT PRIMARY KEY,  -- stays TEXT!
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT
);

-- ==========================================
-- 3️⃣ Polish Colors
-- ==========================================
CREATE TABLE polish_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  hex_code TEXT, -- optional, for UI color swatches
  description TEXT
);

-- ==========================================
-- 4️⃣ Product Polish Colors (M:N)
-- ==========================================
CREATE TABLE product_polish_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE, -- ✅ FIXED TO TEXT
  polish_color_id UUID REFERENCES polish_colors(id) ON DELETE CASCADE,
  UNIQUE (product_id, polish_color_id)
);

-- ==========================================
-- 5️⃣ Dimensions (Variants by Size)
-- ==========================================
CREATE TABLE dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE, -- ✅ FIXED TO TEXT
  name TEXT, -- optional e.g. "4x6"
  width NUMERIC NOT NULL,
  height NUMERIC NOT NULL,
  depth NUMERIC,
  length NUMERIC,
  price NUMERIC NOT NULL CHECK (price >= 0),
  UNIQUE (product_id, width, height, depth)
);

-- ==========================================
-- 6️⃣ Variant Options (SKU)
-- ==========================================
CREATE TABLE variant_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE, -- ✅ FIXED TO TEXT
  dimension_id UUID REFERENCES dimensions(id) ON DELETE CASCADE,
  polish_color_id UUID REFERENCES polish_colors(id) ON DELETE CASCADE,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  UNIQUE (product_id, dimension_id, polish_color_id)
);

-- ==========================================
-- 7️⃣ Product Images
-- ==========================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE, -- ✅ FIXED TO TEXT
  polish_color_id UUID REFERENCES polish_colors(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL CHECK (image_url <> ''),
  is_primary BOOLEAN DEFAULT FALSE,
  UNIQUE (product_id, polish_color_id, image_url)
);

-- ==========================================
-- ⚡ Trigger: Ensure only ONE primary image per Product + Polish Color
-- ==========================================
CREATE OR REPLACE FUNCTION enforce_one_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary THEN
    UPDATE product_images
    SET is_primary = FALSE
    WHERE product_id = NEW.product_id
      AND polish_color_id = NEW.polish_color_id
      AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_one_primary_image
BEFORE INSERT OR UPDATE ON product_images
FOR EACH ROW EXECUTE FUNCTION enforce_one_primary_image();

-- ==========================================
-- 8️⃣ Discounts
-- ==========================================
CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'money', 'free_shipping', 'coupon')),
  scope TEXT NOT NULL CHECK (scope IN ('all_items', 'categories', 'products', 'coupon')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  CONSTRAINT valid_date_range CHECK (start_date < end_date)
);

-- ==========================================
-- 9️⃣ Discount All Items (for all_items scope discounts)
-- ==========================================
CREATE TABLE discount_all_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id UUID REFERENCES discounts(id) ON DELETE CASCADE,
  discount_value NUMERIC NOT NULL CHECK (discount_value >= 0),
  UNIQUE (discount_id)
);

-- ==========================================
-- 🔟 Discount Categories (for category-specific discounts)
-- ==========================================
CREATE TABLE discount_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id UUID REFERENCES discounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  discount_value NUMERIC NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
  UNIQUE (discount_id, category_id)
);

-- ==========================================
-- 1️⃣1️⃣ Discount Products (for product-specific discounts)
-- ==========================================
CREATE TABLE discount_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id UUID REFERENCES discounts(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  discount_value NUMERIC NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
  UNIQUE (discount_id, product_id)
);

-- ==========================================
-- 1️⃣2️⃣ Discount Coupons (for coupon-type discounts)
-- ==========================================
CREATE TABLE discount_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id UUID REFERENCES discounts(id) ON DELETE CASCADE,
  coupon_code TEXT NOT NULL UNIQUE,
  coupon_discount_type TEXT NOT NULL CHECK (coupon_discount_type IN ('percent', 'money')),
  discount_value NUMERIC NOT NULL CHECK (discount_value >= 0),
  usage_limit INTEGER CHECK (usage_limit > 0),
  usage_count INTEGER DEFAULT 0,
  UNIQUE (discount_id)
);

-- ==========================================
-- ⚡ Discount System Functions
-- ==========================================

-- Function to validate coupon discount
CREATE OR REPLACE FUNCTION validate_coupon_discount(
  p_discount_id UUID,
  p_coupon_code TEXT
) RETURNS JSONB AS $$
DECLARE
  discount_record RECORD;
  coupon_record RECORD;
BEGIN
  -- Get discount details
  SELECT * INTO discount_record
  FROM discounts
  WHERE id = p_discount_id AND is_active = TRUE;
  
  -- Check if discount exists and is active
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Discount not found or inactive'
    );
  END IF;
  
  -- Check if discount is within time frame
  IF NOW() < discount_record.start_date OR NOW() > discount_record.end_date THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Discount is not within valid time frame'
    );
  END IF;
  
  -- If discount is coupon type, validate coupon
  IF discount_record.discount_type = 'coupon' THEN
    IF p_coupon_code IS NULL THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'Coupon code required for coupon discount'
      );
    END IF;
    
    -- Get coupon details
    SELECT * INTO coupon_record
    FROM discount_coupons
    WHERE discount_id = p_discount_id AND coupon_code = p_coupon_code;
    
    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'Invalid coupon code'
      );
    END IF;
    
    -- Check coupon usage limit
    IF coupon_record.usage_limit IS NOT NULL AND coupon_record.usage_count >= coupon_record.usage_limit THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'Coupon usage limit exceeded'
      );
    END IF;
  END IF;
  
  -- If all checks pass
  RETURN jsonb_build_object(
    'valid', true,
    'discount', row_to_json(discount_record),
    'coupon', CASE WHEN discount_record.discount_type = 'coupon' THEN row_to_json(coupon_record) ELSE NULL END
  );
END;
$$ LANGUAGE plpgsql;

-- Function to apply coupon discount
CREATE OR REPLACE FUNCTION apply_coupon_discount(
  p_discount_id UUID,
  p_coupon_code TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  validation_result JSONB;
  discount_record RECORD;
BEGIN
  -- Validate coupon first
  validation_result := validate_coupon_discount(p_discount_id, p_coupon_code);
  
  IF NOT (validation_result->>'valid')::BOOLEAN THEN
    RAISE EXCEPTION '%', validation_result->>'error';
  END IF;
  
  -- Get discount details
  SELECT * INTO discount_record FROM discounts WHERE id = p_discount_id;
  
  -- Update coupon usage count if it's a coupon discount
  -- Note: This will trigger auto-deactivation if usage limit is reached
  IF discount_record.discount_type = 'coupon' THEN
    UPDATE discount_coupons
    SET usage_count = usage_count + 1
    WHERE discount_id = p_discount_id AND coupon_code = p_coupon_code;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get applicable discounts for a product
CREATE OR REPLACE FUNCTION get_applicable_discounts(
  p_product_id TEXT,
  p_category_id UUID DEFAULT NULL
) RETURNS TABLE(
  discount_id UUID,
  name TEXT,
  description TEXT,
  discount_type TEXT,
  discount_value NUMERIC,
  scope TEXT,
  coupon_code TEXT,
  coupon_discount_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.description,
    d.discount_type,
    CASE 
      WHEN d.scope = 'all_items' THEN dai.discount_value
      WHEN d.scope = 'categories' THEN dc.discount_value
      WHEN d.scope = 'products' THEN dp.discount_value
      WHEN d.scope = 'coupon' THEN dcoup.discount_value
      ELSE 0
    END as discount_value,
    d.scope,
    dcoup.coupon_code,
    dcoup.coupon_discount_type
  FROM discounts d
  LEFT JOIN discount_all_items dai ON d.id = dai.discount_id AND d.scope = 'all_items'
  LEFT JOIN discount_categories dc ON d.id = dc.discount_id 
    AND dc.category_id = COALESCE(p_category_id, (
      SELECT category_id FROM products WHERE id = p_product_id
    ))
    AND d.scope = 'categories'
  LEFT JOIN discount_products dp ON d.id = dp.discount_id 
    AND dp.product_id = p_product_id
    AND d.scope = 'products'
  LEFT JOIN discount_coupons dcoup ON d.id = dcoup.discount_id AND d.scope = 'coupon'
  WHERE d.is_active = TRUE
    AND NOW() BETWEEN d.start_date AND d.end_date
    AND (
      -- All items discount
      (d.scope = 'all_items' AND dai.id IS NOT NULL)
      OR
      -- Category-specific discount
      (d.scope = 'categories' AND dc.id IS NOT NULL)
      OR
      -- Product-specific discount
      (d.scope = 'products' AND dp.id IS NOT NULL)
      OR
      -- Coupon discount (requires manual validation)
      (d.scope = 'coupon' AND dcoup.id IS NOT NULL)
    )
  ORDER BY 
    CASE 
      WHEN d.scope = 'all_items' THEN dai.discount_value
      WHEN d.scope = 'categories' THEN dc.discount_value
      WHEN d.scope = 'products' THEN dp.discount_value
      WHEN d.scope = 'coupon' THEN dcoup.discount_value
      ELSE 0
    END DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get coupon discount by code
CREATE OR REPLACE FUNCTION get_coupon_discount(p_coupon_code TEXT)
RETURNS TABLE(
  discount_id UUID,
  name TEXT,
  description TEXT,
  discount_type TEXT,
  discount_value NUMERIC,
  coupon_discount_type TEXT,
  scope TEXT,
  coupon_code TEXT,
  usage_limit INTEGER,
  usage_count INTEGER,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.description,
    d.discount_type,
    dc.discount_value,
    dc.coupon_discount_type,
    d.scope,
    dc.coupon_code,
    dc.usage_limit,
    dc.usage_count,
    d.start_date,
    d.end_date
  FROM discounts d
  INNER JOIN discount_coupons dc ON d.id = dc.discount_id
  WHERE dc.coupon_code = p_coupon_code
    AND d.is_active = TRUE
    AND NOW() BETWEEN d.start_date AND d.end_date
    AND (dc.usage_limit IS NULL OR dc.usage_count < dc.usage_limit);
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- ⚡ Auto-deactivate discount when coupon limit reached
-- ==========================================
CREATE OR REPLACE FUNCTION auto_deactivate_coupon_discount()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if usage limit is reached after updating usage_count
  IF NEW.usage_limit IS NOT NULL AND NEW.usage_count >= NEW.usage_limit THEN
    -- Deactivate the discount
    UPDATE discounts
    SET is_active = FALSE
    WHERE id = NEW.discount_id;
    
    -- Optional: Log the deactivation (you can remove this if you don't want logging)
    RAISE NOTICE 'Discount with ID % has been automatically deactivated due to reaching usage limit', NEW.discount_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-deactivation
CREATE TRIGGER trg_auto_deactivate_coupon_discount
AFTER UPDATE ON discount_coupons
FOR EACH ROW
WHEN (OLD.usage_count IS DISTINCT FROM NEW.usage_count)
EXECUTE FUNCTION auto_deactivate_coupon_discount();

-- Function to manually reactivate a discount (for admin purposes)
CREATE OR REPLACE FUNCTION reactivate_discount(p_discount_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  discount_exists BOOLEAN;
BEGIN
  -- Check if discount exists
  SELECT EXISTS(SELECT 1 FROM discounts WHERE id = p_discount_id) INTO discount_exists;
  
  IF NOT discount_exists THEN
    RAISE EXCEPTION 'Discount with ID % does not exist', p_discount_id;
  END IF;
  
  -- Reactivate the discount
  UPDATE discounts
  SET is_active = TRUE
  WHERE id = p_discount_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 🔑 Recommended Indexes
-- ==========================================
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_product_images_product_polish ON product_images(product_id, polish_color_id);
CREATE INDEX idx_variant_options_product_dim_polish ON variant_options(product_id, dimension_id, polish_color_id);

-- Discount system indexes
CREATE INDEX idx_discounts_active_dates ON discounts(is_active, start_date, end_date);
CREATE INDEX idx_discount_all_items_discount ON discount_all_items(discount_id);
CREATE INDEX idx_discount_categories_discount ON discount_categories(discount_id);
CREATE INDEX idx_discount_products_discount ON discount_products(discount_id);
CREATE INDEX idx_discount_coupons_code ON discount_coupons(coupon_code);
CREATE INDEX idx_discount_coupons_discount ON discount_coupons(discount_id);

-- ==========================================
-- 🔄 DROP EXISTING TRIGGER AND FUNCTION
-- ==========================================
DROP TRIGGER IF EXISTS before_insert_product_id ON products;
DROP FUNCTION IF EXISTS set_product_id();

-- ==========================================
-- 📝 NEW IMPROVED FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION set_product_id()
RETURNS TRIGGER AS $$
DECLARE
  last_id_number INTEGER;
  new_id_number INTEGER;
BEGIN
  -- Only generate ID if not provided
  IF NEW.id IS NULL THEN
    -- Get the highest number from existing product IDs
    SELECT COALESCE(
      MAX(
        CAST(
          SUBSTRING(id FROM '^P_([0-9]+)$') AS INTEGER
        )
      ), 
      0
    ) INTO last_id_number
    FROM products 
    WHERE id ~ '^P_[0-9]+$';
    
    -- Increment by 1 (if table is empty, last_id_number = 0, so new will be 1)
    new_id_number := last_id_number + 1;
    
    -- Generate new ID with capital P and 4-digit padding
    NEW.id := 'P-' || LPAD(new_id_number::TEXT, 4, '0');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 🎯 CREATE NEW TRIGGER
-- ==========================================
CREATE TRIGGER before_insert_product_id
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION set_product_id();

-- ==========================================
-- 📚 SAMPLE DISCOUNT DATA & USAGE EXAMPLES
-- ==========================================

-- ⚠️ MIGRATION NOTE: If you have existing discount data, run this first:
/*
-- Drop old constraints that may conflict
ALTER TABLE discounts DROP CONSTRAINT IF EXISTS percent_value_range;
ALTER TABLE discounts DROP CONSTRAINT IF EXISTS free_shipping_value;

-- Remove old columns
ALTER TABLE discounts DROP COLUMN IF EXISTS discount_value;
ALTER TABLE discounts DROP COLUMN IF EXISTS coupon_code;
ALTER TABLE discounts DROP COLUMN IF EXISTS usage_limit;
ALTER TABLE discounts DROP COLUMN IF EXISTS usage_count;
ALTER TABLE discounts DROP COLUMN IF EXISTS created_at;
ALTER TABLE discounts DROP COLUMN IF EXISTS updated_at;

-- Add new coupon scope to existing discounts check constraint
ALTER TABLE discounts DROP CONSTRAINT IF EXISTS discounts_discount_type_check;
ALTER TABLE discounts ADD CONSTRAINT discounts_discount_type_check CHECK (discount_type IN ('percent', 'money', 'free_shipping', 'coupon'));

ALTER TABLE discounts DROP CONSTRAINT IF EXISTS discounts_scope_check;
ALTER TABLE discounts ADD CONSTRAINT discounts_scope_check CHECK (scope IN ('all_items', 'categories', 'products', 'coupon'));

-- Create new tables if they don't exist
CREATE TABLE IF NOT EXISTS discount_all_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id UUID REFERENCES discounts(id) ON DELETE CASCADE,
  discount_value NUMERIC NOT NULL CHECK (discount_value >= 0),
  UNIQUE (discount_id)
);

CREATE TABLE IF NOT EXISTS discount_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id UUID REFERENCES discounts(id) ON DELETE CASCADE,
  coupon_code TEXT NOT NULL UNIQUE,
  coupon_discount_type TEXT NOT NULL CHECK (coupon_discount_type IN ('percent', 'money')),
  discount_value NUMERIC NOT NULL CHECK (discount_value >= 0),
  usage_limit INTEGER CHECK (usage_limit > 0),
  usage_count INTEGER DEFAULT 0,
  UNIQUE (discount_id)
);
*/

-- Example 1: 15% off all items (no coupon needed)
/*
-- First create the discount
INSERT INTO discounts (name, description, discount_type, scope, start_date, end_date)
VALUES (
  'Summer Sale',
  '15% off all items',
  'percent',
  'all_items',
  NOW(),
  NOW() + INTERVAL '30 days'
);

-- Then link it to discount_all_items with the discount value
INSERT INTO discount_all_items (discount_id, discount_value)
SELECT id, 15 FROM discounts WHERE name = 'Summer Sale';
*/

-- Example 2: Different discount values for different categories
/*
-- First create the discount
INSERT INTO discounts (name, description, discount_type, scope, start_date, end_date)
VALUES (
  'Category Specific Sale',
  'Different discounts for different categories',
  'percent',
  'categories',
  NOW(),
  NOW() + INTERVAL '7 days'
);

-- Link discount to specific categories with different values
INSERT INTO discount_categories (discount_id, category_id, discount_value)
SELECT d.id, c.id, 
  CASE 
    WHEN c.name = 'Tables' THEN 15
    WHEN c.name = 'Chairs' THEN 10
    WHEN c.name = 'Shelves' THEN 20
    ELSE 5
  END
FROM discounts d, categories c
WHERE d.name = 'Category Specific Sale' AND c.name IN ('Tables', 'Chairs', 'Shelves');
*/

-- Example 3: Different discount values for different products
/*
-- First create the discount
INSERT INTO discounts (name, description, discount_type, scope, start_date, end_date)
VALUES (
  'Product Specific Sale',
  'Different discounts for different products',
  'money',
  'products',
  NOW(),
  NOW() + INTERVAL '14 days'
);

-- Link discount to specific products with different values
INSERT INTO discount_products (discount_id, product_id, discount_value)
SELECT d.id, p.id, 
  CASE 
    WHEN p.name LIKE '%Premium%' THEN 50
    WHEN p.name LIKE '%Standard%' THEN 25
    ELSE 10
  END
FROM discounts d, products p
WHERE d.name = 'Product Specific Sale' AND p.name IS NOT NULL;
*/

-- Example 4: Coupon discount
/*
-- First create the discount
INSERT INTO discounts (name, description, discount_type, scope, start_date, end_date)
VALUES (
  'Save 20% Coupon',
  'Get 20% off with coupon code',
  'coupon',
  'coupon',
  NOW(),
  NOW() + INTERVAL '30 days'
);

-- Then create the coupon
INSERT INTO discount_coupons (discount_id, coupon_code, coupon_discount_type, discount_value, usage_limit)
SELECT id, 'SAVE20', 'percent', 20, 100 FROM discounts WHERE name = 'Save 20% Coupon';
*/

-- ==========================================
-- 🔍 USAGE EXAMPLES
-- ==========================================

-- Check if a coupon discount is valid
/*
SELECT validate_coupon_discount(
  (SELECT id FROM discounts WHERE name = 'Save 20% Coupon'),
  'SAVE20'
);
*/

-- Get coupon discount by code
/*
SELECT * FROM get_coupon_discount('SAVE20');
*/

-- Get all applicable discounts for a product
/*
SELECT * FROM get_applicable_discounts('P-0001');
*/

-- Apply a coupon discount (increment usage count)
/*
SELECT apply_coupon_discount(
  (SELECT id FROM discounts WHERE name = 'Save 20% Coupon'),
  'SAVE20'
);
*/

-- 🔄 AUTO-DEACTIVATION EXAMPLES
-- Note: When a coupon reaches its usage limit, it will automatically be deactivated

-- Example: Create a limited coupon that will auto-deactivate after 3 uses
/*
-- Create discount
INSERT INTO discounts (name, description, discount_type, scope, start_date, end_date)
VALUES (
  'Limited Coupon Test',
  'Test coupon with 3 usage limit',
  'coupon',
  'coupon',
  NOW(),
  NOW() + INTERVAL '30 days'
);

-- Create coupon with usage limit of 3
INSERT INTO discount_coupons (discount_id, coupon_code, coupon_discount_type, discount_value, usage_limit)
SELECT id, 'LIMIT3', 'percent', 10, 3 FROM discounts WHERE name = 'Limited Coupon Test';

-- Apply discount 3 times (on the 3rd usage, discount will be auto-deactivated)
SELECT apply_coupon_discount(
  (SELECT id FROM discounts WHERE name = 'Limited Coupon Test'),
  'LIMIT3'
);

SELECT apply_coupon_discount(
  (SELECT id FROM discounts WHERE name = 'Limited Coupon Test'),
  'LIMIT3'
);

SELECT apply_coupon_discount(
  (SELECT id FROM discounts WHERE name = 'Limited Coupon Test'),
  'LIMIT3'
);

-- Check if discount is now inactive
SELECT is_active FROM discounts WHERE name = 'Limited Coupon Test';
-- Should return FALSE
*/

-- Manually reactivate a discount (admin function)
/*
SELECT reactivate_discount(
  (SELECT id FROM discounts WHERE name = 'Limited Coupon Test')
);
*/

-- Get active discounts with their usage statistics
/*
SELECT 
  d.name,
  d.discount_type,
  d.scope,
  CASE 
    WHEN d.scope = 'all_items' THEN (SELECT discount_value FROM discount_all_items WHERE discount_id = d.id)
    WHEN d.scope = 'coupon' THEN (SELECT discount_value FROM discount_coupons WHERE discount_id = d.id)
    ELSE NULL
  END as discount_value,
  CASE 
    WHEN d.scope = 'coupon' THEN (SELECT coupon_code FROM discount_coupons WHERE discount_id = d.id)
    ELSE NULL
  END as coupon_code,
  CASE 
    WHEN d.scope = 'coupon' THEN (
      SELECT CASE 
        WHEN usage_limit IS NULL THEN 'Unlimited'
        ELSE CONCAT(usage_count, '/', usage_limit)
      END
      FROM discount_coupons WHERE discount_id = d.id
    )
    ELSE 'N/A'
  END as usage_status,
  d.start_date,
  d.end_date
FROM discounts d
WHERE d.is_active = TRUE
ORDER BY d.start_date DESC;
*/
