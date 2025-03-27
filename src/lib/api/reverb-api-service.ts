/**
 * Reverb API Integration Service
 * 
 * This module provides a service for integrating with the Reverb API
 * and storing the results in MongoDB.
 */

import { ReverbApiClient } from './reverb-api-client';
import { processSearchResults } from './reverb-data-mapper';
import connectToMongoDB from '../mongodb';
import { IAudioGear, ICase } from '../models/gear-models';
import mongoose from 'mongoose';

interface ReverbApiServiceConfig {
  accessToken: string;
  baseUrl?: string;
}

export class ReverbApiService {
  private client: ReverbApiClient;
  private isInitialized: boolean = false;
  private mongoConnected: boolean = false;

  constructor(config: ReverbApiServiceConfig) {
    this.client = new ReverbApiClient({
      accessToken: config.accessToken,
      baseUrl: config.baseUrl
    });
  }

  /**
   * Initialize the service and connect to MongoDB
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
      
      this.mongoConnected = true;
      this.isInitialized = true;
      console.log('Reverb API Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Reverb API Service:', error);
      throw error;
    }
  }

  /**
   * Search for audio gear and store results in MongoDB
   */
  async searchAndStoreAudioGear(keywords: string, itemCount: number = 10): Promise<IAudioGear[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`Searching for audio gear with keywords: ${keywords}`);
      const searchResults = await this.client.searchAudioGear(keywords, itemCount);
      
      const { audioGear, cases } = processSearchResults(searchResults);
      
      if (audioGear.length > 0) {
        await this.storeAudioGear(audioGear);
      }
      
      if (cases.length > 0) {
        await this.storeCases(cases);
      }
      
      return audioGear as unknown as IAudioGear[];
    } catch (error) {
      console.error(`Error searching and storing audio gear with keywords ${keywords}:`, error);
      throw error;
    }
  }

  /**
   * Search for cases and store results in MongoDB
   */
  async searchAndStoreCases(keywords: string, itemCount: number = 10): Promise<ICase[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`Searching for cases with keywords: ${keywords}`);
      const searchResults = await this.client.searchCases(keywords, itemCount);
      
      const { audioGear, cases } = processSearchResults(searchResults);
      
      if (audioGear.length > 0) {
        await this.storeAudioGear(audioGear);
      }
      
      if (cases.length > 0) {
        await this.storeCases(cases);
      }
      
      return cases as unknown as ICase[];
    } catch (error) {
      console.error(`Error searching and storing cases with keywords ${keywords}:`, error);
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
          name: item.name,
          brand: item.brand,
          marketplace: 'reverb'
        });

        if (existingItem) {
          // Update existing item
          await collection.updateOne(
            { _id: existingItem._id },
            { $set: { ...item, updatedAt: new Date() } }
          );
          console.log(`Updated audio gear: ${item.name}`);
        } else {
          // Insert new item
          await collection.insertOne(item);
          console.log(`Inserted new audio gear: ${item.name}`);
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
          name: item.name,
          brand: item.brand,
          marketplace: 'reverb'
        });

        if (existingItem) {
          // Update existing item
          await collection.updateOne(
            { _id: existingItem._id },
            { $set: { ...item, updatedAt: new Date() } }
          );
          console.log(`Updated case: ${item.name}`);
        } else {
          // Insert new item
          await collection.insertOne(item);
          console.log(`Inserted new case: ${item.name}`);
        }
      }
    } catch (error) {
      console.error('Error storing cases in MongoDB:', error);
      throw error;
    }
  }

  /**
   * Run a full product search for both audio gear and cases
   */
  async runFullProductSearch(): Promise<{ audioGear: IAudioGear[], cases: ICase[] }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const audioGearKeywords = [
        'synthesizer keyboard',
        'digital piano',
        'midi controller',
        'drum machine',
        'audio interface',
        'mixer console'
      ];

      const caseKeywords = [
        'keyboard case',
        'synthesizer case',
        'piano case',
        'instrument case',
        'gear protection case',
        'equipment case'
      ];

      const audioGearResults: IAudioGear[] = [];
      const caseResults: ICase[] = [];

      // Search for audio gear
      for (const keyword of audioGearKeywords) {
        const results = await this.searchAndStoreAudioGear(keyword, 5);
        audioGearResults.push(...results);
        
        // Add a delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Search for cases
      for (const keyword of caseKeywords) {
        const results = await this.searchAndStoreCases(keyword, 5);
        caseResults.push(...results);
        
        // Add a delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return {
        audioGear: audioGearResults,
        cases: caseResults
      };
    } catch (error) {
      console.error('Error running full product search:', error);
      throw error;
    }
  }
}

export default ReverbApiService;
