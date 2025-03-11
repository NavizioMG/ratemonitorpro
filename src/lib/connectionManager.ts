import { supabase } from './supabase';
import { debug, Category } from './debug';

class ConnectionManager {
  private static instance: ConnectionManager;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  private readonly MAX_RETRY_ATTEMPTS = 5;
  private retryAttempts = 0;

  private constructor() {
    this.setupHealthCheck();
    this.setupEventListeners();
  }

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  private setupHealthCheck() {
    // Clear any existing interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Set up periodic health checks
    this.healthCheckInterval = setInterval(async () => {
      await this.checkConnection();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  private setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.handleVisibilityChange();
      }
    });

    // Listen for focus events
    window.addEventListener('focus', () => this.handleFocus());
  }

  private async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('profiles').select('count').single();
      
      if (error) {
        debug.logError(Category.DATABASE, 'Health check failed', {}, error);
        this.handleConnectionError();
        return false;
      }

      // Reset retry attempts on successful connection
      this.retryAttempts = 0;
      return true;
    } catch (err) {
      debug.logError(Category.DATABASE, 'Health check error', {}, err);
      this.handleConnectionError();
      return false;
    }
  }

  private async handleConnectionError() {
    if (this.retryAttempts >= this.MAX_RETRY_ATTEMPTS) {
      debug.logWarning(Category.DATABASE, 'Max retry attempts reached');
      this.showReconnectPrompt();
      return;
    }

    this.retryAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.retryAttempts), 30000);

    debug.logInfo(Category.DATABASE, 'Scheduling reconnection attempt', {
      attempt: this.retryAttempts,
      delay
    });

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(async () => {
      await this.checkConnection();
    }, delay);
  }

  private showReconnectPrompt() {
    const event = new CustomEvent('connection-lost', {
      detail: {
        message: 'Connection lost. Please refresh the page to reconnect.',
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(event);
  }

  private async handleOnline() {
    debug.logInfo(Category.DATABASE, 'Network connection restored');
    await this.checkConnection();
  }

  private handleOffline() {
    debug.logWarning(Category.DATABASE, 'Network connection lost');
  }

  private async handleVisibilityChange() {
    debug.logInfo(Category.DATABASE, 'Tab visibility changed to visible');
    await this.checkConnection();
  }

  private async handleFocus() {
    debug.logInfo(Category.DATABASE, 'Window focused');
    await this.checkConnection();
  }

  public cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
  }
}

export const connectionManager = ConnectionManager.getInstance();