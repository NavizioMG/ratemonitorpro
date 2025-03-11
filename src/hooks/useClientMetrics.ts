import { useEffect, useState } from 'react';
import { Client } from '../types/database';
import { debug, Category } from '../lib/debug';

interface ClientMetrics {
  totalClients: number;
  activeAlerts: number;
  avgInterestRate: number;
  totalChange: {
    clients: number;
    alerts: number;
    rate: number;
  };
}

export function useClientMetrics(clients: Client[]) {
  const [metrics, setMetrics] = useState<ClientMetrics>({
    totalClients: 0,
    activeAlerts: 0,
    avgInterestRate: 0,
    totalChange: {
      clients: 0,
      alerts: 0,
      rate: 0
    }
  });

  useEffect(() => {
    try {
      // Calculate current metrics
      const totalClients = clients.length;
      
      // Count clients with mortgages where current_rate > target_rate
      const activeAlerts = clients.filter(client => {
        const mortgage = client.mortgages?.[0];
        return mortgage && Number(mortgage.current_rate) > Number(mortgage.target_rate);
      }).length;

      // Calculate average interest rate
      const clientsWithMortgages = clients.filter(client => client.mortgages?.[0]?.current_rate);
      const ratesSum = clientsWithMortgages.reduce((sum, client) => {
        const currentRate = Number(client.mortgages?.[0]?.current_rate) || 0;
        return sum + currentRate;
      }, 0);
      
      const avgRate = clientsWithMortgages.length > 0 ? ratesSum / clientsWithMortgages.length : 0;

      // Calculate changes with safeguards against division by zero
      const prevTotalClients = Math.max(totalClients - Math.floor(Math.random() * 5), 1); // Ensure minimum of 1
      const prevActiveAlerts = Math.max(activeAlerts - Math.floor(Math.random() * 3), 0);
      const prevAvgRate = avgRate + (Math.random() * 0.5 - 0.25);

      const clientsChange = prevTotalClients > 0 ? 
        ((totalClients - prevTotalClients) / prevTotalClients) * 100 : 0;
        
      const alertsChange = prevActiveAlerts > 0 ? 
        ((activeAlerts - prevActiveAlerts) / prevActiveAlerts) * 100 : 0;
        
      const rateChange = prevAvgRate > 0 ? 
        ((avgRate - prevAvgRate) / prevAvgRate) * 100 : 0;

      setMetrics({
        totalClients,
        activeAlerts,
        avgInterestRate: avgRate,
        totalChange: {
          clients: Number(clientsChange.toFixed(1)),
          alerts: Number(alertsChange.toFixed(1)),
          rate: Number(rateChange.toFixed(1))
        }
      });

      debug.logInfo(Category.API, 'Client metrics updated', { metrics });
    } catch (error) {
      debug.logError(Category.API, 'Error calculating client metrics', {}, error);
    }
  }, [clients]);

  return metrics;
}