/*
  # Consolidated Schema Migration

  1. Tables
    - Recreates all core tables with proper constraints
    - Ensures consistent data types and validations
    - Sets up proper relationships between tables

  2. Security
    - Enables RLS on all tables
    - Creates comprehensive security policies
    - Sets up proper authentication rules

  3. Performance
    - Adds necessary indexes
    - Optimizes query performance
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS rate_alerts CASCADE;
DROP TABLE IF EXISTS rate_history CASCADE;
DROP TABLE IF EXISTS mortgages CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create clients table
CREATE TABLE clients (
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
CREATE TABLE mortgages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  current_rate DECIMAL(5,3) NOT NULL CHECK (current_rate >= 0 AND current_rate <= 15),
  target_rate DECIMAL(5,3) NOT NULL CHECK (target_rate >= 0 AND target_rate <= 15),
  loan_amount DECIMAL(12,2) NOT NULL,
  term_years INTEGER NOT NULL,
  start_date DATE NOT NULL,
  lender TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create rate_history table
CREATE TABLE rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_date DATE NOT NULL,
  rate_type TEXT NOT NULL,
  rate_value DECIMAL(5,3) NOT NULL,
  term_years INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortgages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_history ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read any profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for clients
CREATE POLICY "Brokers can view own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (broker_id = auth.uid());

CREATE POLICY "Brokers can insert own clients"
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
CREATE POLICY "mortgages_select"
  ON mortgages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = mortgages.client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "mortgages_insert"
  ON mortgages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "mortgages_update"
  ON mortgages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "mortgages_delete"
  ON mortgages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
      AND clients.broker_id = auth.uid()
    )
  );

-- Create policy for rate_history
CREATE POLICY "Anyone can view rate history"
  ON rate_history FOR SELECT
  TO authenticated
  USING (true);

-- Create function for cascading deletes
CREATE OR REPLACE FUNCTION delete_client_mortgages()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM mortgages WHERE client_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cascading deletes
CREATE TRIGGER trigger_delete_client_mortgages
  BEFORE DELETE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION delete_client_mortgages();

-- Create indexes for performance
CREATE INDEX mortgages_client_id_idx ON mortgages(client_id);
CREATE INDEX mortgages_rates_idx ON mortgages(current_rate, target_rate);
CREATE INDEX rate_history_date_idx ON rate_history(rate_date);
CREATE INDEX rate_history_term_idx ON rate_history(term_years);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';