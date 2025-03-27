// This file ensures compatibility with Vercel's serverless environment
// It provides a wrapper for the enhanced scraper functionality

import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import * as winston from 'winston';

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
  const mongoose = require('mongoose');
  const uri = process.env.MONGODB_URI || 'mongodb+srv://gearCaseApp:rucwoj-watxor-Rocji5@cluster0.mongodb.net/musician-case-finder';
  
  try {
    await mongoose.connect(uri);
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Function to save product to MongoDB
export async function saveProductToMongoDB(product: Product): Promise<string | null> {
  try {
    const mongoose = require('mongoose');
    await connectToMongoDB();
    
    // Determine if the product is a case or audio gear
    if (product.isCase) {
      // Save to Case collection
      const result = await mongoose.connection.db.collection('Case').updateOne(
        { url: product.url },
        { 
          $set: {
            name: product.title,
            brand: product.title.split(' ')[0], // Simple brand extraction
            type: 'case',
            description: product.description,
            price: product.price,
            currency: product.currency,
            url: product.url,
            imageUrls: product.imageUrls,
            dimensions: {
              interior: {
                length: product.dimensions?.length || 0,
                width: product.dimensions?.width || 0,
                height: product.dimensions?.height || 0,
                unit: product.dimensions?.unit || 'in'
              }
            },
            features: product.features || [],
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
      
      return result.upsertedId ? result.upsertedId.toString() : 'updated';
    } else {
      // Save to AudioGear collection
      const result = await mongoose.connection.db.collection('AudioGear').updateOne(
        { productUrl: product.url },
        { 
          $set: {
            name: product.title,
            brand: product.title.split(' ')[0], // Simple brand extraction
            category: 'other',
            type: 'other',
            description: product.description,
            dimensions: {
              length: product.dimensions?.length || 0,
              width: product.dimensions?.width || 0,
              height: product.dimensions?.height || 0,
              unit: product.dimensions?.unit || 'in'
            },
            weight: {
              value: product.weight?.value || 0,
              unit: product.weight?.unit || 'lb'
            },
            imageUrl: product.imageUrls[0] || '',
            productUrl: product.url,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
      
      return result.upsertedId ? result.upsertedId.toString() : 'updated';
    }
  } catch (error) {
    console.error('Error saving product to MongoDB:', error);
    return null;
  }
}

// Function to search for products using external API
export async function searchProducts(query: string, marketplace?: string): Promise<Product[]> {
  try {
    // In a real implementation, this would call the actual scraper
    // For now, we'll return mock data
    const mockProducts: Product[] = [
      {
        id: 'mock-synth-1',
        title: 'Korg Minilogue XD Synthesizer',
        description: 'The Korg Minilogue XD is a powerful analog/digital hybrid synthesizer with 4 voices.',
        price: 649.99,
        currency: 'USD',
        url: 'https://example.com/korg-minilogue',
        imageUrls: ['/images/korg-minilogue.jpg'],
        marketplace: marketplace || 'amazon',
        isCase: false,
        dimensions: {
          length: 12.8,
          width: 7.44,
          height: 2.76,
          unit: 'in'
        },
        rating: 4.7,
        reviewCount: 245
      },
      {
        id: 'mock-case-1',
        title: 'Gator Cases Hardshell Case for Synthesizers',
        description: 'Gator Cases Hardshell Case for 61-key Synthesizers and Keyboards.',
        price: 249.99,
        currency: 'USD',
        url: 'https://example.com/gator-case',
        imageUrls: ['/images/gator-case.jpg'],
        marketplace: marketplace || 'amazon',
        isCase: true,
        dimensions: {
          length: 45.5,
          width: 15.5,
          height: 6.5,
          unit: 'in'
        },
        features: [
          'Hardshell case with TSA-approved locking latches',
          'Wheels and tow handle for easy transport'
        ],
        rating: 4.8,
        reviewCount: 187
      }
    ];
    
    // Save mock products to MongoDB
    for (const product of mockProducts) {
      await saveProductToMongoDB(product);
    }
    
    return mockProducts;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

// Function to get product details
export async function getProductDetails(marketplace: string, productId: string): Promise<Product | null> {
  try {
    // In a real implementation, this would call the actual scraper
    // For now, we'll return mock data
    const mockProduct: Product = {
      id: productId,
      title: 'Korg Minilogue XD Synthesizer',
      description: 'The Korg Minilogue XD is a powerful analog/digital hybrid synthesizer with 4 voices, digital multi-engine, and effects.',
      price: 649.99,
      currency: 'USD',
      url: `https://example.com/${marketplace}/${productId}`,
      imageUrls: ['/images/korg-minilogue.jpg', '/images/korg-minilogue-2.jpg'],
      marketplace: marketplace,
      isCase: false,
      dimensions: {
        length: 12.8,
        width: 7.44,
        height: 2.76,
        unit: 'in'
      },
      weight: {
        value: 5.73,
        unit: 'lb'
      },
      features: [
        '4-voice analog synthesizer with digital multi-engine',
        '37 slim keys with velocity sensitivity',
        '16-step polyphonic sequencer'
      ],
      rating: 4.7,
      reviewCount: 245
    };
    
    // Save mock product to MongoDB
    await saveProductToMongoDB(mockProduct);
    
    return mockProduct;
  } catch (error) {
    console.error('Error getting product details:', error);
    return null;
  }
}
