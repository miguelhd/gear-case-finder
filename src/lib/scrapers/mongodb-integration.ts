import mongoose from 'mongoose';
import { NormalizedProduct } from './data-normalizer';
import { AudioGear, Case, IGearCaseMatch } from '../models/gear-models';
import * as winston from 'winston';
import { promises as fs } from 'fs';
import path from 'path';

export interface MongoDBIntegrationOptions {
  logDirectory?: string;
  connectionUri?: string;
  databaseName?: string;
  maxRetries?: number;
  delayBetweenRetries?: number;
}

export class MongoDBIntegration {
  private logger!: winston.Logger;
  private options: MongoDBIntegrationOptions;
  private isConnected: boolean = false;
  
  constructor(options: MongoDBIntegrationOptions = {}) {
    // Determine appropriate log directory based on environment
    const defaultLogDir = process.env.NODE_ENV === 'production' 
      ? '/tmp/logs' 
      : './logs';
    
    this.options = {
      logDirectory: defaultLogDir,
      connectionUri: process.env.MONGODB_URI || 'mongodb+srv://gearCaseApp:rucwoj-watxor-Rocji5@cluster0.mongodb.net/musician-case-finder',
      databaseName: 'musician-case-finder',
      maxRetries: 3,
      delayBetweenRetries: 2000,
      ...options
    };
    
    this.setupLogger();
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
      defaultMeta: { service: 'mongodb-integration' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({ 
          filename: path.join(this.options.logDirectory || '/tmp/logs', 'mongodb-error.log'), 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: path.join(this.options.logDirectory || '/tmp/logs', 'mongodb.log') 
        })
      ]
    });
  }
  
  /**
   * Connect to MongoDB
   */
  async connect(): Promise<boolean> {
    if (this.isConnected) {
      this.logger.info('Already connected to MongoDB');
      return true;
    }
    
    try {
      this.logger.info(`Connecting to MongoDB at ${this.options.connectionUri?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
      
      await mongoose.connect(this.options.connectionUri || '', {
        dbName: this.options.databaseName
      });
      
      this.isConnected = true;
      this.logger.info('Successfully connected to MongoDB');
      
      // Log database information
      const dbName = mongoose.connection.db.databaseName;
      this.logger.info(`Connected to database: ${dbName}`);
      
      // Log available collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      this.logger.info(`Available collections: ${collections.map(c => c.name).join(', ')}`);
      
      return true;
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB:', error);
      this.isConnected = false;
      return false;
    }
  }
  
  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      this.logger.info('Not connected to MongoDB');
      return;
    }
    
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      this.logger.info('Disconnected from MongoDB');
    } catch (error) {
      this.logger.error('Error disconnecting from MongoDB:', error);
    }
  }
  
  /**
   * Save a product to the appropriate collection based on its type
   */
  async saveProduct(product: NormalizedProduct): Promise<string | null> {
    try {
      if (!this.isConnected) {
        const connected = await this.connect();
        if (!connected) {
          throw new Error('Failed to connect to MongoDB');
        }
      }
      
      // Determine if the product is a case or audio gear
      if (product.isCase) {
        return await this.saveCase(product);
      } else {
        return await this.saveAudioGear(product);
      }
    } catch (error) {
      this.logger.error(`Error saving product ${product.id}:`, error);
      return null;
    }
  }
  
  /**
   * Save a case to the Case collection
   */
  private async saveCase(product: NormalizedProduct): Promise<string | null> {
    try {
      // Check if the case already exists
      const existingCase = await Case.findOne({ 
        $or: [
          { 'url': product.url },
          { 
            'name': product.title,
            'brand': product.title.split(' ')[0] // Simple brand extraction
          }
        ]
      });
      
      if (existingCase) {
        // Update existing case
        this.logger.info(`Updating existing case: ${existingCase._id}`);
        
        // Update fields
        existingCase.name = product.title;
        existingCase.brand = product.title.split(' ')[0]; // Simple brand extraction
        existingCase.type = product.productType || 'case';
        existingCase.description = product.description;
        existingCase.price = product.price;
        existingCase.currency = product.currency;
        existingCase.rating = product.rating;
        existingCase.reviewCount = product.reviewCount;
        existingCase.url = product.url;
        
        // Update dimensions
        if (product.dimensions) {
          // Set internal dimensions
          existingCase.internalDimensions = {
            length: product.dimensions.length || 0,
            width: product.dimensions.width || 0,
            height: product.dimensions.height || 0,
            unit: product.dimensions.unit || 'in'
          };
          
          // Set dimensions.interior to match internalDimensions
          existingCase.dimensions.interior = {
            length: product.dimensions.length || 0,
            width: product.dimensions.width || 0,
            height: product.dimensions.height || 0,
            unit: product.dimensions.unit || 'in'
          };
        }
        
        // Update features
        if (product.features) {
          existingCase.features = product.features;
        }
        
        // Update image URLs
        if (product.imageUrls && product.imageUrls.length > 0) {
          existingCase.imageUrls = product.imageUrls;
          existingCase.imageUrl = product.imageUrls[0]; // Set primary image
        }
        
        // Update marketplace info
        existingCase.marketplace = product.marketplace;
        existingCase.availability = product.availability;
        
        // Update seller info
        if (product.seller) {
          existingCase.seller = {
            name: product.seller.name,
            url: product.seller.url,
            rating: product.seller.rating
          };
        }
        
        // Save the updated case
        await existingCase.save();
        return existingCase._id.toString();
      } else {
        // Create new case
        this.logger.info(`Creating new case from ${product.marketplace}: ${product.title}`);
        
        const newCase = new Case({
          name: product.title,
          brand: product.title.split(' ')[0], // Simple brand extraction
          type: product.productType || 'case',
          description: product.description,
          price: product.price,
          currency: product.currency,
          rating: product.rating,
          reviewCount: product.reviewCount,
          url: product.url,
          
          // Set dimensions
          internalDimensions: {
            length: product.dimensions?.length || 0,
            width: product.dimensions?.width || 0,
            height: product.dimensions?.height || 0,
            unit: product.dimensions?.unit || 'in'
          },
          
          dimensions: {
            interior: {
              length: product.dimensions?.length || 0,
              width: product.dimensions?.width || 0,
              height: product.dimensions?.height || 0,
              unit: product.dimensions?.unit || 'in'
            }
          },
          
          features: product.features || [],
          imageUrls: product.imageUrls || [],
          imageUrl: product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : undefined,
          marketplace: product.marketplace,
          availability: product.availability,
          seller: product.seller ? {
            name: product.seller.name,
            url: product.seller.url,
            rating: product.seller.rating
          } : undefined,
          
          // Set protection features based on keywords in description and features
          waterproof: this.detectFeature(product, ['waterproof', 'water resistant', 'water-resistant']),
          shockproof: this.detectFeature(product, ['shockproof', 'shock resistant', 'shock-resistant', 'impact']),
          hasPadding: this.detectFeature(product, ['padding', 'padded', 'foam', 'cushion']),
          hasCompartments: this.detectFeature(product, ['compartment', 'pocket', 'divider', 'section']),
          hasHandle: this.detectFeature(product, ['handle', 'grip', 'carrying']),
          hasWheels: this.detectFeature(product, ['wheel', 'rolling', 'trolley']),
          hasLock: this.detectFeature(product, ['lock', 'locking', 'secure', 'security']),
          
          // Determine protection level
          protectionLevel: this.determineProtectionLevel(product)
        });
        
        // Save the new case
        const savedCase = await newCase.save();
        return savedCase._id.toString();
      }
    } catch (error) {
      this.logger.error(`Error saving case ${product.id}:`, error);
      return null;
    }
  }
  
  /**
   * Save audio gear to the AudioGear collection
   */
  private async saveAudioGear(product: NormalizedProduct): Promise<string | null> {
    try {
      // Check if the audio gear already exists
      const existingGear = await AudioGear.findOne({ 
        $or: [
          { 'url': product.url },
          { 
            'name': product.title,
            'brand': product.title.split(' ')[0] // Simple brand extraction
          }
        ]
      });
      
      if (existingGear) {
        // Update existing audio gear
        this.logger.info(`Updating existing audio gear: ${existingGear._id}`);
        
        // Update fields
        existingGear.name = product.title;
        existingGear.brand = product.title.split(' ')[0]; // Simple brand extraction
        existingGear.category = this.determineCategory(product);
        existingGear.type = product.productType || 'other';
        existingGear.description = product.description;
        
        // Update dimensions
        if (product.dimensions) {
          existingGear.dimensions = {
            length: product.dimensions.length || 0,
            width: product.dimensions.width || 0,
            height: product.dimensions.height || 0,
            unit: product.dimensions.unit || 'in'
          };
        }
        
        // Update weight
        if (product.weight) {
          existingGear.weight = {
            value: product.weight.value || 0,
            unit: product.weight.unit || 'lb'
          };
        }
        
        // Update image URL
        if (product.imageUrls && product.imageUrls.length > 0) {
          existingGear.imageUrl = product.imageUrls[0];
        }
        
        // Update product URL
        existingGear.productUrl = product.url;
        
        // Save the updated audio gear
        await existingGear.save();
        return existingGear._id.toString();
      } else {
        // Create new audio gear
        this.logger.info(`Creating new audio gear from ${product.marketplace}: ${product.title}`);
        
        const newGear = new AudioGear({
          name: product.title,
          brand: product.title.split(' ')[0], // Simple brand extraction
          category: this.determineCategory(product),
          type: product.productType || 'other',
          description: product.description,
          
          // Set dimensions
          dimensions: {
            length: product.dimensions?.length || 0,
            width: product.dimensions?.width || 0,
            height: product.dimensions?.height || 0,
            unit: product.dimensions?.unit || 'in'
          },
          
          // Set weight
          weight: {
            value: product.weight?.value || 0,
            unit: product.weight?.unit || 'lb'
          },
          
          imageUrl: product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : undefined,
          productUrl: product.url,
          
          // Set popularity based on rating and review count
          popularity: this.calculatePopularity(product)
        });
        
        // Save the new audio gear
        const savedGear = await newGear.save();
        return savedGear._id.toString();
      }
    } catch (error) {
      this.logger.error(`Error saving audio gear ${product.id}:`, error);
      return null;
    }
  }
  
  /**
   * Save multiple products to the database
   */
  async saveProducts(products: NormalizedProduct[]): Promise<string[]> {
    const savedIds: string[] = [];
    
    for (const product of products) {
      try {
        const id = await this.saveProduct(product);
        if (id) {
          savedIds.push(id);
        }
      } catch (error) {
        this.logger.error(`Error saving product ${product.id}:`, error);
      }
    }
    
    this.logger.info(`Saved ${savedIds.length} out of ${products.length} products to MongoDB`);
    return savedIds;
  }
  
  /**
   * Detect if a product has a specific feature based on keywords
   */
  private detectFeature(product: NormalizedProduct, keywords: string[]): boolean {
    const description = product.description?.toLowerCase() || '';
    const features = product.features ? product.features.join(' ').toLowerCase() : '';
    const title = product.title.toLowerCase();
    
    const combinedText = `${title} ${description} ${features}`;
    
    return keywords.some(keyword => combinedText.includes(keyword));
  }
  
  /**
   * Determine the protection level of a case
   */
  private determineProtectionLevel(product: NormalizedProduct): 'low' | 'medium' | 'high' {
    // Count protection features
    let protectionScore = 0;
    
    if (this.detectFeature(product, ['waterproof', 'water resistant', 'water-resistant'])) {
      protectionScore += 2;
    }
    
    if (this.detectFeature(product, ['shockproof', 'shock resistant', 'shock-resistant', 'impact'])) {
      protectionScore += 2;
    }
    
    if (this.detectFeature(product, ['padding', 'padded', 'foam', 'cushion'])) {
      protectionScore += 1;
    }
    
    if (this.detectFeature(product, ['hard case', 'hardshell', 'hard shell', 'rigid'])) {
      protectionScore += 2;
    }
    
    if (this.detectFeature(product, ['dustproof', 'dust resistant', 'dust-resistant'])) {
      protectionScore += 1;
    }
    
    // Determine protection level based on score
    if (protectionScore >= 5) {
      return 'high';
    } else if (protectionScore >= 3) {
      return 'medium';
    } else {
      return 'low';
    }
  }
  
  /**
   * Determine the category of audio gear
   */
  private determineCategory(product: NormalizedProduct): string {
    const title = product.title.toLowerCase();
    const description = product.description?.toLowerCase() || '';
    const combinedText = `${title} ${description}`;
    
    // Define category keywords
    const categories: Record<string, string[]> = {
      'synthesizer': ['synthesizer', 'synth', 'keyboard', 'workstation', 'digital piano', 'analog synth'],
      'mixer': ['mixer', 'mixing console', 'audio mixer', 'dj mixer', 'mixing desk'],
      'sampler': ['sampler', 'drum machine', 'beat maker', 'groove box', 'sequencer'],
      'effects': ['pedal', 'effects pedal', 'guitar pedal', 'stompbox', 'multi-effects'],
      'audio interface': ['audio interface', 'sound card', 'recording interface'],
      'microphone': ['microphone', 'mic', 'condenser', 'dynamic mic'],
      'headphones': ['headphones', 'earphones', 'earbuds', 'monitors', 'studio headphones'],
      'speakers': ['speaker', 'monitor', 'studio monitor', 'pa system'],
      'accessories': ['cable', 'wire', 'connector', 'adapter', 'midi cable', 'audio cable', 'stand']
    };
    
    // Check each category
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => combinedText.includes(keyword))) {
        return category;
      }
    }
    
    // Default to 'other' if no specific category is detected
    return 'other';
  }
  
  /**
   * Calculate popularity score based on rating and review count
   */
  private calculatePopularity(product: NormalizedProduct): number {
    const rating = product.rating || 0;
    const reviewCount = product.reviewCount || 0;
    
    // Simple popularity formula: rating * log(reviewCount + 1)
    // This gives more weight to items with higher ratings and many reviews
    return rating * Math.log(reviewCount + 1);
  }
}

export default MongoDBIntegration;
