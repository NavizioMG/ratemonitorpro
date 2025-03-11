/*
  # Fix mortgages table schema

  1. Changes
    - Add target_rate column with proper constraints
    - Add validation checks for rate values
    - Add indexes for performance

  2. Security
    - Maintain existing RLS policies
*/

-- Ensure target_rate column exists with proper constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mortgages' AND column_name = 'target_rate'
  ) THEN
    ALTER TABLE mortgages
    ADD COLUMN target_rate DECIMAL(5,2) NOT NULL DEFAULT 0
    CHECK (target_rate >= 0 AND target_rate <= 15);
  END IF;
END $$;

-- Add validation checks for rate values
ALTER TABLE mortgages
ADD CONSTRAINT mortgages_current_rate_check 
CHECK (current_rate >= 0 AND current_rate <= 15);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS mortgages_client_id_idx ON mortgages(client_id);
CREATE INDEX IF NOT EXISTS mortgages_rates_idx ON mortgages(current_rate, target_rate);

-- Update existing records to have a reasonable target rate
UPDATE mortgages
SET target_rate = GREATEST(current_rate - 0.5, 0)
WHERE target_rate = 0;