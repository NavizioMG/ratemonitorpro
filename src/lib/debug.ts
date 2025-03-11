import { supabase } from './supabase';

// Debug levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Debug categories
export enum Category {
  AUTH = 'AUTH',
  DATABASE = 'DATABASE',
  API = 'API',
  RATES = 'RATES',
  PERFORMANCE = 'PERFORMANCE',
  LIFECYCLE = 'LIFECYCLE',
  NETWORK = 'NETWORK',
  MEMORY = 'MEMORY',
  RENDER = 'RENDER'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: Category;
  message: string;
  data?: any;
  error?: any;
  componentId?: string;
  renderCount?: number;
  memoryUsage?: any;
  networkInfo?: any;
}

interface ComponentRenderInfo {
  count: number;
  lastRender: number;
  renderTimes: number[];
}

class DebugManager {
  private static instance: DebugManager | null = null;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private debugEnabled: boolean = true;
  private errorCount: number = 0;
  private readonly ERROR_THRESHOLD = 10;
  private readonly ERROR_WINDOW = 60000;
  private lastErrorReset: number = Date.now();
  private componentRenders: Map<string, ComponentRenderInfo> = new Map();
  private performanceMarks: Map<string, number> = new Map();
  private networkRequests: Map<string, { start: number; end?: number }> = new Map();
  private memoryWarningThreshold: number = 0.9;
  private memoryCheckInterval?: NodeJS.Timeout;

  private constructor() {
    this.debugEnabled = import.meta.env.MODE === 'development';
    this.setupErrorHandling();
    this.startErrorMonitoring();
    this.startPerformanceMonitoring();
    this.startMemoryMonitoring();
    this.setupNetworkMonitoring();
  }

  public static getInstance(): DebugManager {
    if (!DebugManager.instance) {
      DebugManager.instance = new DebugManager();
    }
    return DebugManager.instance;
  }

  private setupErrorHandling() {
    window.onerror = (message, source, lineno, colno, error) => {
      this.logError(Category.API, 'Global error caught', { message, source, lineno, colno }, error);
      return false;
    };

    window.onunhandledrejection = (event) => {
      this.logError(Category.API, 'Unhandled promise rejection', { reason: event.reason });
      return false;
    };
  }

  private startErrorMonitoring() {
    setInterval(() => {
      const now = Date.now();
      if (now - this.lastErrorReset >= this.ERROR_WINDOW) {
        this.errorCount = 0;
        this.lastErrorReset = now;
      }
    }, this.ERROR_WINDOW);
  }

  private startPerformanceMonitoring() {
    if (typeof window !== 'undefined' && window.performance) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask') {
            this.logWarning(Category.PERFORMANCE, 'Long task detected', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
    }
  }

  private startMemoryMonitoring() {
    if (typeof window !== 'undefined' && (performance as any).memory) {
      this.memoryCheckInterval = setInterval(() => {
        const memory = (performance as any).memory;
        const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

        if (usage > this.memoryWarningThreshold) {
          this.logWarning(Category.MEMORY, 'High memory usage detected', {
            used: memory.usedJSHeapSize,
            total: memory.jsHeapSizeLimit,
            usage: usage
          });
        }
      }, 30000);
    }
  }

  private setupNetworkMonitoring() {
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const requestId = Math.random().toString(36).substring(7);
        const startTime = Date.now();
        this.networkRequests.set(requestId, { start: startTime });

        try {
          const response = await originalFetch(...args);
          const endTime = Date.now();
          this.networkRequests.get(requestId)!.end = endTime;

          const duration = endTime - startTime;
          if (duration > 1000) {
            this.logWarning(Category.NETWORK, 'Slow network request', {
              url: args[0],
              duration,
              requestId
            });
          }

          return response;
        } catch (error) {
          this.logError(Category.NETWORK, 'Network request failed', {
            url: args[0],
            requestId
          }, error);
          throw error;
        }
      };
    }
  }

  public startMark(markId: string) {
    this.performanceMarks.set(markId, performance.now());
  }

  public endMark(markId: string, category: Category) {
    const startTime = this.performanceMarks.get(markId);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.performanceMarks.delete(markId);

      if (duration > 1000) {
        this.logWarning(category, `Long operation detected: ${markId}`, {
          duration,
          markId
        });
      }

      return duration;
    }
    return null;
  }

  public trackComponentRender(componentId: string): number {
    const now = Date.now();
    const renderInfo = this.componentRenders.get(componentId) || {
      count: 0,
      lastRender: now,
      renderTimes: []
    };

    const timeSinceLastRender = now - renderInfo.lastRender;
    renderInfo.count++;
    renderInfo.lastRender = now;
    renderInfo.renderTimes.push(timeSinceLastRender);

    if (renderInfo.renderTimes.length > 10) {
      renderInfo.renderTimes.shift();
    }

    const recentRenders = renderInfo.renderTimes.filter(time => time < 1000);
    if (recentRenders.length > 3) {
      this.logWarning(Category.RENDER, 'Excessive re-renders detected', {
        componentId,
        renderCount: renderInfo.count,
        recentRenders: recentRenders.length,
        averageInterval: recentRenders.reduce((a, b) => a + b, 0) / recentRenders.length
      });
    }

    this.componentRenders.set(componentId, renderInfo);
    return renderInfo.count;
  }

  public logDebug(category: Category, message: string, data?: any, componentId?: string) {
    this.addLog(LogLevel.DEBUG, category, message, data, undefined, componentId);
  }

  public logInfo(category: Category, message: string, data?: any, componentId?: string) {
    this.addLog(LogLevel.INFO, category, message, data, undefined, componentId);
  }

  public logWarning(category: Category, message: string, data?: any, componentId?: string) {
    this.addLog(LogLevel.WARN, category, message, data, undefined, componentId);
  }

  public logError(category: Category, message: string, data?: any, error?: any, componentId?: string) {
    this.addLog(LogLevel.ERROR, category, message, data, error, componentId);
    this.incrementErrorCount();
  }

  private addLog(level: LogLevel, category: Category, message: string, data?: any, error?: any, componentId?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      error,
      componentId
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    if (this.debugEnabled) {
      const style = this.getLogStyle(level);
      console.log(
        `%c[${entry.timestamp}] [${level}] [${category}]${componentId ? ` [${componentId}]` : ''} ${message}`,
        style,
        data || '',
        error || ''
      );
    }
  }

  private getLogStyle(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return 'color: #ff0000; font-weight: bold';
      case LogLevel.WARN:
        return 'color: #ffa500; font-weight: bold';
      case LogLevel.INFO:
        return 'color: #0000ff';
      default:
        return 'color: #666666';
    }
  }

  private incrementErrorCount() {
    this.errorCount++;
    if (this.errorCount >= this.ERROR_THRESHOLD) {
      this.logWarning(Category.API, 'Error threshold exceeded, consider refreshing the application');
      this.errorCount = 0;
    }
  }

  public async checkDatabaseHealth(): Promise<boolean> {
    try {
      const start = performance.now();
      const { data, error } = await supabase.from('profiles').select('count').single();
      const duration = performance.now() - start;

      if (error) {
        this.logError(Category.DATABASE, 'Database health check failed', { duration }, error);
        return false;
      }

      this.logInfo(Category.DATABASE, 'Database health check passed', { duration, data });
      return true;
    } catch (err) {
      this.logError(Category.DATABASE, 'Database health check error', {}, err);
      return false;
    }
  }

  public getLogs(level?: LogLevel, category?: Category, limit: number = 100): LogEntry[] {
    return this.logs
      .filter(log => (!level || log.level === level) && (!category || log.category === category))
      .slice(0, limit);
  }

  public clearLogs() {
    this.logs = [];
    this.errorCount = 0;
    this.lastErrorReset = Date.now();
  }

  public getErrorCount(): number {
    return this.errorCount;
  }

  public async exportLogs(): Promise<string> {
    return JSON.stringify(this.logs, null, 2);
  }

  public cleanup() {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
    }
  }
}

export const debug = DebugManager.getInstance();