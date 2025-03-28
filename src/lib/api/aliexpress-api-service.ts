/**
 * AliExpress API Service
 * 
 * This module provides a service for interacting with the AliExpress API
 * to fetch product data for audio gear and protective cases.
 */

import { AliExpressApiClient } from './aliexpress-api-client';
import { AliExpressDataMapper } from './aliexpress-data-mapper';
import { ApiCacheService } from './api-cache-service';

interface AliExpressApiServiceConfig {
  rapidApiKey: string;
  rapidApiHost?: string;
  cacheEnabled?: boolean;
  cacheTtl?: number;
}

export class AliExpressApiService {
  private client: AliExpressApiClient;
  private mapper: AliExpressDataMapper;
  private cacheService: ApiCacheService;
  private cacheEnabled: boolean;
  private cacheTtl: number;
  
  constructor(config: AliExpressApiServiceConfig) {
    this.client = new AliExpressApiClient({
      rapidApiKey: config.rapidApiKey,
      rapidApiHost: config.rapidApiHost
    });
    
    this.mapper = new AliExpressDataMapper();
    this.cacheService = new ApiCacheService();
    this.cacheEnabled = config.cacheEnabled !== undefined ? config.cacheEnabled : true;
    this.cacheTtl = config.cacheTtl || 3600; // Default cache TTL: 1 hour
  }

  /**
   * Get product information by product ID
   */
  async getProductInfo(productId: string, currency: string = 'USD', language: string = 'EN'): Promise<any> {
    try {
      // Check cache first if enabled
      if (this.cacheEnabled) {
        const apiName = 'aliexpress:product';
        const params = { productId, currency, language };
        const cachedData = await this.cacheService.get(apiName, params);
        
        if (cachedData) {
          return cachedData as any;
        }
      }
      
      // Fetch from API if not in cache
      const productData = await this.client.getProductInfo(productId, currency, language);
      const mappedProduct = this.mapper.mapProduct(productData.data);
      
      // Store in cache if enabled
      if (this.cacheEnabled && mappedProduct) {
        const apiName = 'aliexpress:product';
        const params = { productId, currency, language };
        await this.cacheService.set(apiName, params, mappedProduct, { ttl: this.cacheTtl });
      }
      
      return mappedProduct;
    } catch (error) {
      console.error('Error in AliExpress API service getProductInfo:', error);
      throw error;
    }
  }

  /**
   * Search for products using keywords
   */
  async searchProducts(keywords: string, options: any = {}): Promise<any[]> {
    try {
      // Check cache first if enabled
      if (this.cacheEnabled) {
        const apiName = 'aliexpress:search';
        const params = { keywords, ...options };
        const cachedData = await this.cacheService.get(apiName, params);
        
        if (cachedData) {
          return cachedData as any[];
        }
      }
      
      // Prepare search parameters
      const searchParams = {
        keywords: keywords,
        minSalePrice: options.minPrice,
        maxSalePrice: options.maxPrice,
        language: options.language || 'EN',
        pageNo: options.page || '0',
        pageSize: options.limit || '50',
        currency: options.currency || 'USD',
        shipToCountry: options.country || 'US',
        sort: options.sort || 'SALE_PRICE_ASC'
      };
      
      // Fetch from API if not in cache
      const searchResults = await this.client.searchProducts(searchParams);
      
      // Map the products to our standard format
      let mappedProducts: any[] = [];
      
      if (searchResults && searchResults.data && Array.isArray(searchResults.data.products)) {
        mappedProducts = this.mapper.mapProducts(searchResults.data.products);
      }
      
      // Store in cache if enabled
      if (this.cacheEnabled) {
        const apiName = 'aliexpress:search';
        const params = { keywords, ...options };
        await this.cacheService.set(apiName, params, mappedProducts, { ttl: this.cacheTtl });
      }
      
      return mappedProducts;
    } catch (error) {
      console.error('Error in AliExpress API service searchProducts:', error);
      return [];
    }
  }

  /**
   * Get product shipping information
   */
  async getProductShippingInfo(productId: string, country: string = 'US'): Promise<any> {
    try {
      // Check cache first if enabled
      if (this.cacheEnabled) {
        const apiName = 'aliexpress:shipping';
        const params = { productId, country };
        const cachedData = await this.cacheService.get(apiName, params);
        
        if (cachedData) {
          return cachedData as any;
        }
      }
      
      // Fetch from API if not in cache
      const shippingData = await this.client.getProductShippingInfo(productId, country);
      const mappedShippingInfo = this.mapper.mapShippingInfo(shippingData.data);
      
      // Store in cache if enabled
      if (this.cacheEnabled && mappedShippingInfo) {
        const apiName = 'aliexpress:shipping';
        const params = { productId, country };
        await this.cacheService.set(apiName, params, mappedShippingInfo, { ttl: this.cacheTtl });
      }
      
      return mappedShippingInfo;
    } catch (error) {
      console.error('Error in AliExpress API service getProductShippingInfo:', error);
      return null;
    }
  }

  /**
   * Search for audio gear on AliExpress
   */
  async searchAudioGear(keywords: string, options: any = {}): Promise<any[]> {
    return this.searchProducts(keywords, options);
  }

  /**
   * Search for protective cases on AliExpress
   */
  async searchCases(keywords: string, options: any = {}): Promise<any[]> {
    return this.searchProducts(keywords + ' case', options);
  }

  /**
   * Find cases that match the dimensions of a specific audio gear
   */
  async findMatchingCases(audioGear: any, options: any = {}): Promise<any[]> {
    try {
      if (!audioGear || !audioGear.dimensions) {
        return [];
      }
      
      const { length, width, height, unit } = audioGear.dimensions;
      
      // Only proceed if we have at least some dimension information
      if (!length && !width && !height) {
        return [];
      }
      
      // Construct search keywords based on dimensions
      let searchKeywords = 'protective case';
      
      if (audioGear.brand) {
        searchKeywords += ` ${audioGear.brand}`;
      }
      
      if (length && width && height) {
        // Add some tolerance to dimensions (10%)
        const lengthWithTolerance = Math.ceil(length * 1.1);
        const widthWithTolerance = Math.ceil(width * 1.1);
        const heightWithTolerance = Math.ceil(height * 1.1);
        
        searchKeywords += ` ${lengthWithTolerance}${unit || 'cm'} ${widthWithTolerance}${unit || 'cm'} ${heightWithTolerance}${unit || 'cm'}`;
      }
      
      // Search for cases with the constructed keywords
      const cases = await this.searchCases(searchKeywords, options);
      
      // Filter cases that might match the dimensions
      return cases.filter(caseItem => {
        if (!caseItem.dimensions) return false;
        
        const caseDimensions = caseItem.dimensions;
        
        // Check if case dimensions are larger than audio gear dimensions (with some tolerance)
        const isLengthSuitable = !length || !caseDimensions.length || caseDimensions.length >= length * 0.9;
        const isWidthSuitable = !width || !caseDimensions.width || caseDimensions.width >= width * 0.9;
        const isHeightSuitable = !height || !caseDimensions.height || caseDimensions.height >= height * 0.9;
        
        return isLengthSuitable && isWidthSuitable && isHeightSuitable;
      });
    } catch (error) {
      console.error('Error in AliExpress API service findMatchingCases:', error);
      return [];
    }
  }
}

export default AliExpressApiService;
