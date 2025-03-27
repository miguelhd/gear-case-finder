/**
 * Dimension Cache Service
 * 
 * This module provides a service for caching and retrieving instrument dimensions
 * to reduce API calls for dimensional data which is static.
 */

import mongoose from 'mongoose';
import connectToMongoDB from '../mongodb';

/**
 * Represents the physical dimensions of an object.
 */
export interface IDimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

/**
 * Represents the dimensional requirements for a compatible case.
 */
export interface ICompatibleCaseDimensions {
  minLength: number;
  maxLength: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  unit: string;
}

/**
 * Represents the dimensions of a musical instrument or audio gear
 * along with compatible case requirements.
 */
export interface IInstrumentDimensions {
  instrumentType: string;
  brand: string;
  model: string;
  dimensions: IDimensions;
  compatibleCaseDimensions: ICompatibleCaseDimensions;
  lastVerified: Date;
}

export class DimensionCacheService {
  private isInitialized: boolean = false;
  private mongoConnected: boolean = false;

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
      
      // Create indexes for efficient dimension queries
      const collection = mongoose.connection.db.collection('dimensions');
      
      // Create indexes if they don't exist
      const indexes = await collection.indexes();
      const indexNames = indexes.map(index => index.name);
      
      if (!indexNames.includes('instrumentType_1_brand_1_model_1')) {
        await collection.createIndex(
          { instrumentType: 1, brand: 1, model: 1 },
          { unique: true }
        );
      }
      
      if (!indexNames.includes('dimensions.length_1_dimensions.width_1_dimensions.height_1')) {
        await collection.createIndex(
          { 'dimensions.length': 1, 'dimensions.width': 1, 'dimensions.height': 1 }
        );
      }
      
      this.mongoConnected = true;
      this.isInitialized = true;
      console.log('Dimension Cache Service initialized successfully');
      
      // Pre-populate with common instrument dimensions if collection is empty
      const count = await collection.countDocuments();
      if (count === 0) {
        await this.prePopulateCommonInstruments();
      }
    } catch (error) {
      console.error('Failed to initialize Dimension Cache Service:', error);
      throw error;
    }
  }

  /**
   * Pre-populate the dimension cache with common instruments
   */
  private async prePopulateCommonInstruments(): Promise<void> {
    try {
      const commonInstruments: IInstrumentDimensions[] = [
        {
          instrumentType: 'synthesizer',
          brand: 'Korg',
          model: 'Minilogue',
          dimensions: { length: 19.69, width: 11.85, height: 2.83, unit: 'in' },
          compatibleCaseDimensions: {
            minLength: 20.5, maxLength: 22,
            minWidth: 12.5, maxWidth: 14,
            minHeight: 3.5, maxHeight: 6,
            unit: 'in'
          },
          lastVerified: new Date()
        },
        {
          instrumentType: 'synthesizer',
          brand: 'Moog',
          model: 'Subsequent 37',
          dimensions: { length: 22.5, width: 14.8, height: 5.1, unit: 'in' },
          compatibleCaseDimensions: {
            minLength: 23, maxLength: 25,
            minWidth: 15.5, maxWidth: 17,
            minHeight: 6, maxHeight: 8,
            unit: 'in'
          },
          lastVerified: new Date()
        },
        {
          instrumentType: 'keyboard',
          brand: 'Roland',
          model: 'Juno-DS61',
          dimensions: { length: 39.2, width: 11.7, height: 3.7, unit: 'in' },
          compatibleCaseDimensions: {
            minLength: 40, maxLength: 42,
            minWidth: 12.5, maxWidth: 14,
            minHeight: 4.5, maxHeight: 6.5,
            unit: 'in'
          },
          lastVerified: new Date()
        },
        {
          instrumentType: 'drum machine',
          brand: 'Elektron',
          model: 'Digitakt',
          dimensions: { length: 8.5, width: 7.1, height: 2.2, unit: 'in' },
          compatibleCaseDimensions: {
            minLength: 9, maxLength: 10.5,
            minWidth: 7.5, maxWidth: 9,
            minHeight: 3, maxHeight: 4.5,
            unit: 'in'
          },
          lastVerified: new Date()
        },
        {
          instrumentType: 'audio interface',
          brand: 'Focusrite',
          model: 'Scarlett 2i2 3rd Gen',
          dimensions: { length: 7.17, width: 3.77, height: 1.89, unit: 'in' },
          compatibleCaseDimensions: {
            minLength: 7.5, maxLength: 9,
            minWidth: 4, maxWidth: 5.5,
            minHeight: 2.5, maxHeight: 3.5,
            unit: 'in'
          },
          lastVerified: new Date()
        },
        {
          instrumentType: 'mixer',
          brand: 'Behringer',
          model: 'Xenyx X1222USB',
          dimensions: { length: 14.6, width: 13.4, height: 3.8, unit: 'in' },
          compatibleCaseDimensions: {
            minLength: 15, maxLength: 17,
            minWidth: 14, maxWidth: 16,
            minHeight: 4.5, maxHeight: 6.5,
            unit: 'in'
          },
          lastVerified: new Date()
        }
        // More instruments can be added here
      ];
      
      const collection = mongoose.connection.db.collection('dimensions');
      await collection.insertMany(commonInstruments);
      console.log(`Pre-populated dimension cache with ${commonInstruments.length} common instruments`);
    } catch (error) {
      console.error('Error pre-populating dimension cache:', error);
    }
  }

  /**
   * Get instrument dimensions by brand and model
   */
  async getInstrumentDimensions(brand: string, model: string): Promise<IInstrumentDimensions | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const collection = mongoose.connection.db.collection('dimensions');
      
      const instrument = await collection.findOne({
        brand: { $regex: new RegExp(brand, 'i') },
        model: { $regex: new RegExp(model, 'i') }
      });
      
      return instrument as IInstrumentDimensions | null;
    } catch (error) {
      console.error(`Error getting dimensions for ${brand} ${model}:`, error);
      return null;
    }
  }

  /**
   * Store instrument dimensions
   */
  async storeInstrumentDimensions(instrumentData: IInstrumentDimensions): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const collection = mongoose.connection.db.collection('dimensions');
      
      // Check if instrument already exists
      const existingInstrument = await collection.findOne({
        instrumentType: instrumentData.instrumentType,
        brand: instrumentData.brand,
        model: instrumentData.model
      });
      
      if (existingInstrument) {
        // Update existing instrument
        await collection.updateOne(
          { _id: existingInstrument._id },
          { $set: {
              dimensions: instrumentData.dimensions,
              compatibleCaseDimensions: instrumentData.compatibleCaseDimensions,
              lastVerified: new Date()
            }
          }
        );
        console.log(`Updated dimensions for ${instrumentData.brand} ${instrumentData.model}`);
      } else {
        // Insert new instrument
        await collection.insertOne({
          ...instrumentData,
          lastVerified: new Date()
        });
        console.log(`Stored new dimensions for ${instrumentData.brand} ${instrumentData.model}`);
      }
    } catch (error) {
      console.error(`Error storing dimensions for ${instrumentData.brand} ${instrumentData.model}:`, error);
      throw error;
    }
  }

  /**
   * Find compatible cases based on instrument dimensions
   */
  async findCompatibleCaseDimensions(dimensions: IDimensions, tolerance: number = 0.5): Promise<ICompatibleCaseDimensions> {
    // Calculate compatible case dimensions based on instrument dimensions and tolerance
    const compatibleDimensions: ICompatibleCaseDimensions = {
      minLength: dimensions.length + 0.5,
      maxLength: dimensions.length + 2 + tolerance,
      minWidth: dimensions.width + 0.5,
      maxWidth: dimensions.width + 2 + tolerance,
      minHeight: dimensions.height + 0.5,
      maxHeight: dimensions.height + 3 + tolerance,
      unit: dimensions.unit
    };
    
    return compatibleDimensions;
  }

  /**
   * Convert dimensions between units (e.g., inches to cm)
   */
  convertDimensions(dimensions: IDimensions, targetUnit: string): IDimensions {
    if (dimensions.unit === targetUnit) {
      return dimensions;
    }
    
    let conversionFactor = 1;
    
    if (dimensions.unit === 'in' && targetUnit === 'cm') {
      conversionFactor = 2.54;
    } else if (dimensions.unit === 'cm' && targetUnit === 'in') {
      conversionFactor = 0.3937;
    } else if (dimensions.unit === 'in' && targetUnit === 'mm') {
      conversionFactor = 25.4;
    } else if (dimensions.unit === 'mm' && targetUnit === 'in') {
      conversionFactor = 0.03937;
    } else if (dimensions.unit === 'cm' && targetUnit === 'mm') {
      conversionFactor = 10;
    } else if (dimensions.unit === 'mm' && targetUnit === 'cm') {
      conversionFactor = 0.1;
    }
    
    return {
      length: dimensions.length * conversionFactor,
      width: dimensions.width * conversionFactor,
      height: dimensions.height * conversionFactor,
      unit: targetUnit
    };
  }
}

export default DimensionCacheService;
