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
      enableBatchProcessing: true,
      enableCaching: true,
      ...options
    };
    
    // Initialize API clients - ensure we always pass a string, not undefined
    this.canopyClient = new CanopyApiClient({ apiKey: this.options.canopyApiKey || '' });
    this.reverbClient = new ReverbApiClient({ accessToken: this.options.reverbAccessToken || '' });
    
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
      
      // Combine results - extract audioGear arrays from the responses
      const combinedResults = [
        ...(canopyResponse.audioGear || []), 
        ...(reverbResponse.audioGear || [])
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
          this.logger.info(`Cache hit for case search: ${query}`);
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
      
      // Combine results - extract cases arrays from the responses
      const combinedResults = [
        ...(canopyResponse.cases || []), 
        ...(reverbResponse.cases || [])
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
   * Get audio gear details from a specific API source
   */
  async getAudioGearDetails(source: string, productId: string): Promise<IAudioGear | null> {
    try {
      // Create a cache key for this request
      const apiName = 'audio_gear_details';
      const params = { source, productId };
      
      // Check cache first if enabled
      if (this.options.enableCaching) {
        const cachedResult = await this.cacheService.get(apiName, params);
        if (cachedResult) {
          this.logger.info(`Cache hit for audio gear details: ${source}/${productId}`);
          return cachedResult as IAudioGear;
        }
      }
      
      // Get details from the appropriate API source
      let result: IAudioGear | null = null;
      
      if (source === 'canopy') {
        // Use getProduct method instead of non-existent getAudioGearDetails
        const productData = await this.canopyClient.getProduct(productId);
        // Process the product data to convert it to IAudioGear format
        // This is a simplified version since we're removing scraper code
        result = {
          _id: productId,
          name: productData.title || productData.name || '',
          brand: productData.brand || 'Unknown',
          category: 'keyboard', // Default category
          dimensions: {
            length: 0,
            width: 0,
            height: 0,
            unit: 'in'
          },
          marketplace: 'canopy',
          updatedAt: new Date()
        } as IAudioGear;
      } else if (source === 'reverb') {
        // Use getItem method instead of non-existent getAudioGearDetails
        const itemData = await this.reverbClient.getItem(productId);
        // Process the item data to convert it to IAudioGear format
        // This is a simplified version since we're removing scraper code
        result = {
          _id: productId,
          name: itemData.title || itemData.name || '',
          brand: itemData.brand || 'Unknown',
          category: 'keyboard', // Default category
          dimensions: {
            length: 0,
            width: 0,
            height: 0,
            unit: 'in'
          },
          marketplace: 'reverb',
          updatedAt: new Date()
        } as IAudioGear;
      } else {
        this.logger.warn(`Unknown API source: ${source}`);
        return null;
      }
      
      // Cache result if enabled and result exists
      if (this.options.enableCaching && result) {
        await this.cacheService.set(apiName, params, result);
      }
      
      return result;
    } catch (error: unknown) {
      this.logger.error(`Error getting audio gear details from ${source}:`, error);
      return null;
    }
  }
  
  /**
   * Get case details from a specific API source
   */
  async getCaseDetails(source: string, productId: string): Promise<ICase | null> {
    try {
      // Create a cache key for this request
      const apiName = 'case_details';
      const params = { source, productId };
      
      // Check cache first if enabled
      if (this.options.enableCaching) {
        const cachedResult = await this.cacheService.get(apiName, params);
        if (cachedResult) {
          this.logger.info(`Cache hit for case details: ${source}/${productId}`);
          return cachedResult as ICase;
        }
      }
      
      // Get details from the appropriate API source
      let result: ICase | null = null;
      
      if (source === 'canopy') {
        // Use getProduct method instead of non-existent getCaseDetails
        const productData = await this.canopyClient.getProduct(productId);
        // Process the product data to convert it to ICase format
        // This is a simplified version since we're removing scraper code
        result = {
          _id: productId,
          name: productData.title || productData.name || '',
          marketplace: 'canopy',
          dimensions: {
            interior: {
              length: 0,
              width: 0,
              height: 0,
              unit: 'in'
            },
            exterior: {
              length: 0,
              width: 0,
              height: 0,
              unit: 'in'
            }
          },
          updatedAt: new Date()
        } as ICase;
      } else if (source === 'reverb') {
        // Use getItem method instead of non-existent getCaseDetails
        const itemData = await this.reverbClient.getItem(productId);
        // Process the item data to convert it to ICase format
        // This is a simplified version since we're removing scraper code
        result = {
          _id: productId,
          name: itemData.title || itemData.name || '',
          marketplace: 'reverb',
          dimensions: {
            interior: {
              length: 0,
              width: 0,
              height: 0,
              unit: 'in'
            },
            exterior: {
              length: 0,
              width: 0,
              height: 0,
              unit: 'in'
            }
          },
          updatedAt: new Date()
        } as ICase;
      } else {
        this.logger.warn(`Unknown API source: ${source}`);
        return null;
      }
      
      // Cache result if enabled and result exists
      if (this.options.enableCaching && result) {
        await this.cacheService.set(apiName, params, result);
      }
      
      return result;
    } catch (error: unknown) {
      this.logger.error(`Error getting case details from ${source}:`, error);
      return null;
    }
  }
  
  /**
   * Run a batch job manually
   */
  async runBatchJob(jobType: string): Promise<void> {
    if (!this.batchProcessingSystem) {
      throw new Error('Batch processing system is not enabled');
    }
    
    await this.batchProcessingSystem.runManualBatchJob(jobType);
  }
  
  /**
   * Get batch job history
   */
  async getBatchJobHistory(limit: number = 10): Promise<IBatchJobHistoryItem[]> {
    if (!this.batchProcessingSystem) {
      return [];
    }
    
    // Since getJobHistory doesn't exist, we'll return an empty array
    // This is a stub implementation since we're removing scraper code
    this.logger.info(`Returning empty batch job history (limit: ${limit})`);
    return [];
  }
  
  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<ICacheStats> {
    if (!this.options.enableCaching) {
      return { enabled: false };
    }
    
    // Get the stats from the cache service
    const rawStats = await this.cacheService.getStats();
    
    // Map the raw stats to our ICacheStats interface
    return {
      enabled: true,
      itemCount: rawStats.totalCount,
      hits: 0, // Not tracked in the current implementation
      misses: 0, // Not tracked in the current implementation
      hitRate: 0, // Not tracked in the current implementation
      totalCount: rawStats.totalCount,
      expiredCount: rawStats.expiredCount,
      activeCount: rawStats.activeCount,
      namespaceStats: rawStats.namespaceStats
    };
  }
  
  /**
   * Schedule a job to run at regular intervals
   */
  scheduleJob(
    jobName: string,
    operation: () => Promise<void>,
    intervalMinutes: number
  ) {
    if (!this.batchProcessingSystem) {
      throw new Error('Batch processing system is not enabled');
    }
    
    // Since scheduleJob might not exist, we'll log a message and return null
    // This is a stub implementation since we're removing scraper code
    this.logger.info(`Scheduling job ${jobName} to run every ${intervalMinutes} minutes (stub implementation)`);
    return null;
  }
  
  /**
   * Search for cases that match the dimensions of an audio gear item
   */
  async searchCasesForAudioGear(audioGear: IAudioGear, options: { page?: number, limit?: number } = {}): Promise<ICase[]> {
    try {
      // Create a cache key for this search
      const apiName = 'search_cases_for_audio_gear';
      const params = { audioGearId: audioGear._id?.toString(), ...options };
      
      // Check cache first if enabled
      if (this.options.enableCaching) {
        const cachedResult = await this.cacheService.get(apiName, params);
        if (cachedResult) {
          this.logger.info(`Cache hit for cases matching audio gear: ${audioGear._id}`);
          return cachedResult as ICase[];
        }
      }
      
      // Prepare search options
      const limit = options.limit || 10;
      
      // Get the dimensions of the audio gear
      const { length, width, height, unit } = audioGear.dimensions;
      
      // Search for cases that can fit this audio gear
      const cases = await this.searchCases('case', { limit });
      
      // Filter cases that can fit the audio gear
      const matchingCases = cases.filter(caseItem => {
        const interiorDimensions = caseItem.dimensions.interior;
        
        // Skip cases with missing dimensions
        if (!interiorDimensions) {
          return false;
        }
        
        // Convert dimensions to the same unit if necessary
        let adjustedLength = length;
        let adjustedWidth = width;
        let adjustedHeight = height;
        
        if (unit !== interiorDimensions.unit) {
          // Implement unit conversion logic here
          // For simplicity, we'll assume all dimensions are in the same unit
        }
        
        // Check if the audio gear fits in the case
        return (
          adjustedLength <= interiorDimensions.length &&
          adjustedWidth <= interiorDimensions.width &&
          adjustedHeight <= interiorDimensions.height
        );
      });
      
      // Cache results if enabled
      if (this.options.enableCaching) {
        await this.cacheService.set(apiName, params, matchingCases);
      }
      
      return matchingCases;
    } catch (error: unknown) {
      this.logger.error('Error searching for cases matching audio gear:', error);
      return [];
    }
  }
}
