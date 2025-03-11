import { useEffect, useState, useCallback } from 'react';
import { fetchDailyRates } from '../services/rateFetching';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { debug, Category } from '../lib/debug';
import { useAuth } from '../contexts/AuthContext';

const COMPONENT_ID = 'RateTest';

export function RateTest() {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const fetchRates = useCallback(async () => {
    try {
      debug.logInfo(Category.RATES, 'Starting rate fetch', {}, COMPONENT_ID);
      debug.startMark('rate-fetch');
      setLoading(true);
      
      // Check database health before fetching
      const isHealthy = await debug.checkDatabaseHealth();
      if (!isHealthy) {
        debug.logWarning(Category.DATABASE, 'Database health check failed before rate fetch', {}, COMPONENT_ID);
        throw new Error('Database connection error');
      }

      const fetchedRates = await fetchDailyRates();
      debug.endMark('rate-fetch', Category.RATES);
      
      debug.logInfo(Category.RATES, 'Rates fetched successfully', { 
        count: fetchedRates.length,
        rates: fetchedRates 
      }, COMPONENT_ID);

      setRates(fetchedRates);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch rates';
      debug.logError(Category.RATES, 'Rate fetch failed', { error: errorMessage }, err, COMPONENT_ID);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const loadRates = async () => {
      try {
        debug.logInfo(Category.LIFECYCLE, 'RateTest effect running', {}, COMPONENT_ID);
        await fetchRates();
      } catch (error) {
        if (mounted) {
          debug.logError(Category.RATES, 'Error loading rates', {}, error, COMPONENT_ID);
          // Retry after 5 seconds
          retryTimeout = setTimeout(loadRates, 5000);
        }
      }
    };

    if (session) {
      loadRates();
    }

    return () => {
      mounted = false;
      clearTimeout(retryTimeout);
      debug.logInfo(Category.LIFECYCLE, 'RateTest cleanup', {
        hadRetryScheduled: !!retryTimeout
      }, COMPONENT_ID);
    };
  }, [fetchRates, session]);

  if (loading) {
    debug.logDebug(Category.LIFECYCLE, 'Rendering loading state', {}, COMPONENT_ID);
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  debug.logDebug(Category.LIFECYCLE, 'Rendering rates display', {
    hasError: !!error,
    rateCount: rates.length
  }, COMPONENT_ID);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">FRED API Test Results</h2>
      
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start">
          <AlertCircle className="text-red-500 w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-medium">Error Fetching Rates</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-start">
          <CheckCircle2 className="text-green-500 w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className="text-green-800 font-medium">Successfully Retrieved Rates</h3>
            <p className="text-green-600 mt-1">Found {rates.length} rates</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Term (Years)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rates.map((rate, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {rate.termYears}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {rate.value.toFixed(3)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(rate.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}