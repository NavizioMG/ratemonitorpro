/*
  # Update rate columns to handle unrestricted decimals

  1. Changes
    - Modify rate columns to use unrestricted numeric type
    - Remove check constraints on rate columns
    - Update indexes for better performance

  2. Notes
    - This allows for any valid decimal number
    - Preserves existing data
    - Maintains indexing for performance
*/

-- Drop existing check constraints if they exist
ALTER TABLE mortgages DROP CONSTRAINT IF EXISTS mortgages_current_rate_check;
ALTER TABLE mortgages DROP CONSTRAINT IF EXISTS mortgages_target_rate_check;

-- Modify rate columns to use unrestricted numeric type
ALTER TABLE mortgages 
  ALTER COLUMN current_rate TYPE numeric USING current_rate::numeric,
  ALTER COLUMN target_rate TYPE numeric USING target_rate::numeric;

-- Recreate index with new column types
DROP INDEX IF EXISTS mortgages_rates_idx;
CREATE INDEX mortgages_rates_idx ON mortgages(current_rate, target_rate);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';