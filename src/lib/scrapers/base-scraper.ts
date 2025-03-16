// Base scraper class that all marketplace scrapers will extend
import axios from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { randomUserAgent } from './utils';

export interface ScraperOptions {
  useProxy?: boolean;
  proxyType?: 'http' | 'socks';
  proxyHost?: string;
  proxyPort?: number;
  proxyUsername?: string;
  proxyPassword?: string;
  timeout?: number;
  retries?: number;
  delayBetweenRequests?: number;
}

export interface ScrapedProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  url: string;
  imageUrls: string[];
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
  marketplace: string;
  rating?: number;
  reviewCount?: number;
  availability?: string;
  seller?: {
    name?: string;
    url?: string;
    rating?: number;
  };
  category?: string;
  features?: string[];
  scrapedAt: Date;
}

export abstract class BaseScraper {
  protected options: ScraperOptions;
  protected axiosInstance: any;
  
  constructor(options: ScraperOptions = {}) {
    this.options = {
      useProxy: false,
      proxyType: 'http',
      timeout: 30000,
      retries: 3,
      delayBetweenRequests: 2000,
      ...options
    };
    
    this.initializeAxios();
  }
  
  private initializeAxios() {
    const config: any = {
      timeout: this.options.timeout,
      headers: {
        'User-Agent': randomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    };
    
    if (this.options.useProxy && this.options.proxyHost && this.options.proxyPort) {
      const proxyOptions = {
        host: this.options.proxyHost,
        port: this.options.proxyPort,
      };
      
      if (this.options.proxyUsername && this.options.proxyPassword) {
        Object.assign(proxyOptions, {
          auth: `${this.options.proxyUsername}:${this.options.proxyPassword}`
        });
      }
      
      if (this.options.proxyType === 'socks') {
        config.httpsAgent = new SocksProxyAgent(proxyOptions);
      } else {
        config.httpsAgent = new HttpsProxyAgent(proxyOptions);
      }
    }
    
    this.axiosInstance = axios.create(config);
  }
  
  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  protected async fetchWithRetry(url: string, retries = this.options.retries): Promise<any> {
    try {
      const response = await this.axiosInstance.get(url);
      await this.delay(this.options.delayBetweenRequests || 0);
      return response;
    } catch (error) {
      if (retries > 0) {
        console.log(`Request failed, retrying... (${retries} retries left)`);
        await this.delay(this.options.delayBetweenRequests || 0);
        return this.fetchWithRetry(url, retries - 1);
      }
      throw error;
    }
  }
  
  // Abstract methods that must be implemented by each marketplace scraper
  abstract searchProducts(query: string, options?: any): Promise<ScrapedProduct[]>;
  abstract getProductDetails(productId: string): Promise<ScrapedProduct>;
  abstract getProductsByCategory(category: string, options?: any): Promise<ScrapedProduct[]>;
}
