import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { sendWelcomeEmail } from '../../services/email'; // Or the correct path

export function CompleteSignup() {
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasRun = useRef(false);
  const { isAuthenticated, authLoading } = useAuth();

  // Effect to handle the redirection once the user is authenticated.
  // This is the single source of truth for redirection.
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Effect to run the signup and verification process once on page load.
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const completeSignupProcess = async () => {
      try {
        // 1. Get Session ID from URL
        const success = searchParams.get('success');
        const sessionId = searchParams.get('session_id');
        
        if (!success || success !== 'true') throw new Error('Payment was not completed successfully.');
        if (!sessionId) throw new Error('Session ID is missing from the URL.');
    
        // 2. Verify payment and get user data from your server
        const sessionResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-checkout-session`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ sessionId }),
        });
    
        if (!sessionResponse.ok) {
          const errorResult = await sessionResponse.json();
          throw new Error(errorResult.error || 'Failed to verify checkout session.');
        }
    
        const { userData } = await sessionResponse.json();
        if (!userData || !userData.email || !userData.password) {
          throw new Error('Required signup data is missing from the session. Please sign up again.');
        }
    
        const { email, fullName, companyName, phone = '', password, timezone } = userData;
        
        // 3. Try to sign in the user (in case a webhook already created them)
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
          email: email, 
          password 
        });
    
        let userId = signInData?.user?.id;
    
        // 4. If user doesn't exist, sign them up
        if (signInError?.message === 'Invalid login credentials') {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password,
            options: { data: { full_name: fullName, company_name: companyName, phone, timezone } }
          });
    
          if (signUpError) throw signUpError;
          if (!signUpData.user) throw new Error('Failed to create user account.');
          
          userId = signUpData.user.id;
        } else if (signInError) {
          throw signInError;
        }
    
        if (!userId) throw new Error('Could not determine user ID.');
    
        // 5. Create or update the user's public profile
        const { error: updateError } = await supabase.from('profiles').upsert({
          id: userId,
          full_name: fullName,
          company_name: companyName,
          phone,
          timezone
        }, { onConflict: 'id' });
    
        if (updateError) throw updateError;
    
        // 6. Send the welcome email (fire-and-forget)
        try {
          sendWelcomeEmail(email, fullName, companyName); // Notice 'await' is removed
        } catch (emailError) {
          // Log the error but don't block the user from proceeding
          console.error('Welcome email failed to send:', emailError);
        }
    
        // 7. Finally, set the status to success
        setStatus('success');
    
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        setStatus('error');
      }
    };

    completeSignupProcess();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
          <div className="flex justify-center mb-6"><div className="bg-primary text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold shadow-md">RMP</div></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to <span className="text-primary">Rate Monitor Pro</span></h2>
          <p className="text-gray-600 mb-6">Finalizing your account details. This should only take a moment.</p>
          <div className="flex justify-center"><div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div></div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Registration Error</h2>
          <p className="mt-2 text-red-600">{error}</p>
          <button onClick={() => navigate('/auth')} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark">Return to Sign Up</button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
          <div className="flex justify-center mb-6"><div className="bg-primary text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold shadow-md">RMP</div></div>
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome Aboard!</h2>
          <p className="text-gray-600 mb-6">Your account is ready. Redirecting you to the dashboard...</p>
          <div className="flex justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div></div>
        </div>
      </div>
    );
  }

  return null;
}