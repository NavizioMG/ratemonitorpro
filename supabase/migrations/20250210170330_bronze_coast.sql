/*
  # Add Stripe Integration Tables

  1. New Tables
    - subscription_plans
      - Store available subscription plans
    - subscriptions
      - Track user subscriptions
    - billing_history
      - Store payment history

  2. Security
    - Enable RLS
    - Add policies for user access
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

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create billing_history table
CREATE TABLE billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL,
  stripe_invoice_id TEXT UNIQUE,
  invoice_pdf TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- Create policies for subscription_plans
CREATE POLICY "Anyone can view active plans"
  ON subscription_plans FOR SELECT
  USING (active = true);

-- Create policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for billing_history
CREATE POLICY "Users can view own billing history"
  ON billing_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX billing_history_user_id_idx ON billing_history(user_id);
CREATE INDEX subscription_plans_active_idx ON subscription_plans(active);

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

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';