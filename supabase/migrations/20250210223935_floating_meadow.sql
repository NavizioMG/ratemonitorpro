-- Drop existing policies first
DROP POLICY IF EXISTS "Brokers can view own deals" ON deals;
DROP POLICY IF EXISTS "Brokers can create deals" ON deals;
DROP POLICY IF EXISTS "Brokers can update own deals" ON deals;
DROP POLICY IF EXISTS "Brokers can delete own deals" ON deals;

-- Create deals table if it doesn't exist
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  title TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
  loan_type TEXT CHECK (loan_type IN ('purchase', 'refinance', 'reverse')),
  stage_id UUID REFERENCES pipeline_stages(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'cancelled')),
  probability INTEGER NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "deals_select_policy"
  ON deals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = deals.client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "deals_insert_policy"
  ON deals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "deals_update_policy"
  ON deals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = deals.client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "deals_delete_policy"
  ON deals FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = deals.client_id
      AND clients.broker_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS deals_client_id_idx ON deals(client_id);
CREATE INDEX IF NOT EXISTS deals_stage_id_idx ON deals(stage_id);
CREATE INDEX IF NOT EXISTS deals_status_idx ON deals(status);
CREATE INDEX IF NOT EXISTS deals_loan_type_idx ON deals(loan_type);
CREATE INDEX IF NOT EXISTS deals_probability_idx ON deals(probability);
CREATE INDEX IF NOT EXISTS deals_expected_close_date_idx ON deals(expected_close_date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_deals_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_deals_timestamp
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_deals_timestamp();

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';