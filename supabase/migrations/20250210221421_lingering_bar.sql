/*
  # Fix Pipeline Schema

  1. Changes
    - Add loan_type and contact fields to deals table
    - Add proper constraints and defaults
    - Update indexes for performance
    - Add safe trigger creation
  
  2. Security
    - Maintain existing RLS policies
*/

-- Safely add new columns to deals table
DO $$ 
BEGIN
  -- Add loan_type if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deals' AND column_name = 'loan_type'
  ) THEN
    ALTER TABLE deals
    ADD COLUMN loan_type TEXT CHECK (loan_type IN ('purchase', 'refinance', 'reverse'));
  END IF;

  -- Add lead_source if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deals' AND column_name = 'lead_source'
  ) THEN
    ALTER TABLE deals ADD COLUMN lead_source TEXT;
  END IF;

  -- Add lead_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deals' AND column_name = 'lead_status'
  ) THEN
    ALTER TABLE deals
    ADD COLUMN lead_status TEXT CHECK (lead_status IN ('new', 'contacted', 'qualified', 'unqualified'));
  END IF;

  -- Add contact fields if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deals' AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE deals ADD COLUMN contact_email TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deals' AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE deals ADD COLUMN contact_phone TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deals' AND column_name = 'contact_preference'
  ) THEN
    ALTER TABLE deals
    ADD COLUMN contact_preference TEXT CHECK (contact_preference IN ('email', 'phone', 'any'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deals' AND column_name = 'last_contact_date'
  ) THEN
    ALTER TABLE deals ADD COLUMN last_contact_date TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deals' AND column_name = 'next_contact_date'
  ) THEN
    ALTER TABLE deals ADD COLUMN next_contact_date TIMESTAMPTZ;
  END IF;
END $$;

-- Safely create indexes
CREATE INDEX IF NOT EXISTS deals_loan_type_idx ON deals(loan_type);
CREATE INDEX IF NOT EXISTS deals_lead_status_idx ON deals(lead_status);
CREATE INDEX IF NOT EXISTS deals_contact_email_idx ON deals(contact_email);
CREATE INDEX IF NOT EXISTS deals_last_contact_date_idx ON deals(last_contact_date);
CREATE INDEX IF NOT EXISTS deals_next_contact_date_idx ON deals(next_contact_date);

-- Safely update pipeline stages
DO $$
BEGIN
  -- Only update if stages exist
  IF EXISTS (SELECT 1 FROM pipeline_stages WHERE position = 1) THEN
    UPDATE pipeline_stages 
    SET name = 'New Lead', description = 'Initial contact or referral'
    WHERE position = 1;
  END IF;

  IF EXISTS (SELECT 1 FROM pipeline_stages WHERE position = 2) THEN
    UPDATE pipeline_stages 
    SET name = 'Contacted', description = 'Initial communication made'
    WHERE position = 2;
  END IF;

  IF EXISTS (SELECT 1 FROM pipeline_stages WHERE position = 3) THEN
    UPDATE pipeline_stages 
    SET name = 'Qualified', description = 'Lead qualified and ready for application'
    WHERE position = 3;
  END IF;

  IF EXISTS (SELECT 1 FROM pipeline_stages WHERE position = 4) THEN
    UPDATE pipeline_stages 
    SET name = 'Application', description = 'Loan application in progress'
    WHERE position = 4;
  END IF;

  IF EXISTS (SELECT 1 FROM pipeline_stages WHERE position = 5) THEN
    UPDATE pipeline_stages 
    SET name = 'Processing', description = 'Application being processed'
    WHERE position = 5;
  END IF;

  IF EXISTS (SELECT 1 FROM pipeline_stages WHERE position = 6) THEN
    UPDATE pipeline_stages 
    SET name = 'Approved', description = 'Loan approved'
    WHERE position = 6;
  END IF;

  IF EXISTS (SELECT 1 FROM pipeline_stages WHERE position = 7) THEN
    UPDATE pipeline_stages 
    SET name = 'Closed', description = 'Loan closed and funded'
    WHERE position = 7;
  END IF;
END $$;

-- Safely create or replace function for last_contact_date
CREATE OR REPLACE FUNCTION update_deal_last_contact()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE deals
  SET last_contact_date = CURRENT_TIMESTAMP
  WHERE id = NEW.deal_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Safely create triggers
DO $$
BEGIN
  -- Drop existing triggers if they exist
  DROP TRIGGER IF EXISTS update_deal_last_contact_on_note ON notes;
  DROP TRIGGER IF EXISTS update_deal_last_contact_on_activity ON activities;

  -- Create new triggers
  CREATE TRIGGER update_deal_last_contact_on_note
    AFTER INSERT ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_deal_last_contact();

  CREATE TRIGGER update_deal_last_contact_on_activity
    AFTER INSERT ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_deal_last_contact();
END $$;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';