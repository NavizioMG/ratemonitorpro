/*
  # Fix mortgages table schema and refresh cache

  1. Changes
    - Ensure target_rate column exists
    - Add proper constraints and indexes
    - Force schema cache refresh

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing check constraints to avoid conflicts
ALTER TABLE mortgages DROP CONSTRAINT IF EXISTS mortgages_current_rate_check;
ALTER TABLE mortgages DROP CONSTRAINT IF EXISTS mortgages_target_rate_check;

-- Ensure target_rate column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mortgages' AND column_name = 'target_rate'
  ) THEN
    ALTER TABLE mortgages
    ADD COLUMN target_rate DECIMAL(5,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add validation checks for rate values
ALTER TABLE mortgages
ADD CONSTRAINT mortgages_current_rate_check 
CHECK (current_rate >= 0 AND current_rate <= 15);

ALTER TABLE mortgages
ADD CONSTRAINT mortgages_target_rate_check 
CHECK (target_rate >= 0 AND target_rate <= 15);

-- Add indexes for performance if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'mortgages' AND indexname = 'mortgages_client_id_idx'
  ) THEN
    CREATE INDEX mortgages_client_id_idx ON mortgages(client_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'mortgages' AND indexname = 'mortgages_rates_idx'
  ) THEN
    CREATE INDEX mortgages_rates_idx ON mortgages(current_rate, target_rate);
  END IF;
END $$;

-- Update existing records to have a reasonable target rate
UPDATE mortgages
SET target_rate = GREATEST(current_rate - 0.5, 0)
WHERE target_rate = 0;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';