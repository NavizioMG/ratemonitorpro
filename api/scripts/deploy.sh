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

# Deploy all functions
echo "Deploying Supabase Edge Functions..."

functions=(
  "fetch-rates"
  "stripe-webhook"
  "create-checkout-session"
  "get-subscription"
  "cancel-subscription"
  "get-billing-history"
  "sync-client-data"
  "send-notifications"
  "generate-analytics"
)

for func in "${functions[@]}"
do
  echo "Deploying $func..."
  supabase functions deploy "$func" --project-ref "$SUPABASE_PROJECT_ID"
done

echo "Deployment complete!"