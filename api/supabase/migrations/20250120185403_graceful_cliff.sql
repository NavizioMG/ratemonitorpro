-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- Create new policies with proper permissions
CREATE POLICY "Enable read access for all users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for users based on user_id"
  ON profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create initial admin user
DO $$
DECLARE
  raw_user_meta_data jsonb;
  raw_app_meta_data jsonb;
BEGIN
  raw_user_meta_data := '{"full_name": "Admin User", "company_name": "Demo Company"}';
  raw_app_meta_data := '{"provider": "email", "providers": ["email"]}';

  -- Insert admin user if not exists
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) 
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    'f74385f6-1f2c-4409-8275-44c86c0bee83',
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    raw_app_meta_data,
    raw_user_meta_data,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert corresponding profile
  INSERT INTO profiles (id, full_name, company_name)
  VALUES (
    'f74385f6-1f2c-4409-8275-44c86c0bee83',
    'Admin User',
    'Demo Company'
  )
  ON CONFLICT (id) DO NOTHING;
END $$;