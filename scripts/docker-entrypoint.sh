#!/bin/bash
set -e

echo "🚀 Starting GameKey Market..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 2

# Apply migrations using psql if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    echo "📦 Applying database schema..."
    
    # Enable UUID extension
    psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" 2>/dev/null || true
    
    # Create tables (using IF NOT EXISTS to be idempotent)
    psql "$DATABASE_URL" -c "
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
    " 2>/dev/null || true
    
    psql "$DATABASE_URL" -c "
    CREATE TABLE IF NOT EXISTS games (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT,
      cover_image TEXT,
      platform TEXT NOT NULL,
      region_lock TEXT DEFAULT 'Global',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    " 2>/dev/null || true
    
    psql "$DATABASE_URL" -c "
    CREATE TABLE IF NOT EXISTS listings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
      seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      stock_count INTEGER DEFAULT 0,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    " 2>/dev/null || true
    
    psql "$DATABASE_URL" -c "
    CREATE TABLE IF NOT EXISTS keys (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
      key_code TEXT NOT NULL,
      status TEXT DEFAULT 'available',
      order_id UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    " 2>/dev/null || true
    
    psql "$DATABASE_URL" -c "
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
    " 2>/dev/null || true
    
    # Enable RLS
    psql "$DATABASE_URL" -c "ALTER TABLE games ENABLE ROW LEVEL SECURITY;" 2>/dev/null || true
    psql "$DATABASE_URL" -c "ALTER TABLE listings ENABLE ROW LEVEL SECURITY;" 2>/dev/null || true
    psql "$DATABASE_URL" -c "ALTER TABLE orders ENABLE ROW LEVEL SECURITY;" 2>/dev/null || true
    
    echo "✅ Database schema applied!"
else
    echo "⚠️  DATABASE_URL not set, skipping migrations"
fi

echo "✅ Starting Next.js..."
exec npm run start
