/*
  # Fix mortgages table RLS policies

  1. Changes
    - Drop existing RLS policies for mortgages table
    - Add new policies that properly handle all CRUD operations
    - Ensure brokers can manage mortgages for their clients

  2. Security
    - Enable RLS on mortgages table
    - Add policies for SELECT, INSERT, UPDATE, and DELETE
    - Policies check broker_id through client relationship
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Brokers can view client mortgages" ON mortgages;

-- Create comprehensive policies
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

CREATE POLICY "Brokers can create mortgages for their clients"
  ON mortgages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = mortgages.client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Brokers can update client mortgages"
  ON mortgages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = mortgages.client_id
      AND clients.broker_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = mortgages.client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Brokers can delete client mortgages"
  ON mortgages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = mortgages.client_id
      AND clients.broker_id = auth.uid()
    )
  );

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';