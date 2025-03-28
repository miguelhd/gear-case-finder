/**
 * Reverb API Client
 * 
 * This module provides a client for interacting with Reverb's API
 * to fetch product data for musical instruments and gear.
 */

import axios from 'axios';

interface ReverbApiConfig {
  accessToken: string;
  baseUrl?: string | undefined;
}

interface SearchItemsRequest {
  query?: string;
  category?: string;
  itemCount?: number;
  page?: number;
}

export class ReverbApiClient {
  private config: ReverbApiConfig;
  
  constructor(config: ReverbApiConfig) {
    this.config = {
      baseUrl: 'https://api.reverb.com/api',
      ...config
    };
  }

  /**
   * Generate the required authentication headers for the Reverb API
   */
  private generateHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Search for items on Reverb using keywords
   */
  async searchItems(request: SearchItemsRequest): Promise<any> {
    try {
      const params: any = {
        query: request.query || '',
        per_page: request.itemCount || 10,
        page: request.page || 1
      };
      
      if (request.category) {
        params.category = request.category;
      }
      
      const headers = this.generateHeaders();
      
      const response = await axios({
        method: 'get',
        url: `${this.config.baseUrl}/listings/all`,
        headers: headers,
        params: params
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching Reverb items:', error);
      throw error;
    }
  }

  /**
   * Get detailed information for a specific listing by ID
   */
  async getItem(listingId: string): Promise<any> {
    try {
      const headers = this.generateHeaders();
      
      const response = await axios({
        method: 'get',
        url: `${this.config.baseUrl}/listings/${listingId}`,
        headers: headers
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error getting Reverb item ${listingId}:`, error);
      throw error;
    }
  }

  /**
   * Search for audio gear on Reverb
   */
  async searchAudioGear(keywords: string, itemCount: number = 10): Promise<any> {
    return this.searchItems({
      query: keywords,
      category: 'keyboards-and-synths',
      itemCount: itemCount
    });
  }

  /**
   * Search for cases on Reverb
   */
  async searchCases(keywords: string, itemCount: number = 10): Promise<any> {
    return this.searchItems({
      query: keywords + ' case',
      category: 'accessories',
      itemCount: itemCount
    });
  }
}

export default ReverbApiClient;
