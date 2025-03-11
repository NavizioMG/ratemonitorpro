/*
  # Add Missing Deal Columns

  1. Changes
    - Add missing columns to deals table
    - Add proper constraints
    - Add indexes for performance
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add missing columns to deals table
DO $$ 
BEGIN
  -- Add first_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deals' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE deals ADD COLUMN first_name TEXT NOT NULL;
  END IF;

  -- Add last_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deals' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE deals ADD COLUMN last_name TEXT NOT NULL;
  END IF;

  -- Add email if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deals' AND column_name = 'email'
  ) THEN
    ALTER TABLE deals ADD COLUMN email TEXT;
  END IF;

  -- Add phone if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deals' AND column_name = 'phone'
  ) THEN
    ALTER TABLE deals ADD COLUMN phone TEXT;
  END IF;

  -- Add notes if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deals' AND column_name = 'notes'
  ) THEN
    ALTER TABLE deals ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS deals_name_idx ON deals(first_name, last_name);
CREATE INDEX IF NOT EXISTS deals_email_idx ON deals(email);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';