// src/pages/Dashboard.tsx
import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Users, Bell, Plus, DollarSign, CreditCard } from 'lucide-react'; 
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import { useRateHistory } from '../hooks/useRateHistory';
import { useRateCalculations } from '../hooks/useRateCalculations';
import { CurrentRateCard } from '../components/dashboard/CurrentRateCard';
import { StatCard } from '../components/dashboard/StatCard';
import { QuickActionCard } from '../components/dashboard/QuickActionCard';
import { RecentAlertsTable } from '../components/dashboard/RecentAlertsTable';
import { WelcomeModal } from '../components/dashboard/WelcomeModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Subscription {
  id: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export function Dashboard() {
  const { user, profile } = useAuth();
  const { clients } = useClients();
  const { rateHistory } = useRateHistory();
  const currentMarketRate = rateHistory[0]?.rate_value || 0;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { clientsAtTargetRate, clientsAboveRate, totalSavings, rateStatuses } = useRateCalculations(clients, currentMarketRate);
  
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  // Check for payment success from URL params
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setShowPaymentSuccess(true);
      // Clear the URL param
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, navigate]);

  // Check subscription status
  useEffect(() => {
    async function checkSubscription() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('id, status, current_period_end, cancel_at_period_end')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking subscription:', error);
        }

        setSubscription(data);
      } catch (error) {
        console.error('Subscription check failed:', error);
      } finally {
        setSubscriptionLoading(false);
      }
    }

    checkSubscription();
  }, [user]);

  // Show welcome modal for new users
  useEffect(() => {
    if (profile && !profile.has_seen_welcome && subscription) {
      setShowWelcomeModal(true);
    }
  }, [profile, subscription]);

  const handleModalClose = async () => {
    setShowWelcomeModal(false);
    if (user) {
      await supabase
        .from('profiles')
        .update({ has_seen_welcome: true })
        .eq('id', user.id);
    }
  };

  const handleUpgradeClick = () => {
    navigate('/post-signup-billing');
  };

  // Show loading while checking subscription
  if (subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show upgrade prompt if no active subscription
  if (!subscription) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Complete Your Subscription
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            To access your Rate Monitor Pro dashboard and start tracking mortgage rates, 
            please complete your subscription setup.
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rate Monitor Pro</h3>
              <p className="text-3xl font-bold text-primary mb-1">$49.99<span className="text-lg font-normal text-gray-600">/month</span></p>
              <p className="text-sm text-gray-600">14-day free trial included</p>
            </div>
            
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Real-time rate monitoring</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Unlimited client tracking</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Automated email alerts</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Analytics & reporting</span>
              </li>
            </ul>

            <button
              onClick={handleUpgradeClick}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = useMemo(() => [
    { 
      name: 'Potential Monthly Savings', 
      value: `$${totalSavings.toFixed(2)}`,
      icon: DollarSign,
      change: `${clientsAboveRate} clients above market rate`,
      changeType: 'neutral' as const
    },
    { 
      name: 'Total Clients',
      value: clients.length,
      icon: Users,
      change: `${clientsAtTargetRate} at target rate`,
      changeType: 'info' as const
    }
  ], [totalSavings, clientsAboveRate, clients.length, clientsAtTargetRate]);

  const quickActions = [
    {
      title: 'Add New Client',
      description: 'Track a new client\'s mortgage rates',
      icon: Plus,
      href: '/mortgage-clients',
      state: { openAddModal: true }
    },
    {
      title: 'View Rate Trends',
      description: 'Analyze historical rate data',
      icon: TrendingUp,
      href: '/rates'
    },
    {
      title: 'View Notifications',
      description: 'Check your rate alerts',
      icon: Bell,
      href: '/notifications'
    }
  ];

  const recentAlerts = useMemo(() => 
    clients
      .filter(client => {
        const mortgage = client.mortgages?.[0];
        if (!mortgage) return false;
        const status = rateStatuses.get(client.id);
        return status !== undefined && !status.isTargetMet;
      })
      .slice(0, 5),
    [clients, rateStatuses]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Payment Success Banner */}
      {showPaymentSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Payment Successful!</h3>
              <p className="text-sm text-green-700">
                Welcome to Rate Monitor Pro! Your subscription is now active and you have full access to all features.
              </p>
            </div>
            <button
              onClick={() => setShowPaymentSuccess(false)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Overview of your mortgage rate monitoring and client portfolio
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <CurrentRateCard />
        {stats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {quickActions.map((action) => (
          <QuickActionCard key={action.title} {...action} />
        ))}
      </div>

      <div className="mt-8">
        <RecentAlertsTable alerts={recentAlerts} rateStatuses={rateStatuses} />
      </div>
      
      {showWelcomeModal && (
        <WelcomeModal onClose={handleModalClose} />
      )}
    </div>
  );
}