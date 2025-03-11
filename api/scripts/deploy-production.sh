#!/bin/bash

# Load production environment variables
set -a
source .env.production
set +a

# Confirm production deployment
read -p "Are you sure you want to deploy to production? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Deployment cancelled"
    exit 1
fi

echo "Deploying to production environment..."

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

echo "Production deployment complete!"