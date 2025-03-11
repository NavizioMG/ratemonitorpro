/*
  # Add Email and Deal Management Features

  1. New Tables
    - emails
      - Track all email communications
    - email_templates
      - Store reusable email templates
    - deal_emails
      - Junction table linking deals to emails
  
  2. Security
    - Enable RLS
    - Add policies for email management
    - Ensure proper access controls
*/

-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT email_templates_created_by_check CHECK (
    (is_system = true AND created_by IS NULL) OR
    (is_system = false AND created_by IS NOT NULL)
  )
);

-- Create deal_emails junction table
CREATE TABLE IF NOT EXISTS deal_emails (
  deal_id UUID REFERENCES deals(id) NOT NULL,
  email_id UUID REFERENCES emails(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (deal_id, email_id)
);

-- Enable RLS
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_emails ENABLE ROW LEVEL SECURITY;

-- Create policies for emails
CREATE POLICY "Users can view their sent/received emails"
  ON emails FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR
    recipient_email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create emails"
  ON emails FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Create policies for email_templates
CREATE POLICY "Users can view all templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (
    CASE 
      WHEN is_system THEN false
      ELSE created_by = auth.uid()
    END
  );

-- Create policies for deal_emails
CREATE POLICY "Users can view emails for their deals"
  ON deal_emails FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = deal_emails.deal_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage emails for their deals"
  ON deal_emails FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = deal_id
      AND clients.broker_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX emails_sender_id_idx ON emails(sender_id);
CREATE INDEX emails_recipient_email_idx ON emails(recipient_email);
CREATE INDEX emails_status_idx ON emails(status);
CREATE INDEX email_templates_created_by_idx ON email_templates(created_by);
CREATE INDEX deal_emails_deal_id_idx ON deal_emails(deal_id);
CREATE INDEX deal_emails_email_id_idx ON deal_emails(email_id);

-- Add cascade delete trigger for deals
CREATE OR REPLACE FUNCTION delete_deal_email_data()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM deal_emails WHERE deal_id = OLD.id;
  RETURN OLD;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_delete_deal_email_data
  BEFORE DELETE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION delete_deal_email_data();

-- Insert default email templates
INSERT INTO email_templates (name, subject, body, variables, is_system) VALUES
  (
    'Welcome Email',
    'Welcome to [company_name]',
    'Dear [client_name],\n\nThank you for choosing [company_name] for your mortgage needs. We''re excited to work with you!\n\nBest regards,\n[broker_name]',
    '["company_name", "client_name", "broker_name"]',
    true
  ),
  (
    'Rate Update',
    'Important Rate Update for Your Mortgage',
    'Dear [client_name],\n\nI wanted to let you know that current rates have reached [current_rate]%, which meets your target rate of [target_rate]%.\n\nWould you like to discuss your options?\n\nBest regards,\n[broker_name]',
    '["client_name", "current_rate", "target_rate", "broker_name"]',
    true
  ),
  (
    'Document Request',
    'Required Documents for Your Mortgage Application',
    'Dear [client_name],\n\nTo proceed with your mortgage application, we need the following documents:\n\n[document_list]\n\nPlease provide these at your earliest convenience.\n\nBest regards,\n[broker_name]',
    '["client_name", "document_list", "broker_name"]',
    true
  )
ON CONFLICT DO NOTHING;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';