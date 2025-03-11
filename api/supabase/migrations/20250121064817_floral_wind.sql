/*
  # Fix mortgage table policies

  1. Changes
    - Drop existing policies
    - Create new, simplified policies for mortgages table
    - Add proper cascading delete trigger
    - Ensure proper RLS enforcement

  2. Security
    - Enable RLS
    - Add policies for all CRUD operations
    - Ensure proper broker access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Brokers can view client mortgages" ON mortgages;
DROP POLICY IF EXISTS "Brokers can create mortgages for their clients" ON mortgages;
DROP POLICY IF EXISTS "Brokers can update client mortgages" ON mortgages;
DROP POLICY IF EXISTS "Brokers can delete client mortgages" ON mortgages;

-- Ensure RLS is enabled
ALTER TABLE mortgages ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies
CREATE POLICY "mortgages_select_policy"
  ON mortgages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = mortgages.client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "mortgages_insert_policy"
  ON mortgages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "mortgages_update_policy"
  ON mortgages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "mortgages_delete_policy"
  ON mortgages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
      AND clients.broker_id = auth.uid()
    )
  );

-- Create cascading delete trigger
CREATE OR REPLACE FUNCTION delete_client_mortgages()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM mortgages WHERE client_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_delete_client_mortgages ON clients;

CREATE TRIGGER trigger_delete_client_mortgages
  BEFORE DELETE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION delete_client_mortgages();

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';