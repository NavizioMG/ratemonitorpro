import { useState } from 'react';
import { 
  CreditCard, 
  ExternalLink,
  Shield,
  Check,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Billing() {
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();

  const handleManageBilling = async () => {
    if (!session) {
      alert('Please log in first');
      return;
    }

    setLoading(true);
    try {
      // Get the current session token
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error || !currentSession) {
        alert('Please log in again');
        return;
      }

      // Create Stripe customer portal session using the user's JWT token
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe customer portal
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Billing & Subscription</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>
      </div>

      {/* Main Billing Card */}
      <div className="mt-8 bg-white shadow rounded-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Manage Your Subscription
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Access your secure billing portal to manage your subscription, 
            update payment methods, view invoices, and more.
          </p>

          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Opening Portal...
              </>
            ) : (
              <>
                <ExternalLink className="h-5 w-5 mr-2" />
                Open Billing Portal
              </>
            )}
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
              <p className="mt-1 text-sm text-gray-500">
                Update your credit card and billing information
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Billing History</h3>
              <p className="mt-1 text-sm text-gray-500">
                View and download all your past invoices
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Subscription</h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage your plan and subscription settings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Secure & Encrypted
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Your billing information is handled securely by Stripe, our trusted payment processor. 
              We never store your credit card details on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}