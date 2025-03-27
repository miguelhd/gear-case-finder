/**
 * API Integration Test
 * 
 * This module provides tests for the API integration components.
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import ApiManager from '../lib/api/api-manager';
import ApiIntegrationService from '../lib/api/api-integration-service';
import { ApiCacheService } from '../lib/api/api-cache-service';
import mongoose from 'mongoose';

// Mock environment variables
process.env.CANOPY_API_KEY = 'test_canopy_api_key';
process.env.REVERB_ACCESS_TOKEN = 'test_reverb_access_token';

// Mock the API clients
jest.mock('../lib/api/canopy-api-client', () => {
  return jest.fn().mockImplementation(() => {
    return {
      searchAudioGear: jest.fn().mockResolvedValue({
        products: [
          {
            id: 'test_product_1',
            name: 'Test Synthesizer',
            brand: 'Test Brand',
            price: { amount: 999.99, currency: 'USD' },
            description: 'A test synthesizer',
            dimensions: { length: 20, width: 10, height: 5, unit: 'in' },
            weight: { value: 10, unit: 'lb' },
            image: 'https://example.com/test.jpg'
          }
        ]
      }),
      searchCases: jest.fn().mockResolvedValue({
        products: [
          {
            id: 'test_case_1',
            name: 'Test Case',
            brand: 'Test Brand',
            price: { amount: 99.99, currency: 'USD' },
            description: 'A test case',
            dimensions: { length: 25, width: 15, height: 8, unit: 'in' },
            weight: { value: 5, unit: 'lb' },
            image: 'https://example.com/test_case.jpg'
          }
        ]
      }),
      getProduct: jest.fn().mockImplementation((id) => {
        if (id === 'test_product_1') {
          return Promise.resolve({
            id: 'test_product_1',
            name: 'Test Synthesizer',
            brand: 'Test Brand',
            price: { amount: 999.99, currency: 'USD' },
            description: 'A test synthesizer',
            dimensions: { length: 20, width: 10, height: 5, unit: 'in' },
            weight: { value: 10, unit: 'lb' },
            image: 'https://example.com/test.jpg'
          });
        } else if (id === 'test_case_1') {
          return Promise.resolve({
            id: 'test_case_1',
            name: 'Test Case',
            brand: 'Test Brand',
            price: { amount: 99.99, currency: 'USD' },
            description: 'A test case',
            dimensions: { length: 25, width: 15, height: 8, unit: 'in' },
            weight: { value: 5, unit: 'lb' },
            image: 'https://example.com/test_case.jpg'
          });
        } else {
          return Promise.reject(new Error('Product not found'));
        }
      })
    };
  });
});

jest.mock('../lib/api/reverb-api-client', () => {
  return jest.fn().mockImplementation(() => {
    return {
      searchAudioGear: jest.fn().mockResolvedValue({
        products: [
          {
            id: 'reverb_product_1',
            name: 'Reverb Synthesizer',
            brand: 'Reverb Brand',
            price: { amount: 1299.99, currency: 'USD' },
            description: 'A reverb synthesizer',
            dimensions: { length: 22, width: 12, height: 6, unit: 'in' },
            weight: { value: 12, unit: 'lb' },
            image: 'https://example.com/reverb.jpg'
          }
        ]
      }),
      searchCases: jest.fn().mockResolvedValue({
        products: [
          {
            id: 'reverb_case_1',
            name: 'Reverb Case',
            brand: 'Reverb Brand',
            price: { amount: 129.99, currency: 'USD' },
            description: 'A reverb case',
            dimensions: { length: 27, width: 17, height: 9, unit: 'in' },
            weight: { value: 6, unit: 'lb' },
            image: 'https://example.com/reverb_case.jpg'
          }
        ]
      }),
      getProduct: jest.fn().mockImplementation((id) => {
        if (id === 'reverb_product_1') {
          return Promise.resolve({
            id: 'reverb_product_1',
            name: 'Reverb Synthesizer',
            brand: 'Reverb Brand',
            price: { amount: 1299.99, currency: 'USD' },
            description: 'A reverb synthesizer',
            dimensions: { length: 22, width: 12, height: 6, unit: 'in' },
            weight: { value: 12, unit: 'lb' },
            image: 'https://example.com/reverb.jpg'
          });
        } else if (id === 'reverb_case_1') {
          return Promise.resolve({
            id: 'reverb_case_1',
            name: 'Reverb Case',
            brand: 'Reverb Brand',
            price: { amount: 129.99, currency: 'USD' },
            description: 'A reverb case',
            dimensions: { length: 27, width: 17, height: 9, unit: 'in' },
            weight: { value: 6, unit: 'lb' },
            image: 'https://example.com/reverb_case.jpg'
          });
        } else {
          return Promise.reject(new Error('Product not found'));
        }
      })
    };
  });
});

// Mock the MongoDB connection
jest.mock('../lib/mongodb', () => {
  return jest.fn().mockResolvedValue(mongoose.connection);
});

// Mock mongoose
jest.mock('mongoose', () => {
  const originalMongoose = jest.requireActual('mongoose');
  
  return {
    ...originalMongoose,
    connect: jest.fn().mockResolvedValue({}),
    connection: {
      readyState: 1,
      db: {
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(null),
          updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
          insertOne: jest.fn().mockResolvedValue({ insertedId: 'test_id' }),
          indexes: jest.fn().mockResolvedValue([]),
          createIndex: jest.fn().mockResolvedValue('index_created'),
          find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            toArray: jest.fn().mockResolvedValue([])
          }),
          countDocuments: jest.fn().mockResolvedValue(0),
          deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
          aggregate: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([])
          })
        }),
        listCollections: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        }),
        createCollection: jest.fn().mockResolvedValue({})
      }
    },
    model: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      prototype: {
        save: jest.fn().mockResolvedValue({ _id: 'test_id' })
      }
    }),
    models: {},
    Schema: originalMongoose.Schema,
    Types: {
      ObjectId: jest.fn().mockImplementation((id) => id)
    }
  };
});

// Mock the image downloader
jest.mock('../lib/scrapers/image-downloader', () => {
  return {
    ImageDownloader: jest.fn().mockImplementation(() => {
      return {
        downloadImages: jest.fn().mockResolvedValue(['/tmp/images/test.jpg'])
      };
    })
  };
});

describe('API Integration Tests', () => {
  let apiManager: ApiManager;
  let apiIntegrationService: ApiIntegrationService;
  let apiCacheService: ApiCacheService;
  
  beforeAll(async () => {
    // Create instances with test configuration
    apiManager = new ApiManager({
      canopyApiKey: 'test_canopy_api_key',
      reverbAccessToken: 'test_reverb_access_token',
      saveToDatabase: false,
      downloadImages: false,
      enableBatchProcessing: false
    });
    
    apiIntegrationService = new ApiIntegrationService({
      canopyApiKey: 'test_canopy_api_key',
      reverbAccessToken: 'test_reverb_access_token',
      saveToDatabase: false,
      downloadImages: false,
      enableBatchProcessing: false
    });
    
    apiCacheService = new ApiCacheService();
    
    // Initialize services
    await apiManager.initialize();
    await apiIntegrationService.initialize();
    await apiCacheService.initialize();
  });
  
  afterAll(async () => {
    // Clean up
    jest.clearAllMocks();
  });
  
  describe('ApiManager', () => {
    it('should search for audio gear across all API sources', async () => {
      const results = await apiManager.searchAudioGear('synthesizer');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      // Check that results contain expected properties
      const firstResult = results[0];
      expect(firstResult).toHaveProperty('name');
      expect(firstResult).toHaveProperty('brand');
      expect(firstResult).toHaveProperty('dimensions');
      expect(firstResult.dimensions).toHaveProperty('length');
      expect(firstResult.dimensions).toHaveProperty('width');
      expect(firstResult.dimensions).toHaveProperty('height');
      expect(firstResult.dimensions).toHaveProperty('unit');
    });
    
    it('should search for cases across all API sources', async () => {
      const results = await apiManager.searchCases('case');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      // Check that results contain expected properties
      const firstResult = results[0];
      expect(firstResult).toHaveProperty('name');
      expect(firstResult).toHaveProperty('brand');
      expect(firstResult).toHaveProperty('dimensions');
      expect(firstResult.dimensions).toHaveProperty('interior');
      expect(firstResult.dimensions.interior).toHaveProperty('length');
      expect(firstResult.dimensions.interior).toHaveProperty('width');
      expect(firstResult.dimensions.interior).toHaveProperty('height');
      expect(firstResult.dimensions.interior).toHaveProperty('unit');
    });
    
    it('should get audio gear details from a specific API source', async () => {
      const result = await apiManager.getAudioGearDetails('canopy', 'test_product_1');
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('name', 'Test Synthesizer');
      expect(result).toHaveProperty('brand', 'Test Brand');
      expect(result).toHaveProperty('dimensions');
      expect(result!.dimensions).toHaveProperty('length', 20);
      expect(result!.dimensions).toHaveProperty('width', 10);
      expect(result!.dimensions).toHaveProperty('height', 5);
      expect(result!.dimensions).toHaveProperty('unit', 'in');
    });
    
    it('should get case details from a specific API source', async () => {
      const result = await apiManager.getCaseDetails('canopy', 'test_case_1');
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('name', 'Test Case');
      expect(result).toHaveProperty('brand', 'Test Brand');
      expect(result).toHaveProperty('dimensions');
      expect(result!.dimensions).toHaveProperty('interior');
      expect(result!.dimensions.interior).toHaveProperty('length', 25);
      expect(result!.dimensions.interior).toHaveProperty('width', 15);
      expect(result!.dimensions.interior).toHaveProperty('height', 8);
      expect(result!.dimensions.interior).toHaveProperty('unit', 'in');
    });
  });
  
  describe('ApiIntegrationService', () => {
    it('should search for products across all marketplaces', async () => {
      const results = await apiIntegrationService.searchAllMarketplaces('synthesizer');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      // Check that results are in the expected NormalizedProduct format
      const firstResult = results[0];
      expect(firstResult).toHaveProperty('id');
      expect(firstResult).toHaveProperty('name');
      expect(firstResult).toHaveProperty('brand');
      expect(firstResult).toHaveProperty('price');
      expect(firstResult).toHaveProperty('currency');
      expect(firstResult).toHaveProperty('dimensions');
      expect(firstResult).toHaveProperty('productType');
    });
    
    it('should get product details from a specific marketplace', async () => {
      const result = await apiIntegrationService.getProductDetails('canopy', 'test_product_1');
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('name', 'Test Synthesizer');
      expect(result).toHaveProperty('brand', 'Test Brand');
      expect(result).toHaveProperty('dimensions');
      expect(result!.dimensions).toHaveProperty('length', 20);
      expect(result!.dimensions).toHaveProperty('width', 10);
      expect(result!.dimensions).toHaveProperty('height', 5);
      expect(result!.dimensions).toHaveProperty('unit', 'in');
      expect(result).toHaveProperty('productType', 'audio_gear');
    });
    
    it('should get products by category from a specific marketplace', async () => {
      const results = await apiIntegrationService.getProductsByCategory('canopy', 'synthesizer');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      // Check that results are in the expected NormalizedProduct format
      const firstResult = results[0];
      expect(firstResult).toHaveProperty('id');
      expect(firstResult).toHaveProperty('name');
      expect(firstResult).toHaveProperty('brand');
      expect(firstResult).toHaveProperty('price');
      expect(firstResult).toHaveProperty('currency');
      expect(firstResult).toHaveProperty('dimensions');
      expect(firstResult).toHaveProperty('productType');
    });
  });
  
  describe('ApiCacheService', () => {
    it('should cache and retrieve API responses', async () => {
      // Set a cache item
      await apiCacheService.set(
        'test_api',
        { query: 'test_query' },
        { data: 'test_data' },
        { ttl: 3600, namespace: 'test_namespace' }
      );
      
      // Get the cache item
      const cachedData = await apiCacheService.get('test_api', { query: 'test_query' });
      
      expect(cachedData).toBeDefined();
      expect(cachedData).toHaveProperty('data', 'test_data');
    });
    
    it('should wrap API calls with caching', async () => {
      // Create a mock API call function
      const mockApiCall = jest.fn().mockResolvedValue({ data: 'test_data' });
      
      // Call the API with caching
      const result1 = await apiCacheService.cacheApiCall(
        'test_api_call',
        { param1: 'value1' },
        mockApiCall,
        { ttl: 3600, namespace: 'test_namespace' }
      );
      
      // Call again with the same parameters
      const result2 = await apiCacheService.cacheApiCall(
        'test_api_call',
        { param1: 'value1' },
        mockApiCall,
        { ttl: 3600, namespace: 'test_namespace' }
      );
      
      // The API call function should only be called once
      expect(mockApiCall).toHaveBeenCalledTimes(1);
      
      // Both results should be the same
      expect(result1).toEqual(result2);
      expect(result1).toHaveProperty('data', 'test_data');
    });
  });
});
