// This file ensures compatibility with Vercel's serverless environment
// It provides integration with the database for real data instead of mock data

import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import * as winston from 'winston';
import mongoose from 'mongoose';

// Create a singleton logger instance
let loggerInstance: winston.Logger | null = null;

// Function to get or create the logger instance
export function getLogger(): winston.Logger {
  if (!loggerInstance) {
    // Determine appropriate log directory based on environment
    const logDir = process.env.NODE_ENV === 'production' ? '/tmp/logs' : './logs';
    
    // Ensure log directory exists
    fs.mkdir(logDir, { recursive: true }).catch(err => {
      console.error(`Failed to create log directory: ${err.message}`);
    });
    
    loggerInstance = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'vercel-compatible-scrapers' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({ 
          filename: path.join(logDir, 'error.log'), 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: path.join(logDir, 'combined.log') 
        })
      ]
    });
  }
  
  return loggerInstance;
}

// Function to ensure directories exist (needed for Vercel)
export async function ensureDirectories(): Promise<void> {
  const dirs = [
    process.env.NODE_ENV === 'production' ? '/tmp/data' : './data',
    process.env.NODE_ENV === 'production' ? '/tmp/logs' : './logs',
    process.env.NODE_ENV === 'production' ? '/tmp/images' : './public/images',
  ];
  
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true }).catch(err => {
      console.error(`Failed to create directory ${dir}: ${err.message}`);
    });
  }
}

// Simple product interface for API responses
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  url: string;
  imageUrls: string[];
  marketplace: string;
  isCase: boolean;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  weight?: {
    value?: number;
    unit?: string;
  };
  features?: string[];
  rating?: number;
  reviewCount?: number;
}

// MongoDB connection helper
export async function connectToMongoDB() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://gearCaseApp:rucwoj-watxor-Rocji5@gearcasefindercluster.emncnyk.mongodb.net/?retryWrites=true&w=majority&appName=GearCaseFinderCluster';
  
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Successfully connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Function to get real data from MongoDB instead of mock data
export async function searchProducts(query: string, marketplace?: string): Promise<Product[]> {
  try {
    await connectToMongoDB();
    
    // Create a search filter based on the query and marketplace
    const filter: any = {};
    
    // Add text search if query is provided
    if (query) {
      // Use text search if available, otherwise use regex
      try {
        filter.$text = { $search: query };
      } catch (error) {
        // Fallback to regex search if text index is not available
        filter.$or = [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ];
      }
    }
    
    // Add marketplace filter if provided
    if (marketplace) {
      filter.marketplace = marketplace;
    }
    
    // First search for audio gear
    const audioGearCollection = mongoose.connection.db.collection('AudioGear');
    const audioGearResults = await audioGearCollection.find(filter).limit(12).toArray();
    
    // Then search for cases
    const caseCollection = mongoose.connection.db.collection('Case');
    const caseResults = await caseCollection.find(filter).limit(12).toArray();
    
    // Combine and transform the results
    const products: Product[] = [
      ...audioGearResults.map(item => transformAudioGearToProduct(item)),
      ...caseResults.map(item => transformCaseToProduct(item))
    ];
    
    // If no results found, return empty array
    if (products.length === 0) {
      console.log(`No products found for query: ${query}, marketplace: ${marketplace}`);
      return [];
    }
    
    console.log(`Found ${products.length} products for query: ${query}, marketplace: ${marketplace}`);
    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

// Function to get product details from MongoDB
export async function getProductDetails(marketplace: string, productId: string): Promise<Product | null> {
  try {
    await connectToMongoDB();
    
    // Try to find the product in AudioGear collection
    const audioGearCollection = mongoose.connection.db.collection('AudioGear');
    const audioGear = await audioGearCollection.findOne({ _id: new mongoose.Types.ObjectId(productId) });
    
    if (audioGear) {
      return transformAudioGearToProduct(audioGear);
    }
    
    // If not found in AudioGear, try Case collection
    const caseCollection = mongoose.connection.db.collection('Case');
    const caseItem = await caseCollection.findOne({ _id: new mongoose.Types.ObjectId(productId) });
    
    if (caseItem) {
      return transformCaseToProduct(caseItem);
    }
    
    // If not found in either collection, return null
    console.log(`Product not found: ${productId}, marketplace: ${marketplace}`);
    return null;
  } catch (error) {
    console.error('Error getting product details:', error);
    return null;
  }
}

// Helper function to transform AudioGear document to Product interface
function transformAudioGearToProduct(audioGear: any): Product {
  return {
    id: audioGear._id.toString(),
    title: audioGear.name || 'Unknown Audio Gear',
    description: audioGear.description || '',
    price: audioGear.price || 0,
    currency: audioGear.currency || 'USD',
    url: audioGear.productUrl || '',
    imageUrls: audioGear.imageUrl ? [audioGear.imageUrl] : [],
    marketplace: audioGear.marketplace || 'unknown',
    isCase: false,
    dimensions: {
      length: audioGear.dimensions?.length || 0,
      width: audioGear.dimensions?.width || 0,
      height: audioGear.dimensions?.height || 0,
      unit: audioGear.dimensions?.unit || 'in'
    },
    weight: {
      value: audioGear.weight?.value || 0,
      unit: audioGear.weight?.unit || 'lb'
    },
    features: audioGear.features || [],
    rating: audioGear.rating || 0,
    reviewCount: audioGear.reviewCount || 0
  };
}

// Helper function to transform Case document to Product interface
function transformCaseToProduct(caseItem: any): Product {
  return {
    id: caseItem._id.toString(),
    title: caseItem.name || 'Unknown Case',
    description: caseItem.description || '',
    price: caseItem.price || 0,
    currency: caseItem.currency || 'USD',
    url: caseItem.url || '',
    imageUrls: caseItem.imageUrl ? [caseItem.imageUrl] : (caseItem.imageUrls || []),
    marketplace: caseItem.marketplace || 'unknown',
    isCase: true,
    dimensions: {
      length: caseItem.dimensions?.interior?.length || caseItem.internalDimensions?.length || 0,
      width: caseItem.dimensions?.interior?.width || caseItem.internalDimensions?.width || 0,
      height: caseItem.dimensions?.interior?.height || caseItem.internalDimensions?.height || 0,
      unit: caseItem.dimensions?.interior?.unit || caseItem.internalDimensions?.unit || 'in'
    },
    features: caseItem.features || [],
    rating: caseItem.rating || 0,
    reviewCount: caseItem.reviewCount || 0
  };
}
