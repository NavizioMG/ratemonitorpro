/*
  # Fix rate columns and constraints

  1. Changes
    - Set proper decimal precision for rate columns
    - Add appropriate constraints
    - Keep rates in mortgages table
    - Add indexes for performance

  2. Details
    - Use DECIMAL(5,3) for rates to allow values like 6.125
    - Add check constraints to ensure valid rate ranges
    - Maintain existing table structure
*/

-- Modify rate columns to use proper decimal type
ALTER TABLE mortgages 
  ALTER COLUMN current_rate TYPE DECIMAL(5,3),
  ALTER COLUMN target_rate TYPE DECIMAL(5,3);

-- Add check constraints for valid rate ranges
ALTER TABLE mortgages
  ADD CONSTRAINT mortgages_current_rate_check 
    CHECK (current_rate >= 0 AND current_rate <= 15),
  ADD CONSTRAINT mortgages_target_rate_check 
    CHECK (target_rate >= 0 AND target_rate <= 15);

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS mortgages_rates_idx 
  ON mortgages(current_rate, target_rate);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';