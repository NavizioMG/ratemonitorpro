/*
  # Add missing columns to deals table

  1. New Columns
    - loan_amount (DECIMAL)
    - loan_type (TEXT)
    - notes (TEXT)
    - stage_id (UUID)
    - status (TEXT)
    - probability (INTEGER)

  2. Security
    - Maintain existing RLS policies
*/

-- Add missing columns to deals table
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS loan_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS loan_type TEXT CHECK (loan_type IN ('purchase', 'refinance', 'reverse')),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS stage_id UUID REFERENCES pipeline_stages(id),
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'cancelled')),
ADD COLUMN IF NOT EXISTS probability INTEGER NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS deals_loan_amount_idx ON deals(loan_amount);
CREATE INDEX IF NOT EXISTS deals_loan_type_idx ON deals(loan_type);
CREATE INDEX IF NOT EXISTS deals_stage_id_idx ON deals(stage_id);
CREATE INDEX IF NOT EXISTS deals_status_idx ON deals(status);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';