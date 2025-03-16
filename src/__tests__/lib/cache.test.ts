// Unit tests for cache functionality
import { 
  getCache, 
  getCacheItem, 
  setCacheItem, 
  removeCacheItem, 
  clearCache, 
  getCacheStats,
  withCache 
} from '../../lib/cache';

describe('Cache Functionality', () => {
  beforeEach(() => {
    clearCache();
  });

  describe('Basic Cache Operations', () => {
    it('should store and retrieve items', () => {
      const testKey = 'test-key';
      const testValue = { data: 'test-data' };
      
      setCacheItem(testKey, testValue);
      const retrievedValue = getCacheItem(testKey);
      
      expect(retrievedValue).toEqual(testValue);
    });

    it('should return undefined for non-existent items', () => {
      const nonExistentKey = 'non-existent-key';
      const retrievedValue = getCacheItem(nonExistentKey);
      
      expect(retrievedValue).toBeUndefined();
    });

    it('should remove items correctly', () => {
      const testKey = 'test-key';
      const testValue = { data: 'test-data' };
      
      setCacheItem(testKey, testValue);
      const removed = removeCacheItem(testKey);
      const retrievedValue = getCacheItem(testKey);
      
      expect(removed).toBe(true);
      expect(retrievedValue).toBeUndefined();
    });

    it('should clear all items', () => {
      setCacheItem('key1', 'value1');
      setCacheItem('key2', 'value2');
      
      clearCache();
      
      expect(getCacheItem('key1')).toBeUndefined();
      expect(getCacheItem('key2')).toBeUndefined();
    });
  });

  describe('Cache Statistics', () => {
    it('should provide accurate cache statistics', () => {
      // Add some items to the cache
      setCacheItem('key1', 'value1');
      setCacheItem('key2', 'value2');
      setCacheItem('key3', 'value3');
      
      const stats = getCacheStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('itemCount');
      expect(stats).toHaveProperty('maxItems');
      expect(stats).toHaveProperty('hitRate');
      
      expect(stats.itemCount).toBe(3);
    });
  });

  describe('withCache Function', () => {
    it('should cache function results', async () => {
      // Create a mock function that counts calls
      let callCount = 0;
      const expensiveFunction = async (param: string) => {
        callCount++;
        return `Result for ${param}`;
      };
      
      // Wrap the function with cache
      const cachedFunction = withCache(expensiveFunction, 'test-prefix');
      
      // Call the function multiple times with the same parameter
      const result1 = await cachedFunction('test');
      const result2 = await cachedFunction('test');
      const result3 = await cachedFunction('test');
      
      // The function should only be called once, and results should be from cache
      expect(callCount).toBe(1);
      expect(result1).toBe('Result for test');
      expect(result2).toBe('Result for test');
      expect(result3).toBe('Result for test');
    });

    it('should handle different parameters separately', async () => {
      // Create a mock function that counts calls
      let callCount = 0;
      const expensiveFunction = async (param: string) => {
        callCount++;
        return `Result for ${param}`;
      };
      
      // Wrap the function with cache
      const cachedFunction = withCache(expensiveFunction, 'test-prefix');
      
      // Call the function with different parameters
      const result1 = await cachedFunction('param1');
      const result2 = await cachedFunction('param2');
      
      // The function should be called twice (once for each parameter)
      expect(callCount).toBe(2);
      expect(result1).toBe('Result for param1');
      expect(result2).toBe('Result for param2');
    });

    it('should respect custom TTL', async () => {
      jest.useFakeTimers();
      
      // Create a mock function
      const expensiveFunction = jest.fn().mockResolvedValue('result');
      
      // Wrap with a short TTL (100ms)
      const cachedFunction = withCache(expensiveFunction, 'ttl-test', 100);
      
      // First call
      await cachedFunction('test');
      expect(expensiveFunction).toHaveBeenCalledTimes(1);
      
      // Second call (should use cache)
      await cachedFunction('test');
      expect(expensiveFunction).toHaveBeenCalledTimes(1);
      
      // Advance time past TTL
      jest.advanceTimersByTime(150);
      
      // Third call (should call function again as cache expired)
      await cachedFunction('test');
      expect(expensiveFunction).toHaveBeenCalledTimes(2);
      
      jest.useRealTimers();
    });
  });
});
