/*
  # Create Clients and Mortgages Tables

  1. New Tables
    - clients
      - Basic client information
      - Linked to broker (profile)
    - mortgages
      - Mortgage details for clients
      - Linked to client

  2. Security
    - Enable RLS
    - Add policies for broker access
    - Ensure proper relationships
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID REFERENCES profiles(id) NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create mortgages table
CREATE TABLE IF NOT EXISTS mortgages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  current_rate DECIMAL(5,3) NOT NULL CHECK (current_rate >= 0 AND current_rate <= 15),
  target_rate DECIMAL(5,3) NOT NULL CHECK (target_rate >= 0 AND target_rate <= 15),
  loan_amount DECIMAL(12,2) NOT NULL CHECK (loan_amount > 0),
  term_years INTEGER NOT NULL CHECK (term_years > 0),
  start_date DATE NOT NULL,
  lender TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS clients_broker_id_idx ON clients(broker_id);
CREATE INDEX IF NOT EXISTS clients_email_idx ON clients(email);
CREATE INDEX IF NOT EXISTS mortgages_client_id_idx ON mortgages(client_id);
CREATE INDEX IF NOT EXISTS mortgages_rates_idx ON mortgages(current_rate, target_rate);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortgages ENABLE ROW LEVEL SECURITY;

-- Create policies for clients
CREATE POLICY "Brokers can view own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (broker_id = auth.uid());

CREATE POLICY "Brokers can create own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (broker_id = auth.uid());

CREATE POLICY "Brokers can update own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (broker_id = auth.uid());

CREATE POLICY "Brokers can delete own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (broker_id = auth.uid());

-- Create policies for mortgages
CREATE POLICY "Brokers can view client mortgages"
  ON mortgages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = mortgages.client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Brokers can create client mortgages"
  ON mortgages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Brokers can update client mortgages"
  ON mortgages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Brokers can delete client mortgages"
  ON mortgages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
      AND clients.broker_id = auth.uid()
    )
  );

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mortgages_updated_at
  BEFORE UPDATE ON mortgages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add cascade delete trigger for mortgages when client is deleted
CREATE OR REPLACE FUNCTION delete_client_mortgages()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM mortgages WHERE client_id = OLD.id;
  RETURN OLD;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_delete_client_mortgages
  BEFORE DELETE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION delete_client_mortgages();

-- Grant permissions
GRANT ALL ON TABLE clients TO authenticated;
GRANT ALL ON TABLE mortgages TO authenticated;
GRANT ALL ON TABLE clients TO service_role;
GRANT ALL ON TABLE mortgages TO service_role;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';