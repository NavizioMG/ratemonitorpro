# Deployment Guide

## Prerequisites
- Node.js 20.x
- npm 9.x
- Supabase CLI
- Netlify CLI

## Environment Setup
1. Copy the example environment file:
   ```bash
   cp .env.example .env

   Update the .env file with your actual development values.

Ensure all production secrets (e.g., STRIPE_SECRET_KEY_LIVE, APP_URL) are set in your Supabase project and Netlify site settings.

Database Deployment
Apply the latest database migrations:

Bash

supabase db push
Add the has_seen_welcome column for the one-time welcome modal (if not already in migrations):

SQL

ALTER TABLE profiles ADD COLUMN has_seen_welcome BOOLEAN DEFAULT false;
Edge Functions Deployment
Deploy all necessary server-side functions.

Core Functions:

Bash

supabase functions deploy create-checkout-session
supabase functions deploy verify-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy fetch-rates
Scheduled Functions (if applicable):

Bash

supabase functions deploy scheduled-rates
Billing/Subscription Functions:

Bash

supabase functions deploy get-subscription
supabase functions deploy cancel-subscription
supabase functions deploy get-billing-history
Frontend Deployment
Build the application for production:

Bash

npm run build
Deploy the contents of the dist folder to Netlify:

Bash

netlify deploy --prod
Post-Deployment Checklist
Verify Environment Variables: Double-check that all secrets are correctly set for both your Supabase functions and your Netlify frontend.

Test Authentication: Ensure you can log in and log out successfully.

Test the Full Signup Flow: This is the most critical test.

Create a new account.

Complete a payment through the Stripe checkout.

Verify you are redirected to the welcome screen and then automatically to the dashboard.

Check that the welcome modal appears only once.

Confirm the new user was created in Supabase Auth and a corresponding profile was created in the profiles table.

Verify Rate Monitoring: Check that the CurrentRateCard on the dashboard displays the latest rates.

Production Cleanup
Before launching, run this script in your Supabase SQL Editor to remove all test data.

SQL

-- Clean test users and all related data
DELETE FROM notifications WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@test.com');
DELETE FROM mortgages WHERE client_id IN (SELECT id FROM clients WHERE broker_id IN (SELECT id FROM auth.users WHERE email LIKE '%@test.com'));
DELETE FROM clients WHERE broker_id IN (SELECT id FROM auth.users WHERE email LIKE '%@test.com');
DELETE FROM profiles WHERE id IN (SELECT id FROM auth.users WHERE email LIKE '%@test.com');
DELETE FROM auth.users WHERE email LIKE '%@test.com';