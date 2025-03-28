/**
 * API Manager
 * 
 * This module provides a unified interface for accessing product data
 * from various API sources, replacing the scraper-based approach.
 */

import * as winston from 'winston';
import { promises as fs } from 'fs';
import path from 'path';
import mongoose from 'mongoose';

import { IAudioGear, ICase } from '../models/gear-models';
import { ApiCacheService } from './api-cache-service';
import CanopyApiClient from './canopy-api-client';
import ReverbApiClient from './reverb-api-client';
import AliExpressApiService from './aliexpress-api-service';
import { processSearchResults as processCanopyResults } from './canopy-data-mapper';
import { processSearchResults as processReverbResults } from './reverb-data-mapper';
import { BatchProcessingSystem } from './batch-processing-system';
import { ImageDownloader } from '../utils/image-downloader';

/**
 * Configuration options for the API Manager.
 */
export interface IApiManagerOptions {
  /**
   * Directory for storing log files.
   */
  logDirectory?: string;
  
  /**
   * Directory for storing data files.
   */
  dataDirectory?: string;
  
  /**
   * Directory for storing downloaded images.
   */
  imageDirectory?: string;
  
  /**
   * Maximum number of retry attempts for failed API calls.
   */
  maxRetries?: number;
  
  /**
   * Delay in milliseconds between retry attempts.
   */
  delayBetweenRetries?: number;
  
  /**
   * Whether to enable caching of API responses.
   */
  enableCaching?: boolean;
  
  /**
   * Whether to enable batch processing of API requests.
   */
  enableBatchProcessing?: boolean;
  
  /**
   * API key for Canopy API.
   */
  canopyApiKey?: string;
  
  /**
   * Access token for Reverb API.
   */
  reverbAccessToken?: string;
  
  /**
   * API key for AliExpress API.
   */
  aliexpressApiKey?: string;
}

export class ApiManager {
  private options: IApiManagerOptions;
  private logger!: winston.Logger;
  private cacheService: ApiCacheService;
  private canopyClient: CanopyApiClient;
  private reverbClient: ReverbApiClient;
  private aliexpressService: AliExpressApiService;
  private batchProcessingSystem?: BatchProcessingSystem;
  private imageDownloader: ImageDownloader;
  private apiSources: Map<string, string> = new Map();
  
  constructor(options: IApiManagerOptions = {}) {
    this.options = {
      logDirectory: '/tmp/logs',
      dataDirectory: '/tmp/data',
      imageDirectory: '/tmp/images',
      maxRetries: 3,
      delayBetweenRetries: 1000,
      enableCaching: true,
      enableBatchProcessing: false,
      ...options
    };
    
    // Initialize API clients
    this.canopyClient = new CanopyApiClient({
      apiKey: this.options.canopyApiKey || ''
    });
    
    this.reverbClient = new ReverbApiClient({
      accessToken: this.options.reverbAccessToken || ''
    });
    
    this.aliexpressService = new AliExpressApiService({
      rapidApiKey: this.options.aliexpressApiKey || ''
    });
    
    // Initialize cache service
    this.cacheService = new ApiCacheService();
    
    // Initialize image downloader
    this.imageDownloader = new ImageDownloader({
      outputDirectory: this.options.imageDirectory || '/tmp/images'
    });
    
    // Register API sources
    this.apiSources.set('canopy', 'Canopy API');
    this.apiSources.set('reverb', 'Reverb API');
    this.apiSources.set('aliexpress', 'AliExpress API');
    
    this.setupLogger();
    
    // Initialize batch processing system if enabled
    if (this.options.enableBatchProcessing) {
      this.batchProcessingSystem = new BatchProcessingSystem({
        canopyApiKey: this.options.canopyApiKey || '',
        reverbAccessToken: this.options.reverbAccessToken || ''
      });
    }
  }
  
  /**
   * Initialize the API manager
   */
  async initialize(): Promise<void> {
    try {
      // Initialize cache service
      if (this.options.enableCaching) {
        await this.cacheService.initialize();
      }
      
      // Initialize batch processing system
      if (this.options.enableBatchProcessing && this.batchProcessingSystem) {
        await this.batchProcessingSystem.initialize();
      }
      
      this.logger.info('API Manager initialized successfully');
    } catch (error: unknown) {
      this.logger.error('Failed to initialize API Manager:', error);
      throw error;
    }
  }
  
  private setupLogger(): void {
    // Ensure log directory exists
    fs.mkdir(this.options.logDirectory || '/tmp/logs', { recursive: true }).catch(err => {
      console.error(`Failed to create log directory: ${err.message}`);
    });
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'api-manager' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({
          filename: path.join(this.options.logDirectory || '/tmp/logs', 'api-manager-error.log'),
          level: 'error'
        }),
        new winston.transports.File({
          filename: path.join(this.options.logDirectory || '/tmp/logs', 'api-manager.log')
        })
      ]
    });
  }
  
  /**
   * Search for audio gear across all API sources
   */
  async searchAudioGear(query: string, options: { page?: number, limit?: number } = {}): Promise<IAudioGear[]> {
    try {
      // Create a cache key for this search
      const apiName = 'search_audio_gear';
      const params = { query, ...options };
      
      // Check cache first if enabled
      if (this.options.enableCaching) {
        const cachedResult = await this.cacheService.get(apiName, params);
        if (cachedResult) {
          this.logger.info(`Cache hit for audio gear search: ${query}`);
          return cachedResult as IAudioGear[];
        }
      }
      
      // Prepare search options - extract limit for API clients which only accept a number
      const limit = options.limit || 10;
      
      // Search from all API sources
      const canopyResponse = await this.canopyClient.searchAudioGear(query, limit)
        .then(results => processCanopyResults(results))
        .catch(error => {
          this.logger.error(`Error searching Canopy API for audio gear: ${error.message}`);
          return { audioGear: [], cases: [] };
        });
        
      const reverbResponse = await this.reverbClient.searchAudioGear(query, limit)
        .then(results => processReverbResults(results))
        .catch(error => {
          this.logger.error(`Error searching Reverb API for audio gear: ${error.message}`);
          return { audioGear: [], cases: [] };
        });
      
      // Search AliExpress API
      const aliexpressResponse = await this.aliexpressService.searchAudioGear(query, { limit })
        .catch(error => {
          this.logger.error(`Error searching AliExpress API for audio gear: ${error.message}`);
          return [];
        });
      
      // Combine results - extract audioGear arrays from the responses
      const combinedResults = [
        ...(canopyResponse.audioGear || []), 
        ...(reverbResponse.audioGear || []),
        ...(aliexpressResponse || [])
      ];
      
      // Cache results if enabled
      if (this.options.enableCaching) {
        await this.cacheService.set(apiName, params, combinedResults, { ttl: 3600 });
      }
      
      return combinedResults;
    } catch (error: unknown) {
      this.logger.error('Error searching for audio gear:', error);
      return [];
    }
  }
  
  /**
   * Search for cases across all API sources
   */
  async searchCases(query: string, options: { page?: number, limit?: number } = {}): Promise<ICase[]> {
    try {
      // Create a cache key for this search
      const apiName = 'search_cases';
      const params = { query, ...options };
      
      // Check cache first if enabled
      if (this.options.enableCaching) {
        const cachedResult = await this.cacheService.get(apiName, params);
        if (cachedResult) {
          this.logger.info(`Cache hit for cases search: ${query}`);
          return cachedResult as ICase[];
        }
      }
      
      // Prepare search options - extract limit for API clients which only accept a number
      const limit = options.limit || 10;
      
      // Search from all API sources
      const canopyResponse = await this.canopyClient.searchCases(query, limit)
        .then(results => processCanopyResults(results))
        .catch(error => {
          this.logger.error(`Error searching Canopy API for cases: ${error.message}`);
          return { audioGear: [], cases: [] };
        });
        
      const reverbResponse = await this.reverbClient.searchCases(query, limit)
        .then(results => processReverbResults(results))
        .catch(error => {
          this.logger.error(`Error searching Reverb API for cases: ${error.message}`);
          return { audioGear: [], cases: [] };
        });
      
      // Search AliExpress API
      const aliexpressResponse = await this.aliexpressService.searchCases(query, { limit })
        .catch(error => {
          this.logger.error(`Error searching AliExpress API for cases: ${error.message}`);
          return [];
        });
      
      // Combine results - extract cases arrays from the responses
      const combinedResults = [
        ...(canopyResponse.cases || []), 
        ...(reverbResponse.cases || []),
        ...(aliexpressResponse || [])
      ];
      
      // Cache results if enabled
      if (this.options.enableCaching) {
        await this.cacheService.set(apiName, params, combinedResults, { ttl: 3600 });
      }
      
      return combinedResults;
    } catch (error: unknown) {
      this.logger.error('Error searching for cases:', error);
      return [];
    }
  }
  
  /**
   * Get the available API sources
   */
  getApiSources(): Map<string, string> {
    return this.apiSources;
  }
  
  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    if (!this.options.enableCaching) {
      return { enabled: false };
    }
    
    try {
      return await this.cacheService.getStats();
    } catch (error: unknown) {
      this.logger.error('Error getting cache statistics:', error);
      return { error: 'Failed to get cache statistics' };
    }
  }
  
  /**
   * Run a batch job manually
   */
  async runBatchJob(jobType: string): Promise<void> {
    if (!this.options.enableBatchProcessing || !this.batchProcessingSystem) {
      this.logger.warn('Batch processing is not enabled');
      return;
    }
    
    try {
      await this.batchProcessingSystem.runManualBatchJob(jobType);
      this.logger.info(`Successfully ran batch job: ${jobType}`);
    } catch (error: unknown) {
      this.logger.error(`Error running batch job ${jobType}:`, error);
      throw error;
    }
  }
  
  /**
   * Get batch job history
   */
  async getBatchJobHistory(limit: number = 10): Promise<any[]> {
    if (!this.options.enableBatchProcessing || !this.batchProcessingSystem) {
      this.logger.warn('Batch processing is not enabled');
      return [];
    }
    
    try {
      return await this.batchProcessingSystem.getBatchJobHistory(limit);
    } catch (error: unknown) {
      this.logger.error('Error getting batch job history:', error);
      return [];
    }
  }
  
  /**
   * Schedule a job to run at regular intervals
   */
  scheduleJob(
    jobName: string,
    operation: () => Promise<void>,
    intervalMinutes: number
  ): NodeJS.Timeout {
    this.logger.info(`Scheduling job ${jobName} to run every ${intervalMinutes} minutes`);
    
    // Convert minutes to milliseconds
    const interval = intervalMinutes * 60 * 1000;
    
    // Schedule the job to run at the specified interval
    const timer = setInterval(async () => {
      try {
        this.logger.info(`Running scheduled job: ${jobName}`);
        await operation();
        this.logger.info(`Completed scheduled job: ${jobName}`);
      } catch (error: unknown) {
        this.logger.error(`Error in scheduled job ${jobName}:`, error);
      }
    }, interval);
    
    return timer;
  }
  
  /**
   * Find cases that match the dimensions of a specific audio gear
   */
  async findMatchingCases(audioGear: IAudioGear): Promise<ICase[]> {
    try {
      if (!audioGear || !audioGear.dimensions) {
        return [];
      }
      
      // Create a cache key for this search
      const apiName = 'find_matching_cases';
      const params = { audioGearId: audioGear.id, dimensions: audioGear.dimensions };
      
      // Check cache first if enabled
      if (this.options.enableCaching) {
        const cachedResult = await this.cacheService.get(apiName, params);
        if (cachedResult) {
          this.logger.info(`Cache hit for matching cases for audio gear: ${audioGear.id}`);
          return cachedResult as ICase[];
        }
      }
      
      // Construct search query based on dimensions
      let searchQuery = 'case';
      
      if (audioGear.brand) {
        searchQuery += ` ${audioGear.brand}`;
      }
      
      if (audioGear.model) {
        searchQuery += ` ${audioGear.model}`;
      }
      
      // Search for cases
      const allCases = await this.searchCases(searchQuery, { limit: 50 });
      
      // Filter cases that match the dimensions
      const matchingCases = allCases.filter(caseItem => {
        if (!caseItem.dimensions || !caseItem.dimensions.interior || !audioGear.dimensions) {
          return false;
        }
        
        // Check if case interior dimensions are larger than audio gear dimensions (with some tolerance)
        const isLengthSuitable = !audioGear.dimensions.length || !caseItem.dimensions.interior.length || 
          caseItem.dimensions.interior.length >= audioGear.dimensions.length * 0.9;
          
        const isWidthSuitable = !audioGear.dimensions.width || !caseItem.dimensions.interior.width || 
          caseItem.dimensions.interior.width >= audioGear.dimensions.width * 0.9;
          
        const isHeightSuitable = !audioGear.dimensions.height || !caseItem.dimensions.interior.height || 
          caseItem.dimensions.interior.height >= audioGear.dimensions.height * 0.9;
          
        return isLengthSuitable && isWidthSuitable && isHeightSuitable;
      });
      
      // Cache results if enabled
      if (this.options.enableCaching) {
        await this.cacheService.set(apiName, params, matchingCases, { ttl: 86400 });
      }
      
      return matchingCases;
    } catch (error: unknown) {
      this.logger.error('Error finding matching cases:', error);
      return [];
    }
  }

  /**
   * Get audio gear details by marketplace and product ID
   */
  async getAudioGearDetails(marketplace: string, productId: string): Promise<IAudioGear | null> {
    try {
      // Create a cache key for this request
      const apiName = 'get_audio_gear_details';
      const params = { marketplace, productId };
      
      // Check cache first if enabled
      if (this.options.enableCaching) {
        const cachedResult = await this.cacheService.get(apiName, params);
        if (cachedResult) {
          this.logger.info(`Cache hit for audio gear details: ${marketplace}/${productId}`);
          return cachedResult as IAudioGear;
        }
      }
      
      // Get details from the appropriate API source
      let audioGearData: any = null;
      
      switch (marketplace.toLowerCase()) {
        case 'canopy':
          try {
            const productData = await this.canopyClient.getProduct(productId);
            // Convert product data to audio gear format
            audioGearData = {
              id: productId,
              marketplace: 'canopy',
              name: productData.title || '',
              brand: productData.brand || '',
              type: productData.type || 'unknown',
              category: productData.category || '',
              description: productData.description || '',
              price: productData.price || 0,
              currency: productData.currency || 'USD',
              imageUrl: productData.imageUrl || '',
              url: productData.url || '',
              dimensions: productData.dimensions || {
                length: 0,
                width: 0,
                height: 0,
                unit: 'in'
              },
              weight: {
                value: 0,
                unit: 'lbs'
              }
            };
          } catch (error: any) {
            this.logger.error(`Error getting audio gear details from Canopy API: ${error.message}`);
            return null;
          }
          break;
          
        case 'reverb':
          try {
            const productData = await this.reverbClient.getItem(productId);
            // Convert product data to audio gear format
            audioGearData = {
              id: productId,
              marketplace: 'reverb',
              name: productData.title || '',
              brand: productData.brand || '',
              type: productData.type || 'unknown',
              category: productData.category || '',
              description: productData.description || '',
              price: productData.price || 0,
              currency: productData.currency || 'USD',
              imageUrl: productData.imageUrl || '',
              url: productData.url || '',
              dimensions: productData.dimensions || {
                length: 0,
                width: 0,
                height: 0,
                unit: 'in'
              },
              weight: {
                value: 0,
                unit: 'lbs'
              }
            };
          } catch (error: any) {
            this.logger.error(`Error getting audio gear details from Reverb API: ${error.message}`);
            return null;
          }
          break;
          
        case 'aliexpress':
          const productInfo = await this.aliexpressService.getProductInfo(productId)
            .catch(error => {
              this.logger.error(`Error getting product details from AliExpress API: ${error.message}`);
              return null;
            });
            
          // Convert product info to audio gear format if it exists
          if (productInfo) {
            audioGearData = {
              id: productId,
              marketplace: 'aliexpress',
              name: productInfo.title || '',
              brand: productInfo.brand || '',
              type: productInfo.type || 'unknown',
              category: productInfo.category || '',
              description: productInfo.description || '',
              price: productInfo.price || 0,
              currency: productInfo.currency || 'USD',
              imageUrl: productInfo.imageUrl || '',
              url: productInfo.url || '',
              dimensions: productInfo.dimensions || {
                length: 0,
                width: 0,
                height: 0,
                unit: 'in'
              },
              weight: {
                value: 0,
                unit: 'lbs'
              }
            };
          }
          break;
          
        default:
          this.logger.warn(`Unknown marketplace: ${marketplace}`);
          return null;
      }
      
      // Cache results if enabled and audio gear was found
      if (this.options.enableCaching && audioGearData) {
        await this.cacheService.set(apiName, params, audioGearData, { ttl: 86400 });
      }
      
      // Return as IAudioGear type but without Document methods
      return audioGearData as unknown as IAudioGear;
    } catch (error: unknown) {
      this.logger.error('Error getting audio gear details:', error);
      return null;
    }
  }
  
  /**
   * Get case details by marketplace and product ID
   */
  async getCaseDetails(marketplace: string, productId: string): Promise<ICase | null> {
    try {
      // Create a cache key for this request
      const apiName = 'get_case_details';
      const params = { marketplace, productId };
      
      // Check cache first if enabled
      if (this.options.enableCaching) {
        const cachedResult = await this.cacheService.get(apiName, params);
        if (cachedResult) {
          this.logger.info(`Cache hit for case details: ${marketplace}/${productId}`);
          return cachedResult as ICase;
        }
      }
      
      // Get details from the appropriate API source
      let caseData: any = null;
      
      switch (marketplace.toLowerCase()) {
        case 'canopy':
          try {
            const productData = await this.canopyClient.getProduct(productId);
            // Convert product data to case format
            caseData = {
              id: productId,
              marketplace: 'canopy',
              name: productData.title || '',
              brand: productData.brand || '',
              type: productData.type || 'hard case',
              category: productData.category || '',
              description: productData.description || '',
              price: productData.price || 0,
              currency: productData.currency || 'USD',
              imageUrl: productData.imageUrl || '',
              url: productData.url || '',
              dimensions: {
                interior: {
                  length: productData.dimensions?.length || 0,
                  width: productData.dimensions?.width || 0,
                  height: productData.dimensions?.height || 0,
                  unit: productData.dimensions?.unit || 'in'
                }
              },
              internalDimensions: {
                length: productData.dimensions?.length || 0,
                width: productData.dimensions?.width || 0,
                height: productData.dimensions?.height || 0,
                unit: productData.dimensions?.unit || 'in'
              },
              compatibleWith: []
            };
          } catch (error: any) {
            this.logger.error(`Error getting case details from Canopy API: ${error.message}`);
            return null;
          }
          break;
          
        case 'reverb':
          try {
            const productData = await this.reverbClient.getItem(productId);
            // Convert product data to case format
            caseData = {
              id: productId,
              marketplace: 'reverb',
              name: productData.title || '',
              brand: productData.brand || '',
              type: productData.type || 'hard case',
              category: productData.category || '',
              description: productData.description || '',
              price: productData.price || 0,
              currency: productData.currency || 'USD',
              imageUrl: productData.imageUrl || '',
              url: productData.url || '',
              dimensions: {
                interior: {
                  length: productData.dimensions?.length || 0,
                  width: productData.dimensions?.width || 0,
                  height: productData.dimensions?.height || 0,
                  unit: productData.dimensions?.unit || 'in'
                }
              },
              internalDimensions: {
                length: productData.dimensions?.length || 0,
                width: productData.dimensions?.width || 0,
                height: productData.dimensions?.height || 0,
                unit: productData.dimensions?.unit || 'in'
              },
              compatibleWith: []
            };
          } catch (error: any) {
            this.logger.error(`Error getting case details from Reverb API: ${error.message}`);
            return null;
          }
          break;
          
        case 'aliexpress':
          const productInfo = await this.aliexpressService.getProductInfo(productId)
            .catch(error => {
              this.logger.error(`Error getting product details from AliExpress API: ${error.message}`);
              return null;
            });
            
          // Convert product info to case format if it exists
          if (productInfo) {
            caseData = {
              id: productId,
              marketplace: 'aliexpress',
              name: productInfo.title || '',
              brand: productInfo.brand || '',
              type: productInfo.type || 'hard case',
              category: productInfo.category || '',
              description: productInfo.description || '',
              price: productInfo.price || 0,
              currency: productInfo.currency || 'USD',
              imageUrl: productInfo.imageUrl || '',
              url: productInfo.url || '',
              dimensions: {
                interior: {
                  length: productInfo.dimensions?.length || 0,
                  width: productInfo.dimensions?.width || 0,
                  height: productInfo.dimensions?.height || 0,
                  unit: productInfo.dimensions?.unit || 'in'
                }
              },
              internalDimensions: {
                length: productInfo.dimensions?.length || 0,
                width: productInfo.dimensions?.width || 0,
                height: productInfo.dimensions?.height || 0,
                unit: productInfo.dimensions?.unit || 'in'
              },
              compatibleWith: []
            };
          }
          break;
          
        default:
          this.logger.warn(`Unknown marketplace: ${marketplace}`);
          return null;
      }
      
      // Cache results if enabled and case was found
      if (this.options.enableCaching && caseData) {
        await this.cacheService.set(apiName, params, caseData, { ttl: 86400 });
      }
      
      // Return as ICase type but without Document methods
      return caseData as unknown as ICase;
    } catch (error: unknown) {
      this.logger.error('Error getting case details:', error);
      return null;
    }
  }
}

export default ApiManager;
