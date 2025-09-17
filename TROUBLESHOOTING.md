# Troubleshooting Guide

## Signup Flow Issues

### Issue: Infinite "Finalizing..." Screen After Payment
**Symptoms:**
- User completes Stripe payment
- Redirected to welcome screen showing "Finalizing..."
- Screen never progresses to dashboard
- Console shows SIGNED_IN events but AuthContext shows `isAuthenticated: false`

**Root Cause:**
AuthContext not syncing with Supabase auth state changes quickly enough

**Solution:**
In `CompleteSignup.tsx`, increase the auth sync timeout:
```typescript
// Wait longer for auth context to sync
let attempts = 0;
const maxAttempts = 10; // 5 seconds instead of 3
```

---

### Issue: 404 Error After Payment Completion
**Symptoms:**
- User completes payment
- Gets 404 error or redirected to wrong page
- URL shows incorrect path

**Root Cause:**
Incorrect success URL in Stripe checkout session

**Solution:**
In `create-checkout-session/index.ts`:
```javascript
success_url: `${Deno.env.get("APP_URL")}/complete-signup?success=true`,
// NOT: /auth/complete-signup
```

---

### Issue: Redirected Back to Auth Page
**Symptoms:**
- Signup completes successfully
- User sees welcome screen briefly
- Gets redirected back to login page

**Root Cause:**
PrivateRoute checks auth before AuthContext has updated

**Solution:**
Ensure proper timing in redirect logic and verify AuthContext is properly managing state

---

## GHL Integration Issues

### Issue: Missing GHL Contact ID
**Symptoms:**
- Users can sign up but can't sync clients
- Database shows null `ghl_rmp_contact_id`
- Client sync fails

**Root Cause:**
Missing database column or contact ID not being stored

**Solution:**
1. Add missing column:
```sql
ALTER TABLE profiles ADD COLUMN ghl_rmp_contact_id TEXT;
```

2. Verify contact ID storage in CompleteSignup:
```typescript
if (contactResponse.ok) {
  const contactResult = await contactResponse.json();
  await supabase.from('profiles').update({
    ghl_rmp_contact_id: contactResult.contactId
  }).eq('id', userId);
}
```

---

### Issue: GHL Sub-account Creation Fails
**Symptoms:**
- Console shows "GHL sub-account creation failed"
- Error: "Could not find the 'ghl_api_key' column"

**Root Cause:**
Database column name mismatch

**Solution:**
In `create-ghl-subaccount/index.ts`, use correct column name:
```typescript
// Use this:
ghl_agency_api_key: newApiKey || '',
// NOT: ghl_api_key
```

---

## Authentication Issues

### Issue: Multiple Component Re-renders
**Symptoms:**
- Console shows component loading 10+ times
- Poor performance
- Excessive API calls

**Root Cause:**
Improper useEffect dependencies causing render loops

**Solution:**
Clean up useEffect dependencies:
```typescript
// Remove problematic dependencies
}, [searchParams]); // Don't include session, completed, etc.
```

---

### Issue: AuthContext Not Updating
**Symptoms:**
- Supabase shows SIGNED_IN events
- AuthContext shows `isAuthenticated: false`
- User can't access protected routes

**Root Cause:**
AuthContext implementation issues or timing problems

**Solutions:**
1. Check AuthContext tab management (multiple tabs can conflict)
2. Verify session refresh logic
3. Check RLS policies on profiles table
4. Ensure proper error handling in AuthContext

---

## Database Issues

### Issue: Cannot Delete Auth Users Manually
**Symptoms:**
- Supabase dashboard delete fails
- Foreign key constraint errors

**Root Cause:**
Related data in custom tables prevents deletion

**Solution:**
Use SQL to delete in proper order:
```sql
-- Delete related data first
DELETE FROM profiles WHERE id = 'user-id';
DELETE FROM ghl_subaccounts WHERE user_id = 'user-id';
DELETE FROM notifications WHERE user_id = 'user-id';

-- Then delete auth user
DELETE FROM auth.users WHERE id = 'user-id';
```

---

### Issue: RLS Policy Errors
**Symptoms:**
- Users can't access their own data
- Permission denied errors
- API calls fail with 403

**Root Cause:**
Row Level Security policies not properly configured

**Solution:**
Verify RLS policies:
```bash
supabase db verify-policies
```

Check policy syntax:
```sql
-- Example correct policy
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);
```

---

## Edge Function Issues

### Issue: Function Deployment Fails
**Symptoms:**
- Deploy command fails
- Function not available at runtime
- Import errors

**Solution:**
1. Check function syntax
2. Verify environment variables
3. Check import statements
4. Deploy with verbose logging:
```bash
supabase functions deploy function-name --debug
```

---

### Issue: CORS Errors in Functions
**Symptoms:**
- Browser blocks requests
- OPTIONS preflight fails

**Root Cause:**
Missing or incorrect CORS headers

**Solution:**
Ensure proper CORS handling:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle OPTIONS
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}
```

---

## Development Issues

### Issue: Environment Variables Not Loading
**Symptoms:**
- Functions can't access env vars
- API keys undefined
- Service connections fail

**Solution:**
1. Check .env file format
2. Verify variable names match exactly
3. Restart development server
4. For functions, check Supabase dashboard env vars

---

### Issue: Hot Reload Not Working
**Symptoms:**
- Changes don't appear
- Need to manually refresh
- Cached old code

**Solution:**
1. Clear browser cache
2. Restart dev server
3. Check for TypeScript errors
4. Clear node_modules and reinstall

---

## Performance Issues

### Issue: Slow Initial Load
**Symptoms:**
- Long white screen
- Slow authentication check
- Poor user experience

**Solution:**
1. Add loading screens
2. Optimize bundle size
3. Check database query performance
4. Add proper error boundaries

---

## Monitoring & Debugging

### Essential Debug Steps
1. **Check browser console** for errors
2. **Check Network tab** for failed requests
3. **Check Supabase logs** for database errors
4. **Check Edge Function logs** in Supabase dashboard
5. **Verify environment variables** are set correctly

### Useful Debug Commands
```bash
# Check function logs
supabase functions logs function-name

# Test database connection
supabase db verify-policies

# Check auth status
supabase auth status

# Reset local database
supabase db reset
```

### Production Monitoring
- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor Edge Function performance
- Track authentication success rates
- Monitor GHL API usage and limits