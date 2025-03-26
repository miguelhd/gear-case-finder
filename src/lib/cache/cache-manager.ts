/**
 * Cache Manager for GraphQL Resolvers
 * 
 * This module provides caching functionality to improve performance
 * and prevent timeouts in GraphQL resolver functions.
 */

import NodeCache from 'node-cache';

// Cache configuration
const DEFAULT_TTL = 300; // 5 minutes in seconds
const CHECK_PERIOD = 60; // Check for expired keys every minute

// Create cache instance
const cache = new NodeCache({
  stdTTL: DEFAULT_TTL,
  checkperiod: CHECK_PERIOD,
  useClones: false, // For better performance with large objects
});

/**
 * Cache key generator
 * Creates a unique key based on resolver name and parameters
 */
export const createCacheKey = (
  resolverName: string,
  params: Record<string, any>
): string => {
  return `${resolverName}:${JSON.stringify(params)}`;
};

/**
 * Get data from cache
 * @param key Cache key
 * @returns Cached data or undefined if not found
 */
export const getFromCache = <T>(key: string): T | undefined => {
  return cache.get<T>(key);
};

/**
 * Set data in cache
 * @param key Cache key
 * @param data Data to cache
 * @param ttl Time to live in seconds (optional, defaults to DEFAULT_TTL)
 */
export const setInCache = <T>(key: string, data: T, ttl?: number): void => {
  cache.set(key, data, ttl || DEFAULT_TTL);
};

/**
 * Clear cache for a specific key
 * @param key Cache key
 */
export const clearCacheKey = (key: string): void => {
  cache.del(key);
};

/**
 * Clear all cache
 */
export const clearAllCache = (): void => {
  cache.flushAll();
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): { keys: number; hits: number; misses: number } => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
  };
};

/**
 * Cached resolver wrapper
 * Wraps a resolver function with caching functionality
 * 
 * @param resolverName Name of the resolver
 * @param resolverFn The resolver function to wrap
 * @param ttl Optional TTL override
 * @returns Wrapped resolver function with caching
 */
export const cachedResolver = <T, P extends any[]>(
  resolverName: string,
  resolverFn: (...args: P) => Promise<T>,
  ttl?: number
) => {
  return async (...args: P): Promise<T> => {
    // Extract parameters from args (typically parent, args, context, info)
    const params = args[1] || {};
    
    // Create cache key
    const cacheKey = createCacheKey(resolverName, params);
    
    // Try to get from cache first
    const cachedResult = getFromCache<T>(cacheKey);
    if (cachedResult !== undefined) {
      return cachedResult;
    }
    
    // If not in cache, call the original resolver
    const result = await resolverFn(...args);
    
    // Cache the result
    setInCache(cacheKey, result, ttl);
    
    return result;
  };
};

/**
 * Timeout wrapper for resolver functions
 * Adds timeout handling to prevent long-running operations
 * 
 * @param resolverFn The resolver function to wrap
 * @param timeoutMs Timeout in milliseconds (default: 5000ms)
 * @returns Wrapped resolver function with timeout handling
 */
export const withTimeout = <T, P extends any[]>(
  resolverFn: (...args: P) => Promise<T>,
  timeoutMs: number = 5000
) => {
  return async (...args: P): Promise<T> => {
    return new Promise<T>(async (resolve, reject) => {
      // Create a timeout
      const timeoutId = setTimeout(() => {
        reject(new Error(`Resolver timeout after ${timeoutMs}ms`));
      }, timeoutMs);
      
      try {
        // Execute the resolver
        const result = await resolverFn(...args);
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        // Return the result
        resolve(result);
      } catch (error) {
        // Clear the timeout
        clearTimeout(timeoutId);
        
        // Propagate the error
        reject(error);
      }
    });
  };
};

/**
 * Combined wrapper for caching and timeout
 * 
 * @param resolverName Name of the resolver
 * @param resolverFn The resolver function to wrap
 * @param timeoutMs Timeout in milliseconds
 * @param ttl Cache TTL in seconds
 * @returns Wrapped resolver with caching and timeout
 */
export const optimizedResolver = <T, P extends any[]>(
  resolverName: string,
  resolverFn: (...args: P) => Promise<T>,
  timeoutMs: number = 5000,
  ttl?: number
) => {
  // First add timeout handling
  const withTimeoutFn = withTimeout(resolverFn, timeoutMs);
  
  // Then add caching
  return cachedResolver(resolverName, withTimeoutFn, ttl);
};

export default {
  getFromCache,
  setInCache,
  clearCacheKey,
  clearAllCache,
  getCacheStats,
  cachedResolver,
  withTimeout,
  optimizedResolver,
};
