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
   * Whether to save API results to the database.
   */
  saveToDatabase?: boolean;
  
  /**
   * Whether to download images from API results.
   */
  downloadImages?: boolean;
  
  /**
   * MongoDB connection URI.
   */
  mongodbUri?: string;
  
  /**
   * API key for the Canopy API.
   */
  canopyApiKey?: string;
  
  /**
   * Access token for the Reverb API.
   */
  reverbAccessToken?: string;
  
  /**
   * API key for the AliExpress API (RapidAPI).
   */
  aliexpressRapidApiKey?: string;
  
  /**
   * Whether to enable batch processing of API requests.
   */
  enableBatchProcessing?: boolean;
  
  /**
   * Whether to enable caching of API responses.
   */
  enableCaching?: boolean;
}

/**
 * Interface for batch job history item
 */
export interface IBatchJobHistoryItem {
  jobId: string;
  jobType: string;
  startTime: Date;
  endTime?: Date;
  status: string;
  results?: {
    success: boolean;
    itemsProcessed: number;
    errors: string[];
  };
}

/**
 * Interface for cache statistics
 */
export interface ICacheStats {
  enabled: boolean;
  size?: number | undefined;
  maxSize?: number | undefined;
  itemCount?: number | undefined;
  maxItems?: number | undefined;
  hitRate?: number | undefined;
  misses?: number | undefined;
  hits?: number | undefined;
  totalCount?: number;
  expiredCount?: number;
  activeCount?: number;
  namespaceStats?: Array<{ namespace: string; count: number }>;
}

export class ApiManager {
  private logger!: winston.Logger;
  private options: IApiManagerOptions;
  private cacheService: ApiCacheService;
  private canopyClient: CanopyApiClient;
  private reverbClient: ReverbApiClient;
  private aliexpressService: AliExpressApiService;
  private batchProcessingSystem?: BatchProcessingSystem;
  private imageDownloader?: ImageDownloader;
  private apiSources: Map<string, string> = new Map();
  
  constructor(options: IApiManagerOptions = {}) {
    // Determine appropriate log directory based on environment
    const defaultLogDir = process.env.NODE_ENV === 'production' 
      ? '/tmp/logs' 
      : './logs';
    
    // Determine appropriate data directory based on environment
    const defaultDataDir = process.env.NODE_ENV === 'production' 
      ? '/tmp/data' 
      : './data';
    
    // Determine appropriate image directory based on environment
    const defaultImageDir = process.env.NODE_ENV === 'production' 
      ? '/tmp/images' 
      : './public/images';
    
    this.options = {
      logDirectory: defaultLogDir,
      dataDirectory: defaultDataDir,
      imageDirectory: defaultImageDir,
      maxRetries: 3,
      delayBetweenRetries: 5000,
      saveToDatabase: true,
      downloadImages: true,
      mongodbUri: process.env['MONGODB_URI'] || 'mongodb+srv://gearCaseApp:rucwoj-watxor-Rocji5@cluster0.mongodb.net/musician-case-finder',
      canopyApiKey: process.env['CANOPY_API_KEY'] || '',
      reverbAccessToken: process.env['REVERB_ACCESS_TOKEN'] || '',
      aliexpressRapidApiKey: process.env['ALIEXPRESS_RAPIDAPI_KEY'] || '',
      enableBatchProcessing: true,
      enableCaching: true,
      ...options
    };
    
    // Initialize API clients - ensure we always pass a string, not undefined
    this.canopyClient = new CanopyApiClient({ apiKey: this.options.canopyApiKey || '' });
    this.reverbClient = new ReverbApiClient({ accessToken: this.options.reverbAccessToken || '' });
    this.aliexpressService = new AliExpressApiService({ 
      rapidApiKey: this.options.aliexpressRapidApiKey || '',
      cacheEnabled: this.options.enableCaching
    });
    
    // Initialize cache service
    this.cacheService = new ApiCacheService();
    
    // Initialize image downloader if enabled
    if (this.options.downloadImages) {
      // Create a configuration object with only defined values to avoid TypeScript errors
      const imageDownloaderOptions: Record<string, string> = {};
      
      // Only add properties if they are defined
      if (this.options.imageDirectory) {
        imageDownloaderOptions['imageDirectory'] = this.options.imageDirectory;
      }
      
      if (this.options.logDirectory) {
        imageDownloaderOptions['logDirectory'] = this.options.logDirectory;
      }
      
      this.imageDownloader = new ImageDownloader(imageDownloaderOptions);
    }
    
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
        await this.cacheService.set(apiName, params, combinedResults);
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
        await this.cacheService.set(apiName, params, combinedResults);
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
  async getCacheStats(): Promise<ICacheStats> {
    try {
      if (!this.options.enableCaching) {
        return { enabled: false };
      }
      
      return await this.cacheService.getStats();
    } catch (error: unknown) {
      this.logger.error('Error getting cache stats:', error);
      return { enabled: this.options.enableCaching || false };
    }
  }
  
  /**
   * Clear the cache
   */
  async clearCache(): Promise<boolean> {
    try {
      if (!this.options.enableCaching) {
        return false;
      }
      
      return await this.cacheService.clear();
    } catch (error: unknown) {
      this.logger.error('Error clearing cache:', error);
      return false;
    }
  }
  
  /**
   * Get batch job history
   */
  async getBatchJobHistory(): Promise<IBatchJobHistoryItem[]> {
    try {
      if (!this.options.enableBatchProcessing || !this.batchProcessingSystem) {
        return [];
      }
      
      return await this.batchProcessingSystem.getJobHistory();
    } catch (error: unknown) {
      this.logger.error('Error getting batch job history:', error);
      return [];
    }
  }
  
  /**
   * Start a batch job to fetch audio gear data
   */
  async startAudioGearBatchJob(queries: string[]): Promise<string> {
    try {
      if (!this.options.enableBatchProcessing || !this.batchProcessingSystem) {
        throw new Error('Batch processing is not enabled');
      }
      
      return await this.batchProcessingSystem.startAudioGearBatchJob(queries);
    } catch (error: unknown) {
      this.logger.error('Error starting audio gear batch job:', error);
      throw error;
    }
  }
  
  /**
   * Start a batch job to fetch case data
   */
  async startCasesBatchJob(queries: string[]): Promise<string> {
    try {
      if (!this.options.enableBatchProcessing || !this.batchProcessingSystem) {
        throw new Error('Batch processing is not enabled');
      }
      
      return await this.batchProcessingSystem.startCasesBatchJob(queries);
    } catch (error: unknown) {
      this.logger.error('Error starting cases batch job:', error);
      throw error;
    }
  }
  
  /**
   * Get batch job status
   */
  async getBatchJobStatus(jobId: string): Promise<IBatchJobHistoryItem | null> {
    try {
      if (!this.options.enableBatchProcessing || !this.batchProcessingSystem) {
        return null;
      }
      
      return await this.batchProcessingSystem.getJobStatus(jobId);
    } catch (error: unknown) {
      this.logger.error('Error getting batch job status:', error);
      return null;
    }
  }
  
  /**
   * Find cases that match the dimensions of a specific audio gear
   */
  async searchCasesForAudioGear(audioGear: IAudioGear, options: { page?: number, limit?: number } = {}): Promise<ICase[]> {
    try {
      if (!audioGear || !audioGear.dimensions) {
        return [];
      }
      
      // Create a cache key for this search
      const apiName = 'search_cases_for_audio_gear';
      const params = { audioGearId: audioGear.id, ...options };
      
      // Check cache first if enabled
      if (this.options.enableCaching) {
        const cachedResult = await this.cacheService.get(apiName, params);
        if (cachedResult) {
          this.logger.info(`Cache hit for cases search for audio gear: ${audioGear.id}`);
          return cachedResult as ICase[];
        }
      }
      
      // Prepare search options
      const limit = options.limit || 20;
      
      // Search for cases
      const cases = await this.searchCases('case', { limit });
      
      // Filter cases that match the dimensions of the audio gear
      const matchingCases = cases.filter(caseItem => {
        if (!caseItem.dimensions || !audioGear.dimensions) {
          return false;
        }
        
        // Check if case dimensions are larger than audio gear dimensions
        const isLengthSuitable = !audioGear.dimensions.length || !caseItem.dimensions.length || caseItem.dimensions.length >= audioGear.dimensions.length;
        const isWidthSuitable = !audioGear.dimensions.width || !caseItem.dimensions.width || caseItem.dimensions.width >= audioGear.dimensions.width;
        const isHeightSuitable = !audioGear.dimensions.height || !caseItem.dimensions.height || caseItem.dimensions.height >= audioGear.dimensions.height;
        
        return isLengthSuitable && isWidthSuitable && isHeightSuitable;
      });
      
      // Try AliExpress API for more precise matching if available
      if (this.options.aliexpressRapidApiKey) {
        try {
          const aliexpressMatchingCases = await this.aliexpressService.findMatchingCases(audioGear, { limit });
          
          // Add AliExpress cases to the matching cases
          matchingCases.push(...aliexpressMatchingCases);
        } catch (error) {
          this.logger.error(`Error finding matching cases from AliExpress: ${error}`);
        }
      }
      
      // Cache results if enabled
      if (this.options.enableCaching) {
        await this.cacheService.set(apiName, params, matchingCases);
      }
      
      return matchingCases;
    } catch (error: unknown) {
      this.logger.error('Error searching for cases for audio gear:', error);
      return [];
    }
  }
}

export default ApiManager;
