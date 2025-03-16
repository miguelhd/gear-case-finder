// Cache implementation for performance optimization
import { LRUCache } from 'lru-cache';

// Define cache options
const options = {
  // Maximum number of items to store in the cache
  max: 500,
  
  // Maximum age of items in milliseconds (30 minutes)
  ttl: 1000 * 60 * 30,
  
  // Function to calculate size of items (optional)
  sizeCalculation: (value: any, key: string) => {
    return 1;
  },
  
  // Maximum allowed cache size
  maxSize: 5000,
  
  // Function to call when items are disposed from the cache
  dispose: (value: any, key: string) => {
    // Optional cleanup logic
  }
};

// Create a singleton cache instance
let cacheInstance: LRUCache<string, any> | null = null;

/**
 * Get the cache instance (creates it if it doesn't exist)
 */
export function getCache(): LRUCache<string, any> {
  if (!cacheInstance) {
    cacheInstance = new LRUCache(options);
  }
  return cacheInstance;
}

/**
 * Get an item from the cache
 * @param key - Cache key
 * @returns The cached value or undefined if not found
 */
export function getCacheItem<T>(key: string): T | undefined {
  const cache = getCache();
  return cache.get(key) as T | undefined;
}

/**
 * Set an item in the cache
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttl - Optional custom TTL in milliseconds
 */
export function setCacheItem<T>(key: string, value: T, ttl?: number): void {
  const cache = getCache();
  if (ttl) {
    cache.set(key, value, { ttl });
  } else {
    cache.set(key, value);
  }
}

/**
 * Remove an item from the cache
 * @param key - Cache key
 * @returns true if the item was removed, false otherwise
 */
export function removeCacheItem(key: string): boolean {
  const cache = getCache();
  return cache.delete(key);
}

/**
 * Clear the entire cache
 */
export function clearCache(): void {
  const cache = getCache();
  cache.clear();
}

/**
 * Get cache statistics
 * @returns Object with cache statistics
 */
export function getCacheStats() {
  const cache = getCache();
  return {
    size: cache.size,
    maxSize: options.maxSize,
    itemCount: cache.size,
    maxItems: options.max,
    hitRate: cache.calculatedHitRate,
  };
}

/**
 * Wrapper function to cache the results of async functions
 * @param fn - Async function to cache
 * @param keyPrefix - Prefix for cache key
 * @param ttl - Optional custom TTL in milliseconds
 * @returns Wrapped function with caching
 */
export function withCache<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  keyPrefix: string,
  ttl?: number
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    // Create a cache key based on the function arguments
    const key = `${keyPrefix}:${JSON.stringify(args)}`;
    
    // Check if the result is already in the cache
    const cachedResult = getCacheItem<T>(key);
    if (cachedResult !== undefined) {
      return cachedResult;
    }
    
    // If not in cache, call the original function
    const result = await fn(...args);
    
    // Store the result in the cache
    setCacheItem<T>(key, result, ttl);
    
    return result;
  };
}
