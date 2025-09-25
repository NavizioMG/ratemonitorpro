import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function PostSignupBilling() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { replace: true });
      return;
    }

    createCheckoutSession();
  }, [isAuthenticated, navigate]);

  const createCheckoutSession = async () => {
    try {
      if (!user?.email) {
        throw new Error('No user email found');
      }

      console.log('Creating checkout session for:', user.email);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          email: user.email,
          userData: {
            fullName: user.user_metadata?.full_name || '',
            companyName: user.user_metadata?.company_name || '',
            phone: user.user_metadata?.phone || '',
            timezone: user.user_metadata?.timezone || 'America/New_York'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (err) {
      console.error('Billing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start billing process');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => createCheckoutSession()}
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-primary text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold shadow-md">
            RMP
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Complete Your Subscription
        </h2>
        <p className="text-gray-600 mb-6">
          Redirecting you to secure checkout to start your 14-day free trial...
        </p>
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          You'll be redirected to Stripe's secure payment page
        </p>
      </div>
    </div>
  );
}