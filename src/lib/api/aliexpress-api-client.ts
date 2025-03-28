/**
 * AliExpress API Client
 * 
 * This module provides a client for interacting with the AliExpress True API via RapidAPI
 * to fetch product data for audio gear and protective cases.
 */

import axios from 'axios';

interface AliExpressApiConfig {
  rapidApiKey: string;
  rapidApiHost?: string;
}

interface SearchProductsParams {
  keywords: string;
  minSalePrice?: string;
  maxSalePrice?: string;
  language?: string;
  pageNo?: string;
  pageSize?: string;
  currency?: string;
  shipToCountry?: string;
  sort?: string;
}

export class AliExpressApiClient {
  private config: AliExpressApiConfig;
  private baseUrl: string = 'https://aliexpress-true-api.p.rapidapi.com/api';
  
  constructor(config: AliExpressApiConfig) {
    this.config = {
      rapidApiHost: 'aliexpress-true-api.p.rapidapi.com',
      ...config
    };
  }

  /**
   * Generate the required headers for the RapidAPI AliExpress True API
   */
  private generateHeaders(): Record<string, string> {
    return {
      'X-RapidAPI-Key': this.config.rapidApiKey,
      'X-RapidAPI-Host': this.config.rapidApiHost || 'aliexpress-true-api.p.rapidapi.com',
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get product information by product ID
   */
  async getProductInfo(productId: string, currency: string = 'USD', language: string = 'EN'): Promise<any> {
    try {
      const headers = this.generateHeaders();
      
      const response = await axios({
        method: 'get',
        url: `${this.baseUrl}/v3/product-info`,
        headers: headers,
        params: {
          product_id: productId,
          currency: currency,
          language: language
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting AliExpress product info:', error);
      throw error;
    }
  }

  /**
   * Search for products using keywords
   */
  async searchProducts(params: SearchProductsParams): Promise<any> {
    try {
      const headers = this.generateHeaders();
      
      // Set default values for optional parameters
      const searchParams = {
        keywords: params.keywords,
        min_sale_price: params.minSalePrice || '1',
        max_sale_price: params.maxSalePrice || '1000',
        language: params.language || 'EN',
        page_no: params.pageNo || '0',
        page_size: params.pageSize || '50',
        currency: params.currency || 'USD',
        ship_to_country: params.shipToCountry || 'US',
        sort: params.sort || 'SALE_PRICE_ASC'
      };
      
      const response = await axios({
        method: 'get',
        url: `${this.baseUrl}/v2/hot-products`,
        headers: headers,
        params: searchParams
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching AliExpress products:', error);
      throw error;
    }
  }

  /**
   * Get product shipping information
   */
  async getProductShippingInfo(productId: string, country: string = 'US', language: string = 'EN'): Promise<any> {
    try {
      const headers = this.generateHeaders();
      
      const response = await axios({
        method: 'get',
        url: `${this.baseUrl}/v2/product-shipping-info`,
        headers: headers,
        params: {
          product_id: productId,
          ship_to_country: country,
          language: language
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting AliExpress product shipping info:', error);
      throw error;
    }
  }

  /**
   * Search for audio gear on AliExpress
   */
  async searchAudioGear(keywords: string, country: string = 'US'): Promise<any> {
    return this.searchProducts({
      keywords: keywords,
      shipToCountry: country,
      sort: 'SALE_PRICE_ASC'
    });
  }

  /**
   * Search for protective cases on AliExpress
   */
  async searchCases(keywords: string, country: string = 'US'): Promise<any> {
    return this.searchProducts({
      keywords: keywords + ' case',
      shipToCountry: country,
      sort: 'SALE_PRICE_ASC'
    });
  }

  /**
   * Get categories from AliExpress
   */
  async getCategories(): Promise<any> {
    try {
      const headers = this.generateHeaders();
      
      const response = await axios({
        method: 'get',
        url: `${this.baseUrl}/v2/categories`,
        headers: headers
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting AliExpress categories:', error);
      throw error;
    }
  }
}

export default AliExpressApiClient;
