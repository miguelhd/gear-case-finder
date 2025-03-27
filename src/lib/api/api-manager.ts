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
    
    // Initialize API clients
    this.canopyClient = new CanopyApiClient({ apiKey: this.options.canopyApiKey });
    this.reverbClient = new ReverbApiClient({ accessToken: this.options.reverbAccessToken });
    
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
        canopyApiKey: this.options.canopyApiKey,
        reverbAccessToken: this.options.reverbAccessToken
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
            () => this.canopyClient.searchAudioGear(query, options.limit || 10, options.page || 1),
            { ttl: 3600, namespace: 'audio_gear' }
          );
        } else {
          canopyResults = await this.canopyClient.searchAudioGear(query, options.limit || 10, options.page || 1);
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
            () => this.reverbClient.searchAudioGear(query, options.limit || 10, options.page || 1),
            { ttl: 3600, namespace: 'audio_gear' }
          );
        } else {
          reverbResults = await this.reverbClient.searchAudioGear(query, options.limit || 10, options.page || 1);
        }
        
        this.logger.info(`Found ${reverbResults.products?.length || 0} audio gear results from Reverb API`);
        
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
    
    // Wait for all searches to complete
    await Promise.allSettled(searchPromises);
    
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
            () => this.canopyClient.searchCases(query, options.limit || 10, options.page || 1),
            { ttl: 3600, namespace: 'cases' }
          );
        } else {
          canopyResults = await this.canopyClient.searchCases(query, options.limit || 10, options.page || 1);
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
            () => this.reverbClient.searchCases(query, options.limit || 10, options.page || 1),
            { ttl: 3600, namespace: 'cases' }
          );
        } else {
          reverbResults = await this.reverbClient.searchCases(query, options.limit || 10, options.page || 1);
        }
        
        this.logger.info(`Found ${reverbResults.products?.length || 0} case results from Reverb API`);
        
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
    
    // Wait for all searches to complete
    await Promise.allSettled(searchPromises);
    
    return allResults;
  }
  
  /**
   * Get audio gear details by ID from a specific API source
   */
  async getAudioGearDetails(source: string, productId: string): Promise<IAudioGear | null> {
    if (!this.apiSources.has(source)) {
      this.logger.error(`Unknown API source: ${source}`);
      return null;
    }
    
    try {
      let result;
      
      if (source === 'canopy') {
        // Try to get from cache first if caching is enabled
        if (this.options.enableCaching) {
          result = await this.cacheService.cacheApiCall(
            'canopy_audio_gear_details',
            { productId },
            () => this.canopyClient.getProduct(productId),
            { ttl: 86400, namespace: 'audio_gear_details' }
          );
        } else {
          result = await this.canopyClient.getProduct(productId);
        }
        
        // Process the result
        const processedResults = processCanopyResults({ products: [result] });
        
        if (processedResults.audioGear.length > 0) {
          // Process the result (download images and save to database)
          const finalResult = await this.processAudioGearResult(processedResults.audioGear[0], source);
          
          // Save the result to disk
          await this.saveResults([finalResult], `product_${source}_${productId}`);
          
          return finalResult;
        }
      } else if (source === 'reverb') {
        // Try to get from cache first if caching is enabled
        if (this.options.enableCaching) {
          result = await this.cacheService.cacheApiCall(
            'reverb_audio_gear_details',
            { productId },
            () => this.reverbClient.getProduct(productId),
            { ttl: 86400, namespace: 'audio_gear_details' }
          );
        } else {
          result = await this.reverbClient.getProduct(productId);
        }
        
        // Process the result
        const processedResults = processReverbResults({ products: [result] });
        
        if (processedResults.audioGear.length > 0) {
          // Process the result (download images and save to database)
          const finalResult = await this.processAudioGearResult(processedResults.audioGear[0], source);
          
          // Save the result to disk
          await this.saveResults([finalResult], `product_${source}_${productId}`);
          
          return finalResult;
        }
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Error getting audio gear details from ${source}:`, error);
      return null;
    }
  }
  
  /**
   * Get case details by ID from a specific API source
   */
  async getCaseDetails(source: string, productId: string): Promise<ICase | null> {
    if (!this.apiSources.has(source)) {
      this.logger.error(`Unknown API source: ${source}`);
      return null;
    }
    
    try {
      let result;
      
      if (source === 'canopy') {
        // Try to get from cache first if caching is enabled
        if (this.options.enableCaching) {
          result = await this.cacheService.cacheApiCall(
            'canopy_case_details',
            { productId },
            () => this.canopyClient.getProduct(productId),
            { ttl: 86400, namespace: 'case_details' }
          );
        } else {
          result = await this.canopyClient.getProduct(productId);
        }
        
        // Process the result
        const processedResults = processCanopyResults({ products: [result] });
        
        if (processedResults.cases.length > 0) {
          // Process the result (download images and save to database)
          const finalResult = await this.processCaseResult(processedResults.cases[0], source);
          
          // Save the result to disk
          await this.saveResults([finalResult], `case_${source}_${productId}`);
          
          return finalResult;
        }
      } else if (source === 'reverb') {
        // Try to get from cache first if caching is enabled
        if (this.options.enableCaching) {
          result = await this.cacheService.cacheApiCall(
            'reverb_case_details',
            { productId },
            () => this.reverbClient.getProduct(productId),
            { ttl: 86400, namespace: 'case_details' }
          );
        } else {
          result = await this.reverbClient.getProduct(productId);
        }
        
        // Process the result
        const processedResults = processReverbResults({ products: [result] });
        
        if (processedResults.cases.length > 0) {
          // Process the result (download images and save to database)
          const finalResult = await this.processCaseResult(processedResults.cases[0], source);
          
          // Save the result to disk
          await this.saveResults([finalResult], `case_${source}_${productId}`);
          
          return finalResult;
        }
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Error getting case details from ${source}:`, error);
      return null;
    }
  }
  
  /**
   * Process a single audio gear result (download images and save to database)
   */
  private async processAudioGearResult(audioGear: IAudioGear, source: string): Promise<IAudioGear> {
    try {
      // Clone the audio gear to avoid modifying the original
      const processedAudioGear = { ...audioGear };
      
      // Set marketplace
      processedAudioGear.marketplace = source;
      
      // Download images if enabled
      if (this.options.downloadImages && this.imageDownloader && processedAudioGear.imageUrl) {
        this.logger.info(`Downloading image for audio gear ${processedAudioGear.name}`);
        const localImagePaths = await this.imageDownloader.downloadImages(
          [processedAudioGear.imageUrl],
          source,
          processedAudioGear._id?.toString() || processedAudioGear.name
        );
        
        if (localImagePaths.length > 0) {
          this.logger.info(`Successfully downloaded image for audio gear ${processedAudioGear.name}`);
          processedAudioGear.imageUrl = localImagePaths[0];
        } else {
          this.logger.warn(`Failed to download image for audio gear ${processedAudioGear.name}`);
        }
      }
      
      // Save to database if enabled
      if (this.options.saveToDatabase) {
        this.logger.info(`Saving audio gear ${processedAudioGear.name} to database`);
        
        try {
          // Connect to MongoDB if not already connected
          if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(this.options.mongodbUri || '');
          }
          
          // Get the AudioGear model
          const AudioGearModel = mongoose.model('AudioGear');
          
          // Check if audio gear already exists
          const existingAudioGear = await AudioGearModel.findOne({
            name: processedAudioGear.name,
            brand: processedAudioGear.brand,
            marketplace: source
          });
          
          if (existingAudioGear) {
            // Update existing audio gear
            await AudioGearModel.updateOne(
              { _id: existingAudioGear._id },
              { $set: processedAudioGear }
            );
            
            this.logger.info(`Successfully updated audio gear ${processedAudioGear.name} in database`);
          } else {
            // Create new audio gear
            const newAudioGear = new AudioGearModel(processedAudioGear);
            await newAudioGear.save();
            
            this.logger.info(`Successfully saved audio gear ${processedAudioGear.name} to database`);
          }
        } catch (error) {
          this.logger.error(`Error saving audio gear ${processedAudioGear.name} to database:`, error);
        }
      }
      
      return processedAudioGear;
    } catch (error) {
      this.logger.error(`Error processing audio gear ${audioGear.name}:`, error);
      return audioGear; // Return original audio gear if processing fails
    }
  }
  
  /**
   * Process multiple audio gear results (download images and save to database)
   */
  private async processAudioGearResults(audioGearItems: IAudioGear[], source: string): Promise<IAudioGear[]> {
    const processedAudioGearItems: IAudioGear[] = [];
    
    for (const audioGear of audioGearItems) {
      try {
        const processedAudioGear = await this.processAudioGearResult(audioGear, source);
        processedAudioGearItems.push(processedAudioGear);
      } catch (error) {
        this.logger.error(`Error processing audio gear ${audioGear.name}:`, error);
        processedAudioGearItems.push(audioGear); // Add original audio gear if processing fails
      }
    }
    
    return processedAudioGearItems;
  }
  
  /**
   * Process a single case result (download images and save to database)
   */
  private async processCaseResult(caseItem: ICase, source: string): Promise<ICase> {
    try {
      // Clone the case to avoid modifying the original
      const processedCase = { ...caseItem };
      
      // Set marketplace
      processedCase.marketplace = source;
      
      // Ensure internalDimensions is set (for backward compatibility)
      if (!processedCase.internalDimensions && processedCase.dimensions?.interior) {
        processedCase.internalDimensions = { ...processedCase.dimensions.interior };
      }
      
      // Ensure externalDimensions is set (for backward compatibility)
      if (!processedCase.externalDimensions && processedCase.dimensions?.exterior) {
        processedCase.externalDimensions = { ...processedCase.dimensions.exterior };
      }
      
      // Download images if enabled
      if (this.options.downloadImages && this.imageDownloader) {
        const imageUrls = processedCase.imageUrls || (processedCase.imageUrl ? [processedCase.imageUrl] : []);
        
        if (imageUrls.length > 0) {
          this.logger.info(`Downloading ${imageUrls.length} images for case ${processedCase.name}`);
          const localImagePaths = await this.imageDownloader.downloadImages(
            imageUrls,
            source,
            processedCase._id?.toString() || processedCase.name
          );
          
          if (localImagePaths.length > 0) {
            this.logger.info(`Successfully downloaded ${localImagePaths.length} images for case ${processedCase.name}`);
            processedCase.imageUrls = localImagePaths;
            processedCase.imageUrl = localImagePaths[0];
          } else {
            this.logger.warn(`Failed to download any images for case ${processedCase.name}`);
          }
        }
      }
      
      // Save to database if enabled
      if (this.options.saveToDatabase) {
        this.logger.info(`Saving case ${processedCase.name} to database`);
        
        try {
          // Connect to MongoDB if not already connected
          if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(this.options.mongodbUri || '');
          }
          
          // Get the Case model
          const CaseModel = mongoose.model('Case');
          
          // Check if case already exists
          const existingCase = await CaseModel.findOne({
            name: processedCase.name,
            brand: processedCase.brand,
            marketplace: source
          });
          
          if (existingCase) {
            // Update existing case
            await CaseModel.updateOne(
              { _id: existingCase._id },
              { $set: processedCase }
            );
            
            this.logger.info(`Successfully updated case ${processedCase.name} in database`);
          } else {
            // Create new case
            const newCase = new CaseModel(processedCase);
            await newCase.save();
            
            this.logger.info(`Successfully saved case ${processedCase.name} to database`);
          }
        } catch (error) {
          this.logger.error(`Error saving case ${processedCase.name} to database:`, error);
        }
      }
      
      return processedCase;
    } catch (error) {
      this.logger.error(`Error processing case ${caseItem.name}:`, error);
      return caseItem; // Return original case if processing fails
    }
  }
  
  /**
   * Process multiple case results (download images and save to database)
   */
  private async processCaseResults(caseItems: ICase[], source: string): Promise<ICase[]> {
    const processedCaseItems: ICase[] = [];
    
    for (const caseItem of caseItems) {
      try {
        const processedCase = await this.processCaseResult(caseItem, source);
        processedCaseItems.push(processedCase);
      } catch (error) {
        this.logger.error(`Error processing case ${caseItem.name}:`, error);
        processedCaseItems.push(caseItem); // Add original case if processing fails
      }
    }
    
    return processedCaseItems;
  }
  
  /**
   * Save results to disk
   */
  private async saveResults(results: any[], filePrefix: string) {
    try {
      // Ensure data directory exists
      await fs.mkdir(this.options.dataDirectory || '/tmp/data', { recursive: true });
      
      // Create a timestamped filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = path.join(this.options.dataDirectory || '/tmp/data', `${filePrefix}_${timestamp}.json`);
      
      // Write the results to disk
      await fs.writeFile(filename, JSON.stringify(results, null, 2));
      this.logger.info(`Saved ${results.length} results to ${filename}`);
    } catch (error) {
      this.logger.error(`Error saving results:`, error);
    }
  }
  
  /**
   * Utility function to retry operations with exponential backoff
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error = new Error("Operation failed");
    let delay = initialDelay;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, error);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Exponential backoff
        delay *= 2;
      }
    }
    
    this.logger.error(`Operation failed after ${maxRetries} attempts`);
    throw lastError;
  }
  
  /**
   * Schedule a job to run at regular intervals
   */
  scheduleJob(
    jobName: string,
    operation: () => Promise<void>,
    intervalMinutes: number
  ) {
    this.logger.info(`Scheduling job "${jobName}" to run every ${intervalMinutes} minutes`);
    
    // Run immediately
    operation().catch(error => {
      this.logger.error(`Error running scheduled job "${jobName}":`, error);
    });
    
    // Then schedule for regular execution
    const intervalMs = intervalMinutes * 60 * 1000;
    const intervalId = setInterval(() => {
      operation().catch(error => {
        this.logger.error(`Error running scheduled job "${jobName}":`, error);
      });
    }, intervalMs);
    
    return {
      stop: () => {
        clearInterval(intervalId);
        this.logger.info(`Stopped scheduled job "${jobName}"`);
      }
    };
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
  async getBatchJobHistory(limit: number = 10): Promise<any[]> {
    if (!this.batchProcessingSystem) {
      throw new Error('Batch processing system is not enabled');
    }
    
    return await this.batchProcessingSystem.getBatchJobHistory(limit);
  }
  
  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    if (!this.options.enableCaching) {
      throw new Error('Caching is not enabled');
    }
    
    return await this.cacheService.getStats();
  }
}

export default ApiManager;
