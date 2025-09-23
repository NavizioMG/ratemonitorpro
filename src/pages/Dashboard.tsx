import { useState, useEffect } from 'react';
import { TrendingUp, Users, Bell, ArrowUpRight, ArrowDownRight, Percent, DollarSign, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RateTest } from '../components/RateTest';
import { useClients } from '../hooks/useClients';
import { useClientMetrics } from '../hooks/useClientMetrics';
import { useRateHistory } from '../hooks/useRateHistory';
import { useRateCalculations } from '../hooks/useRateCalculations';
import { RateStatusBadge } from '../components/RateStatusBadge';
import { CurrentRateCard } from '../components/CurrentRateCard';
import { supabase } from '../lib/supabase';
import { debug, Category } from '../lib/debug';


export function Dashboard() {
  const { clients } = useClients();
  const { rateHistory } = useRateHistory();
  const currentMarketRate = rateHistory[0]?.rate_value || 0;
  const { clientsAtTargetRate, clientsAboveRate, totalSavings, rateStatuses } = useRateCalculations(clients, currentMarketRate);
  const metrics = useClientMetrics(clients);
  const [user, setUser] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const setupUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        debug.logError(Category.AUTH, 'Failed to get user', {}, error);
        return;
      }
      setUser(user);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single();

      if (profileError) {
        debug.logError(Category.DATABASE, 'Failed to fetch profile', {}, profileError);
      } else {
        const now = new Date();
        const createdAt = new Date(profile.created_at);
        const timeDiff = now - createdAt;
        if (timeDiff < 5 * 60 * 1000) {
          setShowWelcomeModal(true);
        }
      }
    };
    setupUser();
  }, []);

  const handleModalClose = async () => {
    setShowWelcomeModal(false);
    if (user) {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('title', 'Welcome to Rate Monitor Pro!');
      if (error) {
        debug.logError(Category.DATABASE, 'Failed to mark notification as read', {}, error);
      }
    }
  };

  const stats = [
    { 
      name: 'Potential Monthly Savings', 
      value: `$${totalSavings.toFixed(2)}`,
      icon: DollarSign,
      change: `${clientsAboveRate} clients above market rate`,
      changeType: 'neutral'
    },
    { 
      name: 'Total Clients',
      value: metrics.totalClients,
      icon: Users,
      change: `${clientsAtTargetRate} at target rate`,
      changeType: 'info'
    }
  ];

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

  const recentAlerts = clients
    .filter(client => {
      const mortgage = client.mortgages?.[0];
      if (!mortgage) return false;
      const status = rateStatuses.get(client.id);
      return status !== undefined && !status.isTargetMet;
    })
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatRate = (rate: number) => {
    return `${rate.toFixed(3)}%`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Overview of your mortgage rate monitoring and client portfolio
          </p>
        </div>
      </div>


      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <CurrentRateCard />
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-500">{stat.name}</h3>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                <div className={`mt-1 text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' :
                  stat.changeType === 'info' ? 'text-primary' :
                  'text-gray-500'
                }`}>
                  {stat.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.href}
              state={action.state}
              className="group relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <Icon className="mx-auto h-8 w-8 text-gray-400 group-hover:text-primary transition-colors" />
              <span className="mt-2 block text-sm font-semibold text-gray-900">{action.title}</span>
              <span className="mt-1 block text-sm text-gray-500">{action.description}</span>
            </Link>
          );
        })}
      </div>

      {/* Recent Rate Alerts */}
      <div className="mt-8 bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Active Rate Alerts</h3>
            <Link
              to="/rates"
              className="text-sm text-primary hover:text-primary-dark font-medium flex items-center"
            >
              View All
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Savings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentAlerts.map((client) => {
                const mortgage = client.mortgages![0];
                const status = rateStatuses.get(client.id)!;
                return (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {client.first_name[0]}{client.last_name[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {client.first_name} {client.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatRate(mortgage.target_rate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatRate(mortgage.current_rate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {formatCurrency(status.savingsAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RateStatusBadge
                        isTargetMet={status.isTargetMet}
                        percentageToTarget={status.percentageToTarget}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Welcome Modal with Animation */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 animate-slide-in-up">
            {/* Logo Placeholder */}
            <div className="flex justify-center mb-6">
              <div className="bg-primary text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">
                RMP
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Welcome to Rate Monitor Pro!
            </h2>
            <p className="text-gray-600 mb-4 text-center">
              Your account is now active—get started by adding your first client.
            </p>
            <p className="text-gray-600 mb-6 text-center">
              Please verify your email using the link sent to secure your account.
            </p>
            <button
              onClick={handleModalClose}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
            >
              Got It
            </button>
            <p className="text-gray-500 text-sm mt-3 text-center">
              (Coming soon: SMS verification for extra security!)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Add this to your CSS (e.g., index.css) or a <style> tag in your app
const styles = `
  @keyframes slide-in-up {
    0% {
      transform: translateY(100px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
  .animate-slide-in-up {
    animation: slide-in-up 0.5s ease-out forwards;
  }
`;

// If using a CSS file, add the above to src/index.css
// Or add <style>{styles}</style> in your App.tsx