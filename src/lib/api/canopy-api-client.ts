/**
 * Canopy API Client
 * 
 * This module provides a client for interacting with the Canopy API
 * to fetch product data for audio gear and protective cases across multiple marketplaces.
 */

import axios from 'axios';

interface CanopyApiConfig {
  apiKey: string;
  baseUrl?: string;
}

interface SearchItemsRequest {
  query?: string;
  category?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export class CanopyApiClient {
  private config: CanopyApiConfig;
  
  constructor(config: CanopyApiConfig) {
    this.config = {
      baseUrl: 'https://api.canopyapi.co/v1',
      ...config
    };
  }

  /**
   * Generate the required headers for the Canopy API
   */
  private generateHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Search for products using various criteria
   */
  async searchProducts(request: SearchItemsRequest): Promise<any> {
    try {
      const headers = this.generateHeaders();
      
      // Build query parameters
      const params: any = {
        limit: request.limit || 20,
        offset: request.offset || 0
      };
      
      if (request.query) {
        params.query = request.query;
      }
      
      if (request.category) {
        params.category = request.category;
      }
      
      if (request.minPrice) {
        params.min_price = request.minPrice;
      }
      
      if (request.maxPrice) {
        params.max_price = request.maxPrice;
      }
      
      // Add dimension parameters if provided
      if (request.dimensions) {
        if (request.dimensions.length) {
          params.length = request.dimensions.length;
        }
        
        if (request.dimensions.width) {
          params.width = request.dimensions.width;
        }
        
        if (request.dimensions.height) {
          params.height = request.dimensions.height;
        }
        
        if (request.dimensions.unit) {
          params.dimension_unit = request.dimensions.unit;
        }
      }
      
      const response = await axios({
        method: 'get',
        url: `${this.config.baseUrl}/products/search`,
        headers: headers,
        params: params
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Get detailed information for a specific product by ID
   */
  async getProduct(productId: string): Promise<any> {
    try {
      const headers = this.generateHeaders();
      
      const response = await axios({
        method: 'get',
        url: `${this.config.baseUrl}/products/${productId}`,
        headers: headers
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error getting product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Search for products by dimensions (with tolerance)
   */
  async searchByDimensions(length: number, width: number, height: number, unit: string = 'in', tolerance: number = 0.5): Promise<any> {
    try {
      const headers = this.generateHeaders();
      
      const params: any = {
        length_min: length - tolerance,
        length_max: length + tolerance,
        width_min: width - tolerance,
        width_max: width + tolerance,
        height_min: height - tolerance,
        height_max: height + tolerance,
        dimension_unit: unit,
        limit: 50
      };
      
      const response = await axios({
        method: 'get',
        url: `${this.config.baseUrl}/products/search`,
        headers: headers,
        params: params
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching products by dimensions:', error);
      throw error;
    }
  }

  /**
   * Search for audio gear on various marketplaces
   */
  async searchAudioGear(keywords: string, limit: number = 20): Promise<any> {
    return this.searchProducts({
      query: keywords,
      category: 'electronics',
      limit: limit
    });
  }

  /**
   * Search for protective cases on various marketplaces
   */
  async searchCases(keywords: string, limit: number = 20): Promise<any> {
    return this.searchProducts({
      query: keywords + ' case',
      limit: limit
    });
  }

  /**
   * Search for cases that match specific gear dimensions
   */
  async searchCasesByGearDimensions(gear: { length: number, width: number, height: number, unit: string }, tolerance: number = 0.5): Promise<any> {
    return this.searchByDimensions(
      gear.length,
      gear.width,
      gear.height,
      gear.unit,
      tolerance
    );
  }
}

export default CanopyApiClient;
