/*
  # Fix decimal handling for rate columns

  1. Changes
    - Modify rate columns to use numeric type with proper precision
    - Remove any remaining check constraints
    - Update indexes for better performance

  2. Notes
    - Allows decimal numbers with up to 3 decimal places
    - Preserves existing data
    - Maintains indexing for performance
*/

-- Drop any existing check constraints
ALTER TABLE mortgages DROP CONSTRAINT IF EXISTS mortgages_current_rate_check;
ALTER TABLE mortgages DROP CONSTRAINT IF EXISTS mortgages_target_rate_check;

-- Modify rate columns to use numeric type with proper precision
ALTER TABLE mortgages 
  ALTER COLUMN current_rate TYPE numeric(6,3) USING current_rate::numeric(6,3),
  ALTER COLUMN target_rate TYPE numeric(6,3) USING target_rate::numeric(6,3);

-- Recreate index with new column types
DROP INDEX IF EXISTS mortgages_rates_idx;
CREATE INDEX mortgages_rates_idx ON mortgages(current_rate, target_rate);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';