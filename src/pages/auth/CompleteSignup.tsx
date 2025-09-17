import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { debug, Category } from '../../lib/debug';
import { supabase } from '../../lib/supabase';

const COMPONENT_ID = 'CompleteSignup';

export function CompleteSignup() {
  console.log('🚨 CompleteSignup component loaded!'); // Add this line
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (completed || hasRun.current) return;
    hasRun.current = true;

    const completeSignup = async () => {
      try {
        debug.logInfo(Category.AUTH, 'Starting signup completion', {}, COMPONENT_ID);

        const success = searchParams.get('success');
        if (!success || success !== 'true') throw new Error('Payment was not completed');

        const email = searchParams.get('email') || localStorage.getItem('signupEmail');
        const fullName = searchParams.get('fullName') || localStorage.getItem('signupFullName');
        const companyName = searchParams.get('companyName') || localStorage.getItem('signupCompanyName');
        const phone = searchParams.get('phone') || localStorage.getItem('signupPhone') || '';
        const password = searchParams.get('password') || localStorage.getItem('signupPassword');
        const timezone = searchParams.get('timezone') || localStorage.getItem('signupTimezone');

        if (!email || !fullName || !companyName || !password || !timezone) {
          localStorage.clear();
          throw new Error('Signup data missing—please start over');
        }

        const fixedEmail = email.replace(' ', '+');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fixedEmail)) {
          throw new Error(`Invalid email format: ${fixedEmail}`);
        }

        console.log('🔧 Debug - Available signup data:', {
          email: fixedEmail,
          fullName,
          companyName,
          phone,
          timezone,
          password: password ? 'Present' : 'Missing'
        });

        // Try to sign in first (user might already exist from Stripe webhook)
        console.log('🔧 Attempting to sign in existing user');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
          email: fixedEmail, 
          password 
        });

        let userId;

        if (signInData?.user) {
          // User already exists and signed in successfully
          userId = signInData.user.id;
          console.log('🔧 User signed in successfully:', userId);
        } else if (signInError?.message === 'Invalid login credentials') {
          // User doesn't exist, create new account
          console.log('🔧 Creating new user account');
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: fixedEmail,
            password,
            options: {
              data: {
                full_name: fullName,
                company_name: companyName,
                phone,
                timezone
              }
            }
          });

          if (signUpError) throw signUpError;
          
          userId = signUpData.user?.id;
          if (!userId) throw new Error('User ID not found after signup');

          // Sign in the newly created user
          console.log('🔧 Signing in newly created user');
          const { error: newSignInError } = await supabase.auth.signInWithPassword({ 
            email: fixedEmail, 
            password 
          });
          if (newSignInError) throw newSignInError;
        } else {
          // Some other error occurred
          throw signInError;
        }

        console.log('🔧 Updating user profile');
        const { error: updateError } = await supabase.from('profiles').upsert({
          id: userId,
          full_name: fullName,
          company_name: companyName,
          phone,
          timezone
        }, { onConflict: 'id' });

        if (updateError) throw updateError;

        console.log('🔧 Creating welcome notification');
        await supabase.from('notifications').insert({
          user_id: userId,
          title: 'Welcome to Rate Monitor Pro!',
          message: 'Your account is now active. Get started by adding your first client.',
          type: 'system'
        });

        // 🔧 Step 1: Create contact in RMP sub-account for tracking
        console.log('🔧 Creating contact in RMP sub-account');
        try {
          const contactResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/add-client`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              fullName,
              email: fixedEmail,
              phone,
              companyName,
              timezone
            }),
          });

          const contactResult = await contactResponse.json();
          if (contactResponse.ok) {
            console.log('🔧 RMP contact created successfully:', contactResult);
          } else {
            console.error('🔧 RMP contact creation failed:', contactResult);
          }
        } catch (contactError) {
          console.error('🔧 RMP contact creation error:', contactError);
        }

        // 🔧 Step 2: Create GHL sub-account for the user
        console.log('🔧 Creating GHL sub-account for user');
        try {
          const subaccountResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-ghl-subaccount`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              userId,
              fullName,
              email: fixedEmail,
              phone,
              companyName,
              timezone
            }),
          });

          const subaccountResult = await subaccountResponse.json();
          if (subaccountResponse.ok) {
            console.log('🔧 GHL sub-account created successfully:', subaccountResult);
          } else {
            console.error('🔧 GHL sub-account creation failed:', subaccountResult);
          }
        } catch (subaccountError) {
          console.error('🔧 GHL sub-account creation error:', subaccountError);
        }

        // 🔧 DEBUG: Check auth state before redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('🔧 Auth state before redirect:', {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          error: sessionError
        });

        // Also check if profile was created
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        console.log('🔧 Profile check:', {
          hasProfile: !!profile,
          profile,
          profileError
        });

        console.log('🔧 Signup completion successful - cleaning up and redirecting');
        localStorage.clear();
        setCompleted(true);
        
        // 🔧 AGGRESSIVE REDIRECT: Try multiple methods
        console.log('🔧 Attempting navigation to dashboard...');
        console.log('🔧 Current location:', window.location.pathname);
        
        // Method 1: React Router navigate
        navigate('/dashboard', { replace: true });
        
        // Method 2: If React Router fails, use window.location as backup
        setTimeout(() => {
          console.log('🔧 Location after 2s:', window.location.pathname);
          if (window.location.pathname !== '/dashboard') {
            console.log('🔧 React Router failed, using window.location...');
            window.location.href = '/dashboard';
          }
        }, 2000);
        
        // Method 3: Final fallback
        setTimeout(() => {
          console.log('🔧 Location after 3s:', window.location.pathname);
          if (window.location.pathname !== '/dashboard') {
            console.log('🔧 All redirects failed, forcing reload to dashboard...');
            window.location.replace('/dashboard');
          }
        }, 3000);

      } catch (err) {
        console.error('Signup error:', err.message);
        debug.logError(Category.AUTH, 'Signup completion failed', {}, err, COMPONENT_ID);
        setError(err instanceof Error ? err.message : 'Failed to complete signup');
        setLoading(false);
      }
    };

    completeSignup();
  }, [searchParams, navigate, completed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Completing your registration...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Registration Error</h2>
          <p className="mt-2 text-red-600">{error}</p>
          <button
            onClick={() => navigate('/auth')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
          >
            Return to Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Welcome to Rate Monitor Pro!</h2>
        <p className="mt-2 text-gray-600">Your account is ready—log in to get started.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}