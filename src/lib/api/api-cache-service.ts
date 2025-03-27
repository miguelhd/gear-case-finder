/**
 * API Caching Service
 * 
 * This module provides a caching layer for API responses to reduce
 * the number of API calls and improve performance.
 */

import mongoose from 'mongoose';
import connectToMongoDB from '../mongodb';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string; // Cache namespace for grouping related items
}

export class ApiCacheService {
  private isInitialized: boolean = false;
  private mongoConnected: boolean = false;
  private defaultTTL: number = 86400; // 24 hours in seconds
  
  /**
   * Initialize the service and connect to MongoDB
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Connect to MongoDB
      await connectToMongoDB();
      
      // Verify connection
      if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
        throw new Error('MongoDB connection failed or db property is not available');
      }
      
      // Create cache collection if it doesn't exist
      const collections = await mongoose.connection.db.listCollections().toArray();
      if (!collections.some(c => c.name === 'api_cache')) {
        await mongoose.connection.db.createCollection('api_cache');
      }
      
      // Create indexes for efficient cache retrieval and TTL expiration
      const collection = mongoose.connection.db.collection('api_cache');
      
      // Create indexes if they don't exist
      const indexes = await collection.indexes();
      const indexNames = indexes.map(index => index.name);
      
      if (!indexNames.includes('key_1')) {
        await collection.createIndex({ key: 1 }, { unique: true });
      }
      
      if (!indexNames.includes('namespace_1')) {
        await collection.createIndex({ namespace: 1 });
      }
      
      if (!indexNames.includes('expireAt_1')) {
        await collection.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
      }
      
      this.mongoConnected = true;
      this.isInitialized = true;
      console.log('API Cache Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize API Cache Service:', error);
      throw error;
    }
  }

  /**
   * Generate a cache key from the provided parameters
   */
  private generateCacheKey(apiName: string, params: any): string {
    const sortedParams = Object.keys(params || {})
      .sort()
      .reduce((result: any, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${apiName}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Get an item from the cache
   */
  async get(apiName: string, params: any): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const key = this.generateCacheKey(apiName, params);
      const collection = mongoose.connection.db.collection('api_cache');
      
      const cacheItem = await collection.findOne({ key });
      
      if (!cacheItem) {
        return null;
      }
      
      // Check if item is expired
      if (cacheItem.expireAt && cacheItem.expireAt < new Date()) {
        await collection.deleteOne({ key });
        return null;
      }
      
      return cacheItem.data;
    } catch (error) {
      console.error(`Error getting cache item for ${apiName}:`, error);
      return null;
    }
  }

  /**
   * Set an item in the cache
   */
  async set(apiName: string, params: any, data: any, options: CacheOptions = {}): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const key = this.generateCacheKey(apiName, params);
      const ttl = options.ttl || this.defaultTTL;
      const namespace = options.namespace || apiName;
      
      const expireAt = new Date();
      expireAt.setSeconds(expireAt.getSeconds() + ttl);
      
      const collection = mongoose.connection.db.collection('api_cache');
      
      await collection.updateOne(
        { key },
        { 
          $set: {
            key,
            namespace,
            data,
            params,
            expireAt,
            createdAt: new Date(),
            updatedAt: new Date()
          } 
        },
        { upsert: true }
      );
    } catch (error) {
      console.error(`Error setting cache item for ${apiName}:`, error);
      throw error;
    }
  }

  /**
   * Delete an item from the cache
   */
  async delete(apiName: string, params: any): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const key = this.generateCacheKey(apiName, params);
      const collection = mongoose.connection.db.collection('api_cache');
      
      await collection.deleteOne({ key });
    } catch (error) {
      console.error(`Error deleting cache item for ${apiName}:`, error);
      throw error;
    }
  }

  /**
   * Clear all items in a namespace
   */
  async clearNamespace(namespace: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const collection = mongoose.connection.db.collection('api_cache');
      
      await collection.deleteMany({ namespace });
    } catch (error) {
      console.error(`Error clearing namespace ${namespace}:`, error);
      throw error;
    }
  }

  /**
   * Clear all expired items
   */
  async clearExpired(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const collection = mongoose.connection.db.collection('api_cache');
      
      await collection.deleteMany({ expireAt: { $lt: new Date() } });
    } catch (error) {
      console.error('Error clearing expired cache items:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const collection = mongoose.connection.db.collection('api_cache');
      
      const totalCount = await collection.countDocuments();
      const expiredCount = await collection.countDocuments({ expireAt: { $lt: new Date() } });
      
      // Get namespace statistics
      const namespaceStats = await collection.aggregate([
        { $group: { _id: '$namespace', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray();
      
      return {
        totalCount,
        expiredCount,
        activeCount: totalCount - expiredCount,
        namespaceStats: namespaceStats.map(stat => ({
          namespace: stat._id,
          count: stat.count
        }))
      };
    } catch (error) {
      console.error('Error getting cache statistics:', error);
      throw error;
    }
  }

  /**
   * Set TTL for different types of data
   */
  setTTLForDataType(dataType: string, ttl: number): void {
    switch (dataType) {
      case 'dimensions':
        // Dimensions rarely change, so cache for a long time
        this.defaultTTL = 30 * 86400; // 30 days
        break;
      case 'product_details':
        // Product details may change, but not frequently
        this.defaultTTL = 7 * 86400; // 7 days
        break;
      case 'prices':
        // Prices change more frequently
        this.defaultTTL = 1 * 86400; // 1 day
        break;
      case 'search_results':
        // Search results may change frequently
        this.defaultTTL = 12 * 3600; // 12 hours
        break;
      default:
        this.defaultTTL = ttl;
    }
  }

  /**
   * Wrap an API call with caching
   */
  async cacheApiCall(
    apiName: string, 
    params: any, 
    apiCallFn: () => Promise<any>, 
    options: CacheOptions = {}
  ): Promise<any> {
    try {
      // Try to get from cache first
      const cachedData = await this.get(apiName, params);
      
      if (cachedData) {
        console.log(`Cache hit for ${apiName}`);
        return cachedData;
      }
      
      // If not in cache, make the API call
      console.log(`Cache miss for ${apiName}, making API call`);
      const data = await apiCallFn();
      
      // Store in cache
      await this.set(apiName, params, data, options);
      
      return data;
    } catch (error) {
      console.error(`Error in cached API call for ${apiName}:`, error);
      throw error;
    }
  }
}

export default ApiCacheService;
