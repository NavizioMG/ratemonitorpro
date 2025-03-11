/*
  # Enhance Deals Table

  1. New Fields
    - referral_source: Track lead sources
    - loss_reason: Document why deals fall through
    - commission_amount: Track potential earnings
    - priority: Deal prioritization
    - next_action_date: Track when next action is needed
    - last_contact_date: Track client engagement

  2. Enhancements
    - Add check constraints for data validation
    - Add indexes for performance
*/

-- Add new columns to deals table
ALTER TABLE deals
ADD COLUMN referral_source TEXT,
ADD COLUMN loss_reason TEXT,
ADD COLUMN commission_amount DECIMAL(12,2),
ADD COLUMN priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
ADD COLUMN next_action_date DATE,
ADD COLUMN last_contact_date DATE;

-- Add check constraint for commission amount
ALTER TABLE deals
ADD CONSTRAINT deals_commission_amount_check
CHECK (commission_amount >= 0);

-- Add check constraint for status
ALTER TABLE deals
ADD CONSTRAINT deals_status_check
CHECK (status IN ('active', 'won', 'lost', 'cancelled'));

-- Add check constraint for probability
ALTER TABLE deals
ADD CONSTRAINT deals_probability_check
CHECK (probability >= 0 AND probability <= 100);

-- Create indexes for new columns
CREATE INDEX deals_priority_idx ON deals(priority);
CREATE INDEX deals_next_action_date_idx ON deals(next_action_date);
CREATE INDEX deals_last_contact_date_idx ON deals(last_contact_date);

-- Create function to update last_contact_date
CREATE OR REPLACE FUNCTION update_deal_last_contact()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE deals
  SET last_contact_date = CURRENT_DATE,
      updated_at = now()
  WHERE id = NEW.deal_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to update last_contact_date
CREATE TRIGGER update_deal_last_contact_on_note
  AFTER INSERT ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_deal_last_contact();

CREATE TRIGGER update_deal_last_contact_on_activity
  AFTER INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_deal_last_contact();

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';