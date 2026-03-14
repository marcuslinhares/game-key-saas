-- Listings Table
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for Listings
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listings are viewable by everyone." ON listings FOR SELECT USING (true);
CREATE POLICY "Sellers can manage their own listings." ON listings FOR ALL USING (auth.uid() = seller_id);
