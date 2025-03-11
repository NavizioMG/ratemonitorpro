import { useState, useEffect } from 'react';
import { TrendingUp, ArrowUp, ArrowDown, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { debug, Category } from '../lib/debug';

interface Rate {
  rate_value: number;
  rate_date: string;
  created_at: string;
  term_years: number;
}

const POLL_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

export function CurrentRateCard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRate, setCurrentRate] = useState<Rate | null>(null);
  const [previousRate, setPreviousRate] = useState<Rate | null>(null);
  const [selectedTerm, setSelectedTerm] = useState(30);
  const [refreshing, setRefreshing] = useState(false);

  const terms = [15, 20, 30];

  const fetchRates = async () => {
    try {
      setError(null);
      
      // Get the most recent rate for selected term
      const { data: latestRates, error: latestError } = await supabase
        .from('rate_history')
        .select('*')
        .eq('term_years', selectedTerm)
        .order('rate_date', { ascending: false })
        .limit(2); // Get 2 most recent rates

      if (latestError) throw latestError;

      // Handle no rates case
      if (!latestRates || latestRates.length === 0) {
        debug.logInfo(Category.RATES, 'No rates found, triggering initial fetch');
        await handleRefresh(); // Trigger initial rate fetch
        return;
      }

      setCurrentRate(latestRates[0]);
      setPreviousRate(latestRates[1] || null);
      
      debug.logInfo(Category.RATES, 'Fetched rates from Supabase', {
        current: latestRates[0],
        previous: latestRates[1]
      });
    } catch (err) {
      debug.logError(Category.RATES, 'Error fetching rates', {}, err);
      setError('Failed to fetch current rates');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      // Force a new FRED API fetch
      const { error: fetchError } = await supabase.functions.invoke('fetch-rates', {
        body: { 
          forceRefresh: true,
          timestamp: Date.now() // Cache buster
        }
      });

      if (fetchError) throw fetchError;

      // Wait a moment for the data to be stored
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refetch rates from Supabase
      await fetchRates();
    } catch (err) {
      debug.logError(Category.RATES, 'Error refreshing rates', {}, err);
      setError('Failed to refresh rates');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRates();
    
    // Set up polling every 6 hours
    const interval = setInterval(fetchRates, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [selectedTerm]);

  const formatRate = (rate: number) => `${rate.toFixed(3)}%`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString();
  const formatTime = (date: string) => new Date(date).toLocaleTimeString();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  const rateChange = currentRate && previousRate 
    ? currentRate.rate_value - previousRate.rate_value 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-medium text-gray-900">
            Current {selectedTerm}-Year Fixed Rate
          </h2>
        </div>
        <div className="flex items-center space-x-4">
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
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      ) : currentRate ? (
        <>
          <div className="mt-4 flex items-center">
            <span className="text-3xl font-bold text-gray-900">
              {formatRate(currentRate.rate_value)}
            </span>
            {rateChange !== 0 && (
              <div className={`ml-3 flex items-center ${
                rateChange < 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {rateChange < 0 ? (
                  <ArrowDown className="h-5 w-5" />
                ) : (
                  <ArrowUp className="h-5 w-5" />
                )}
                <span className="ml-1 text-sm font-medium">
                  {Math.abs(rateChange).toFixed(3)}%
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Last Updated: {formatDate(currentRate.created_at)} at {formatTime(currentRate.created_at)}
            </div>
            <div>
              Rate Date: {formatDate(currentRate.rate_date)}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4 flex flex-col items-center justify-center py-6">
          <AlertTriangle className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-600">No rate data available</p>
          <button
            onClick={handleRefresh}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Fetch Latest Rates
          </button>
        </div>
      )}
    </div>
  );
}