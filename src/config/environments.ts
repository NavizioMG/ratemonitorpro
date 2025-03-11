export interface Environment {
  name: string;
  apiUrl: string;
  appUrl: string;
  debug: boolean;
  analytics: boolean;
  features: {
    notifications: boolean;
    rateAlerts: boolean;
  };
  rateMonitoring: {
    updateInterval: number;
    businessHours: {
      start: number;
      end: number;
    };
  };
}

const environments: Record<string, Environment> = {
  development: {
    name: import.meta.env.VITE_APP_NAME || 'Mortgage Rate Monitor (Dev)',
    apiUrl: import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321',
    appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    debug: true,
    analytics: false,
    features: {
      notifications: true,
      rateAlerts: true,
    },
    rateMonitoring: {
      updateInterval: 3600000,
      businessHours: {
        start: 8,
        end: 18,
      },
    },
  },
  staging: {
    name: import.meta.env.VITE_APP_NAME || 'Mortgage Rate Monitor (Staging)',
    apiUrl: import.meta.env.VITE_SUPABASE_URL,
    appUrl: import.meta.env.VITE_APP_URL,
    debug: true,
    analytics: true,
    features: {
      notifications: true,
      rateAlerts: true,
    },
    rateMonitoring: {
      updateInterval: 3600000,
      businessHours: {
        start: 8,
        end: 18,
      },
    },
  },
  production: {
    name: import.meta.env.VITE_APP_NAME || 'Mortgage Rate Monitor',
    apiUrl: import.meta.env.VITE_SUPABASE_URL,
    appUrl: import.meta.env.VITE_APP_URL,
    debug: false,
    analytics: true,
    features: {
      notifications: true,
      rateAlerts: true,
    },
    rateMonitoring: {
      updateInterval: 3600000,
      businessHours: {
        start: 8,
        end: 18,
      },
    },
  },
};

export const currentEnvironment = environments[import.meta.env.VITE_APP_ENV || 'development'];