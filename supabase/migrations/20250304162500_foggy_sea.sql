-- Safely create subscription_plans table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plans') THEN
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
  END IF;
END $$;

-- Safely create subscriptions table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscriptions') THEN
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
  END IF;
END $$;

-- Safely create billing_history table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_history') THEN
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
  END IF;
END $$;

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active plans" ON subscription_plans;
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can view own billing history" ON billing_history;

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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS billing_history_user_id_idx ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS subscription_plans_active_idx ON subscription_plans(active);

-- Insert default plan if it doesn't exist
INSERT INTO subscription_plans 
  (stripe_price_id, name, description, price, interval, features, max_clients, max_alerts)
SELECT
  'price_standard',
  'Standard',
  'Everything you need to grow your mortgage business',
  49.99,
  'month',
  ARRAY[
    'Unlimited clients',
    'Real-time rate monitoring',
    'Smart notifications',
    'Client management',
    'Rate analytics',
    'Email support',
    'API access'
  ],
  -1,
  -1
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans WHERE stripe_price_id = 'price_standard'
);

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';