/*
  # Initial Schema Setup for Mortgage Rate Monitoring System

  1. New Tables
    - `profiles`
      - Extended user profile information
      - Linked to auth.users
    - `clients`
      - Client information
      - Linked to broker (profile)
    - `mortgages`
      - Current mortgage details for clients
    - `rate_history`
      - Daily mortgage rate tracking
    - `rate_alerts`
      - Target rate alerts for clients

  2. Security
    - RLS policies for all tables
    - Brokers can only access their own clients and related data
*/

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID REFERENCES profiles(id) NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create mortgages table
CREATE TABLE mortgages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  current_rate DECIMAL(5,2) NOT NULL,
  loan_amount DECIMAL(12,2) NOT NULL,
  term_years INTEGER NOT NULL,
  start_date DATE NOT NULL,
  lender TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create rate_history table
CREATE TABLE rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_date DATE NOT NULL,
  rate_type TEXT NOT NULL,
  rate_value DECIMAL(5,2) NOT NULL,
  term_years INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create rate_alerts table
CREATE TABLE rate_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mortgage_id UUID REFERENCES mortgages(id) NOT NULL,
  target_rate DECIMAL(5,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortgages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_alerts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Clients policies
CREATE POLICY "Brokers can view own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (broker_id = auth.uid());

CREATE POLICY "Brokers can insert own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (broker_id = auth.uid());

CREATE POLICY "Brokers can update own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (broker_id = auth.uid());

CREATE POLICY "Brokers can delete own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (broker_id = auth.uid());

-- Mortgages policies
CREATE POLICY "Brokers can view client mortgages"
  ON mortgages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = mortgages.client_id
      AND clients.broker_id = auth.uid()
    )
  );

-- Rate history policies
CREATE POLICY "Anyone can view rate history"
  ON rate_history FOR SELECT
  TO authenticated
  USING (true);

-- Rate alerts policies
CREATE POLICY "Brokers can manage alerts"
  ON rate_alerts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mortgages
      JOIN clients ON clients.id = mortgages.client_id
      WHERE mortgages.id = rate_alerts.mortgage_id
      AND clients.broker_id = auth.uid()
    )
  );