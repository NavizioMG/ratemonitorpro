/*
  # Fix rate_history RLS policies

  1. Changes
    - Drop existing policies
    - Add new comprehensive policies for rate_history table
    - Enable proper access for authenticated users and service role
    - Add function for safe rate insertion
  
  2. Security
    - Maintain read access for all authenticated users
    - Allow insert/update for authenticated users
    - Keep service role access for admin functions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON rate_history;
DROP POLICY IF EXISTS "Enable insert/update for service role only" ON rate_history;

-- Ensure RLS is enabled
ALTER TABLE rate_history ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Anyone can view rates"
  ON rate_history FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert rates"
  ON rate_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update rates"
  ON rate_history FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create or replace the rate insertion function with proper permissions
CREATE OR REPLACE FUNCTION public.insert_daily_rate(
  p_rate_date DATE,
  p_rate_type TEXT,
  p_rate_value DECIMAL,
  p_term_years INTEGER
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO rate_history (rate_date, rate_type, rate_value, term_years)
  VALUES (p_rate_date, p_rate_type, p_rate_value, p_term_years)
  ON CONFLICT (rate_date, term_years) 
  WHERE rate_type = 'Fixed'
  DO UPDATE SET
    rate_value = EXCLUDED.rate_value,
    created_at = now();
END;
$$;

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.insert_daily_rate TO authenticated;
GRANT ALL ON TABLE rate_history TO authenticated;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';