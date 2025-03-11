#!/bin/bash

# Check if environment variables are set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "Error: SUPABASE_ACCESS_TOKEN is not set"
  exit 1
fi

if [ -z "$SUPABASE_PROJECT_ID" ]; then
  echo "Error: SUPABASE_PROJECT_ID is not set"
  exit 1
fi

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo "Error: .env file not found"
  exit 1
fi

# Set secrets for each function
echo "Setting up secrets for Edge Functions..."

# Common secrets for all functions
supabase secrets set \
  --project-ref "$SUPABASE_PROJECT_ID" \
  SUPABASE_URL="$SUPABASE_URL" \
  SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"

# FRED API secrets
supabase secrets set \
  --project-ref "$SUPABASE_PROJECT_ID" \
  FRED_API_KEY="$FRED_API_KEY"

# Stripe secrets
supabase secrets set \
  --project-ref "$SUPABASE_PROJECT_ID" \
  STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
  STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"

echo "Secrets setup complete!"