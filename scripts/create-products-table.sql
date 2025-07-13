-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image TEXT,
  full_description TEXT,
  dimensions VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE
    ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO products (name, description, price, image, full_description, dimensions) VALUES
('Velvet Armchair', 'Comfortable and stylish seating solution', 124999, '/placeholder.svg?height=200&width=200', 'Experience unparalleled comfort and timeless style with our Velvet Armchair. Crafted with a solid oak frame and upholstered in premium, soft velvet that offers both luxury and durability.', 'Height: 85cm, Width: 65cm, Depth: 70cm'),
('Oakwood Lamp', 'Brighten your space with style', 32499, '/placeholder.svg?height=200&width=200', 'Illuminate your space with our handcrafted Oakwood Lamp. Made from sustainably sourced oak with a warm LED bulb for perfect ambient lighting.', 'Height: 45cm, Base: 15cm diameter'),
('Linen Sofa', 'Luxury and elegant seating for your living room', 324999, '/placeholder.svg?height=200&width=200', 'Our premium Linen Sofa combines comfort with sophisticated design. Features high-quality linen upholstery and solid hardwood frame.', 'Height: 80cm, Width: 200cm, Depth: 90cm'),
('Dining Set', 'Perfect for beautiful dining experiences', 224999, '/placeholder.svg?height=200&width=200', 'Complete dining set including table and four chairs. Crafted from solid wood with a beautiful natural finish.', 'Table: 150cm x 90cm, Chair height: 85cm');
