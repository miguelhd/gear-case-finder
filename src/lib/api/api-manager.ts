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
import { ImageDownloader } from '../scrapers/image-downloader';

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
    } catch (error) {
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
          filename: path.join(this.options.logDirectory || '/tmp/logs', 'error.log'), 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: path.join(this.options.logDirectory || '/tmp/logs', 'combined.log') 
        })
      ]
    });
  }
  
  /**
   * Search for audio gear across all API sources
   * @param query Search query string
   * @param options Search options including pagination
   * @returns Array of audio gear items
   */
  async searchAudioGear(query: string, options: { page?: number, limit?: number } = {}): Promise<IAudioGear[]> {
    const allResults: IAudioGear[] = [];
    const searchPromises: Promise<void>[] = [];
    
    // Search Canopy API
    const canopyPromise = this.withRetry(async () => {
      try {
        this.logger.info(`Searching Canopy API for audio gear: ${query}`);
        
        // Try to get from cache first if caching is enabled
        let canopyResults;
        if (this.options.enableCaching) {
          canopyResults = await this.cacheService.cacheApiCall(
            'canopy_search_audio_gear',
            { query, options },
            () => this.canopyClient.searchAudioGear(query, options.limit || 10),
            { ttl: 3600, namespace: 'audio_gear' }
          );
        } else {
          canopyResults = await this.canopyClient.searchAudioGear(query, options.limit || 10);
        }
        
        this.logger.info(`Found ${canopyResults.products?.length || 0} audio gear results from Canopy API`);
        
        // Process the results
        const processedResults = processCanopyResults(canopyResults);
        
        // Process each result (download images and save to database)
        const finalResults = await this.processAudioGearResults(processedResults.audioGear, 'canopy');
        
        allResults.push(...finalResults);
        
        // Save the results to disk
        await this.saveResults(finalResults, `search_canopy_audio_gear_${query.replace(/\s+/g, '_')}`);
      } catch (error) {
        this.logger.error(`Error searching Canopy API for audio gear:`, error);
        // Continue with other sources
      }
    }, this.options.maxRetries, this.options.delayBetweenRetries);
    
    searchPromises.push(canopyPromise);
    
    // Wait for all search promises to complete
    await Promise.all(searchPromises);
    
    return allResults;
  }
  
  /**
   * Search for cases across all API sources
   * @param query Search query string
   * @param options Search options including pagination
   * @returns Array of case items
   */
  async searchCases(query: string, options: { page?: number, limit?: number } = {}): Promise<ICase[]> {
    const allResults: ICase[] = [];
    const searchPromises: Promise<void>[] = [];
    
    // Search Canopy API
    const canopyPromise = this.withRetry(async () => {
      try {
        this.logger.info(`Searching Canopy API for cases: ${query}`);
        
        // Try to get from cache first if caching is enabled
        let canopyResults;
        if (this.options.enableCaching) {
          canopyResults = await this.cacheService.cacheApiCall(
            'canopy_search_cases',
            { query, options },
            () => this.canopyClient.searchCases(query, options.limit || 10),
            { ttl: 3600, namespace: 'cases' }
          );
        } else {
          canopyResults = await this.canopyClient.searchCases(query, options.limit || 10);
        }
        
        this.logger.info(`Found ${canopyResults.products?.length || 0} case results from Canopy API`);
        
        // Process the results
        const processedResults = processCanopyResults(canopyResults);
        
        // Process each result (download images and save to database)
        const finalResults = await this.processCaseResults(processedResults.cases, 'canopy');
        
        allResults.push(...finalResults);
        
        // Save the results to disk
        await this.saveResults(finalResults, `search_canopy_cases_${query.replace(/\s+/g, '_')}`);
      } catch (error) {
        this.logger.error(`Error searching Canopy API for cases:`, error);
        // Continue with other sources
      }
    }, this.options.maxRetries, this.options.delayBetweenRetries);
    
    searchPromises.push(canopyPromise);
    
    // Wait for all search promises to complete
    await Promise.all(searchPromises);
    
    return allResults;
  }
  
  /**
   * Get audio gear details from a specific source
   * @param source Source identifier (e.g., 'canopy', 'reverb')
   * @param productId Product ID in the source system
   * @returns Audio gear details or null if not found
   */
  async getAudioGearDetails(source: string, productId: string): Promise<IAudioGear | null> {
    try {
      this.logger.info(`Getting audio gear details from ${source} for product ID: ${productId}`);
      
      // Try to get from cache first if caching is enabled
      if (this.options.enableCaching) {
        const cacheKey = `${source}_audio_gear_${productId}`;
        const cachedResult = await this.cacheService.get(cacheKey, {});
        if (cachedResult) {
          this.logger.info(`Found cached audio gear details for ${source} product ID: ${productId}`);
          return cachedResult as IAudioGear;
        }
      }
      
      // Not in cache, fetch from source
      let result: IAudioGear | null = null;
      
      if (source === 'canopy') {
        const canopyResult = await this.canopyClient.getProduct(productId);
        if (canopyResult) {
          const mappedResults = processCanopyResults({ products: [canopyResult] });
          if (mappedResults.audioGear.length > 0) {
            const audioGear = mappedResults.audioGear[0];
            
            // Process the result (download images and save to database)
            const processedItems = await this.processAudioGearResults([audioGear], source);
            if (processedItems.length > 0) {
              result = processedItems[0];
            }
          }
        }
      } else if (source === 'reverb') {
        const reverbResult = await this.reverbClient.getProductDetails(productId);
        if (reverbResult) {
          const mappedResults = processReverbResults({ listings: [reverbResult] });
          if (mappedResults.audioGear.length > 0) {
            const audioGear = mappedResults.audioGear[0];
            
            // Process the result (download images and save to database)
            const processedItems = await this.processAudioGearResults([audioGear], source);
            if (processedItems.length > 0) {
              result = processedItems[0];
            }
          }
        }
      }
      
      // Cache the result if found
      if (result && this.options.enableCaching) {
        const cacheKey = `${source}_audio_gear_${productId}`;
        await this.cacheService.set(cacheKey, {}, result, { ttl: 3600, namespace: 'audio_gear' });
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Error getting audio gear details from ${source} for product ID: ${productId}:`, error);
      return null;
    }
  }
  
  /**
   * Get case details from a specific source
   * @param source Source identifier (e.g., 'canopy', 'reverb')
   * @param productId Product ID in the source system
   * @returns Case details or null if not found
   */
  async getCaseDetails(source: string, productId: string): Promise<ICase | null> {
    try {
      this.logger.info(`Getting case details from ${source} for product ID: ${productId}`);
      
      // Try to get from cache first if caching is enabled
      if (this.options.enableCaching) {
        const cacheKey = `${source}_case_${productId}`;
        const cachedResult = await this.cacheService.get(cacheKey, {});
        if (cachedResult) {
          this.logger.info(`Found cached case details for ${source} product ID: ${productId}`);
          return cachedResult as ICase;
        }
      }
      
      // Not in cache, fetch from source
      let result: ICase | null = null;
      
      if (source === 'canopy') {
        const canopyResult = await this.canopyClient.getProduct(productId);
        if (canopyResult) {
          const mappedResults = processCanopyResults({ products: [canopyResult] });
          if (mappedResults.cases.length > 0) {
            const caseItem = mappedResults.cases[0];
            
            // Process the result (download images and save to database)
            const processedItems = await this.processCaseResults([caseItem], source);
            if (processedItems.length > 0) {
              result = processedItems[0];
            }
          }
        }
      } else if (source === 'reverb') {
        const reverbResult = await this.reverbClient.getProductDetails(productId);
        if (reverbResult) {
          const mappedResults = processReverbResults({ listings: [reverbResult] });
          if (mappedResults.cases.length > 0) {
            const caseItem = mappedResults.cases[0];
            
            // Process the result (download images and save to database)
            const processedItems = await this.processCaseResults([caseItem], source);
            if (processedItems.length > 0) {
              result = processedItems[0];
            }
          }
        }
      }
      
      // Cache the result if found
      if (result && this.options.enableCaching) {
        const cacheKey = `${source}_case_${productId}`;
        await this.cacheService.set(cacheKey, {}, result, { ttl: 3600, namespace: 'cases' });
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Error getting case details from ${source} for product ID: ${productId}:`, error);
      return null;
    }
  }
  
  /**
   * Process audio gear results (download images and save to database)
   * @param results Array of audio gear items
   * @param source Source identifier (e.g., 'canopy', 'reverb')
   * @returns Processed audio gear items
   */
  private async processAudioGearResults(results: IAudioGear[], source: string): Promise<IAudioGear[]> {
    const processedResults: IAudioGear[] = [];
    
    for (const item of results) {
      try {
        // Download images if enabled and image downloader is available
        if (this.options.downloadImages && this.imageDownloader && item.imageUrl) {
          const localImagePath = await this.imageDownloader.downloadImage(
            item.imageUrl,
            source,
            item._id?.toString() || `audio_gear_${Date.now()}`
          );
          
          if (localImagePath) {
            item.imageUrl = localImagePath;
          }
        }
        
        // Save to database if enabled
        if (this.options.saveToDatabase) {
          const savedItem = await this.saveAudioGearToDatabase(item);
          if (savedItem) {
            processedResults.push(savedItem);
            continue;
          }
        }
        
        // If not saved to database or saving failed, add the original item
        processedResults.push(item);
      } catch (error) {
        this.logger.error(`Error processing audio gear item:`, error);
        // Add the original item even if processing failed
        processedResults.push(item);
      }
    }
    
    return processedResults;
  }
  
  /**
   * Process case results (download images and save to database)
   * @param results Array of case items
   * @param source Source identifier (e.g., 'canopy', 'reverb')
   * @returns Processed case items
   */
  private async processCaseResults(results: ICase[], source: string): Promise<ICase[]> {
    const processedResults: ICase[] = [];
    
    for (const item of results) {
      try {
        // Download images if enabled and image downloader is available
        if (this.options.downloadImages && this.imageDownloader && item.imageUrl) {
          const localImagePath = await this.imageDownloader.downloadImage(
            item.imageUrl,
            source,
            item._id?.toString() || `case_${Date.now()}`
          );
          
          if (localImagePath) {
            item.imageUrl = localImagePath;
          }
        }
        
        // Download additional images if available
        if (this.options.downloadImages && this.imageDownloader && item.imageUrls && item.imageUrls.length > 0) {
          const localImagePaths = await this.imageDownloader.downloadImages(
            item.imageUrls,
            source,
            item._id?.toString() || `case_${Date.now()}`
          );
          
          if (localImagePaths.length > 0) {
            item.imageUrls = localImagePaths;
          }
        }
        
        // Save to database if enabled
        if (this.options.saveToDatabase) {
          const savedItem = await this.saveCaseToDatabase(item);
          if (savedItem) {
            processedResults.push(savedItem);
            continue;
          }
        }
        
        // If not saved to database or saving failed, add the original item
        processedResults.push(item);
      } catch (error) {
        this.logger.error(`Error processing case item:`, error);
        // Add the original item even if processing failed
        processedResults.push(item);
      }
    }
    
    return processedResults;
  }
  
  /**
   * Save audio gear to database
   * @param audioGear Audio gear item to save
   * @returns Saved audio gear item or null if saving failed
   */
  private async saveAudioGearToDatabase(audioGear: IAudioGear): Promise<IAudioGear | null> {
    try {
      // Connect to MongoDB if not already connected
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(this.options.mongodbUri || '');
      }
      
      // Get the AudioGear model
      const AudioGear = mongoose.model<IAudioGear>('AudioGear');
      
      // Check if the item already exists
      let existingItem = await AudioGear.findOne({ 
        name: audioGear.name,
        brand: audioGear.brand,
        category: audioGear.category
      });
      
      if (existingItem) {
        // Update existing item
        Object.assign(existingItem, audioGear);
        await existingItem.save();
        return existingItem;
      } else {
        // Create new item
        const newItem = new AudioGear(audioGear);
        await newItem.save();
        return newItem;
      }
    } catch (error) {
      this.logger.error(`Error saving audio gear to database:`, error);
      return null;
    }
  }
  
  /**
   * Save case to database
   * @param caseItem Case item to save
   * @returns Saved case item or null if saving failed
   */
  private async saveCaseToDatabase(caseItem: ICase): Promise<ICase | null> {
    try {
      // Connect to MongoDB if not already connected
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(this.options.mongodbUri || '');
      }
      
      // Get the Case model
      const Case = mongoose.model<ICase>('Case');
      
      // Check if the item already exists
      let existingItem = await Case.findOne({ 
        name: caseItem.name,
        brand: caseItem.brand,
        type: caseItem.type
      });
      
      if (existingItem) {
        // Update existing item
        Object.assign(existingItem, caseItem);
        await existingItem.save();
        return existingItem;
      } else {
        // Create new item
        const newItem = new Case(caseItem);
        await newItem.save();
        return newItem;
      }
    } catch (error) {
      this.logger.error(`Error saving case to database:`, error);
      return null;
    }
  }
  
  /**
   * Save results to disk
   * @param results Results to save
   * @param filename Base filename without extension
   * @returns Path to the saved file
   */
  private async saveResults(results: any[], filename: string): Promise<string> {
    try {
      // Ensure data directory exists
      await fs.mkdir(this.options.dataDirectory || './data', { recursive: true });
      
      // Create a timestamped filename
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const fullFilename = `${filename}_${timestamp}.json`;
      const filePath = path.join(this.options.dataDirectory || './data', fullFilename);
      
      // Save the results to disk
      await fs.writeFile(filePath, JSON.stringify(results, null, 2));
      
      this.logger.info(`Saved results to ${filePath}`);
      
      return filePath;
    } catch (error) {
      this.logger.error(`Error saving results to disk:`, error);
      return '';
    }
  }
  
  /**
   * Run a batch job manually
   * @param jobType Type of batch job to run
   */
  async runBatchJob(jobType: string): Promise<void> {
    if (!this.batchProcessingSystem) {
      throw new Error('Batch processing system is not enabled');
    }
    
    await this.batchProcessingSystem.runJob(jobType);
  }
  
  /**
   * Get batch job history
   * @param limit Maximum number of history items to return
   * @returns Array of batch job history items
   */
  async getBatchJobHistory(limit: number = 10): Promise<any[]> {
    if (!this.batchProcessingSystem) {
      return [];
    }
    
    return await this.batchProcessingSystem.getJobHistory(limit);
  }
  
  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  async getCacheStats(): Promise<any> {
    if (!this.options.enableCaching) {
      return { enabled: false };
    }
    
    return await this.cacheService.getStats();
  }
  
  /**
   * Schedule a job to run at regular intervals
   * @param jobName Name of the job
   * @param operation Function to execute
   * @param intervalMinutes Interval in minutes
   * @returns Job ID
   */
  scheduleJob(
    jobName: string,
    operation: () => Promise<void>,
    intervalMinutes: number
  ): string {
    if (!this.batchProcessingSystem) {
      throw new Error('Batch processing system is not enabled');
    }
    
    return this.batchProcessingSystem.scheduleJob(jobName, operation, intervalMinutes);
  }
  
  /**
   * Execute a function with retry logic
   * @param fn Function to execute
   * @param maxRetries Maximum number of retries
   * @param delayMs Delay between retries in milliseconds
   * @returns Result of the function
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = this.options.maxRetries || 3,
    delayMs: number = this.options.delayBetweenRetries || 5000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt <= maxRetries) {
          this.logger.warn(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    throw lastError;
  }
}

export default ApiManager;
