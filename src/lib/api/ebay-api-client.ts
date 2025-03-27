/**
 * eBay API Client
 * 
 * This module provides a client for interacting with the eBay Data API via RapidAPI
 * to fetch product data for audio gear and protective cases.
 */

import axios from 'axios';

interface EbayApiConfig {
  rapidApiKey: string;
  rapidApiHost?: string;
}

interface SearchItemsRequest {
  query?: string;
  country?: string;
  itemCount?: number;
}

export class EbayApiClient {
  private config: EbayApiConfig;
  private baseUrl: string = 'https://ebay-data.p.rapidapi.com';
  
  constructor(config: EbayApiConfig) {
    this.config = {
      rapidApiHost: 'ebay-data.p.rapidapi.com',
      ...config
    };
  }

  /**
   * Generate the required headers for the RapidAPI eBay Data API
   */
  private generateHeaders(): Record<string, string> {
    return {
      'X-RapidAPI-Key': this.config.rapidApiKey,
      'X-RapidAPI-Host': this.config.rapidApiHost || 'ebay-data.p.rapidapi.com',
      'Content-Type': 'application/json'
    };
  }

  /**
   * Start a search job by term
   */
  async startSearchByTerm(term: string, country: string = 'us'): Promise<string> {
    try {
      const headers = this.generateHeaders();
      
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/search-term`,
        headers: headers,
        data: {
          country: country,
          values: [term]
        }
      });
      
      if (response.data.error) {
        throw new Error(response.data.message || 'Error starting search job');
      }
      
      return response.data.job_id;
    } catch (error) {
      console.error('Error starting eBay search by term:', error);
      throw error;
    }
  }

  /**
   * Poll for search results
   */
  async pollSearchResults(jobId: string): Promise<any> {
    try {
      const headers = this.generateHeaders();
      
      const response = await axios({
        method: 'get',
        url: `${this.baseUrl}/poll`,
        headers: headers,
        params: {
          job_id: jobId
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error polling eBay search results:', error);
      throw error;
    }
  }

  /**
   * Search for items with polling until results are ready
   */
  async searchItemsWithPolling(term: string, country: string = 'us', maxAttempts: number = 12, pollingInterval: number = 10000): Promise<any> {
    try {
      // Start the search job
      const jobId = await this.startSearchByTerm(term, country);
      
      // Poll for results
      let attempts = 0;
      let results = null;
      
      while (attempts < maxAttempts) {
        const pollResponse = await this.pollSearchResults(jobId);
        
        if (pollResponse.status === 'finished') {
          results = pollResponse.results;
          break;
        }
        
        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, pollingInterval));
        attempts++;
      }
      
      if (!results) {
        throw new Error('Search job did not complete within the allowed time');
      }
      
      return results;
    } catch (error) {
      console.error('Error searching eBay items with polling:', error);
      throw error;
    }
  }

  /**
   * Search for audio gear on eBay
   */
  async searchAudioGear(keywords: string, country: string = 'us'): Promise<any> {
    return this.searchItemsWithPolling(keywords, country);
  }

  /**
   * Search for protective cases on eBay
   */
  async searchCases(keywords: string, country: string = 'us'): Promise<any> {
    return this.searchItemsWithPolling(keywords + ' case', country);
  }
}

export default EbayApiClient;
