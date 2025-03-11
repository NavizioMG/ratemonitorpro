/*
  # Add Pipeline Management Schema

  1. New Tables
    - pipeline_stages
      - Standard pipeline stages for loan process
    - deals
      - Track opportunities through pipeline
    - tasks
      - Track tasks related to deals
    - notes
      - Store notes for deals
    - activities
      - Log all pipeline activities

  2. Security
    - Enable RLS on all tables
    - Add policies for brokers
    - Ensure data isolation

  3. Relationships
    - Deals belong to clients
    - Tasks belong to deals
    - Notes belong to deals
    - Activities track all changes
*/

-- Create pipeline_stages table
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  stage_id UUID REFERENCES pipeline_stages(id) NOT NULL,
  title TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  probability INTEGER NOT NULL DEFAULT 0,
  expected_close_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies for pipeline_stages
CREATE POLICY "Anyone can view pipeline stages"
  ON pipeline_stages FOR SELECT
  USING (true);

-- Create policies for deals
CREATE POLICY "Brokers can view own deals"
  ON deals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = deals.client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Brokers can create deals"
  ON deals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Brokers can update own deals"
  ON deals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = deals.client_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Brokers can delete own deals"
  ON deals FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = deals.client_id
      AND clients.broker_id = auth.uid()
    )
  );

-- Create policies for tasks
CREATE POLICY "Users can view tasks for their deals"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = tasks.deal_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks for their deals"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = deal_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks for their deals"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = tasks.deal_id
      AND clients.broker_id = auth.uid()
    )
  );

-- Create policies for notes
CREATE POLICY "Users can view notes for their deals"
  ON notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = notes.deal_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Users can create notes for their deals"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = deal_id
      AND clients.broker_id = auth.uid()
    )
  );

-- Create policies for activities
CREATE POLICY "Users can view activities for their deals"
  ON activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = activities.deal_id
      AND clients.broker_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX deals_client_id_idx ON deals(client_id);
CREATE INDEX deals_stage_id_idx ON deals(stage_id);
CREATE INDEX tasks_deal_id_idx ON tasks(deal_id);
CREATE INDEX notes_deal_id_idx ON notes(deal_id);
CREATE INDEX activities_deal_id_idx ON activities(deal_id);

-- Insert default pipeline stages
INSERT INTO pipeline_stages (name, description, color, position) VALUES
  ('Lead', 'Initial contact and qualification', 'bg-gray-100', 1),
  ('Application', 'Loan application in progress', 'bg-blue-100', 2),
  ('Processing', 'Document collection and processing', 'bg-yellow-100', 3),
  ('Underwriting', 'Loan underwriting in progress', 'bg-purple-100', 4),
  ('Approved', 'Loan approved with conditions', 'bg-green-100', 5),
  ('Closing', 'Preparing for closing', 'bg-orange-100', 6),
  ('Funded', 'Loan funded and closed', 'bg-emerald-100', 7);

-- Add cascade delete triggers
CREATE OR REPLACE FUNCTION delete_deal_data()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM tasks WHERE deal_id = OLD.id;
  DELETE FROM notes WHERE deal_id = OLD.id;
  DELETE FROM activities WHERE deal_id = OLD.id;
  RETURN OLD;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_delete_deal_data
  BEFORE DELETE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION delete_deal_data();

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';