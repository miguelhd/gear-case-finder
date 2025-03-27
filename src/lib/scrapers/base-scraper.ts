import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import { IScrapedProduct, IScrapedProductDetails } from '../models/scraper-models';

/**
 * Configuration options for the base scraper.
 */
export interface IScraperOptions {
  /**
   * Maximum number of retry attempts for failed requests.
   */
  maxRetries?: number;
  
  /**
   * Delay in milliseconds between retry attempts.
   */
  delayBetweenRetries?: number;
  
  /**
   * Whether to use a proxy for requests.
   */
  useProxy?: boolean;
  
  /**
   * Timeout in milliseconds for requests.
   */
  timeout?: number;
  
  /**
   * Custom headers to include in requests.
   */
  headers?: Record<string, string>;
}

/**
 * Base scraper class that provides common functionality for all scrapers.
 */
export abstract class BaseScraper {
  protected options: IScraperOptions;
  
  constructor(options: IScraperOptions = {}) {
    this.options = {
      maxRetries: 3,
      delayBetweenRetries: 2000,
      useProxy: false,
      timeout: 10000,
      headers: {
        'User-Agent': this.getRandomUserAgent()
      },
      ...options
    };
  }
  
  /**
   * Search for products based on a query.
   * @param query Search query
   * @param limit Maximum number of results to return
   */
  abstract search(query: string, limit?: number): Promise<IScrapedProduct[]>;
  
  /**
   * Get detailed information about a specific product.
   * @param productId ID of the product to get details for
   */
  abstract getProductDetails(productId: string): Promise<IScrapedProductDetails>;
  
  /**
   * Make an HTTP request with retry logic.
   * @param url URL to request
   * @param config Axios request configuration
   */
  protected async makeRequest<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
    const mergedConfig: AxiosRequestConfig = {
      timeout: this.options.timeout,
      headers: this.options.headers,
      ...config
    };
    
    return this.withRetry(() => axios.get<T>(url, mergedConfig));
  }
  
  /**
   * Execute a function with retry logic.
   * @param fn Function to execute
   * @param retries Number of retries remaining
   */
  protected async withRetry<T>(fn: () => Promise<T>, retries: number = this.options.maxRetries || 3): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await this.delay(this.options.delayBetweenRetries || 2000);
        return this.withRetry(fn, retries - 1);
      }
      throw error;
    }
  }
  
  /**
   * Delay execution for a specified time.
   * @param ms Milliseconds to delay
   */
  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get a random user agent to avoid detection.
   */
  protected getRandomUserAgent(): string {
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
   * Parse HTML content using Cheerio.
   * @param html HTML content to parse
   */
  protected parseHTML(html: string): cheerio.CheerioAPI {
    return cheerio.load(html);
  }
  
  /**
   * Extract text content from a Cheerio element.
   * @param element Cheerio element
   * @param selector CSS selector
   * @param defaultValue Default value if element is not found
   */
  protected getText(element: cheerio.Cheerio<cheerio.Element>, selector: string, defaultValue: string = ''): string {
    const selected = element.find(selector);
    return selected.length > 0 ? selected.text().trim() : defaultValue;
  }
  
  /**
   * Extract attribute value from a Cheerio element.
   * @param element Cheerio element
   * @param selector CSS selector
   * @param attribute Attribute name
   * @param defaultValue Default value if element or attribute is not found
   */
  protected getAttribute(
    element: cheerio.Cheerio<cheerio.Element>, 
    selector: string, 
    attribute: string, 
    defaultValue: string = ''
  ): string {
    const selected = element.find(selector);
    return selected.length > 0 ? selected.attr(attribute) || defaultValue : defaultValue;
  }
  
  /**
   * Parse a price string to a number.
   * @param priceStr Price string (e.g., "$123.45")
   */
  protected parsePrice(priceStr: string): number {
    if (!priceStr) return 0;
    
    // Remove currency symbols and non-numeric characters except decimal point
    const numericStr = priceStr.replace(/[^\d.]/g, '');
    return parseFloat(numericStr) || 0;
  }
  
  /**
   * Extract currency from a price string.
   * @param priceStr Price string (e.g., "$123.45")
   */
  protected extractCurrency(priceStr: string): string {
    if (!priceStr) return 'USD';
    
    const currencySymbols: Record<string, string> = {
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY',
      '₹': 'INR',
      'C$': 'CAD',
      'A$': 'AUD'
    };
    
    for (const [symbol, currency] of Object.entries(currencySymbols)) {
      if (priceStr.includes(symbol)) {
        return currency;
      }
    }
    
    return 'USD';
  }
}
