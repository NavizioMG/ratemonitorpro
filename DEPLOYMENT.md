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

## Edge Functions Deployment
1. Deploy all functions:
   ```bash
   supabase functions deploy fetch-rates
   supabase functions deploy stripe-webhook
   supabase functions deploy create-checkout-session
   supabase functions deploy get-subscription
   supabase functions deploy cancel-subscription
   supabase functions deploy get-billing-history
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
3. Verify rate monitoring
4. Test subscription system
5. Check notifications
6. Verify database connections

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

## Monitoring
- Set up Supabase monitoring
- Configure error tracking
- Set up performance monitoring
- Enable audit logging

## Security Checklist
- [ ] SSL certificates
- [ ] Environment variables
- [ ] API keys rotation
- [ ] Database backups
- [ ] RLS policies