import { supabase } from '../lib/supabase';
import { debug, Category } from '../lib/debug';
import { MortgageRate } from '../types/database';

const COMPONENT_ID = 'RateFetching';

// Cache configuration - reduced to 30 seconds for more frequent updates
const CACHE_DURATION = 30000; 
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

class RateFetchingService {
  private static instance: RateFetchingService;
  private cache: Map<string, { data: MortgageRate[]; timestamp: number }> = new Map();
  private fetchPromise: Promise<MortgageRate[]> | null = null;

  private constructor() {}

  public static getInstance(): RateFetchingService {
    if (!RateFetchingService.instance) {
      RateFetchingService.instance = new RateFetchingService();
    }
    return RateFetchingService.instance;
  }

  private async fetchWithRetry(attempt: number = 0): Promise<MortgageRate[]> {
    try {
      debug.startMark('rate-fetch');
      debug.logInfo(Category.RATES, `Starting rate fetch attempt ${attempt + 1}`);
      
      // Force fresh data from FRED
      const { data, error } = await supabase.functions.invoke('fetch-rates', {
        body: { 
          debug: true,
          forceRefresh: true,
          timestamp: Date.now() // Add timestamp to prevent caching
        }
      });
      
      if (error) {
        debug.logError(Category.RATES, 'Edge function error', { error });
        throw error;
      }
      
      if (!data || !Array.isArray(data)) {
        debug.logError(Category.RATES, 'Invalid response format', { data });
        throw new Error('Invalid response format');
      }

      // Validate rate values
      data.forEach(rate => {
        if (isNaN(rate.value) || rate.value <= 0 || rate.value > 15) {
          throw new Error(`Invalid rate value: ${rate.value}`);
        }
      });
      
      debug.logInfo(Category.RATES, 'Successfully fetched rates', {
        rateCount: data.length,
        rates: data
      });
      
      debug.endMark('rate-fetch', Category.RATES);
      
      return data;
    } catch (error) {
      if (attempt < RETRY_ATTEMPTS) {
        debug.logWarning(
          Category.RATES,
          `Fetch attempt ${attempt + 1} failed, retrying...`,
          { error },
          COMPONENT_ID
        );
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
        return this.fetchWithRetry(attempt + 1);
      }
      throw error;
    }
  }

  public async getRates(forceFetch: boolean = false): Promise<MortgageRate[]> {
    const cacheKey = 'current-rates';
    const now = Date.now();
    const cached = this.cache.get(cacheKey);

    // Always force fetch if no cached data exists
    if (forceFetch || !cached || now - cached.timestamp >= CACHE_DURATION) {
      try {
        // Use existing promise if one is in flight
        if (this.fetchPromise) {
          debug.logInfo(Category.RATES, 'Using existing fetch promise');
          return await this.fetchPromise;
        }

        // Create new fetch promise
        this.fetchPromise = this.fetchWithRetry();
        const rates = await this.fetchPromise;

        // Update cache with new data
        this.cache.set(cacheKey, { data: rates, timestamp: now });
        
        return rates;
      } catch (error) {
        debug.logError(Category.RATES, 'Failed to fetch rates', {}, error);
        
        // Use cached data if available, even if expired
        if (cached) {
          debug.logWarning(Category.RATES, 'Using expired cache after fetch failure', {
            cacheAge: now - cached.timestamp,
            rates: cached.data
          });
          return cached.data;
        }
        
        throw error;
      } finally {
        this.fetchPromise = null;
      }
    }

    debug.logInfo(Category.RATES, 'Using cached rates', {
      cacheAge: now - cached.timestamp,
      rates: cached.data
    });
    return cached.data;
  }

  public clearCache(): void {
    this.cache.clear();
    debug.logInfo(Category.RATES, 'Rate cache cleared');
  }
}

// Export singleton instance
export const rateFetchingService = RateFetchingService.getInstance();

// Export convenience method
export async function fetchDailyRates(forceFetch: boolean = false): Promise<MortgageRate[]> {
  return rateFetchingService.getRates(forceFetch);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  rateFetchingService.clearCache();
});