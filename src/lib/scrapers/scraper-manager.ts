import { BaseScraper, ScraperOptions, ScrapedProduct } from './base-scraper';
import { DataNormalizer, NormalizedProduct } from './data-normalizer';
import * as winston from 'winston';
import { promises as fs } from 'fs';
import path from 'path';

export interface ScraperManagerOptions {
  logDirectory?: string;
  dataDirectory?: string;
  maxRetries?: number;
  delayBetweenRetries?: number;
  scraperOptions?: ScraperOptions;
}

export class ScraperManager {
  private logger!: winston.Logger;
  private normalizer: DataNormalizer;
  private options: ScraperManagerOptions;
  private scrapers: Map<string, BaseScraper> = new Map();
  
  constructor(options: ScraperManagerOptions = {}) {
    this.options = {
      logDirectory: './logs',
      dataDirectory: './data',
      maxRetries: 3,
      delayBetweenRetries: 5000,
      ...options
    };
    
    this.normalizer = new DataNormalizer();
    this.setupLogger();
  }
  
  private setupLogger() {
    // Ensure log directory exists
    fs.mkdir(this.options.logDirectory || './logs', { recursive: true }).catch(err => {
      console.error(`Failed to create log directory: ${err.message}`);
    });
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'scraper-manager' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({ 
          filename: path.join(this.options.logDirectory || './logs', 'error.log'), 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: path.join(this.options.logDirectory || './logs', 'combined.log') 
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
          allResults.push(...normalizedResults);
          
          // Save the results to disk
          await this.saveResults(normalizedResults, `search_${marketplace}_${query.replace(/\s+/g, '_')}`);
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
      
      // Save the result to disk
      await this.saveResults([normalizedResult], `product_${marketplace}_${productId}`);
      
      return normalizedResult;
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
      
      // Save the results to disk
      await this.saveResults(normalizedResults, `category_${marketplace}_${category}`);
      
      return normalizedResults;
    } catch (error) {
      this.logger.error(`Error fetching products by category from ${marketplace}:`, error);
      return [];
    }
  }
  
  /**
   * Save results to disk
   */
  private async saveResults(results: NormalizedProduct[], filePrefix: string) {
    try {
      // Ensure data directory exists
      await fs.mkdir(this.options.dataDirectory || './data', { recursive: true });
      
      // Create a timestamped filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = path.join(this.options.dataDirectory || './data', `${filePrefix}_${timestamp}.json`);
      
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
