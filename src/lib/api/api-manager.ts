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

export interface ApiManagerOptions {
  logDirectory?: string;
  dataDirectory?: string;
  imageDirectory?: string;
  maxRetries?: number;
  delayBetweenRetries?: number;
  saveToDatabase?: boolean;
  downloadImages?: boolean;
  mongodbUri?: string;
  canopyApiKey?: string;
  reverbAccessToken?: string;
  enableBatchProcessing?: boolean;
  enableCaching?: boolean;
}

export class ApiManager {
  private logger!: winston.Logger;
  private options: ApiManagerOptions;
  private cacheService: ApiCacheService;
  private canopyClient: CanopyApiClient;
  private reverbClient: ReverbApiClient;
  private batchProcessingSystem?: BatchProcessingSystem;
  private imageDownloader?: ImageDownloader;
  private apiSources: Map<string, string> = new Map();
  
  constructor(options: ApiManagerOptions = {}) {
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
  
  private setupLogger() {
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
    
    // Search Reverb API
    const reverbPromise = this.withRetry(async () => {
      try {
        this.logger.info(`Searching Reverb API for audio gear: ${query}`);
        
        // Try to get from cache first if caching is enabled
        let reverbResults;
        if (this.options.enableCaching) {
          reverbResults = await this.cacheService.cacheApiCall(
            'reverb_search_audio_gear',
            { query, options },
            () => this.reverbClient.searchAudioGear(query, options.limit || 10),
            { ttl: 3600, namespace: 'audio_gear' }
          );
        } else {
          reverbResults = await this.reverbClient.searchAudioGear(query, options.limit || 10);
        }
        
        this.logger.info(`Found ${reverbResults.listings?.length || 0} audio gear results from Reverb API`);
        
        // Process the results
        const processedResults = processReverbResults(reverbResults);
        
        // Process each result (download images and save to database)
        const finalResults = await this.processAudioGearResults(processedResults.audioGear, 'reverb');
        
        allResults.push(...finalResults);
        
        // Save the results to disk
        await this.saveResults(finalResults, `search_reverb_audio_gear_${query.replace(/\s+/g, '_')}`);
      } catch (error) {
        this.logger.error(`Error searching Reverb API for audio gear:`, error);
        // Continue with other sources
      }
    }, this.options.maxRetries, this.options.delayBetweenRetries);
    
    searchPromises.push(reverbPromise);
    
    // Wait for all search promises to complete
    await Promise.all(searchPromises);
    
    return allResults;
  }
  
  /**
   * Search for cases across all API sources
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
    
    // Search Reverb API
    const reverbPromise = this.withRetry(async () => {
      try {
        this.logger.info(`Searching Reverb API for cases: ${query}`);
        
        // Try to get from cache first if caching is enabled
        let reverbResults;
        if (this.options.enableCaching) {
          reverbResults = await this.cacheService.cacheApiCall(
            'reverb_search_cases',
            { query, options },
            () => this.reverbClient.searchCases(query, options.limit || 10),
            { ttl: 3600, namespace: 'cases' }
          );
        } else {
          reverbResults = await this.reverbClient.searchCases(query, options.limit || 10);
        }
        
        this.logger.info(`Found ${reverbResults.listings?.length || 0} case results from Reverb API`);
        
        // Process the results
        const processedResults = processReverbResults(reverbResults);
        
        // Process each result (download images and save to database)
        const finalResults = await this.processCaseResults(processedResults.cases, 'reverb');
        
        allResults.push(...finalResults);
        
        // Save the results to disk
        await this.saveResults(finalResults, `search_reverb_cases_${query.replace(/\s+/g, '_')}`);
      } catch (error) {
        this.logger.error(`Error searching Reverb API for cases:`, error);
        // Continue with other sources
      }
    }, this.options.maxRetries, this.options.delayBetweenRetries);
    
    searchPromises.push(reverbPromise);
    
    // Wait for all search promises to complete
    await Promise.all(searchPromises);
    
    return allResults;
  }
  
  /**
   * Get audio gear details from a specific source
   */
  async getAudioGearDetails(source: string, productId: string): Promise<IAudioGear | null> {
    try {
      this.logger.info(`Getting audio gear details from ${source} for product ID: ${productId}`);
      
      // Try to get from cache first if caching is enabled
      if (this.options.enableCaching) {
        const cachedResult = await this.cacheService.get(`${source}_audio_gear_${productId}`, 'audio_gear');
        if (cachedResult) {
          this.logger.info(`Found cached audio gear details for ${productId}`);
          return cachedResult as IAudioGear;
        }
      }
      
      let result: IAudioGear | null = null;
      
      if (source === 'canopy') {
        const canopyResult = await this.canopyClient.getProduct(productId);
        if (canopyResult) {
          const processedResults = processCanopyResults({ products: [canopyResult] });
          if (processedResults.audioGear.length > 0) {
            result = processedResults.audioGear[0];
            if (result) {
              result.marketplace = source;
            }
          }
        }
      } else if (source === 'reverb') {
        const reverbResult = await this.reverbClient.getItem(productId);
        if (reverbResult) {
          const processedResults = processReverbResults({ listings: [reverbResult] });
          if (processedResults.audioGear.length > 0) {
            result = processedResults.audioGear[0];
            if (result) {
              result.marketplace = source;
            }
          }
        }
      }
      
      if (result) {
        // Process the result (download images and save to database)
        const finalResults = await this.processAudioGearResults([result], source);
        
        // Cache the result if caching is enabled
        if (this.options.enableCaching && finalResults.length > 0) {
          await this.cacheService.set(
            `${source}_audio_gear_${productId}`, 
            finalResults[0], 
            'audio_gear', 
            { ttl: 86400 } // 24 hours
          );
        }
        
        return finalResults.length > 0 ? finalResults[0] : null;
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Error getting audio gear details from ${source} for product ID ${productId}:`, error);
      return null;
    }
  }
  
  /**
   * Get case details from a specific source
   */
  async getCaseDetails(source: string, productId: string): Promise<ICase | null> {
    try {
      this.logger.info(`Getting case details from ${source} for product ID: ${productId}`);
      
      // Try to get from cache first if caching is enabled
      if (this.options.enableCaching) {
        const cachedResult = await this.cacheService.get(`${source}_case_${productId}`, 'cases');
        if (cachedResult) {
          this.logger.info(`Found cached case details for ${productId}`);
          return cachedResult as ICase;
        }
      }
      
      let result: ICase | null = null;
      
      if (source === 'canopy') {
        const canopyResult = await this.canopyClient.getProduct(productId);
        if (canopyResult) {
          const processedResults = processCanopyResults({ products: [canopyResult] });
          if (processedResults.cases.length > 0) {
            result = processedResults.cases[0];
            if (result) {
              result.marketplace = source;
            }
          }
        }
      } else if (source === 'reverb') {
        const reverbResult = await this.reverbClient.getItem(productId);
        if (reverbResult) {
          const processedResults = processReverbResults({ listings: [reverbResult] });
          if (processedResults.cases.length > 0) {
            result = processedResults.cases[0];
            if (result) {
              result.marketplace = source;
            }
          }
        }
      }
      
      if (result) {
        // Process the result (download images and save to database)
        const finalResults = await this.processCaseResults([result], source);
        
        // Cache the result if caching is enabled
        if (this.options.enableCaching && finalResults.length > 0) {
          await this.cacheService.set(
            `${source}_case_${productId}`, 
            finalResults[0], 
            'cases', 
            { ttl: 86400 } // 24 hours
          );
        }
        
        return finalResults.length > 0 ? finalResults[0] : null;
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Error getting case details from ${source} for product ID ${productId}:`, error);
      return null;
    }
  }
  
  /**
   * Process audio gear results (download images and save to database)
   */
  private async processAudioGearResults(results: IAudioGear[], source: string): Promise<IAudioGear[]> {
    const processedResults: IAudioGear[] = [];
    
    for (const audioGear of results) {
      try {
        // Set the marketplace source
        audioGear.marketplace = source;
        
        // Download images if enabled
        if (this.options.downloadImages && this.imageDownloader && audioGear.imageUrl) {
          try {
            const localImagePath = await this.imageDownloader.downloadImage(audioGear.imageUrl, `audio_gear_${audioGear._id}`);
            if (localImagePath) {
              audioGear.imageUrl = localImagePath;
            }
          } catch (error) {
            this.logger.error(`Error downloading image for audio gear ${audioGear._id}:`, error);
            // Continue with original image URL
          }
        }
        
        // Save to database if enabled
        if (this.options.saveToDatabase) {
          try {
            // Connect to MongoDB if not already connected
            if (mongoose.connection.readyState !== 1) {
              await mongoose.connect(this.options.mongodbUri || '');
            }
            
            // Import the AudioGear model
            const { AudioGear } = await import('../models/gear-models');
            
            // Check if the audio gear already exists
            const existingAudioGear = await AudioGear.findOne({ 
              name: audioGear.name,
              brand: audioGear.brand
            });
            
            if (existingAudioGear) {
              // Update existing audio gear
              await AudioGear.updateOne(
                { _id: existingAudioGear._id },
                { $set: audioGear }
              );
              
              // Use the existing ID
              audioGear._id = existingAudioGear._id;
            } else {
              // Create new audio gear
              const newAudioGear = new AudioGear(audioGear);
              await newAudioGear.save();
              
              // Use the new ID
              audioGear._id = newAudioGear._id;
            }
          } catch (error) {
            this.logger.error(`Error saving audio gear to database:`, error);
            // Continue without saving to database
          }
        }
        
        processedResults.push(audioGear);
      } catch (error) {
        this.logger.error(`Error processing audio gear:`, error);
        // Skip this audio gear and continue with others
      }
    }
    
    return processedResults;
  }
  
  /**
   * Process case results (download images and save to database)
   */
  private async processCaseResults(results: ICase[], source: string): Promise<ICase[]> {
    const processedResults: ICase[] = [];
    
    for (const caseItem of results) {
      try {
        // Set the marketplace source
        caseItem.marketplace = source;
        
        // Download images if enabled
        if (this.options.downloadImages && this.imageDownloader && caseItem.imageUrl) {
          try {
            const localImagePath = await this.imageDownloader.downloadImage(caseItem.imageUrl, `case_${caseItem._id}`);
            if (localImagePath) {
              caseItem.imageUrl = localImagePath;
            }
          } catch (error) {
            this.logger.error(`Error downloading image for case ${caseItem._id}:`, error);
            // Continue with original image URL
          }
        }
        
        // Save to database if enabled
        if (this.options.saveToDatabase) {
          try {
            // Connect to MongoDB if not already connected
            if (mongoose.connection.readyState !== 1) {
              await mongoose.connect(this.options.mongodbUri || '');
            }
            
            // Import the Case model
            const { Case } = await import('../models/gear-models');
            
            // Check if the case already exists
            const existingCase = await Case.findOne({ 
              name: caseItem.name,
              brand: caseItem.brand
            });
            
            if (existingCase) {
              // Update existing case
              await Case.updateOne(
                { _id: existingCase._id },
                { $set: caseItem }
              );
              
              // Use the existing ID
              caseItem._id = existingCase._id;
            } else {
              // Create new case
              const newCase = new Case(caseItem);
              await newCase.save();
              
              // Use the new ID
              caseItem._id = newCase._id;
            }
          } catch (error) {
            this.logger.error(`Error saving case to database:`, error);
            // Continue without saving to database
          }
        }
        
        processedResults.push(caseItem);
      } catch (error) {
        this.logger.error(`Error processing case:`, error);
        // Skip this case and continue with others
      }
    }
    
    return processedResults;
  }
  
  /**
   * Save results to disk
   */
  private async saveResults(results: any[], filename: string): Promise<void> {
    try {
      // Ensure data directory exists
      await fs.mkdir(this.options.dataDirectory || './data', { recursive: true });
      
      // Save results to disk
      const filePath = path.join(this.options.dataDirectory || './data', `${filename}.json`);
      await fs.writeFile(filePath, JSON.stringify(results, null, 2));
      
      this.logger.info(`Saved results to ${filePath}`);
    } catch (error) {
      this.logger.error(`Error saving results to disk:`, error);
      // Continue without saving to disk
    }
  }
  
  /**
   * Retry a function with exponential backoff
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          const delay = delayMs * Math.pow(2, attempt - 1);
          this.logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }
  
  /**
   * Run a batch job manually
   */
  async runBatchJob(jobType: string): Promise<void> {
    if (!this.batchProcessingSystem) {
      throw new Error('Batch processing system is not enabled');
    }
    
    await this.batchProcessingSystem.runJob(jobType);
  }
  
  /**
   * Get batch job history
   */
  async getBatchJobHistory(limit: number = 10): Promise<any[]> {
    if (!this.batchProcessingSystem) {
      return [];
    }
    
    return await this.batchProcessingSystem.getJobHistory(limit);
  }
  
  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    if (!this.options.enableCaching) {
      return { enabled: false };
    }
    
    return await this.cacheService.getStats();
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
    
    return this.batchProcessingSystem.scheduleJob(jobName, operation, intervalMinutes);
  }
}
