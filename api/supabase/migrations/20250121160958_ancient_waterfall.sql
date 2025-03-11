-- Drop existing policies
DROP POLICY IF EXISTS "mortgages_select" ON mortgages;
DROP POLICY IF EXISTS "mortgages_insert" ON mortgages;
DROP POLICY IF EXISTS "mortgages_update" ON mortgages;
DROP POLICY IF EXISTS "mortgages_delete" ON mortgages;

-- Ensure RLS is enabled
ALTER TABLE mortgages ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies
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

-- Create function for cascading deletes if it doesn't exist
CREATE OR REPLACE FUNCTION delete_client_mortgages()
RETURNS TRIGGER AS $func$
BEGIN
  DELETE FROM mortgages WHERE client_id = OLD.id;
  RETURN OLD;
END;
$func$ LANGUAGE plpgsql;

-- Create trigger for cascading deletes if it doesn't exist
DROP TRIGGER IF EXISTS trigger_delete_client_mortgages ON clients;

CREATE TRIGGER trigger_delete_client_mortgages
  BEFORE DELETE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION delete_client_mortgages();

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';