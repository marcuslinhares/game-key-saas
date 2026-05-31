-- Escrow & Disputes System
-- Gerencia retenção de pagamentos, disputas e liberação de fundos

-- Disputes Table (Resolução de Conflitos)
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  reason TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open', -- open, resolved_buyer, resolved_seller, cancelled
  admin_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Withdrawals Table (Saques)
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processed, rejected
  destination_account TEXT NOT NULL,
  admin_notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add escrow_fields to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS escrow_released_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS escrow_release_date TIMESTAMP WITH TIME ZONE;

-- RLS Policies
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyer can see their own disputes"
  ON disputes FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Seller can see disputes on their orders"
  ON disputes FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "Buyer can create disputes"
  ON disputes FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Admin can manage all disputes"
  ON disputes FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own withdrawals"
  ON withdrawals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create withdrawals"
  ON withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all withdrawals"
  ON withdrawals FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));
