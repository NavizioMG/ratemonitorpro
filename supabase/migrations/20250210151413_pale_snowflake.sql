-- Safely add GHL location ID column if it doesn't exist
DO $$ 
BEGIN
  -- Check if column exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'ghl_location_id'
  ) THEN
    -- Add the column if it doesn't exist
    ALTER TABLE profiles 
    ADD COLUMN ghl_location_id TEXT;
  END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS profiles_ghl_location_id_idx 
ON profiles(ghl_location_id);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';