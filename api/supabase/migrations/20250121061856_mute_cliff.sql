/*
  # Update rate and loan amount constraints

  1. Changes
    - Remove decimal precision restrictions on rates
    - Remove loan amount restrictions
    - Update existing indexes

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing check constraints
ALTER TABLE mortgages DROP CONSTRAINT IF EXISTS mortgages_current_rate_check;
ALTER TABLE mortgages DROP CONSTRAINT IF EXISTS mortgages_target_rate_check;

-- Modify rate columns to use numeric type without restrictions
ALTER TABLE mortgages 
  ALTER COLUMN current_rate TYPE numeric,
  ALTER COLUMN target_rate TYPE numeric;

-- Drop and recreate index with new column types
DROP INDEX IF EXISTS mortgages_rates_idx;
CREATE INDEX mortgages_rates_idx ON mortgages(current_rate, target_rate);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';