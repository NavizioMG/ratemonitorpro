// API Constants
export const API_URL = import.meta.env.VITE_SUPABASE_URL;
export const API_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const FRED_API_KEY = import.meta.env.VITE_FRED_API_KEY;

// Rate Constants
export const RATE_UPDATE_INTERVAL = 3600000; // 1 hour
export const BUSINESS_HOURS = {
  start: 8, // 8 AM EST
  end: 18, // 6 PM EST
};

// Auth Constants
export const AUTH_TIMEOUT = 10000; // 10 seconds
export const MAX_AUTH_RETRIES = 3;

// Cache Constants
export const CACHE_DURATION = 3600000; // 1 hour

// Error Messages
export const ERROR_MESSAGES = {
  AUTH: {
    TIMEOUT: 'Authentication timed out. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
  },
  API: {
    RATE_LIMIT: 'Too many requests. Please try again later.',
    SERVER_ERROR: 'Server error. Please try again later.',
  },
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  CLIENTS: '/clients',
  RATES: '/rates',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  BILLING: '/billing',
  FEATURES: '/features',
  ABOUT: '/about',
  CONTACT: '/contact',
  BLOG: '/blog',
  LEGAL: '/legal',
};