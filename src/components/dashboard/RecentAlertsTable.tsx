// src/components/RecentAlertsTable.tsx
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { RateStatusBadge } from '../RateStatusBadge';
import { Client, RateStatus } from '../types'; // You may need to create or adjust this types file

// Helper formatters (can be moved to a utils file)
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const formatRate = (rate: number) => `${rate.toFixed(3)}%`;

interface RecentAlertsTableProps {
  alerts: Client[];
  rateStatuses: Map<string, RateStatus>;
}

export function RecentAlertsTable({ alerts, rateStatuses }: RecentAlertsTableProps) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-12 bg-white shadow-sm rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">All clients are at or below their target rates!</h3>
        <p className="mt-2 text-sm text-gray-500">No active alerts to show right now.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Active Rate Alerts</h3>
          <Link to="/rates" className="text-sm text-primary hover:text-primary-dark font-medium flex items-center">
            View All
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Savings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {alerts.map((client) => {
              const mortgage = client.mortgages![0];
              const status = rateStatuses.get(client.id)!;
              return (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{client.first_name} {client.last_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatRate(mortgage.target_rate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatRate(mortgage.current_rate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{formatCurrency(status.savingsAmount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RateStatusBadge isTargetMet={status.isTargetMet} percentageToTarget={status.percentageToTarget} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}