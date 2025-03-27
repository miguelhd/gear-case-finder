import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as winston from 'winston';

export interface ImageDownloaderOptions {
  imageDirectory?: string;
  maxRetries?: number;
  delayBetweenRetries?: number;
  logDirectory?: string;
}

export class ImageDownloader {
  private logger!: winston.Logger;
  private options: ImageDownloaderOptions;
  
  constructor(options: ImageDownloaderOptions = {}) {
    // Determine appropriate image directory based on environment
    const defaultImageDir = process.env.NODE_ENV === 'production' 
      ? '/tmp/images' 
      : './public/images';
    
    // Determine appropriate log directory based on environment
    const defaultLogDir = process.env.NODE_ENV === 'production' 
      ? '/tmp/logs' 
      : './logs';
    
    this.options = {
      imageDirectory: defaultImageDir,
      maxRetries: 3,
      delayBetweenRetries: 2000,
      logDirectory: defaultLogDir,
      ...options
    };
    
    this.setupLogger();
    this.ensureDirectories();
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
      defaultMeta: { service: 'image-downloader' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({ 
          filename: path.join(this.options.logDirectory || '/tmp/logs', 'image-downloader-error.log'), 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: path.join(this.options.logDirectory || '/tmp/logs', 'image-downloader.log') 
        })
      ]
    });
  }
  
  private async ensureDirectories() {
    try {
      // Ensure image directory exists
      await fs.mkdir(this.options.imageDirectory || './public/images', { recursive: true });
      this.logger.info(`Ensured image directory exists: ${this.options.imageDirectory}`);
    } catch (error) {
      this.logger.error(`Failed to create image directory: ${error}`);
    }
  }
  
  /**
   * Download an image from a URL and save it to the local filesystem
   * @param imageUrl URL of the image to download
   * @param marketplace Name of the marketplace (e.g., 'amazon', 'ebay')
   * @param productId ID of the product the image belongs to
   * @param index Optional index for multiple images of the same product
   * @returns Path to the saved image file, or null if download failed
   */
  async downloadImage(
    imageUrl: string, 
    marketplace: string, 
    productId: string, 
    index: number = 0
  ): Promise<string | null> {
    if (!imageUrl) {
      this.logger.warn(`No image URL provided for ${marketplace} product ${productId}`);
      return null;
    }
    
    try {
      // Generate a unique filename based on marketplace, product ID, and index
      const fileExtension = this.getFileExtension(imageUrl);
      const filename = `${marketplace}_${productId}_${index}${fileExtension}`;
      const filePath = path.join(this.options.imageDirectory || './public/images', filename);
      
      this.logger.info(`Downloading image from ${imageUrl} to ${filePath}`);
      
      // Download the image with retries
      const response = await this.fetchWithRetry(imageUrl);
      
      // Save the image to disk
      await fs.writeFile(filePath, response.data);
      
      this.logger.info(`Successfully downloaded image to ${filePath}`);
      
      // Return the relative path for database storage
      const relativePath = path.join('/images', filename);
      return relativePath;
    } catch (error) {
      this.logger.error(`Error downloading image from ${imageUrl}:`, error);
      return null;
    }
  }
  
  /**
   * Download multiple images for a product
   * @param imageUrls Array of image URLs to download
   * @param marketplace Name of the marketplace
   * @param productId ID of the product
   * @returns Array of paths to the saved image files
   */
  async downloadImages(
    imageUrls: string[], 
    marketplace: string, 
    productId: string
  ): Promise<string[]> {
    if (!imageUrls || imageUrls.length === 0) {
      this.logger.warn(`No image URLs provided for ${marketplace} product ${productId}`);
      return [];
    }
    
    const downloadPromises = imageUrls.map((url, index) => 
      this.downloadImage(url, marketplace, productId, index)
    );
    
    const results = await Promise.all(downloadPromises);
    
    // Filter out null results (failed downloads)
    return results.filter((path): path is string => path !== null);
  }
  
  /**
   * Get the file extension from an image URL
   * @param url URL of the image
   * @returns File extension including the dot (e.g., '.jpg')
   */
  private getFileExtension(url: string): string {
    // Try to extract extension from URL
    const urlPath = new URL(url).pathname;
    const extension = path.extname(urlPath).toLowerCase();
    
    // If we got a valid extension, return it
    if (extension && ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'].includes(extension)) {
      return extension;
    }
    
    // If URL doesn't have a valid extension, try to guess from URL patterns
    if (url.includes('.jpg') || url.includes('.jpeg')) return '.jpg';
    if (url.includes('.png')) return '.png';
    if (url.includes('.gif')) return '.gif';
    if (url.includes('.webp')) return '.webp';
    if (url.includes('.svg')) return '.svg';
    
    // Default to .jpg if we can't determine the extension
    return '.jpg';
  }
  
  /**
   * Fetch with retry logic
   * @param url URL to fetch
   * @param retries Number of retries remaining
   * @returns Axios response
   */
  private async fetchWithRetry(url: string, retries = this.options.maxRetries): Promise<any> {
    try {
      const response = await axios.get(url, { 
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': this.getRandomUserAgent()
        }
      });
      return response;
    } catch (error) {
      if (retries && retries > 0) {
        this.logger.warn(`Request failed, retrying... (${retries} retries left)`);
        await this.delay(this.options.delayBetweenRetries || 2000);
        return this.fetchWithRetry(url, retries - 1);
      }
      throw error;
    }
  }
  
  /**
   * Delay execution for a specified time
   * @param ms Milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get a random user agent to avoid detection
   * @returns Random user agent string
   */
  private getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
    ];
    
    const randomIndex = Math.floor(Math.random() * userAgents.length);
    return userAgents[randomIndex];
  }
  
  /**
   * Generate a hash from a URL to use as part of a filename
   * @param url URL to hash
   * @returns Short hash string
   */
  private generateHashFromUrl(url: string): string {
    return crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
  }
}

export default ImageDownloader;
