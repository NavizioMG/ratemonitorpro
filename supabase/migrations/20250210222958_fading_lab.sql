/*
  # Fix RLS policies for deals table

  1. Changes
    - Drop existing RLS policies
    - Create new comprehensive policies for deals table
    - Add proper broker access control through client relationship
  
  2. Security
    - Enable RLS
    - Add policies for all CRUD operations
    - Ensure proper data access control
*/

-- Drop any existing policies
DROP POLICY IF EXISTS "Brokers can view own deals" ON deals;
DROP POLICY IF EXISTS "Brokers can create deals" ON deals;
DROP POLICY IF EXISTS "Brokers can update own deals" ON deals;
DROP POLICY IF EXISTS "Brokers can delete own deals" ON deals;

-- Create comprehensive policies
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

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';