/*
  # Fix authentication system

  1. Changes
    - Drop and recreate profile policies
    - Update admin user if exists, create if not
    - Add performance indexes
  
  2. Security
    - Enable RLS on profiles table
    - Add policies for authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can read any profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(id);

-- Update or create admin user
DO $$
DECLARE
  user_exists boolean;
BEGIN
  -- Check if user exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE id = 'f74385f6-1f2c-4409-8275-44c86c0bee83'
  ) INTO user_exists;

  -- Update user if exists, create if not
  IF user_exists THEN
    UPDATE auth.users
    SET
      email = 'admin@example.com',
      encrypted_password = crypt('password123', gen_salt('bf')),
      email_confirmed_at = now(),
      last_sign_in_at = now(),
      raw_app_meta_data = jsonb_build_object(
        'provider', 'email',
        'providers', array['email']
      ),
      raw_user_meta_data = jsonb_build_object(
        'full_name', 'Admin User',
        'company_name', 'Demo Company'
      ),
      updated_at = now()
    WHERE id = 'f74385f6-1f2c-4409-8275-44c86c0bee83';
  ELSE
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'f74385f6-1f2c-4409-8275-44c86c0bee83',
      'authenticated',
      'authenticated',
      'admin@example.com',
      crypt('password123', gen_salt('bf')),
      now(),
      now(),
      jsonb_build_object(
        'provider', 'email',
        'providers', array['email']
      ),
      jsonb_build_object(
        'full_name', 'Admin User',
        'company_name', 'Demo Company'
      ),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  END IF;

  -- Ensure profile exists
  INSERT INTO profiles (
    id,
    full_name,
    company_name,
    created_at,
    updated_at
  ) VALUES (
    'f74385f6-1f2c-4409-8275-44c86c0bee83',
    'Admin User',
    'Demo Company',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    updated_at = now();
END $$;