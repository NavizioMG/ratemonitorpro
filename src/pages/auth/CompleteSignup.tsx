import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function CompleteSignup() {
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasRun = useRef(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // If already authenticated, redirect immediately
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Prevent double execution
    if (hasRun.current) return;
    hasRun.current = true;

    const completeSignupProcess = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          throw new Error('Missing session ID. Please try signing up again.');
        }

        // Verify checkout session and create user account
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-checkout-session`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(errorResult.error || 'Failed to verify payment');
        }
        
        const responseData = await response.json();
        console.log('Server response:', responseData);
        
        const { success, accessToken, refreshToken, userId } = responseData;
        
        if (!success || !accessToken || !refreshToken) {
          throw new Error('Invalid response from server');
        }

        // Set the session in Supabase client
        const { data: authData, error: authError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (authError) {
          throw new Error(`Authentication failed: ${authError.message}`);
        }

        if (!authData.user) {
          throw new Error('No user data received');
        }

        console.log(`User ${userId} successfully signed up and authenticated`);
        setStatus('success');
        
        // Redirect to dashboard after brief success message
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);

      } catch (err) {
        console.error('Signup completion error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setStatus('error');
      }
    };

    completeSignupProcess();
  }, [searchParams, navigate, isAuthenticated]);

  if (status === 'loading') {
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
            Completing your registration and setting up your account...
          </p>
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Registration Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate('/auth')} 
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold shadow-md">
              RMP
            </div>
          </div>
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome Aboard!</h2>
          <p className="text-gray-600 mb-6">
            Your account is ready and your subscription is active. Redirecting to your dashboard...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}