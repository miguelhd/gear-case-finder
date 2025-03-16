// Unit tests for monitoring functionality
import { 
  scraperLogger, 
  scraperMetrics, 
  monitorScraperJob, 
  getScraperHealth 
} from '../../lib/monitoring';

describe('Monitoring Functionality', () => {
  beforeEach(() => {
    // Reset metrics before each test
    scraperMetrics.resetAllMetrics();
    
    // Mock console methods to prevent test output clutter
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('ScraperMetrics', () => {
    it('should initialize marketplace metrics', () => {
      scraperMetrics.initMarketplace('amazon');
      const metrics = scraperMetrics.getMarketplaceMetrics('amazon');
      
      expect(metrics).toBeDefined();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.successfulRequests).toBe(0);
      expect(metrics.failedRequests).toBe(0);
      expect(metrics.errors).toEqual([]);
    });

    it('should record requests correctly', () => {
      scraperMetrics.recordRequest('amazon', true);
      scraperMetrics.recordRequest('amazon', true);
      scraperMetrics.recordRequest('amazon', false);
      
      const metrics = scraperMetrics.getMarketplaceMetrics('amazon');
      
      expect(metrics.totalRequests).toBe(3);
      expect(metrics.successfulRequests).toBe(2);
      expect(metrics.failedRequests).toBe(1);
    });

    it('should record scraped items', () => {
      scraperMetrics.recordScrapedItems('amazon', 10);
      
      const metrics = scraperMetrics.getMarketplaceMetrics('amazon');
      
      expect(metrics.itemsScraped).toBe(10);
    });

    it('should record database operations', () => {
      scraperMetrics.recordDatabaseOperations('amazon', 5, 3);
      
      const metrics = scraperMetrics.getMarketplaceMetrics('amazon');
      
      expect(metrics.newItemsAdded).toBe(5);
      expect(metrics.itemsUpdated).toBe(3);
    });

    it('should record run time', () => {
      const now = new Date();
      jest.spyOn(global, 'Date').mockImplementation(() => now);
      
      scraperMetrics.recordRunTime('amazon', 1500);
      
      const metrics = scraperMetrics.getMarketplaceMetrics('amazon');
      
      expect(metrics.lastRunTime).toBe(1500);
      expect(metrics.lastRunDate).toEqual(now);
    });

    it('should record errors', () => {
      const now = new Date();
      jest.spyOn(global, 'Date').mockImplementation(() => now);
      
      scraperMetrics.recordError('amazon', 'Test error', 'ERR001');
      
      const metrics = scraperMetrics.getMarketplaceMetrics('amazon');
      
      expect(metrics.errors.length).toBe(1);
      expect(metrics.errors[0]).toEqual({
        timestamp: now,
        message: 'Test error',
        code: 'ERR001'
      });
    });

    it('should record rate limits', () => {
      const now = new Date();
      jest.spyOn(global, 'Date').mockImplementation(() => now);
      
      scraperMetrics.recordRateLimit('amazon', 5000);
      
      const metrics = scraperMetrics.getMarketplaceMetrics('amazon');
      
      expect(metrics.rateLimits.length).toBe(1);
      expect(metrics.rateLimits[0]).toEqual({
        timestamp: now,
        waitTime: 5000
      });
    });

    it('should get summary metrics', () => {
      // Record metrics for multiple marketplaces
      scraperMetrics.recordRequest('amazon', true);
      scraperMetrics.recordRequest('amazon', false);
      scraperMetrics.recordScrapedItems('amazon', 5);
      
      scraperMetrics.recordRequest('ebay', true);
      scraperMetrics.recordScrapedItems('ebay', 3);
      
      const summary = scraperMetrics.getSummaryMetrics();
      
      expect(summary.totalRequests).toBe(3);
      expect(summary.successfulRequests).toBe(2);
      expect(summary.failedRequests).toBe(1);
      expect(summary.itemsScraped).toBe(8);
      expect(summary.marketplaces).toContain('amazon');
      expect(summary.marketplaces).toContain('ebay');
    });

    it('should reset marketplace metrics', () => {
      scraperMetrics.recordRequest('amazon', true);
      scraperMetrics.resetMarketplaceMetrics('amazon');
      
      const metrics = scraperMetrics.getMarketplaceMetrics('amazon');
      
      expect(metrics.totalRequests).toBe(0);
    });

    it('should reset all metrics', () => {
      scraperMetrics.recordRequest('amazon', true);
      scraperMetrics.recordRequest('ebay', true);
      scraperMetrics.resetAllMetrics();
      
      const amazonMetrics = scraperMetrics.getMarketplaceMetrics('amazon');
      const ebayMetrics = scraperMetrics.getMarketplaceMetrics('ebay');
      
      expect(amazonMetrics.totalRequests).toBe(0);
      expect(ebayMetrics.totalRequests).toBe(0);
    });
  });

  describe('monitorScraperJob', () => {
    it('should wrap a function and record metrics', async () => {
      // Create a mock function
      const mockJob = jest.fn().mockResolvedValue({
        itemsScraped: 10,
        itemsAdded: 5,
        itemsUpdated: 3
      });
      
      // Wrap with monitoring
      const monitoredJob = monitorScraperJob('amazon', mockJob);
      
      // Execute the job
      await monitoredJob('param1', 'param2');
      
      // Verify the original function was called with the right parameters
      expect(mockJob).toHaveBeenCalledWith('param1', 'param2');
      
      // Verify metrics were recorded
      const metrics = scraperMetrics.getMarketplaceMetrics('amazon');
      expect(metrics.lastRunTime).toBeGreaterThan(0);
      expect(metrics.lastRunDate).toBeDefined();
    });

    it('should handle errors and record them', async () => {
      // Create a mock function that throws an error
      const mockError = new Error('Test error');
      const mockJob = jest.fn().mockRejectedValue(mockError);
      
      // Wrap with monitoring
      const monitoredJob = monitorScraperJob('amazon', mockJob);
      
      // Execute the job and expect it to throw
      await expect(monitoredJob()).rejects.toThrow(mockError);
      
      // Verify error was recorded
      const metrics = scraperMetrics.getMarketplaceMetrics('amazon');
      expect(metrics.errors.length).toBe(1);
      expect(metrics.errors[0].message).toBe('Test error');
    });
  });

  describe('getScraperHealth', () => {
    it('should return health status for all marketplaces', () => {
      // Set up some metrics
      scraperMetrics.recordRequest('amazon', true);
      scraperMetrics.recordRequest('amazon', true);
      scraperMetrics.recordRequest('amazon', false);
      
      scraperMetrics.recordRequest('ebay', true);
      scraperMetrics.recordRequest('ebay', false);
      scraperMetrics.recordRequest('ebay', false);
      
      // Get health status
      const health = getScraperHealth();
      
      // Verify structure
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('lastUpdated');
      expect(health).toHaveProperty('summary');
      expect(health).toHaveProperty('marketplaces');
      
      // Verify marketplace statuses
      expect(health.marketplaces).toHaveProperty('amazon');
      expect(health.marketplaces).toHaveProperty('ebay');
      
      // Verify status calculations
      expect(health.marketplaces.amazon.successRate).toBe(66.67);
      expect(health.marketplaces.ebay.successRate).toBe(33.33);
      
      // Amazon should be healthy (success rate > 50%)
      expect(health.marketplaces.amazon.status).toBe('healthy');
      
      // eBay should be warning (success rate < 50%)
      expect(health.marketplaces.ebay.status).toBe('warning');
    });
  });
});
