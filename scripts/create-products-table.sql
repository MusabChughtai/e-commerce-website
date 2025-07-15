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
-- 🔑 Recommended Indexes
-- ==========================================
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_product_images_product_polish ON product_images(product_id, polish_color_id);
CREATE INDEX idx_variant_options_product_dim_polish ON variant_options(product_id, dimension_id, polish_color_id);

-- ==========================================
-- 📌 Auto-increment Product ID prefix: 'p_0001'
-- ==========================================
CREATE SEQUENCE IF NOT EXISTS product_id_seq START 1;

CREATE OR REPLACE FUNCTION set_product_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL THEN
    NEW.id := 'p_' || LPAD(nextval('product_id_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_insert_product_id ON products;

CREATE TRIGGER before_insert_product_id
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION set_product_id();
