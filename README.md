# 📊 Rate Monitor Pro (RMP) - README

## 1️⃣ Overview

Rate Monitor Pro (RMP) is a SaaS web app for mortgage brokers and loan officers. It tracks daily mortgage rates from trusted APIs like FRED and alerts clients when their target rate is hit.

**Target:** Independent brokers, loan teams, lending professionals.
**Value:** Automate rate tracking, save time, close more deals.

---

## 2️⃣ Core Features

* ✅ Real-time rate fetching from trusted sources
* ✅ Client management dashboard
* ✅ Target rate tracking per client
* ✅ Automated notifications (email/SMS)
* ✅ Secure, server-side Stripe billing
* ✅ Role-based access and secure authentication (Supabase)
* ✅ Supabase Edge Functions for scalable backend logic
* ✅ Robust signup workflow with server-side payment processing

---

## 3️⃣ Architecture

**Frontend:** Vite + React + TypeScript + Tailwind + Lucide Icons
**Backend:** Supabase (PostgreSQL, Auth, RLS, Realtime) + Edge Functions
**APIs:** FRED (for rate data), Stripe (billing)
**Hosting:** Netlify + Supabase

---

## 4️⃣ Project Structure

Our component structure is organized for clarity and scalability.

src/
├── components/
│   ├── ui/         # Generic, reusable UI elements (Button, Modal, etc.)
│   ├── layout/     # Structural components (DashboardLayout, Footer, etc.)
│   ├── auth/       # Authentication-related components
│   ├── clients/    # Components for the client management feature
│   └── dashboard/  # Components specific to the main dashboard
├── pages/          # Top-level route components
├── contexts/       # Global state management (AuthContext)
├── hooks/          # Reusable React hooks
├── services/       # API clients (Stripe, Email, etc.)
└── lib/            # Core libraries (Supabase client, utils)

---

## 9️⃣ Common Issues & Solutions

### GHL Integration (Post-MVP):
- **Missing contact sync**: Check `ghl_rmp_contact_id` column exists.
- **Sub-account creation fails**: Verify column names in the database.

See `TROUBLESHOOTING.md` for more detailed solutions.

---

## 🔟 Production Checklist

Before going live:
1.  **Clean test data**: Use the SQL script in `DEPLOYMENT.md` to remove test users.
2.  **Switch to live Stripe keys**: Update environment variables in Supabase and Netlify.
3.  **Verify API quotas**: Check limits for any external services.
4.  **Test complete signup flow**: Perform an end-to-end test with a real payment method.
5.  **Monitor error tracking**: Ensure logging and monitoring services are active.
6.  **Database backups**: Confirm the backup schedule is enabled in Supabase.

---

## 📋 Next Development Priorities

1.  **Finalize Notification System** - Implement and test target rate alert emails for brokers and clients.
2.  **Build Out Settings Page** - Add user profile, password, and notification preference management.
3.  **Remove GoHighLevel Integration** - Systematically refactor the codebase to remove all GHL-related logic and database columns.
4.  **Analytics Dashboard** - Enhance the dashboard with more detailed portfolio performance metrics.

---

## 📚 Additional Documentation

-   `DEPLOYMENT.md` - A complete guide to deploying the application.
-   `TROUBLESHOOTING.md` - Solutions for common development and deployment issues.
-   `DOCUMENTATION.md` - Comprehensive technical documentation.
