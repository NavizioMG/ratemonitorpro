/*
  # Create Rate History Table
  
  1. New Tables
    - rate_history
      - Stores daily mortgage rates
      - Includes rate value, date, term years
      - Enforces data validation
  
  2. Security
    - Enable RLS
    - Allow public read access
    - Restrict write access to service role
*/

-- Create rate_history table
CREATE TABLE IF NOT EXISTS rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_date DATE NOT NULL,
  rate_type TEXT NOT NULL,
  rate_value DECIMAL(5,3) NOT NULL CHECK (rate_value >= 0 AND rate_value <= 15),
  term_years INTEGER NOT NULL CHECK (term_years > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS rate_history_date_idx ON rate_history(rate_date);
CREATE INDEX IF NOT EXISTS rate_history_term_idx ON rate_history(term_years);

-- Create unique constraint for daily rates
CREATE UNIQUE INDEX IF NOT EXISTS rate_history_unique_daily_rate 
  ON rate_history(rate_date, term_years) 
  WHERE rate_type = 'Fixed';

-- Enable Row Level Security
ALTER TABLE rate_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
  ON rate_history FOR SELECT
  USING (true);

CREATE POLICY "Enable insert/update for service role only"
  ON rate_history FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to safely insert daily rates
CREATE OR REPLACE FUNCTION insert_daily_rate(
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
GRANT EXECUTE ON FUNCTION insert_daily_rate TO service_role;
GRANT ALL ON TABLE rate_history TO service_role;