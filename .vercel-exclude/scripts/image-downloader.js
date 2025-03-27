const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const winston = require('winston');

class ImageDownloader {
  constructor(options = {}) {
    // Determine appropriate image directory based on environment
    const defaultImageDir = process.env.NODE_ENV === 'production' 
      ? '/tmp/images' 
      : './public/images';
    
    // Determine appropriate log directory based on environment
    const defaultLogDir = process.env.NODE_ENV === 'production' 
      ? '/tmp/logs' 
      : './logs';
    
    this.options = {
      imageDirectory: options.imageDirectory || defaultImageDir,
      maxRetries: options.maxRetries || 3,
      delayBetweenRetries: options.delayBetweenRetries || 2000,
      logDirectory: options.logDirectory || defaultLogDir,
    };
    
    this.setupLogger();
    this.ensureDirectories();
  }
  
  setupLogger() {
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
  
  async ensureDirectories() {
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
   * @param {string} imageUrl URL of the image to download
   * @param {string} marketplace Name of the marketplace (e.g., 'amazon', 'ebay')
   * @param {string} productId ID of the product the image belongs to
   * @param {number} index Optional index for multiple images of the same product
   * @returns {Promise<string|null>} Path to the saved image file, or null if download failed
   */
  async downloadImage(imageUrl, marketplace, productId, index = 0) {
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
   * @param {string[]} imageUrls Array of image URLs to download
   * @param {string} marketplace Name of the marketplace
   * @param {string} productId ID of the product
   * @returns {Promise<string[]>} Array of paths to the saved image files
   */
  async downloadImages(imageUrls, marketplace, productId) {
    if (!imageUrls || imageUrls.length === 0) {
      this.logger.warn(`No image URLs provided for ${marketplace} product ${productId}`);
      return [];
    }
    
    const downloadPromises = imageUrls.map((url, index) => 
      this.downloadImage(url, marketplace, productId, index)
    );
    
    const results = await Promise.all(downloadPromises);
    
    // Filter out null results (failed downloads)
    return results.filter(path => path !== null);
  }
  
  /**
   * Get the file extension from an image URL
   * @param {string} url URL of the image
   * @returns {string} File extension including the dot (e.g., '.jpg')
   */
  getFileExtension(url) {
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
   * @param {string} url URL to fetch
   * @param {number} retries Number of retries remaining
   * @returns {Promise<any>} Axios response
   */
  async fetchWithRetry(url, retries = this.options.maxRetries) {
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
   * @param {number} ms Milliseconds to delay
   * @returns {Promise<void>} Promise that resolves after the delay
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get a random user agent to avoid detection
   * @returns {string} Random user agent string
   */
  getRandomUserAgent() {
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
   * @param {string} url URL to hash
   * @returns {string} Short hash string
   */
  generateHashFromUrl(url) {
    return crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
  }
}

module.exports = ImageDownloader;
