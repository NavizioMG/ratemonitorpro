/*
  # Add Loan Amount Column to Deals Table

  1. Changes
    - Add loan_amount column to deals table
    - Add proper constraints and validation
    - Add index for performance
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add loan_amount column if it doesn't exist
DO $$ 
BEGIN
  -- Add loan_amount if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deals' AND column_name = 'loan_amount'
  ) THEN
    ALTER TABLE deals ADD COLUMN loan_amount DECIMAL(12,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add constraint to ensure positive loan amount
ALTER TABLE deals 
  DROP CONSTRAINT IF EXISTS deals_loan_amount_check,
  ADD CONSTRAINT deals_loan_amount_check 
  CHECK (loan_amount >= 0);

-- Create index for loan amount queries
CREATE INDEX IF NOT EXISTS deals_loan_amount_idx ON deals(loan_amount);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';