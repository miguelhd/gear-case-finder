/**
 * Batch Processing System
 * 
 * This module provides a system for batch processing API calls
 * to reduce the number of real-time API requests.
 */

import { CronJob } from 'cron';
import mongoose from 'mongoose';
import connectToMongoDB from '../mongodb';
import ApiCacheService from './api-cache-service';
import CanopyApiClient from './canopy-api-client';
import ReverbApiClient from './reverb-api-client';
import { processSearchResults as processCanopyResults } from './canopy-data-mapper';
import { processSearchResults as processReverbResults } from './reverb-data-mapper';
import allInstruments from './instrument-dimensions-data';

interface BatchProcessingConfig {
  canopyApiKey: string;
  reverbAccessToken: string;
  schedules?: {
    productRefresh?: string;
    dimensionRefresh?: string;
    priceRefresh?: string;
  };
}

export class BatchProcessingSystem {
  private isInitialized: boolean = false;
  private mongoConnected: boolean = false;
  private config: BatchProcessingConfig;
  private cacheService: ApiCacheService;
  private canopyClient: CanopyApiClient;
  private reverbClient: ReverbApiClient;
  private jobs: Record<string, CronJob> = {};
  
  constructor(config: BatchProcessingConfig) {
    this.config = {
      schedules: {
        productRefresh: '0 0 * * *', // Daily at midnight
        dimensionRefresh: '0 0 1 * *', // Monthly on the 1st
        priceRefresh: '0 */12 * * *', // Every 12 hours
      },
      ...config
    };
    
    this.cacheService = new ApiCacheService();
    this.canopyClient = new CanopyApiClient({ apiKey: config.canopyApiKey });
    this.reverbClient = new ReverbApiClient({ accessToken: config.reverbAccessToken });
  }
  
  /**
   * Initialize the batch processing system
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
      
      // Initialize cache service
      await this.cacheService.initialize();
      
      // Set up batch processing collection if it doesn't exist
      const collections = await mongoose.connection.db.listCollections().toArray();
      if (!collections.some(c => c.name === 'batch_processing')) {
        await mongoose.connection.db.createCollection('batch_processing');
      }
      
      // Create indexes for batch processing collection
      const collection = mongoose.connection.db.collection('batch_processing');
      
      // Create indexes if they don't exist
      const indexes = await collection.indexes();
      const indexNames = indexes.map(index => index['name']);
      
      if (!indexNames.includes('jobType_1')) {
        await collection.createIndex({ jobType: 1 });
      }
      
      if (!indexNames.includes('status_1')) {
        await collection.createIndex({ status: 1 });
      }
      
      if (!indexNames.includes('createdAt_1')) {
        await collection.createIndex({ createdAt: 1 });
      }
      
      this.mongoConnected = true;
      this.isInitialized = true;
      console.log('Batch Processing System initialized successfully');
      
      // Start scheduled jobs
      this.startScheduledJobs();
    } catch (error) {
      console.error('Failed to initialize Batch Processing System:', error);
      throw error;
    }
  }
  
  /**
   * Start scheduled batch processing jobs
   */
  private startScheduledJobs(): void {
    // Product refresh job
    this.jobs['productRefresh'] = new CronJob(
      this.config.schedules?.productRefresh || '0 0 * * *',
      () => this.refreshProductData(),
      null,
      true
    );
    
    // Dimension refresh job
    this.jobs['dimensionRefresh'] = new CronJob(
      this.config.schedules?.dimensionRefresh || '0 0 1 * *',
      () => this.refreshDimensionData(),
      null,
      true
    );
    
    // Price refresh job
    this.jobs['priceRefresh'] = new CronJob(
      this.config.schedules?.priceRefresh || '0 */12 * * *',
      () => this.refreshPriceData(),
      null,
      true
    );
    
    console.log('Scheduled batch processing jobs started');
  }
  
  /**
   * Stop all scheduled jobs
   */
  stopScheduledJobs(): void {
    Object.values(this.jobs).forEach(job => job.stop());
    console.log('Scheduled batch processing jobs stopped');
  }
  
  /**
   * Refresh product data for all instruments and cases
   */
  async refreshProductData(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      console.log('Starting product data refresh batch job');
      
      // Record job start
      const jobId = await this.recordJobStart('productRefresh');
      
      // Define search terms for audio gear
      const audioGearKeywords = [
        'synthesizer keyboard',
        'digital piano',
        'midi controller',
        'drum machine',
        'audio interface',
        'mixer console',
        'groovebox',
        'sampler'
      ];
      
      // Define search terms for cases
      const caseKeywords = [
        'keyboard case',
        'synthesizer case',
        'instrument case',
        'gear protection case',
        'equipment case',
        'drum machine case',
        'audio interface case'
      ];
      
      // Process audio gear searches
      for (const keyword of audioGearKeywords) {
        try {
          // Search Canopy API
          const canopyResults = await this.canopyClient.searchAudioGear(keyword, 10);
          const processedCanopyResults = processCanopyResults(canopyResults);
          
          // Store in database
          await this.storeAudioGear(processedCanopyResults.audioGear);
          
          // Cache the results
          await this.cacheService.set(
            'canopy_search',
            { query: keyword, type: 'audio_gear' },
            canopyResults,
            { ttl: 86400, namespace: 'product_data' }
          );
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Search Reverb API
          const reverbResults = await this.reverbClient.searchAudioGear(keyword, 10);
          const processedReverbResults = processReverbResults(reverbResults);
          
          // Store in database
          await this.storeAudioGear(processedReverbResults.audioGear);
          
          // Cache the results
          await this.cacheService.set(
            'reverb_search',
            { query: keyword, type: 'audio_gear' },
            reverbResults,
            { ttl: 86400, namespace: 'product_data' }
          );
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error processing audio gear keyword "${keyword}":`, error);
          // Continue with next keyword
        }
      }
      
      // Process case searches
      for (const keyword of caseKeywords) {
        try {
          // Search Canopy API
          const canopyResults = await this.canopyClient.searchCases(keyword, 10);
          const processedCanopyResults = processCanopyResults(canopyResults);
          
          // Store in database
          await this.storeCases(processedCanopyResults.cases);
          
          // Cache the results
          await this.cacheService.set(
            'canopy_search',
            { query: keyword, type: 'case' },
            canopyResults,
            { ttl: 86400, namespace: 'product_data' }
          );
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Search Reverb API
          const reverbResults = await this.reverbClient.searchCases(keyword, 10);
          const processedReverbResults = processReverbResults(reverbResults);
          
          // Store in database
          await this.storeCases(processedReverbResults.cases);
          
          // Cache the results
          await this.cacheService.set(
            'reverb_search',
            { query: keyword, type: 'case' },
            reverbResults,
            { ttl: 86400, namespace: 'product_data' }
          );
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error processing case keyword "${keyword}":`, error);
          // Continue with next keyword
        }
      }
      
      // Record job completion
      await this.recordJobCompletion(jobId);
      
      console.log('Product data refresh batch job completed');
    } catch (error) {
      console.error('Error in product data refresh batch job:', error);
      throw error;
    }
  }
  
  /**
   * Refresh dimension data for all instruments
   */
  async refreshDimensionData(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      console.log('Starting dimension data refresh batch job');
      
      // Record job start
      const jobId = await this.recordJobStart('dimensionRefresh');
      
      // Get dimension collection
      const collection = mongoose.connection.db.collection('dimensions');
      
      // Store all instrument dimensions from our static data
      for (const instrument of allInstruments) {
        try {
          // Check if instrument already exists
          const existingInstrument = await collection.findOne({
            instrumentType: instrument.instrumentType,
            brand: instrument.brand,
            model: instrument.model
          });
          
          if (existingInstrument) {
            // Update existing instrument
            await collection.updateOne(
              { _id: existingInstrument._id },
              { 
                $set: {
                  dimensions: instrument.dimensions,
                  compatibleCaseDimensions: instrument.compatibleCaseDimensions,
                  accessorySpace: instrument.accessorySpace,
                  lastVerified: new Date()
                }
              }
            );
          } else {
            // Insert new instrument
            await collection.insertOne({
              ...instrument,
              lastVerified: new Date()
            });
          }
        } catch (error) {
          console.error(`Error processing dimension data for ${instrument.brand} ${instrument.model}:`, error);
          // Continue with next instrument
        }
      }
      
      // Record job completion
      await this.recordJobCompletion(jobId);
      
      console.log('Dimension data refresh batch job completed');
    } catch (error) {
      console.error('Error in dimension data refresh batch job:', error);
      throw error;
    }
  }
  
  /**
   * Refresh price data for all products
   */
  async refreshPriceData(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      console.log('Starting price data refresh batch job');
      
      // Record job start
      const jobId = await this.recordJobStart('priceRefresh');
      
      // Get collections
      const audioGearCollection = mongoose.connection.db.collection('AudioGear');
      const caseCollection = mongoose.connection.db.collection('Case');
      
      // Get all audio gear items
      const audioGearItems = await audioGearCollection.find({}).toArray();
      
      // Update prices for audio gear
      for (const item of audioGearItems) {
        try {
          if (item['marketplace'] === 'canopy' && item['productUrl']) {
            // Extract product ID from URL
            const productId = item['productUrl'].split('/').pop();
            
            if (productId) {
              // Get updated product data
              const productData = await this.canopyClient.getProduct(productId);
              
              // Update price
              if (productData.price) {
                await audioGearCollection.updateOne(
                  { _id: item['_id'] },
                  { 
                    $set: {
                      price: parseFloat(productData.price.amount || productData.price.value || productData.price) || item['price'],
                      currency: productData.price.currency || item['currency'],
                      updatedAt: new Date()
                    }
                  }
                );
              }
            }
          } else if (item['marketplace'] === 'reverb' && item['productUrl']) {
            // For Reverb items, we would implement similar logic
            // This is a placeholder for the actual implementation
          }
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error updating price for audio gear ${item['name']}:`, error);
          // Continue with next item
        }
      }
      
      // Get all case items
      const caseItems = await caseCollection.find({}).toArray();
      
      // Update prices for cases
      for (const item of caseItems) {
        try {
          if (item['marketplace'] === 'canopy' && item['url']) {
            // Extract product ID from URL
            const productId = item['url'].split('/').pop();
            
            if (productId) {
              // Get updated product data
              const productData = await this.canopyClient.getProduct(productId);
              
              // Update price
              if (productData.price) {
                await caseCollection.updateOne(
                  { _id: item['_id'] },
                  { 
                    $set: {
                      price: parseFloat(productData.price.amount || productData.price.value || productData.price) || item['price'],
                      currency: productData.price.currency || item['currency'],
                      updatedAt: new Date()
                    }
                  }
                );
              }
            }
          } else if (item['marketplace'] === 'reverb' && item['url']) {
            // For Reverb items, we would implement similar logic
            // This is a placeholder for the actual implementation
          }
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error updating price for case ${item['name']}:`, error);
          // Continue with next item
        }
      }
      
      // Record job completion
      await this.recordJobCompletion(jobId);
      
      console.log('Price data refresh batch job completed');
    } catch (error) {
      console.error('Error in price data refresh batch job:', error);
      throw error;
    }
  }
  
  /**
   * Record the start of a batch job
   */
  private async recordJobStart(jobType: string): Promise<string> {
    try {
      const collection = mongoose.connection.db.collection('batch_processing');
      
      const result = await collection.insertOne({
        jobType,
        status: 'running',
        startTime: new Date(),
        endTime: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return result.insertedId.toString();
    } catch (error) {
      console.error(`Error recording start of ${jobType} job:`, error);
      throw error;
    }
  }
  
  /**
   * Record the completion of a batch job
   */
  private async recordJobCompletion(jobId: string): Promise<void> {
    try {
      const collection = mongoose.connection.db.collection('batch_processing');
      
      await collection.updateOne(
        { _id: new mongoose.Types.ObjectId(jobId) },
        { 
          $set: {
            status: 'completed',
            endTime: new Date(),
            updatedAt: new Date()
          }
        }
      );
    } catch (error) {
      console.error(`Error recording completion of job ${jobId}:`, error);
      throw error;
    }
  }
  
  /**
   * Store audio gear in MongoDB
   */
  private async storeAudioGear(audioGearItems: any[]): Promise<void> {
    try {
      if (!this.mongoConnected) {
        throw new Error('MongoDB not connected');
      }

      // Ensure we have a valid db connection
      if (!mongoose.connection.db) {
        throw new Error('MongoDB db property is not available');
      }
      
      const collection = mongoose.connection.db.collection('AudioGear');

      for (const item of audioGearItems) {
        // Check if item already exists
        const existingItem = await collection.findOne({ 
          name: item['name'],
          brand: item['brand'],
          marketplace: item['marketplace']
        });

        if (existingItem) {
          // Update existing item
          await collection.updateOne(
            { _id: existingItem._id },
            { $set: { ...item, updatedAt: new Date() } }
          );
        } else {
          // Insert new item
          await collection.insertOne(item);
        }
      }
    } catch (error) {
      console.error('Error storing audio gear in MongoDB:', error);
      throw error;
    }
  }

  /**
   * Store cases in MongoDB
   */
  private async storeCases(caseItems: any[]): Promise<void> {
    try {
      if (!this.mongoConnected) {
        throw new Error('MongoDB not connected');
      }

      // Ensure we have a valid db connection
      if (!mongoose.connection.db) {
        throw new Error('MongoDB db property is not available');
      }
      
      const collection = mongoose.connection.db.collection('Case');

      for (const item of caseItems) {
        // Check if item already exists
        const existingItem = await collection.findOne({ 
          name: item['name'],
          brand: item['brand'],
          marketplace: item['marketplace']
        });

        if (existingItem) {
          // Update existing item
          await collection.updateOne(
            { _id: existingItem._id },
            { $set: { ...item, updatedAt: new Date() } }
          );
        } else {
          // Insert new item
          await collection.insertOne(item);
        }
      }
    } catch (error) {
      console.error('Error storing cases in MongoDB:', error);
      throw error;
    }
  }
  
  /**
   * Run a manual batch job
   */
  async runManualBatchJob(jobType: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      switch (jobType) {
        case 'productRefresh':
          await this.refreshProductData();
          break;
        case 'dimensionRefresh':
          await this.refreshDimensionData();
          break;
        case 'priceRefresh':
          await this.refreshPriceData();
          break;
        default:
          throw new Error(`Unknown job type: ${jobType}`);
      }
    } catch (error) {
      console.error(`Error running manual batch job ${jobType}:`, error);
      throw error;
    }
  }
  
  /**
   * Get batch job history
   */
  async getBatchJobHistory(limit: number = 10): Promise<any[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const collection = mongoose.connection.db.collection('batch_processing');
      
      return await collection.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('Error getting batch job history:', error);
      throw error;
    }
  }
}

export default BatchProcessingSystem;
