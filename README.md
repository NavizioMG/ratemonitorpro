# 📊 Rate Monitor Pro (RMP) - README

## 1️⃣ Overview

Rate Monitor Pro (RMP) is a SaaS web app for mortgage brokers and loan officers. It tracks daily mortgage rates from trusted APIs like FRED and alerts clients when their target rate is hit.

**Target:** Independent brokers, loan teams, lending professionals.
**Value:** Automate rate tracking, save time, close more deals.

---

## 2️⃣ Core Features

* ✅ Real-time rate fetching
* ✅ Client management dashboard
* ✅ Target rate tracking
* ✅ Automated notifications (email/SMS) via Go High Level
* ✅ Secure Stripe billing (flat + metered)
* ✅ Role-based access, secure auth (Supabase)
* ✅ Supabase Edge Functions + Netlify Functions
* ✅ GHL sub-account creation and management
* ✅ Complete signup workflow with payment integration

---

## 3️⃣ Architecture

**Frontend:** Vite + React + TypeScript + Tailwind + Lucide Icons
**Backend:** Supabase (PostgreSQL, Auth, RLS, Realtime) + Edge Functions
**APIs:** FRED API (rates), Stripe (billing), GHL API (CRM automation)
**Hosting:** Netlify + Supabase

---

## 4️⃣ Project Structure

```
src/
├── components/      # UI components (auth, clients, deals, layout)
├── pages/           # Routes (Dashboard, Billing, Docs, Auth)
├── contexts/        # Global contexts (AuthContext)
├── hooks/           # React hooks (useClients, useRateHistory, etc.)
├── services/        # Stripe, GHL, FRED logic
├── config/          # Env config files
├── lib/             # Supabase setup, utilities
├── types/           # TypeScript models
├── utils/           # Helpers, test utilities
api/supabase/functions/ # Edge Functions
├── add-client/              # Create contacts in RMP location
├── create-ghl-subaccount/   # Create user sub-accounts
├── create-checkout-session/ # Stripe payment processing
├── fetch-rates/             # Rate monitoring
├── stripe-webhook/          # Payment webhooks
└── [other functions]/       # Additional integrations
```

---

## 5️⃣ Current Signup Workflow (E2E)

### Working Flow (As of Latest Updates):
1. **User visits landing page** → clicks "Get Started"
2. **Fills signup form** → data stored in localStorage
3. **Redirected to Stripe** → completes payment
4. **Stripe redirects to** `/complete-signup?success=true`
5. **CompleteSignup component:**
   - Attempts sign-in (fails expected for new users)
   - Creates new Supabase auth user
   - Signs in the new user
   - Updates user profile
   - Creates welcome notification
   - **Creates contact in RMP location** (stores contact ID)
   - **Creates GHL sub-account** for user
   - Waits for AuthContext to sync (5-second timeout)
   - Shows welcome screen
   - Redirects to dashboard

### Critical Timing Fix:
The signup flow requires proper auth context synchronization. The component waits up to 5 seconds for the AuthContext to recognize the authenticated state before allowing redirect to dashboard.

---

## 6️⃣ Environment Variables

```
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# APIs
VITE_FRED_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=

# GHL Integration  
GHL_RMP_API_KEY=         # For creating contacts in RMP location
RMP_LOCATION_ID=         # Your main RMP location ID
GHL_AGENCY_API_KEY=      # For creating user sub-accounts
GHL_COMPANY_ID=          # Your GHL company/agency ID

# App Config
APP_URL=https://ratemonitorpro.com
```

---

## 7️⃣ Database Schema Updates

Recent additions to support GHL integration:

```sql
-- Profiles table (add missing column)
ALTER TABLE profiles ADD COLUMN ghl_rmp_contact_id TEXT;

-- GHL Sub-accounts tracking
CREATE TABLE ghl_subaccounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  ghl_location_id TEXT NOT NULL,
  ghl_agency_api_key TEXT,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 8️⃣ Deployment

**Local Development:**
```bash
git clone <repo>
npm install
cp .env.example .env
npm run dev
```

**Database:**
```bash
supabase db push
supabase db verify-policies
```

**Edge Functions:**
```bash
supabase functions deploy add-client
supabase functions deploy create-ghl-subaccount
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
# ... deploy other functions as needed
```

**Frontend:**
```bash
npm run build
netlify deploy --prod
```

---

## 9️⃣ Common Issues & Solutions

### Signup Flow Problems:
- **Infinite "Finalizing" screen**: AuthContext sync timeout too short
- **404 after payment**: Wrong Stripe success URL
- **Redirect to login**: PrivateRoute timing issue

### GHL Integration:
- **Missing contact sync**: Check `ghl_rmp_contact_id` column exists
- **Sub-account creation fails**: Verify column names in database

See `TROUBLESHOOTING.md` for detailed solutions.

---

## 🔟 Production Checklist

Before going live:
1. **Clean test data**: Use SQL script to remove all `%@test.com` users
2. **Switch to live Stripe**: Update environment variables
3. **Verify GHL quotas**: Check API limits
4. **Test complete signup flow**: End-to-end verification
5. **Monitor error tracking**: Set up logging
6. **Database backups**: Verify backup schedule

---

## 📋 Next Development Priorities

1. **Dashboard client management** - Add/edit clients functionality
2. **Rate monitoring setup** - Configure FRED API integration
3. **GHL client sync** - Sync user clients to their sub-accounts  
4. **Notification system** - Rate alerts via GHL workflows
5. **Analytics dashboard** - Portfolio performance metrics

---

## 🔒 License

MIT License — see `LICENSE` file.

**Maintainer:** Justin Jacobs
**PM:** ChatGPT AI co-pilot 🚀

---

## 📚 Additional Documentation

- `DEPLOYMENT.md` - Complete deployment guide
- `TROUBLESHOOTING.md` - Common issues and solutions  
- `DOCUMENTATION.md` - Comprehensive technical documentation