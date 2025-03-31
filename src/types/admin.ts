/**
 * Type definitions for admin-related functionality
 */

/**
 * Represents an activity entry in the system
 */
export interface ActivityEntry {
  /**
   * Timestamp when the activity occurred
   */
  timestamp: Date;
  
  /**
   * Collection name related to the activity
   */
  collection: string;
  
  /**
   * Operation type performed (e.g., 'insert', 'update', 'delete')
   */
  operation: string;
  
  /**
   * Number of records affected by the operation
   */
  count: number;
}

/**
 * Database statistics response structure
 */
export interface DatabaseStats {
  /**
   * Count of audio gear items
   */
  gearCount: number;
  
  /**
   * Count of cases
   */
  caseCount: number;
  
  /**
   * Count of gear-case matches
   */
  matchCount: number;
  
  /**
   * Number of distinct gear categories
   */
  gearCategories: number;
  
  /**
   * Number of distinct gear brands
   */
  gearBrands: number;
  
  /**
   * Number of distinct case types
   */
  caseTypes: number;
  
  /**
   * Number of distinct case brands
   */
  caseBrands: number;
  
  /**
   * Average compatibility score across all matches
   */
  avgCompatibility: number;
  
  /**
   * Count of matches with high compatibility scores
   */
  highCompatibilityCount: number;
  
  /**
   * Recent activity entries in the system
   */
  recentActivity: ActivityEntry[];
}

/**
 * Cache entry type statistics
 */
export interface CacheEntryTypeStats {
  /**
   * Type of cache entry
   */
  type: string;
  
  /**
   * Count of entries of this type
   */
  count: number;
  
  /**
   * Hit rate for this entry type
   */
  hitRate: number;
  
  /**
   * Average time-to-live for this entry type in milliseconds
   */
  avgTtl: number;
}

/**
 * Cache statistics response structure
 */
export interface CacheStats {
  /**
   * Total number of cache requests
   */
  totalRequests: number;
  
  /**
   * Number of cache hits
   */
  hits: number;
  
  /**
   * Number of cache misses
   */
  misses: number;
  
  /**
   * Average response time for cached requests in milliseconds
   */
  avgCachedResponseTime: number;
  
  /**
   * Average response time for uncached requests in milliseconds
   */
  avgUncachedResponseTime: number;
  
  /**
   * Statistics by entry type
   */
  entriesByType: CacheEntryTypeStats[];
}
