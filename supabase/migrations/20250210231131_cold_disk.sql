/*
  # Add Address Fields to Clients Table

  1. Changes
    - Add address fields to clients table
    - Add indexes for performance
    - Update existing RLS policies
  
  2. Details
    - Add address, city, state, zip columns
    - Add appropriate indexes
    - Maintain existing RLS policies
*/

-- Add address fields to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip TEXT;

-- Create indexes for address fields
CREATE INDEX IF NOT EXISTS clients_city_state_idx ON clients(city, state);
CREATE INDEX IF NOT EXISTS clients_zip_idx ON clients(zip);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';