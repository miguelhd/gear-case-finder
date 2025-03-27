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
      mongodbUri: process.env.MONGODB_URI || 'mongodb+srv://gearCaseApp:rucwoj-watxor-Rocji5@cluster0.mongodb.net/musician-case-finder',
      canopyApiKey: process.env.CANOPY_API_KEY || '',
      reverbAccessToken: process.env.REVERB_ACCESS_TOKEN || '',
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
      this.imageDownloader = new ImageDownloader({
        imageDirectory: this.options.imageDirectory,
        logDirectory: this.options.logDirectory
      });
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
   * Process audio gear results by downloading images and saving to database
   * @param results Audio gear results to process
   * @param source Source of the results (e.g., 'canopy', 'reverb')
   * @returns Processed audio gear results
   */
  private async processAudioGearResults(results: IAudioGear[], source: string): Promise<IAudioGear[]> {
    const processedResults: IAudioGear[] = [];
    
    for (const gear of results) {
      try {
        // Download images if enabled and imageUrl is provided
        if (this.options.downloadImages && this.imageDownloader && gear.imageUrl) {
          const localImagePath = await this.imageDownloader.downloadImage(
            gear.imageUrl,
            source,
            gear.id || `${gear.brand}_${gear.name}`.replace(/\s+/g, '_'),
            0
          );
          
          if (localImagePath) {
            gear.imageUrl = localImagePath;
          }
          
          // Download additional images if available
          if (gear.imageUrls && gear.imageUrls.length > 0) {
            const localImagePaths = await this.imageDownloader.downloadImages(
              gear.imageUrls,
              source,
              gear.id || `${gear.brand}_${gear.name}`.replace(/\s+/g, '_')
            );
            
            if (localImagePaths.length > 0) {
              gear.imageUrls = localImagePaths;
            }
          }
        }
        
        // Save to database if enabled
        if (this.options.saveToDatabase) {
          await this.saveToDatabase(gear);
        }
        
        processedResults.push(gear);
      } catch (error) {
        this.logger.error(`Error processing audio gear result:`, error);
        // Continue with other results
        processedResults.push(gear);
      }
    }
    
    return processedResults;
  }
  
  /**
   * Save audio gear to database
   * @param gear Audio gear to save
   */
  private async saveToDatabase(gear: IAudioGear): Promise<void> {
    try {
      // Connect to MongoDB if not already connected
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(this.options.mongodbUri || '');
      }
      
      // Check if gear already exists in database
      const existingGear = await mongoose.model<IAudioGear>('AudioGear').findOne({
        brand: gear.brand,
        name: gear.name
      });
      
      if (existingGear) {
        // Update existing gear
        await mongoose.model<IAudioGear>('AudioGear').updateOne(
          { _id: existingGear._id },
          { $set: gear }
        );
        
        this.logger.info(`Updated audio gear in database: ${gear.brand} ${gear.name}`);
      } else {
        // Create new gear
        await mongoose.model<IAudioGear>('AudioGear').create(gear);
        
        this.logger.info(`Saved new audio gear to database: ${gear.brand} ${gear.name}`);
      }
    } catch (error) {
      this.logger.error(`Error saving audio gear to database:`, error);
      throw error;
    }
  }
  
  /**
   * Save results to disk
   * @param results Results to save
   * @param filename Base filename without extension
   */
  private async saveResults(results: any[], filename: string): Promise<void> {
    try {
      // Ensure data directory exists
      await fs.mkdir(this.options.dataDirectory || './data', { recursive: true });
      
      // Save results to JSON file
      const filePath = path.join(this.options.dataDirectory || './data', `${filename}.json`);
      await fs.writeFile(filePath, JSON.stringify(results, null, 2));
      
      this.logger.info(`Saved results to ${filePath}`);
    } catch (error) {
      this.logger.error(`Error saving results to disk:`, error);
      // Continue execution
    }
  }
  
  /**
   * Execute a function with retry logic
   * @param fn Function to execute
   * @param retries Number of retries remaining
   * @param delay Delay between retries in milliseconds
   */
  private async withRetry<T>(
    fn: () => Promise<T>, 
    retries: number = this.options.maxRetries || 3, 
    delay: number = this.options.delayBetweenRetries || 5000
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        this.logger.warn(`Request failed, retrying... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(fn, retries - 1, delay);
      }
      throw error;
    }
  }
}

export default ApiManager;
