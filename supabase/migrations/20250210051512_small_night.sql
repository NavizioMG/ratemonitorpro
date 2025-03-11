/*
  # Add GHL Location ID to Profiles

  1. Changes
    - Add ghl_location_id column to profiles table
    - Add index for performance
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add GHL location ID column
ALTER TABLE profiles 
ADD COLUMN ghl_location_id TEXT;

-- Add index for performance
CREATE INDEX IF NOT EXISTS profiles_ghl_location_id_idx 
ON profiles(ghl_location_id);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';