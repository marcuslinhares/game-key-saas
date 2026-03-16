-- GameKey Market - Database Schema
-- Execute this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  is_seller BOOLEAN DEFAULT FALSE,
  reputation_score DECIMAL DEFAULT 5.0,
  balance_available DECIMAL DEFAULT 0,
  balance_pending DECIMAL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games Table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  platform TEXT NOT NULL,
  region_lock TEXT DEFAULT 'Global',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings Table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keys Table
CREATE TABLE IF NOT EXISTS keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  key_code TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  listing_id UUID REFERENCES listings(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Key Reveal Logs
CREATE TABLE IF NOT EXISTS key_reveal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_id UUID REFERENCES keys(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Logs
CREATE TABLE IF NOT EXISTS financial_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  order_id UUID REFERENCES orders(id),
  change_amount DECIMAL(10, 2) NOT NULL,
  new_balance_pending DECIMAL(10, 2),
  new_balance_available DECIMAL(10, 2),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Games are viewable by everyone." ON games FOR SELECT USING (true);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listings are viewable by everyone." ON listings FOR SELECT USING (true);
CREATE POLICY "Sellers can manage their own listings." ON listings FOR ALL USING (auth.uid() = seller_id);

ALTER TABLE keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Keys are private." ON keys FOR SELECT USING (
  auth.uid() IN (SELECT seller_id FROM listings WHERE id = listing_id)
  OR auth.uid() IN (SELECT buyer_id FROM orders WHERE id = order_id)
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own orders." ON orders FOR SELECT USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);

ALTER TABLE key_reveal_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins or the owner can see reveal logs." ON key_reveal_logs FOR SELECT USING (
  auth.uid() = user_id
);

-- Insert sample games
INSERT INTO games (title, description, platform, region_lock, cover_image) VALUES
  ('Elden Ring', 'Um RPG de ação em mundo aberto da FromSoftware e George R.R. Martin.', 'Steam', 'Global', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg'),
  ('Cyberpunk 2077', 'RPG de ação em mundo aberto ambientado em Night City.', 'Steam', 'Global', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg'),
  ('Baldur''s Gate 3', 'RPG baseado em D&D 5e com narrativa profunda.', 'Steam', 'Global', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg'),
  ('Hogwarts Legacy', 'RPG de ação no mundo de Harry Potter.', 'Steam', 'Global', 'https://cdn.cloudflare.steamstatic.com/steam/apps/990080/header.jpg'),
  ('God of War Ragnarök', 'Aventura épica de Kratos e Atreus.', 'Steam', 'Global', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/header.jpg'),
  ('Red Dead Redemption 2', 'Ação e aventura no velho oeste americano.', 'Steam', 'Global', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg');
