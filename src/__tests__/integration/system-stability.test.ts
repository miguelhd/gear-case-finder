// Integration test for system stability
import { systemMetrics, startMonitoring, stopMonitoring } from '../../lib/system-monitoring';
import { mongoose } from '../../lib/mongodb';
import { clearCache, setCacheItem } from '../../lib/cache';
import { scraperMetrics } from '../../lib/monitoring';

describe('System Stability Tests', () => {
  beforeAll(() => {
    // Start monitoring with a short interval for testing
    startMonitoring(1000);
  });

  afterAll(() => {
    // Stop monitoring
    stopMonitoring();
  });

  beforeEach(() => {
    // Reset metrics before each test
    clearCache();
    scraperMetrics.resetAllMetrics();
  });

  test('System metrics are collected correctly', async () => {
    // Wait for metrics to be collected
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get system health
    const health = systemMetrics.getSystemHealth();
    
    // Verify structure
    expect(health).toHaveProperty('status');
    expect(health).toHaveProperty('issues');
    expect(health).toHaveProperty('timestamp');
    expect(health).toHaveProperty('metrics');
    
    // Verify metrics
    expect(health.metrics.system).toHaveProperty('cpu');
    expect(health.metrics.system).toHaveProperty('memory');
    expect(health.metrics.system).toHaveProperty('uptime');
    
    // CPU metrics should be numbers
    expect(typeof health.metrics.system.cpu.average).toBe('number');
    expect(health.metrics.system.cpu.usage.length).toBeGreaterThan(0);
    
    // Memory metrics should be numbers
    expect(typeof health.metrics.system.memory.total).toBe('number');
    expect(typeof health.metrics.system.memory.free).toBe('number');
    expect(typeof health.metrics.system.memory.used).toBe('number');
    expect(typeof health.metrics.system.memory.usagePercent).toBe('number');
    
    // Uptime should be a number
    expect(typeof health.metrics.system.uptime).toBe('number');
  });

  test('API metrics are recorded correctly', () => {
    // Simulate API requests
    systemMetrics.recordApiRequest('/api/gear', 50, 200);
    systemMetrics.recordApiRequest('/api/cases', 75, 200);
    systemMetrics.recordApiRequest('/api/matches', 120, 200);
    systemMetrics.recordApiRequest('/api/gear/123', 30, 404);
    
    // Get metrics
    const metrics = systemMetrics.getAllMetrics();
    
    // Verify API metrics
    expect(metrics.api.total).toBe(4);
    expect(metrics.api.byEndpoint).toHaveProperty('/api/gear');
    expect(metrics.api.byEndpoint).toHaveProperty('/api/cases');
    expect(metrics.api.byEndpoint).toHaveProperty('/api/matches');
    expect(metrics.api.byEndpoint).toHaveProperty('/api/gear/123');
    
    // Verify response time metrics
    expect(metrics.api.responseTime.samples.length).toBe(4);
    expect(metrics.api.responseTime.average).toBeGreaterThan(0);
    expect(metrics.api.responseTime.min).toBe(30);
    expect(metrics.api.responseTime.max).toBe(120);
    
    // Verify error metrics
    expect(metrics.api.errors.count).toBe(1);
    expect(metrics.api.errors.byStatusCode).toHaveProperty('404');
  });

  test('Database metrics are updated correctly', () => {
    // Simulate database operations
    systemMetrics.updateDatabaseMetrics(true);
    systemMetrics.updateDatabaseMetrics(true, 50);
    systemMetrics.updateDatabaseMetrics(true, 75);
    systemMetrics.updateDatabaseMetrics(true, 100, false);
    
    // Get metrics
    const metrics = systemMetrics.getAllMetrics();
    
    // Verify database metrics
    expect(metrics.database.connectionStatus).toBe('connected');
    expect(metrics.database.queryCount).toBe(3);
    expect(metrics.database.averageQueryTime).toBeGreaterThan(0);
    expect(metrics.database.errors).toBe(0);
    
    // Simulate database error
    systemMetrics.updateDatabaseMetrics(true, 200, true);
    
    // Get updated metrics
    const updatedMetrics = systemMetrics.getAllMetrics();
    
    // Verify error count increased
    expect(updatedMetrics.database.errors).toBe(1);
  });

  test('Cache metrics are integrated correctly', () => {
    // Add items to cache
    setCacheItem('test1', 'value1');
    setCacheItem('test2', 'value2');
    setCacheItem('test3', 'value3');
    
    // Get metrics
    const metrics = systemMetrics.getAllMetrics();
    
    // Verify cache metrics
    expect(metrics.cache).toBeDefined();
    expect(metrics.cache.itemCount).toBe(3);
  });

  test('Scraper metrics are integrated correctly', () => {
    // Record scraper metrics
    scraperMetrics.recordRequest('amazon', true);
    scraperMetrics.recordRequest('amazon', true);
    scraperMetrics.recordRequest('amazon', false);
    scraperMetrics.recordScrapedItems('amazon', 10);
    
    // Get metrics
    const metrics = systemMetrics.getAllMetrics();
    
    // Verify scraper metrics
    expect(metrics.scrapers).toBeDefined();
    expect(metrics.scrapers.marketplaces).toHaveProperty('amazon');
    expect(metrics.scrapers.marketplaces.amazon.successRate).toBeCloseTo(66.67, 1);
  });

  test('System health status is calculated correctly', () => {
    // Set up a healthy system
    systemMetrics.updateDatabaseMetrics(true);
    
    // Get health status
    const healthyStatus = systemMetrics.getSystemHealth();
    
    // Verify healthy status
    expect(healthyStatus.status).toBe('healthy');
    expect(healthyStatus.issues.length).toBe(0);
    
    // Simulate database disconnection (critical issue)
    systemMetrics.updateDatabaseMetrics(false);
    
    // Get updated health status
    const criticalStatus = systemMetrics.getSystemHealth();
    
    // Verify critical status
    expect(criticalStatus.status).toBe('critical');
    expect(criticalStatus.issues.length).toBeGreaterThan(0);
    expect(criticalStatus.issues).toContain('Database is disconnected');
  });
});
