// This file ensures compatibility with Vercel's serverless environment
// It provides a wrapper for the enhanced scraper functionality

import { EnhancedScraperManager } from '../lib/scrapers/enhanced-scraper-manager';
import { AmazonScraper } from '../lib/scrapers/amazon-scraper';
import { EbayScraper } from '../lib/scrapers/ebay-scraper';
import { EtsyScraper } from '../lib/scrapers/etsy-scraper';
import { AliexpressScraper } from '../lib/scrapers/aliexpress-scraper';
import { TemuScraper } from '../lib/scrapers/temu-scraper';
import { ImageDownloader } from '../lib/scrapers/image-downloader';
import { MongoDBIntegration } from '../lib/scrapers/mongodb-integration';
import { promises as fs } from 'fs';
import path from 'path';

// Create a singleton instance of the enhanced scraper manager
let scraperManagerInstance: EnhancedScraperManager | null = null;

// Function to get or create the scraper manager instance
export function getScraperManager(): EnhancedScraperManager {
  if (!scraperManagerInstance) {
    // Initialize the scraper manager with Vercel-compatible settings
    scraperManagerInstance = new EnhancedScraperManager({
      // Use /tmp directory for Vercel serverless functions
      dataDirectory: process.env.NODE_ENV === 'production' ? '/tmp/data' : './data',
      logDirectory: process.env.NODE_ENV === 'production' ? '/tmp/logs' : './logs',
      imageDirectory: process.env.NODE_ENV === 'production' ? '/tmp/images' : './public/images',
      saveToDatabase: true,
      downloadImages: true,
      mongodbUri: process.env.MONGODB_URI
    });

    // Register scrapers
    scraperManagerInstance.registerScraper('amazon', new AmazonScraper());
    scraperManagerInstance.registerScraper('ebay', new EbayScraper());
    scraperManagerInstance.registerScraper('etsy', new EtsyScraper());
    scraperManagerInstance.registerScraper('aliexpress', new AliexpressScraper());
    scraperManagerInstance.registerScraper('temu', new TemuScraper());
  }

  return scraperManagerInstance;
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

// Function to get image downloader instance
export function getImageDownloader(): ImageDownloader {
  return new ImageDownloader({
    imageDirectory: process.env.NODE_ENV === 'production' ? '/tmp/images' : './public/images',
    logDirectory: process.env.NODE_ENV === 'production' ? '/tmp/logs' : './logs'
  });
}

// Function to get MongoDB integration instance
export function getMongoDBIntegration(): MongoDBIntegration {
  return new MongoDBIntegration({
    logDirectory: process.env.NODE_ENV === 'production' ? '/tmp/logs' : './logs',
    connectionUri: process.env.MONGODB_URI
  });
}

// Export all components for use in API routes
export {
  EnhancedScraperManager,
  AmazonScraper,
  EbayScraper,
  EtsyScraper,
  AliexpressScraper,
  TemuScraper,
  ImageDownloader,
  MongoDBIntegration
};
