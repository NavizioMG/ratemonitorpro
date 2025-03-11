import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, ArrowDown, ArrowUp, Info, ChevronDown } from 'lucide-react';
import { useClients } from '../hooks/useClients';
import { useRateHistory } from '../hooks/useRateHistory';
import { RateStatusBadge } from '../components/RateStatusBadge';

// Calculate monthly mortgage payment
function calculateMonthlyPayment(principal: number, annualRate: number, years: number): number {
  // Convert annual rate to monthly decimal rate
  const monthlyRate = (annualRate / 100) / 12;
  const numberOfPayments = years * 12;
  
  // Handle edge case of 0% rate
  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }
  
  // Standard mortgage payment formula: P * (r(1+r)^n) / ((1+r)^n - 1)
  // where P = principal, r = monthly rate, n = total number of payments
  const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                 (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
                 
  return payment;
}

export function RateTracking() {
  const { clients } = useClients();
  const { rateHistory, loading, error } = useRateHistory();
  const [selectedTerm, setSelectedTerm] = useState<number>(30);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  const terms = [15, 20, 30];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading rate data. Please try again later.</p>
      </div>
    );
  }

  const currentRate = rateHistory[0]?.rate_value || 0;
  const previousRate = rateHistory[1]?.rate_value || 0;
  const rateChange = currentRate - previousRate;

  // Count clients who could benefit from current rates
  const clientsAboveRate = clients.filter(client => {
    const mortgage = client.mortgages?.[0];
    return mortgage && mortgage.current_rate > currentRate;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatRate = (rate: number) => {
    return `${rate.toFixed(3)}%`;
  };

  // Mobile Client Card Component
  const ClientCard = ({ client }: { client: any }) => {
    const mortgage = client.mortgages![0];
    const isExpanded = expandedClient === client.id;
    
    const currentPayment = calculateMonthlyPayment(
      mortgage.loan_amount,
      mortgage.current_rate,
      mortgage.term_years
    );
    
    const newPayment = calculateMonthlyPayment(
      mortgage.loan_amount,
      currentRate,
      mortgage.term_years
    );
    
    const monthlySavings = currentPayment - newPayment;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedClient(isExpanded ? null : client.id)}
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium">
                {client.first_name[0]}{client.last_name[0]}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {client.first_name} {client.last_name}
              </h3>
              <div className="mt-1 text-sm text-gray-500">
                Current Rate: {formatRate(mortgage.current_rate)}
              </div>
            </div>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isExpanded ? 'transform rotate-180' : ''
            }`}
          />
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Target Rate</p>
                <p className="font-medium">{formatRate(mortgage.target_rate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Loan Amount</p>
                <p className="font-medium">{formatCurrency(mortgage.loan_amount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Current Payment</p>
                <p className="font-medium">{formatCurrency(currentPayment)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">New Payment</p>
                <p className="font-medium">{formatCurrency(newPayment)}</p>
              </div>
            </div>

            {monthlySavings > 0 && (
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm text-green-700">
                  Potential Monthly Savings: {formatCurrency(monthlySavings)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Rate Tracking</h1>
          <p className="mt-2 text-sm text-gray-700">
            Monitor daily mortgage rates and compare with your clients' rates
          </p>
        </div>
      </div>

      {/* Current Rate Card */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Current {selectedTerm}-Year Rate</h2>
            <div className="mt-1 flex items-center">
              <span className="text-3xl font-bold text-gray-900">{formatRate(currentRate)}</span>
              <div className={`ml-3 flex items-center ${rateChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
                {rateChange < 0 ? <ArrowDown className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
                <span className="ml-1 text-sm font-medium">{Math.abs(rateChange).toFixed(3)}%</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {terms.map(term => (
              <button
                key={term}
                onClick={() => setSelectedTerm(term)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  selectedTerm === term
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {term}Y
              </button>
            ))}
          </div>
        </div>

        {/* Rate Chart - Responsive */}
        <div className="mt-6 h-[300px] lg:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rateHistory.filter(r => r.term_years === selectedTerm)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="rate_date"
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(3)}%`}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="rate_value"
                name="Interest Rate"
                stroke="#0A2463"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clients Above Rate Section */}
      <div className="mt-8 bg-white rounded-lg shadow-sm">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Clients Above Current Rate</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Info className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Estimated monthly savings based on current loan terms</span>
              <span className="sm:hidden">Est. monthly savings</span>
            </div>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment at New Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Savings
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientsAboveRate.map((client) => {
                const mortgage = client.mortgages![0];
                const currentPayment = calculateMonthlyPayment(
                  mortgage.loan_amount,
                  mortgage.current_rate,
                  mortgage.term_years
                );
                const newPayment = calculateMonthlyPayment(
                  mortgage.loan_amount,
                  currentRate,
                  mortgage.term_years
                );
                const monthlySavings = currentPayment - newPayment;

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
                      {formatRate(mortgage.current_rate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatRate(mortgage.target_rate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(currentPayment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(newPayment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {formatCurrency(monthlySavings)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden">
          <div className="space-y-4 p-4">
            {clientsAboveRate.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
            {clientsAboveRate.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-900">No Clients Above Rate</p>
                <p className="text-sm text-gray-500">All clients are at or below current market rates</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}