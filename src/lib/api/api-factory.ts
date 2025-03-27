/**
 * API Factory
 * 
 * This module provides a factory for creating API-based components
 * to replace the existing scraper-based components.
 */

import ApiManager from './api-manager';
import ApiIntegrationService from './api-integration-service';
import { ApiCacheService } from './api-cache-service';
import { BatchProcessingSystem } from './batch-processing-system';

export class ApiFactory {
  /**
   * Create an API manager with the specified options
   */
  static createApiManager(options: any = {}): ApiManager {
    return new ApiManager({
      canopyApiKey: process.env.CANOPY_API_KEY || '',
      reverbAccessToken: process.env.REVERB_ACCESS_TOKEN || '',
      ...options
    });
  }
  
  /**
   * Create an API integration service with the specified options
   */
  static createApiIntegrationService(options: any = {}): ApiIntegrationService {
    return new ApiIntegrationService({
      canopyApiKey: process.env.CANOPY_API_KEY || '',
      reverbAccessToken: process.env.REVERB_ACCESS_TOKEN || '',
      ...options
    });
  }
  
  /**
   * Create an API cache service
   */
  static createApiCacheService(): ApiCacheService {
    return new ApiCacheService();
  }
  
  /**
   * Create a batch processing system with the specified options
   */
  static createBatchProcessingSystem(options: any = {}): BatchProcessingSystem {
    return new BatchProcessingSystem({
      canopyApiKey: process.env.CANOPY_API_KEY || '',
      reverbAccessToken: process.env.REVERB_ACCESS_TOKEN || '',
      ...options
    });
  }
}

export default ApiFactory;
