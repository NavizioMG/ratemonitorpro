import { currentEnvironment } from './environments';

// App Configuration
export const APP_NAME = currentEnvironment.name;
export const APP_URL = currentEnvironment.appUrl;
export const IS_DEBUG = currentEnvironment.debug;
export const IS_PRODUCTION = import.meta.env.VITE_APP_ENV === 'production';

// API Configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const FRED_API_KEY = import.meta.env.VITE_FRED_API_KEY;

// Feature Flags
export const ENABLE_NOTIFICATIONS = currentEnvironment.features.notifications;
export const ENABLE_RATE_ALERTS = currentEnvironment.features.rateAlerts;

// Rate Monitoring Configuration
export const RATE_UPDATE_INTERVAL = currentEnvironment.rateMonitoring.updateInterval;
export const BUSINESS_HOURS = currentEnvironment.rateMonitoring.businessHours;

// Auth Configuration
export const AUTH_CONFIG = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  flowType: 'pkce' as const,
};

// Debug Configuration
export const DEBUG_LEVEL = import.meta.env.VITE_DEBUG_LEVEL || 'error';

// Analytics Configuration
export const ENABLE_ANALYTICS = currentEnvironment.analytics;

// Cache Configuration
export const CACHE_CONFIG = {
  rateHistory: {
    duration: 3600000, // 1 hour
    key: 'rate-history',
  },
  clientList: {
    duration: 300000, // 5 minutes
    key: 'client-list',
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  auth: {
    invalidCredentials: 'Invalid email or password',
    networkError: 'Network error. Please check your connection',
    sessionExpired: 'Your session has expired. Please sign in again',
  },
  rates: {
    fetchError: 'Unable to fetch current rates',
    updateError: 'Failed to update rate information',
  },
  clients: {
    fetchError: 'Unable to load client list',
    updateError: 'Failed to update client information',
    deleteError: 'Failed to delete client',
  },
};

// Validation Rules
export const VALIDATION_RULES = {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
  },
  rates: {
    min: 0,
    max: 15,
    decimals: 3,
  },
  loanAmount: {
    min: 1000,
    max: 100000000,
  },
};