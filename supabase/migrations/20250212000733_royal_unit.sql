/*
  # Add GHL Sub-accounts Table

  1. New Tables
    - `ghl_subaccounts`
      - Stores GHL sub-account information for each user
      - Links to auth.users
      - Stores GHL location ID and API key

  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Create ghl_subaccounts table
CREATE TABLE ghl_subaccounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  ghl_location_id TEXT NOT NULL,
  ghl_api_key TEXT NOT NULL,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(ghl_location_id)
);

-- Enable RLS
ALTER TABLE ghl_subaccounts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own GHL account"
  ON ghl_subaccounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own GHL account"
  ON ghl_subaccounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX ghl_subaccounts_user_id_idx ON ghl_subaccounts(user_id);
CREATE INDEX ghl_subaccounts_ghl_location_id_idx ON ghl_subaccounts(ghl_location_id);

-- Add updated_at trigger
CREATE TRIGGER update_ghl_subaccounts_updated_at
  BEFORE UPDATE ON ghl_subaccounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();