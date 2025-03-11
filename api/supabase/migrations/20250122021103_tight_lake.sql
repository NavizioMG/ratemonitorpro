/*
  # Add Stripe subscription system

  1. New Tables
    - subscription_plans
      - id (uuid, primary key)
      - stripe_price_id (text)
      - name (text)
      - description (text)
      - price (decimal)
      - interval (text)
      - features (text[])
      - max_clients (integer)
      - max_alerts (integer)
      - active (boolean)
      - created_at (timestamptz)
      - updated_at (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for access control
*/

-- Create subscription_plans table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_price_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  interval TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  max_clients INTEGER NOT NULL,
  max_alerts INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active plans"
  ON subscription_plans FOR SELECT
  USING (active = true);

CREATE POLICY "Service role can manage plans"
  ON subscription_plans FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert default plans
INSERT INTO subscription_plans 
  (stripe_price_id, name, description, price, interval, features, max_clients, max_alerts)
VALUES
  (
    'price_starter',
    'Starter',
    'Perfect for mortgage brokers just getting started',
    29.99,
    'month',
    ARRAY[
      'Up to 25 clients',
      'Basic rate monitoring',
      'Email notifications',
      'Basic reporting'
    ],
    25,
    50
  ),
  (
    'price_professional',
    'Professional',
    'For growing mortgage businesses',
    79.99,
    'month',
    ARRAY[
      'Up to 100 clients',
      'Advanced rate monitoring',
      'Priority notifications',
      'Advanced reporting',
      'API access'
    ],
    100,
    200
  ),
  (
    'price_enterprise',
    'Enterprise',
    'For large mortgage operations',
    199.99,
    'month',
    ARRAY[
      'Unlimited clients',
      'Custom rate monitoring',
      'Priority support',
      'Custom reporting',
      'API access',
      'White labeling'
    ],
    -1,
    -1
  );

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX subscription_plans_active_idx ON subscription_plans(active);
CREATE INDEX subscription_plans_price_idx ON subscription_plans(price);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';