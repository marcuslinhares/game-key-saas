-- Keys Table
CREATE TABLE keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  key_code TEXT NOT NULL, -- Em produção, seria criptografado
  status TEXT DEFAULT 'available', -- available, sold, disputed
  order_id UUID, -- preenchido quando vendido
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  listing_id UUID REFERENCES listings(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, paid, completed, disputed
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Key Reveal Logs (Auditoria de Segurança)
CREATE TABLE key_reveal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_id UUID REFERENCES keys(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Logs (Auditoria Financeira)
CREATE TABLE financial_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  order_id UUID REFERENCES orders(id),
  change_amount DECIMAL(10, 2) NOT NULL,
  new_balance_pending DECIMAL(10, 2),
  new_balance_available DECIMAL(10, 2),
  reason TEXT, -- sale, escrow_release, withdrawal
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Keys are private." ON keys FOR SELECT USING (auth.uid() IN (SELECT seller_id FROM listings WHERE id = listing_id) OR auth.uid() IN (SELECT buyer_id FROM orders WHERE id = order_id));

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own orders." ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

ALTER TABLE key_reveal_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins or the owner can see reveal logs." ON key_reveal_logs FOR SELECT USING (auth.uid() = user_id);
