/*
  # Fix deals table structure and relationships

  1. Changes
    - Drop and recreate deals table with proper structure
    - Set up clear relationships with clients table
    - Create proper RLS policies
    - Add necessary indexes
  
  2. Security
    - Enable RLS
    - Add comprehensive policies for all operations
    - Ensure proper data access control
*/

-- Drop existing deals table and related tables
DROP TABLE IF EXISTS deals CASCADE;

-- Create deals table with proper structure
CREATE TABLE deals (
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

-- Create comprehensive RLS policies
CREATE POLICY "Brokers can view own deals"
  ON deals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = deals.client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Brokers can create deals"
  ON deals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Brokers can update own deals"
  ON deals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = deals.client_id
      AND clients.broker_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Brokers can delete own deals"
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
CREATE INDEX deals_client_id_idx ON deals(client_id);
CREATE INDEX deals_stage_id_idx ON deals(stage_id);
CREATE INDEX deals_status_idx ON deals(status);
CREATE INDEX deals_loan_type_idx ON deals(loan_type);
CREATE INDEX deals_probability_idx ON deals(probability);
CREATE INDEX deals_expected_close_date_idx ON deals(expected_close_date);

-- Create updated_at trigger
CREATE TRIGGER set_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';