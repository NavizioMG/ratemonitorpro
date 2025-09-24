// src/pages/Dashboard.tsx
import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Users, Bell, Plus, DollarSign } from 'lucide-react'; 
import { Link } from 'react-router-dom';
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

export function Dashboard() {
  const { user, profile } = useAuth();
  const { clients } = useClients();
  const { rateHistory } = useRateHistory();
  const currentMarketRate = rateHistory[0]?.rate_value || 0;
  
  const { clientsAtTargetRate, clientsAboveRate, totalSavings, rateStatuses } = useRateCalculations(clients, currentMarketRate);
  
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (profile && !profile.has_seen_welcome) {
      setShowWelcomeModal(true);
    }
  }, [profile]);

  const handleModalClose = async () => {
    setShowWelcomeModal(false);
    if (user) {
      await supabase
        .from('profiles')
        .update({ has_seen_welcome: true })
        .eq('id', user.id);
    }
  };

  const stats = useMemo(() => [
    { 
      name: 'Potential Monthly Savings', 
      value: `$${totalSavings.toFixed(2)}`,
      icon: DollarSign, // This line was causing the error without the import
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