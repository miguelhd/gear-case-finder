// Monitoring system for Gear Case Finder application
import { createLogger, format, transports } from 'winston';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { scraperMetrics, getScraperHealth } from './monitoring'
import { getCacheStats } from './cache';
import { mongoose } from './mongodb';

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Create the system logger
const systemLogger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'system-monitor' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new transports.File({ 
      filename: path.join(logDir, 'system-error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new transports.File({ 
      filename: path.join(logDir, 'system.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  systemLogger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    ),
  }));
}

// System metrics tracking
class SystemMetrics {
  private metrics: {
    cpu: {
      usage: number[];
      average: number;
    };
    memory: {
      total: number;
      free: number;
      used: number;
      usagePercent: number;
    };
    uptime: number;
    lastUpdated: Date;
    apiRequests: {
      total: number;
      byEndpoint: Record<string, number>;
      responseTime: {
        average: number;
        min: number;
        max: number;
        samples: number[];
      };
      errors: {
        count: number;
        byStatusCode: Record<string, number>;
      };
    };
    database: {
      connectionStatus: 'connected' | 'disconnected' | 'error';
      queryCount: number;
      averageQueryTime: number;
      errors: number;
    };
  };

  constructor() {
    this.metrics = {
      cpu: {
        usage: [],
        average: 0
      },
      memory: {
        total: 0,
        free: 0,
        used: 0,
        usagePercent: 0
      },
      uptime: 0,
      lastUpdated: new Date(),
      apiRequests: {
        total: 0,
        byEndpoint: {},
        responseTime: {
          average: 0,
          min: 0,
          max: 0,
          samples: []
        },
        errors: {
          count: 0,
          byStatusCode: {}
        }
      },
      database: {
        connectionStatus: 'disconnected',
        queryCount: 0,
        averageQueryTime: 0,
        errors: 0
      }
    };
  }

  // Update system metrics
  updateSystemMetrics(): void {
    // Update CPU usage
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });
    
    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - (idle / total) * 100;
    
    this.metrics.cpu.usage.push(usage);
    
    // Keep only the last 60 samples
    if (this.metrics.cpu.usage.length > 60) {
      this.metrics.cpu.usage.shift();
    }
    
    // Calculate average CPU usage
    this.metrics.cpu.average = this.metrics.cpu.usage.reduce((sum, val) => sum + val, 0) / this.metrics.cpu.usage.length;
    
    // Update memory usage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    this.metrics.memory = {
      total: totalMemory,
      free: freeMemory,
      used: usedMemory,
      usagePercent: (usedMemory / totalMemory) * 100
    };
    
    // Update uptime
    this.metrics.uptime = os.uptime();
    
    // Update timestamp
    this.metrics.lastUpdated = new Date();
    
    // Log system metrics
    systemLogger.debug('System metrics updated', {
      cpu: this.metrics.cpu,
      memory: this.metrics.memory,
      uptime: this.metrics.uptime
    });
  }

  // Record API request
  recordApiRequest(endpoint: string, responseTime: number, statusCode: number): void {
    // Update total requests
    this.metrics.apiRequests.total++;
    
    // Update requests by endpoint
    if (!this.metrics.apiRequests.byEndpoint[endpoint]) {
      this.metrics.apiRequests.byEndpoint[endpoint] = 0;
    }
    this.metrics.apiRequests.byEndpoint[endpoint]++;
    
    // Update response time metrics
    this.metrics.apiRequests.responseTime.samples.push(responseTime);
    
    // Keep only the last 1000 samples
    if (this.metrics.apiRequests.responseTime.samples.length > 1000) {
      this.metrics.apiRequests.responseTime.samples.shift();
    }
    
    // Recalculate response time stats
    const samples = this.metrics.apiRequests.responseTime.samples;
    this.metrics.apiRequests.responseTime.average = samples.reduce((sum, val) => sum + val, 0) / samples.length;
    this.metrics.apiRequests.responseTime.min = Math.min(...samples);
    this.metrics.apiRequests.responseTime.max = Math.max(...samples);
    
    // Record errors if status code is 4xx or 5xx
    if (statusCode >= 400) {
      this.metrics.apiRequests.errors.count++;
      
      const statusCodeStr = statusCode.toString();
      if (!this.metrics.apiRequests.errors.byStatusCode[statusCodeStr]) {
        this.metrics.apiRequests.errors.byStatusCode[statusCodeStr] = 0;
      }
      this.metrics.apiRequests.errors.byStatusCode[statusCodeStr]++;
      
      // Log error
      systemLogger.error('API request error', {
        endpoint,
        statusCode,
        responseTime
      });
    }
  }

  // Update database metrics
  updateDatabaseMetrics(connected: boolean, queryTime?: number, isError?: boolean): void {
    // Update connection status
    this.metrics.database.connectionStatus = connected ? 'connected' : 'disconnected';
    
    // If query time is provided, update query metrics
    if (queryTime !== undefined) {
      this.metrics.database.queryCount++;
      
      // Update average query time using a weighted average
      const oldWeight = (this.metrics.database.queryCount - 1) / this.metrics.database.queryCount;
      const newWeight = 1 / this.metrics.database.queryCount;
      
      this.metrics.database.averageQueryTime = 
        (this.metrics.database.averageQueryTime * oldWeight) + (queryTime * newWeight);
    }
    
    // If error flag is provided, update error count
    if (isError) {
      this.metrics.database.errors++;
      
      // Log database error
      systemLogger.error('Database operation error');
    }
  }

  // Get all metrics
  getAllMetrics() {
    return {
      system: {
        cpu: this.metrics.cpu,
        memory: this.metrics.memory,
        uptime: this.metrics.uptime,
        lastUpdated: this.metrics.lastUpdated
      },
      api: this.metrics.apiRequests,
      database: this.metrics.database,
      scrapers: getScraperHealth(),
      cache: getCacheStats()
    };
  }

  // Get system health status
  getSystemHealth() {
    // Determine overall system health
    let status = 'healthy';
    const issues: string[] = [];
    
    // Check CPU usage (warning if > 80%, critical if > 90%)
    if (this.metrics.cpu.average > 90) {
      status = 'critical';
      issues.push('CPU usage is extremely high');
    } else if (this.metrics.cpu.average > 80) {
      if (status !== 'critical') status = 'warning';
      issues.push('CPU usage is high');
    }
    
    // Check memory usage (warning if > 85%, critical if > 95%)
    if (this.metrics.memory.usagePercent > 95) {
      status = 'critical';
      issues.push('Memory usage is extremely high');
    } else if (this.metrics.memory.usagePercent > 85) {
      if (status !== 'critical') status = 'warning';
      issues.push('Memory usage is high');
    }
    
    // Check API error rate (warning if > 5%, critical if > 10%)
    const errorRate = this.metrics.apiRequests.total > 0 
      ? (this.metrics.apiRequests.errors.count / this.metrics.apiRequests.total) * 100 
      : 0;
    
    if (errorRate > 10) {
      status = 'critical';
      issues.push('API error rate is extremely high');
    } else if (errorRate > 5) {
      if (status !== 'critical') status = 'warning';
      issues.push('API error rate is high');
    }
    
    // Check database status
    if (this.metrics.database.connectionStatus === 'error') {
      status = 'critical';
      issues.push('Database connection error');
    } else if (this.metrics.database.connectionStatus === 'disconnected') {
      status = 'critical';
      issues.push('Database is disconnected');
    }
    
    // Check scraper health
    const scraperHealth = getScraperHealth();
    if (scraperHealth.status === 'critical') {
      status = 'critical';
      issues.push('Scraper system is in critical state');
    } else if (scraperHealth.status === 'warning') {
      if (status !== 'critical') status = 'warning';
      issues.push('Scraper system has warnings');
    }
    
    return {
      status,
      issues,
      timestamp: new Date(),
      metrics: this.getAllMetrics()
    };
  }
}

// Create a singleton instance of the system metrics
export const systemMetrics = new SystemMetrics();

// Start monitoring system metrics
let monitoringInterval: NodeJS.Timeout | null = null;

export function startMonitoring(intervalMs = 60000): void {
  // Stop any existing monitoring
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
  }
  
  // Update metrics immediately
  systemMetrics.updateSystemMetrics();
  
  // Set up interval for regular updates
  monitoringInterval = setInterval(() => {
    systemMetrics.updateSystemMetrics();
  }, intervalMs);
  
  systemLogger.info('System monitoring started', { intervalMs });
}

export function stopMonitoring(): void {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    systemLogger.info('System monitoring stopped');
  }
}

// API monitoring middleware
export function apiMonitoringMiddleware(req: any, res: any, next: Function): void {
  const startTime = Date.now();
  const originalEnd = res.end;
  
  // Override res.end to capture response time and status
  res.end = function(...args: any[]) {
    const responseTime = Date.now() - startTime;
    const endpoint = req.originalUrl || req.url;
    const statusCode = res.statusCode;
    
    // Record API request
    systemMetrics.updateDatabaseMetrics(mongoose.connection.readyState === 1);
    systemMetrics.recordApiRequest(endpoint, responseTime, statusCode);
    
    // Call the original end method
    return originalEnd.apply(this, args);
  };
  
  next();
}

// Database monitoring
mongoose.connection.on('connected', () => {
  systemMetrics.updateDatabaseMetrics(true);
  systemLogger.info('Database connected');
});

mongoose.connection.on('disconnected', () => {
  systemMetrics.updateDatabaseMetrics(false);
  systemLogger.warn('Database disconnected');
});

mongoose.connection.on('error', (err) => {
  systemMetrics.updateDatabaseMetrics(false, undefined, true);
  systemLogger.error('Database connection error', { error: err });
});

// Export monitoring system
export default {
  systemLogger,
  systemMetrics,
  startMonitoring,
  stopMonitoring,
  apiMonitoringMiddleware
};
