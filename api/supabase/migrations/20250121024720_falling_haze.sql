/*
  # Fix Rate History RLS Policies

  1. Changes
    - Drop existing rate_history policies
    - Add new policies to allow:
      - Anyone to read rate history
      - Service role to insert rate history
      - Service role to update rate history
  
  2. Security
    - Enable RLS on rate_history table
    - Add proper policies for read/write access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view rate history" ON rate_history;

-- Ensure RLS is enabled
ALTER TABLE rate_history ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable read access for all users"
  ON rate_history FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for service role"
  ON rate_history FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Enable update for service role"
  ON rate_history FOR UPDATE
  TO service_role
  USING (true);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS rate_history_date_idx ON rate_history(rate_date);
CREATE INDEX IF NOT EXISTS rate_history_term_idx ON rate_history(term_years);