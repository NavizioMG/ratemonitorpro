/*
  # Add target rate to mortgages table

  1. Changes
    - Add target_rate column to mortgages table
    - Add default value and not null constraint
    - Add check constraint for valid rate range

  2. Security
    - No changes to RLS policies needed
*/

ALTER TABLE mortgages
ADD COLUMN IF NOT EXISTS target_rate DECIMAL(5,2) NOT NULL DEFAULT 0
CHECK (target_rate >= 0 AND target_rate <= 15);

-- Update existing records to have a target rate slightly below their current rate
UPDATE mortgages
SET target_rate = GREATEST(current_rate - 0.5, 0)
WHERE target_rate = 0;