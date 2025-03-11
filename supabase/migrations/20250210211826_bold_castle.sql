/*
  # Pipeline Management Enhancements

  1. New Tables
    - deal_checklists
      - Configurable checklists for different deal stages
      - Track required documents and tasks
    - deal_milestones
      - Track key milestones in the deal lifecycle
      - Record completion dates and responsible parties
    - deal_requirements
      - Track specific requirements for each deal
      - Support conditional requirements based on deal type
  
  2. Security
    - Enable RLS on all new tables
    - Add policies for proper access control
    - Ensure data isolation between brokers
*/

-- Create deal_checklists table
CREATE TABLE deal_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  due_date DATE,
  category TEXT NOT NULL,
  order_position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create deal_milestones table
CREATE TABLE deal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  completed_date DATE,
  completed_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  order_position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_milestone_status CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed', 'cancelled'))
);

-- Create deal_requirements table
CREATE TABLE deal_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) NOT NULL,
  requirement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_requirement_status CHECK (status IN ('pending', 'in_progress', 'verified', 'waived', 'failed'))
);

-- Enable RLS
ALTER TABLE deal_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_requirements ENABLE ROW LEVEL SECURITY;

-- Create policies for deal_checklists
CREATE POLICY "Users can view checklists for their deals"
  ON deal_checklists FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = deal_checklists.deal_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage checklists for their deals"
  ON deal_checklists FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = deal_id
      AND clients.broker_id = auth.uid()
    )
  );

-- Create policies for deal_milestones
CREATE POLICY "Users can view milestones for their deals"
  ON deal_milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = deal_milestones.deal_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage milestones for their deals"
  ON deal_milestones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = deal_id
      AND clients.broker_id = auth.uid()
    )
  );

-- Create policies for deal_requirements
CREATE POLICY "Users can view requirements for their deals"
  ON deal_requirements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = deal_requirements.deal_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage requirements for their deals"
  ON deal_requirements FOR ALL
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
CREATE INDEX deal_checklists_deal_id_idx ON deal_checklists(deal_id);
CREATE INDEX deal_checklists_category_idx ON deal_checklists(category);
CREATE INDEX deal_milestones_deal_id_idx ON deal_milestones(deal_id);
CREATE INDEX deal_milestones_status_idx ON deal_milestones(status);
CREATE INDEX deal_requirements_deal_id_idx ON deal_requirements(deal_id);
CREATE INDEX deal_requirements_status_idx ON deal_requirements(status);
CREATE INDEX deal_requirements_type_idx ON deal_requirements(requirement_type);

-- Add cascade delete triggers
CREATE OR REPLACE FUNCTION delete_deal_checklist_data()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM deal_checklists WHERE deal_id = OLD.id;
  DELETE FROM deal_milestones WHERE deal_id = OLD.id;
  DELETE FROM deal_requirements WHERE deal_id = OLD.id;
  RETURN OLD;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_delete_deal_checklist_data
  BEFORE DELETE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION delete_deal_checklist_data();

-- Insert default checklist categories
INSERT INTO deal_checklists (deal_id, title, description, category, order_position)
SELECT 
  d.id,
  'Income Verification',
  'Verify client income sources and documentation',
  'Documentation',
  1
FROM deals d
WHERE NOT EXISTS (
  SELECT 1 FROM deal_checklists dc 
  WHERE dc.deal_id = d.id AND dc.title = 'Income Verification'
);

INSERT INTO deal_checklists (deal_id, title, description, category, order_position)
SELECT 
  d.id,
  'Property Appraisal',
  'Schedule and complete property appraisal',
  'Property',
  2
FROM deals d
WHERE NOT EXISTS (
  SELECT 1 FROM deal_checklists dc 
  WHERE dc.deal_id = d.id AND dc.title = 'Property Appraisal'
);

-- Insert default milestones
INSERT INTO deal_milestones (deal_id, title, description, status, order_position)
SELECT 
  d.id,
  'Application Submitted',
  'Initial loan application completed and submitted',
  'pending',
  1
FROM deals d
WHERE NOT EXISTS (
  SELECT 1 FROM deal_milestones dm 
  WHERE dm.deal_id = d.id AND dm.title = 'Application Submitted'
);

INSERT INTO deal_milestones (deal_id, title, description, status, order_position)
SELECT 
  d.id,
  'Initial Approval',
  'Preliminary loan approval received',
  'pending',
  2
FROM deals d
WHERE NOT EXISTS (
  SELECT 1 FROM deal_milestones dm 
  WHERE dm.deal_id = d.id AND dm.title = 'Initial Approval'
);

-- Insert default requirements
INSERT INTO deal_requirements (deal_id, requirement_type, title, description, status)
SELECT 
  d.id,
  'Documentation',
  'Proof of Income',
  'Last 2 years W-2s and recent pay stubs',
  'pending'
FROM deals d
WHERE NOT EXISTS (
  SELECT 1 FROM deal_requirements dr 
  WHERE dr.deal_id = d.id AND dr.title = 'Proof of Income'
);

INSERT INTO deal_requirements (deal_id, requirement_type, title, description, status)
SELECT 
  d.id,
  'Documentation',
  'Bank Statements',
  'Last 2 months of bank statements from all accounts',
  'pending'
FROM deals d
WHERE NOT EXISTS (
  SELECT 1 FROM deal_requirements dr 
  WHERE dr.deal_id = d.id AND dr.title = 'Bank Statements'
);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';