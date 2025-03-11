#!/bin/bash

# Load staging environment variables
set -a
source .env.staging
set +a

echo "Deploying to staging environment..."

# Deploy database migrations
echo "Running database migrations..."
supabase db push --project-ref "$SUPABASE_PROJECT_ID"

# Deploy edge functions
echo "Deploying Edge Functions..."
functions=(
  "fetch-rates"
  "stripe-webhook"
  "create-checkout-session"
  "get-subscription"
  "cancel-subscription"
  "get-billing-history"
)

for func in "${functions[@]}"
do
  echo "Deploying $func..."
  supabase functions deploy "$func" --project-ref "$SUPABASE_PROJECT_ID"
done

# Set up secrets
echo "Setting up secrets..."
./scripts/setup-secrets.sh

echo "Staging deployment complete!"