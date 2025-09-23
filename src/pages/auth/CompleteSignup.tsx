import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
/*import { sendWelcomeEmail } from '../../services/email'; */

export function CompleteSignup() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasRun = useRef(false);
  const { session, loading: authLoading, isAuthenticated } = useAuth();

  // Debug auth state changes
  useEffect(() => {
    console.log('=== AUTH STATE DEBUG ===');
    console.log('completed:', completed);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('authLoading:', authLoading);
    console.log('session:', session);
    console.log('session user id:', session?.user?.id);
    console.log('session profile:', session?.profile);
    console.log('========================');
  }, [completed, isAuthenticated, authLoading, session]);

  // Redirect when auth is ready
  useEffect(() => {
    console.log('Redirect check:', { completed, isAuthenticated, authLoading });
    
    if (completed && isAuthenticated && !authLoading) {
      console.log('CONDITIONS MET - Redirecting to dashboard in 500ms');
      setTimeout(() => {
        console.log('Executing redirect to dashboard');
        navigate('/dashboard', { replace: true });
      }, 500);
    } else {
      console.log('Redirect conditions not met:', {
        completed,
        isAuthenticated, 
        authLoading,
        willRedirect: completed && isAuthenticated && !authLoading
      });
    }
  }, [completed, isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (completed || hasRun.current) return;
    hasRun.current = true;

    const completeSignup = async () => {
      try {
        console.log('=== SIGNUP PROCESS START ===');
        
        const success = searchParams.get('success');
        console.log('Payment success param:', success);
        if (!success || success !== 'true') throw new Error('Payment was not completed');

        // Debug: Log all available data
        console.log('URL searchParams:', Object.fromEntries(searchParams.entries()));
        console.log('localStorage data:', {
          email: localStorage.getItem('signupEmail'),
          fullName: localStorage.getItem('signupFullName'),
          companyName: localStorage.getItem('signupCompanyName'),
          phone: localStorage.getItem('signupPhone'),
          password: !!localStorage.getItem('signupPassword'), // Don't log actual password
          timezone: localStorage.getItem('signupTimezone')
        });

        const email = searchParams.get('email') || localStorage.getItem('signupEmail');
        const fullName = searchParams.get('fullName') || localStorage.getItem('signupFullName');
        const companyName = searchParams.get('companyName') || localStorage.getItem('signupCompanyName');
        const phone = searchParams.get('phone') || localStorage.getItem('signupPhone') || '';
        const password = searchParams.get('password') || localStorage.getItem('signupPassword');
        const timezone = searchParams.get('timezone') || localStorage.getItem('signupTimezone');

        console.log('Extracted data:', { 
          email, 
          fullName, 
          companyName, 
          phone: !!phone, 
          password: !!password, 
          timezone 
        });

        if (!email || !fullName || !companyName || !password || !timezone) {
          console.error('Missing required fields:', {
            email: !!email,
            fullName: !!fullName,
            companyName: !!companyName,
            password: !!password,
            timezone: !!timezone
          });
          localStorage.clear();
          throw new Error('Signup data missing—please start over');
        }

        const fixedEmail = email.replace(' ', '+');
        console.log('Using email:', fixedEmail);
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fixedEmail)) {
          throw new Error(`Invalid email format: ${fixedEmail}`);
        }

        console.log('Attempting sign in...');

        // Try to sign in first (user might already exist from Stripe webhook)
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
          email: fixedEmail, 
          password 
        });

        let userId;

        if (signInData?.user) {
          console.log('Sign in successful, user exists:', signInData.user.id);
          userId = signInData.user.id;
        } else if (signInError?.message === 'Invalid login credentials') {
          console.log('User does not exist, creating new account...');
          
          // Create new account
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

          if (signUpError) {
            console.error('Sign up error:', signUpError);
            throw signUpError;
          }
          
          console.log('Sign up successful:', signUpData.user?.id);
          userId = signUpData.user?.id;
          if (!userId) throw new Error('User ID not found after signup');

          console.log('Signing in newly created user...');
          // Sign in the newly created user
          const { error: newSignInError } = await supabase.auth.signInWithPassword({ 
            email: fixedEmail, 
            password 
          });
          if (newSignInError) {
            console.error('Sign in after signup error:', newSignInError);
            throw newSignInError;
          }
          console.log('Sign in after signup successful');
        } else {
          console.error('Sign in error:', signInError);
          throw signInError;
        }

        console.log('Updating profile for user:', userId);

        // Update user profile
        const { error: updateError } = await supabase.from('profiles').upsert({
          id: userId,
          full_name: fullName,
          company_name: companyName,
          phone,
          timezone
        }, { onConflict: 'id' });

        if (updateError) {
          console.error('Profile update error:', updateError);
          throw updateError;
        }

        console.log('Profile updated successfully');

        // Send welcome email (non-blocking)
        try {
          console.log('Sending welcome email to:', fixedEmail);
          await sendWelcomeEmail(fixedEmail, fullName, companyName);
          console.log('Welcome email sent successfully');
        } catch (emailError) {
          console.error('Welcome email failed:', emailError);
        }

        // Wait for auth context to properly sync (replacing the time that GHL calls used to provide)
        console.log('Waiting for auth context to sync...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Auth sync wait complete');

        // Clear local storage and mark as completed
        localStorage.clear();
        console.log('Setting completed = true');
        setCompleted(true);
        setLoading(false);
        console.log('=== SIGNUP PROCESS COMPLETE ===');

      } catch (err) {
        console.error('=== SIGNUP PROCESS ERROR ===');
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to complete signup');
        setLoading(false);
      }
    };

    completeSignup();
  }, [searchParams, completed, session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold shadow-md">
              RMP
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Welcome to <span className="text-primary">Rate Monitor Pro</span>
          </h2>
          <p className="text-gray-600 mb-6">
            We're setting up your account and dashboard access.
          </p>
          <div className="flex justify-center">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-primary text-sm font-medium">
                <span>⏳</span>
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-6">
            This usually only takes a few seconds...
          </p>
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

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold shadow-md">
              RMP
            </div>
          </div>
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Welcome to <span className="text-primary">Rate Monitor Pro</span>!
          </h2>
          <p className="text-gray-600 mb-6">
            {authLoading || !isAuthenticated 
              ? 'Setting up your dashboard access...' 
              : 'Your account is ready. Redirecting to dashboard...'
            }
          </p>
          <div className="flex justify-center">
            <div className="animate-pulse inline-flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              {authLoading || !isAuthenticated ? 'Finalizing...' : 'Redirecting...'}
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-6">
            Almost there...
          </p>
        </div>
      </div>
    );
  }

  return null;
}