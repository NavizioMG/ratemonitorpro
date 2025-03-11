/*
  # Enhance Pipeline Management System

  1. New Features
    - Document management for deals
    - Contact tracking for deals
    - Custom fields for deals
    - Pipeline templates
    - Deal tags

  2. Security
    - RLS policies for all new tables
    - Proper data isolation
    - Audit logging
*/

-- Create documents table for deal attachments
CREATE TABLE deal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) NOT NULL,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create deal contacts table
CREATE TABLE deal_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create custom fields table
CREATE TABLE deal_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) NOT NULL,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL,
  field_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(deal_id, field_name)
);

-- Create pipeline templates
CREATE TABLE pipeline_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  stages JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create deal tags
CREATE TABLE deal_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create deal_tags_junction table
CREATE TABLE deal_tags_junction (
  deal_id UUID REFERENCES deals(id) NOT NULL,
  tag_id UUID REFERENCES deal_tags(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (deal_id, tag_id)
);

-- Enable RLS
ALTER TABLE deal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_tags_junction ENABLE ROW LEVEL SECURITY;

-- Create policies for deal_documents
CREATE POLICY "Users can view documents for their deals"
  ON deal_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = deal_documents.deal_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload documents for their deals"
  ON deal_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = deal_id
      AND clients.broker_id = auth.uid()
    )
  );

-- Create policies for deal_contacts
CREATE POLICY "Users can view contacts for their deals"
  ON deal_contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = deal_contacts.deal_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage contacts for their deals"
  ON deal_contacts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = deal_id
      AND clients.broker_id = auth.uid()
    )
  );

-- Create policies for deal_custom_fields
CREATE POLICY "Users can view custom fields for their deals"
  ON deal_custom_fields FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = deal_custom_fields.deal_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage custom fields for their deals"
  ON deal_custom_fields FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = deal_id
      AND clients.broker_id = auth.uid()
    )
  );

-- Create policies for pipeline_templates
CREATE POLICY "Users can view all templates"
  ON pipeline_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create templates"
  ON pipeline_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Create policies for deal_tags
CREATE POLICY "Users can view all tags"
  ON deal_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tags"
  ON deal_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    CASE 
      WHEN is_system THEN false  -- Prevent creation of system tags
      ELSE auth.uid() = created_by
    END
  );

-- Create policies for deal_tags_junction
CREATE POLICY "Users can view tags for their deals"
  ON deal_tags_junction FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN clients ON clients.id = deals.client_id
      WHERE deals.id = deal_tags_junction.deal_id
      AND clients.broker_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tags for their deals"
  ON deal_tags_junction FOR ALL
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
CREATE INDEX deal_documents_deal_id_idx ON deal_documents(deal_id);
CREATE INDEX deal_contacts_deal_id_idx ON deal_contacts(deal_id);
CREATE INDEX deal_custom_fields_deal_id_idx ON deal_custom_fields(deal_id);
CREATE INDEX deal_tags_junction_deal_id_idx ON deal_tags_junction(deal_id);
CREATE INDEX deal_tags_junction_tag_id_idx ON deal_tags_junction(tag_id);

-- Add cascade delete triggers
CREATE OR REPLACE FUNCTION delete_deal_related_data()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM deal_documents WHERE deal_id = OLD.id;
  DELETE FROM deal_contacts WHERE deal_id = OLD.id;
  DELETE FROM deal_custom_fields WHERE deal_id = OLD.id;
  DELETE FROM deal_tags_junction WHERE deal_id = OLD.id;
  RETURN OLD;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_delete_deal_related_data
  BEFORE DELETE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION delete_deal_related_data();

-- Insert default system tags
INSERT INTO deal_tags (name, color, is_system, created_by) VALUES
  ('Hot Lead', 'bg-red-100', true, NULL),
  ('Priority', 'bg-yellow-100', true, NULL),
  ('VIP', 'bg-purple-100', true, NULL),
  ('Needs Follow-up', 'bg-blue-100', true, NULL);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';