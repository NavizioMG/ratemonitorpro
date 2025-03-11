/*
  # Fix RLS policies for deals table

  1. Changes
    - Drop existing RLS policies
    - Create new comprehensive policies for deals table
    - Add proper broker access control
  
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
    auth.uid() = (
      SELECT broker_id 
      FROM clients 
      WHERE id = deals.client_id
    )
  );

CREATE POLICY "Brokers can create deals"
  ON deals FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = (
      SELECT broker_id 
      FROM clients 
      WHERE id = client_id
    )
  );

CREATE POLICY "Brokers can update own deals"
  ON deals FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = (
      SELECT broker_id 
      FROM clients 
      WHERE id = client_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT broker_id 
      FROM clients 
      WHERE id = client_id
    )
  );

CREATE POLICY "Brokers can delete own deals"
  ON deals FOR DELETE
  TO authenticated
  USING (
    auth.uid() = (
      SELECT broker_id 
      FROM clients 
      WHERE id = client_id
    )
  );

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';