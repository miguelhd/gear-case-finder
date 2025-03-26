"use strict";
exports.id = 471;
exports.ids = [471];
exports.modules = {

/***/ 3471:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LK: () => (/* binding */ clearCache),
/* harmony export */   eW: () => (/* binding */ getCacheStats)
/* harmony export */ });
/* unused harmony exports getCache, getCacheItem, setCacheItem, removeCacheItem, withCache */
// Cache implementation for performance optimization
// Import LRUCache directly without relying on module structure
// This approach works in both local and Vercel environments
const LRUCache = __webpack_require__(5680);
// Define cache options
const options = {
    max: 500,
    ttl: 1000 * 60 * 5,
    maxSize: 5000000,
    sizeCalculation: (value, key)=>{
        // Approximate size calculation based on JSON stringification
        return JSON.stringify(value).length + (key ? key.length : 0);
    },
    allowStale: false
};
// Create cache instance with direct constructor
const cache = new LRUCache(options);
// Track hits and misses for hit rate calculation
let hits = 0;
let misses = 0;
/**
 * Get the cache instance
 * @returns The LRU cache instance
 */ function getCache() {
    return cache;
}
/**
 * Get an item from the cache
 * @param key - Cache key
 * @returns The cached value or undefined if not found
 */ function getCacheItem(key) {
    const value = cache.get(key);
    if (value === undefined) {
        misses++;
    } else {
        hits++;
    }
    return value;
}
/**
 * Set an item in the cache
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttl - Optional custom TTL in milliseconds
 */ function setCacheItem(key, value, ttl) {
    cache.set(key, value, {
        ttl
    });
}
/**
 * Remove an item from the cache
 * @param key - Cache key
 * @returns True if the item was removed, false if it wasn't in the cache
 */ function removeCacheItem(key) {
    return cache.delete(key);
}
/**
 * Clear the entire cache
 */ function clearCache() {
    cache.clear();
    hits = 0;
    misses = 0;
}
/**
 * Get cache statistics
 * @returns Object with cache statistics
 */ function getCacheStats() {
    const totalRequests = hits + misses;
    const hitRate = totalRequests > 0 ? hits / totalRequests : 0;
    return {
        size: JSON.stringify(cache).length,
        maxSize: options.maxSize || 5000000,
        itemCount: cache.size,
        maxItems: options.max,
        hitRate: hitRate,
        hits,
        misses,
        totalRequests
    };
}
/**
 * Higher-order function to cache function results
 * @param fn - Function to cache results for
 * @param keyPrefix - Prefix for cache keys
 * @param ttl - Optional custom TTL in milliseconds
 * @returns Wrapped function that uses cache
 */ function withCache(fn, keyPrefix, ttl) {
    return async (...args)=>{
        // Create cache key from function name, prefix and stringified arguments
        const key = `${keyPrefix}:${JSON.stringify(args)}`;
        // Try to get from cache first
        const cachedResult = getCacheItem(key);
        if (cachedResult !== undefined) {
            return cachedResult;
        }
        // If not in cache, call the original function
        const result = await fn(...args);
        // Cache the result
        setCacheItem(key, result, ttl);
        return result;
    };
}
/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = ({
    getCache,
    getCacheItem,
    setCacheItem,
    removeCacheItem,
    clearCache,
    getCacheStats,
    withCache
});


/***/ })

};
;