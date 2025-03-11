/*
  # Add notifications system

  1. New Tables
    - notifications
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - title (text)
      - message (text)
      - type (text)
      - read (boolean)
      - created_at (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Drop table if it exists
DROP TABLE IF EXISTS notifications;

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage notifications"
  ON notifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_created_at_idx ON notifications(created_at);
CREATE INDEX notifications_read_idx ON notifications(read);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';