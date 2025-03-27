import { BaseScraper, ScraperOptions, ScrapedProduct } from './base-scraper';
import { DataNormalizer, NormalizedProduct } from './data-normalizer';
import { ImageDownloader } from './image-downloader';
import { MongoDBIntegration } from './mongodb-integration';
import * as winston from 'winston';
import { promises as fs } from 'fs';
import path from 'path';

export interface EnhancedScraperManagerOptions {
  logDirectory?: string;
  dataDirectory?: string;
  imageDirectory?: string;
  maxRetries?: number;
  delayBetweenRetries?: number;
  scraperOptions?: ScraperOptions;
  saveToDatabase?: boolean;
  downloadImages?: boolean;
  mongodbUri?: string;
}

export class EnhancedScraperManager {
  private logger!: winston.Logger;
  private normalizer: DataNormalizer;
  private imageDownloader: ImageDownloader;
  private mongoDBIntegration: MongoDBIntegration;
  private options: EnhancedScraperManagerOptions;
  private scrapers: Map<string, BaseScraper> = new Map();
  
  constructor(options: EnhancedScraperManagerOptions = {}) {
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
      ...options
    };
    
    this.normalizer = new DataNormalizer();
    this.imageDownloader = new ImageDownloader({
      imageDirectory: this.options.imageDirectory,
      logDirectory: this.options.logDirectory
    });
    this.mongoDBIntegration = new MongoDBIntegration({
      logDirectory: this.options.logDirectory,
      connectionUri: this.options.mongodbUri
    });
    
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
      defaultMeta: { service: 'enhanced-scraper-manager' },
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
   * Register a scraper for a specific marketplace
   */
  registerScraper(marketplace: string, scraper: BaseScraper) {
    this.scrapers.set(marketplace, scraper);
    this.logger.info(`Registered scraper for marketplace: ${marketplace}`);
  }
  
  /**
   * Get a scraper for a specific marketplace
   */
  getScraper(marketplace: string): BaseScraper | undefined {
    return this.scrapers.get(marketplace);
  }
  
  /**
   * Search for products across all registered marketplaces
   */
  async searchAllMarketplaces(query: string, options: { page?: number } = {}): Promise<NormalizedProduct[]> {
    const allResults: NormalizedProduct[] = [];
    const searchPromises: Promise<void>[] = [];
    
    // Convert Map entries to array before iteration to avoid TypeScript downlevelIteration issues
    const scraperEntries = Array.from(this.scrapers.entries());
    for (const [marketplace, scraper] of scraperEntries) {
      const searchPromise = this.withRetry(async () => {
        try {
          this.logger.info(`Searching ${marketplace} for: ${query}`);
          const results = await scraper.searchProducts(query, options);
          this.logger.info(`Found ${results.length} results from ${marketplace}`);
          
          // Normalize the results
          const normalizedResults = this.normalizer.normalizeProducts(results);
          
          // Process each result (download images and save to database)
          const processedResults = await this.processResults(normalizedResults);
          
          allResults.push(...processedResults);
          
          // Save the results to disk
          await this.saveResults(processedResults, `search_${marketplace}_${query.replace(/\s+/g, '_')}`);
        } catch (error) {
          this.logger.error(`Error searching ${marketplace}:`, error);
          throw error; // Rethrow for retry mechanism
        }
      }, this.options.maxRetries, this.options.delayBetweenRetries);
      
      searchPromises.push(searchPromise);
    }
    
    // Wait for all searches to complete
    await Promise.allSettled(searchPromises);
    
    return allResults;
  }
  
  /**
   * Get product details from a specific marketplace
   */
  async getProductDetails(marketplace: string, productId: string): Promise<NormalizedProduct | null> {
    const scraper = this.getScraper(marketplace);
    if (!scraper) {
      this.logger.error(`No scraper registered for marketplace: ${marketplace}`);
      return null;
    }
    
    try {
      const result = await this.withRetry(async () => {
        this.logger.info(`Fetching product details from ${marketplace} for ID: ${productId}`);
        return await scraper.getProductDetails(productId);
      }, this.options.maxRetries, this.options.delayBetweenRetries);
      
      // Normalize the result
      const normalizedResult = this.normalizer.normalizeProduct(result);
      
      // Process the result (download images and save to database)
      const processedResult = await this.processResult(normalizedResult);
      
      // Save the result to disk
      await this.saveResults([processedResult], `product_${marketplace}_${productId}`);
      
      return processedResult;
    } catch (error) {
      this.logger.error(`Error fetching product details from ${marketplace}:`, error);
      return null;
    }
  }
  
  /**
   * Get products by category from a specific marketplace
   */
  async getProductsByCategory(marketplace: string, category: string, options: { page?: number } = {}): Promise<NormalizedProduct[]> {
    const scraper = this.getScraper(marketplace);
    if (!scraper) {
      this.logger.error(`No scraper registered for marketplace: ${marketplace}`);
      return [];
    }
    
    try {
      const results = await this.withRetry(async () => {
        this.logger.info(`Fetching products from ${marketplace} for category: ${category}`);
        return await scraper.getProductsByCategory(category, options);
      }, this.options.maxRetries, this.options.delayBetweenRetries);
      
      // Normalize the results
      const normalizedResults = this.normalizer.normalizeProducts(results);
      
      // Process each result (download images and save to database)
      const processedResults = await this.processResults(normalizedResults);
      
      // Save the results to disk
      await this.saveResults(processedResults, `category_${marketplace}_${category}`);
      
      return processedResults;
    } catch (error) {
      this.logger.error(`Error fetching products by category from ${marketplace}:`, error);
      return [];
    }
  }
  
  /**
   * Process a single result (download images and save to database)
   */
  private async processResult(product: NormalizedProduct): Promise<NormalizedProduct> {
    try {
      // Clone the product to avoid modifying the original
      const processedProduct = { ...product };
      
      // Download images if enabled
      if (this.options.downloadImages && product.imageUrls && product.imageUrls.length > 0) {
        this.logger.info(`Downloading ${product.imageUrls.length} images for product ${product.id}`);
        const localImagePaths = await this.imageDownloader.downloadImages(
          product.imageUrls,
          product.marketplace,
          product.sourceId
        );
        
        if (localImagePaths.length > 0) {
          this.logger.info(`Successfully downloaded ${localImagePaths.length} images for product ${product.id}`);
          processedProduct.imageUrls = localImagePaths;
        } else {
          this.logger.warn(`Failed to download any images for product ${product.id}`);
        }
      }
      
      // Save to database if enabled
      if (this.options.saveToDatabase) {
        this.logger.info(`Saving product ${product.id} to database`);
        const dbId = await this.mongoDBIntegration.saveProduct(processedProduct);
        if (dbId) {
          this.logger.info(`Successfully saved product ${product.id} to database with ID ${dbId}`);
        } else {
          this.logger.warn(`Failed to save product ${product.id} to database`);
        }
      }
      
      return processedProduct;
    } catch (error) {
      this.logger.error(`Error processing product ${product.id}:`, error);
      return product; // Return original product if processing fails
    }
  }
  
  /**
   * Process multiple results (download images and save to database)
   */
  private async processResults(products: NormalizedProduct[]): Promise<NormalizedProduct[]> {
    const processedProducts: NormalizedProduct[] = [];
    
    for (const product of products) {
      try {
        const processedProduct = await this.processResult(product);
        processedProducts.push(processedProduct);
      } catch (error) {
        this.logger.error(`Error processing product ${product.id}:`, error);
        processedProducts.push(product); // Add original product if processing fails
      }
    }
    
    return processedProducts;
  }
  
  /**
   * Save results to disk
   */
  private async saveResults(results: NormalizedProduct[], filePrefix: string) {
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
   * Schedule a scraping job to run at regular intervals
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
}

export default EnhancedScraperManager;
