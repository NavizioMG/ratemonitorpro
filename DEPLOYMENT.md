# Deployment Guide

## Prerequisites
- Node.js 20.x
- npm 9.x
- Supabase CLI
- Netlify CLI (optional)

## Environment Setup
1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Update environment variables with actual values

## Database Deployment
1. Push database migrations:
   ```bash
   supabase db push
   ```

2. Verify RLS policies:
   ```bash
   supabase db verify-policies
   ```

3. Add missing columns (if needed):
   ```sql
   ALTER TABLE profiles ADD COLUMN ghl_rmp_contact_id TEXT;
   ```

## Edge Functions Deployment
1. Deploy all functions:
   ```bash
   supabase functions deploy fetch-rates
   supabase functions deploy stripe-webhook
   supabase functions deploy create-checkout-session
   supabase functions deploy get-subscription
   supabase functions deploy cancel-subscription
   supabase functions deploy get-billing-history
   supabase functions deploy add-client
   supabase functions deploy create-ghl-subaccount
   supabase functions deploy sync-ghl-client
   supabase functions deploy sync-ghl-contact
   supabase functions deploy update-ghl-contact
   supabase functions deploy update-subaccount
   ```

## Frontend Deployment
1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```

## Post-Deployment
1. Verify all environment variables
2. Test authentication flow
3. Test signup → payment → dashboard flow
4. Verify rate monitoring
5. Test subscription system
6. Check notifications
7. Test GHL integrations
8. Verify database connections

## Common Issues & Fixes

### Authentication Redirect Loop
- **Symptom**: Users get stuck on welcome screen after payment
- **Cause**: AuthContext not syncing with Supabase auth events
- **Fix**: Increase auth sync timeout in CompleteSignup.tsx to 5+ seconds

### Stripe Redirect Error
- **Symptom**: 404 after payment completion
- **Fix**: Ensure success URL in create-checkout-session uses `/complete-signup` not `/auth/complete-signup`

### Missing GHL Contact ID
- **Symptom**: Users can't sync clients to their GHL sub-account
- **Fix**: Verify `ghl_rmp_contact_id` column exists and is populated during signup

## Rollback Procedures
1. Database:
   ```bash
   supabase db reset
   supabase db push
   ```

2. Frontend:
   ```bash
   netlify deploy --prod --dir=dist
   ```

3. Edge Functions:
   ```bash
   # Rollback specific function
   supabase functions deploy [function-name] --import-map import_map.json
   ```

## Production Cleanup
Before going live, clean all test data:
```sql
-- Clean test users and related data
DELETE FROM notifications WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@test.com');
DELETE FROM ghl_subaccounts WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@test.com');
DELETE FROM mortgages WHERE client_id IN (SELECT id FROM clients WHERE broker_id IN (SELECT id FROM auth.users WHERE email LIKE '%@test.com'));
DELETE FROM clients WHERE broker_id IN (SELECT id FROM auth.users WHERE email LIKE '%@test.com');
DELETE FROM profiles WHERE id IN (SELECT id FROM auth.users WHERE email LIKE '%@test.com');
DELETE FROM auth.users WHERE email LIKE '%@test.com';
```

## Monitoring
- Set up Supabase monitoring
- Configure error tracking
- Set up performance monitoring
- Enable audit logging
- Monitor GHL API quotas

## Security Checklist
- [ ] SSL certificates
- [ ] Environment variables
- [ ] API keys rotation
- [ ] Database backups
- [ ] RLS policies
- [ ] GHL webhook security
- [ ] Stripe webhook verification