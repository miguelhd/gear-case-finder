/**
 * API Integration Service
 * 
 * This module provides a service layer for integrating the API-based
 * approach with the existing application functionality.
 */

import { ApiManager, IApiManagerOptions } from './api-manager';
import { IAudioGear, ICase } from '../models/gear-models';
import { NormalizedProduct } from '../models/normalized-product';

export class ApiIntegrationService {
  private apiManager: ApiManager;
  
  constructor(options: IApiManagerOptions = {}) {
    this.apiManager = new ApiManager(options);
  }
  
  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    await this.apiManager.initialize();
  }
  
  /**
   * Search for products across all API sources
   * This method provides compatibility with the existing scraper-based approach
   */
  async searchAllMarketplaces(query: string, options: { page?: number } = {}): Promise<NormalizedProduct[]> {
    // Create search options objects with proper handling of optional properties
    const searchOptions: { limit: number } = { limit: 10 };
    // Only add page property if it exists
    if (options.page !== undefined) {
      (searchOptions as { page: number, limit: number }).page = options.page;
    }
    
    // Search for both audio gear and cases
    const [audioGearResults, caseResults] = await Promise.all([
      this.apiManager.searchAudioGear(query, searchOptions),
      this.apiManager.searchCases(query, searchOptions)
    ]);
    
    // Convert to NormalizedProduct format for compatibility with existing code
    const normalizedResults: NormalizedProduct[] = [
      ...this.convertAudioGearToNormalizedProducts(audioGearResults),
      ...this.convertCasesToNormalizedProducts(caseResults)
    ];
    
    return normalizedResults;
  }
  
  /**
   * Get product details from a specific marketplace
   * This method provides compatibility with the existing scraper-based approach
   */
  async getProductDetails(marketplace: string, productId: string): Promise<NormalizedProduct | null> {
    // Try to get as audio gear first
    const audioGear = await this.apiManager.getAudioGearDetails(marketplace, productId);
    if (audioGear) {
      return this.convertAudioGearToNormalizedProduct(audioGear);
    }
    
    // If not found as audio gear, try as case
    const caseItem = await this.apiManager.getCaseDetails(marketplace, productId);
    if (caseItem) {
      return this.convertCaseToNormalizedProduct(caseItem);
    }
    
    return null;
  }
  
  /**
   * Get products by category from a specific marketplace
   * This method provides compatibility with the existing scraper-based approach
   */
  async getProductsByCategory(marketplace: string, category: string, options: { page?: number } = {}): Promise<NormalizedProduct[]> {
    // Create search options objects with proper handling of optional properties
    const searchOptions: { limit: number } = { limit: 10 };
    // Only add page property if it exists
    if (options.page !== undefined) {
      (searchOptions as { page: number, limit: number }).page = options.page;
    }
    
    // Determine if this is an audio gear category or a case category
    const isAudioGearCategory = this.isAudioGearCategory(category);
    
    if (isAudioGearCategory) {
      const audioGearResults = await this.apiManager.searchAudioGear(category, searchOptions);
      return this.convertAudioGearToNormalizedProducts(audioGearResults);
    } else {
      const caseResults = await this.apiManager.searchCases(category, searchOptions);
      return this.convertCasesToNormalizedProducts(caseResults);
    }
  }
  
  /**
   * Search for audio gear directly
   */
  async searchAudioGear(query: string, options: { page?: number, limit?: number } = {}): Promise<IAudioGear[]> {
    return await this.apiManager.searchAudioGear(query, options);
  }
  
  /**
   * Search for cases directly
   */
  async searchCases(query: string, options: { page?: number, limit?: number } = {}): Promise<ICase[]> {
    return await this.apiManager.searchCases(query, options);
  }
  
  /**
   * Get audio gear details directly
   */
  async getAudioGearDetails(source: string, productId: string): Promise<IAudioGear | null> {
    return await this.apiManager.getAudioGearDetails(source, productId);
  }
  
  /**
   * Get case details directly
   */
  async getCaseDetails(source: string, productId: string): Promise<ICase | null> {
    return await this.apiManager.getCaseDetails(source, productId);
  }
  
  /**
   * Run a batch job manually
   */
  async runBatchJob(jobType: string): Promise<void> {
    await this.apiManager.runBatchJob(jobType);
  }
  
  /**
   * Get batch job history
   */
  async getBatchJobHistory(limit: number = 10): Promise<any[]> {
    return await this.apiManager.getBatchJobHistory(limit);
  }
  
  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    return await this.apiManager.getCacheStats();
  }
  
  /**
   * Schedule a job to run at regular intervals
   */
  scheduleJob(
    jobName: string,
    operation: () => Promise<void>,
    intervalMinutes: number
  ) {
    return this.apiManager.scheduleJob(jobName, operation, intervalMinutes);
  }
  
  /**
   * Convert IAudioGear to NormalizedProduct for compatibility with existing code
   */
  private convertAudioGearToNormalizedProduct(audioGear: IAudioGear): NormalizedProduct {
    const now = new Date();
    
    // Create a base product without the problematic weight property
    const baseProduct = {
      id: audioGear._id?.toString() || `audio_gear_${Date.now()}`,
      sourceId: audioGear._id?.toString() || `audio_gear_${Date.now()}`,
      marketplace: audioGear.marketplace || 'unknown',
      title: audioGear.name,
      description: audioGear.description || '',
      price: audioGear.price || 0,
      currency: audioGear.currency || 'USD',
      url: audioGear.productUrl || '',
      imageUrls: audioGear.imageUrl ? [audioGear.imageUrl] : [],
      dimensions: {
        length: audioGear.dimensions.length,
        width: audioGear.dimensions.width,
        height: audioGear.dimensions.height,
        unit: audioGear.dimensions.unit
      },
      rating: 0,
      reviewCount: 0,
      availability: 'in_stock',
      seller: {
        name: 'Unknown Seller',
        url: '',
        rating: 0
      },
      category: audioGear.category,
      features: [],
      scrapedAt: now,
      normalizedAt: now,
      productType: 'audio_gear',
      isCase: false
    };
    
    // Use type assertion to add the weight property conditionally
    const result = baseProduct as NormalizedProduct;
    
    // Only add weight property if it exists in the source
    if (audioGear.weight) {
      result.weight = {
        value: audioGear.weight.value,
        unit: audioGear.weight.unit
      };
    }
    
    return result;
  }
  
  /**
   * Convert ICase to NormalizedProduct for compatibility with existing code
   */
  private convertCaseToNormalizedProduct(caseItem: ICase): NormalizedProduct {
    const now = new Date();
    const seller = caseItem.seller ? {
      name: caseItem.seller.name || 'Unknown Seller',
      url: caseItem.seller.url || '',
      rating: caseItem.seller.rating || 0
    } : {
      name: 'Unknown Seller',
      url: '',
      rating: 0
    };
    
    // Create a base product without the problematic weight property
    const baseProduct = {
      id: caseItem._id?.toString() || `case_${Date.now()}`,
      sourceId: caseItem._id?.toString() || `case_${Date.now()}`,
      marketplace: caseItem.marketplace || 'unknown',
      title: caseItem.name,
      description: caseItem.description || '',
      price: caseItem.price || 0,
      currency: caseItem.currency || 'USD',
      url: caseItem.url || '',
      imageUrls: caseItem.imageUrls || [],
      dimensions: caseItem.dimensions.interior,
      rating: caseItem.rating || 0,
      reviewCount: caseItem.reviewCount || 0,
      availability: 'in_stock',
      seller: seller,
      category: 'case',
      features: caseItem.features || [],
      scrapedAt: now,
      normalizedAt: now,
      productType: 'case',
      isCase: true,
      caseCompatibility: {
        minLength: 0,
        maxLength: caseItem.dimensions.interior.length,
        minWidth: 0,
        maxWidth: caseItem.dimensions.interior.width,
        minHeight: 0,
        maxHeight: caseItem.dimensions.interior.height,
        dimensionUnit: caseItem.dimensions.interior.unit
      }
    };
    
    // Use type assertion to add the weight property conditionally
    const result = baseProduct as NormalizedProduct;
    
    // Only add weight property if it exists in the source
    if (caseItem.weight) {
      result.weight = {
        value: caseItem.weight.value,
        unit: caseItem.weight.unit
      };
    }
    
    return result;
  }
  
  /**
   * Convert multiple IAudioGear items to NormalizedProduct array
   */
  private convertAudioGearToNormalizedProducts(audioGearItems: IAudioGear[]): NormalizedProduct[] {
    return audioGearItems.map(item => this.convertAudioGearToNormalizedProduct(item));
  }
  
  /**
   * Convert multiple ICase items to NormalizedProduct array
   */
  private convertCasesToNormalizedProducts(caseItems: ICase[]): NormalizedProduct[] {
    return caseItems.map(item => this.convertCaseToNormalizedProduct(item));
  }
  
  /**
   * Determine if a category is an audio gear category
   */
  private isAudioGearCategory(category: string): boolean {
    const audioGearCategories = [
      'synthesizer', 'keyboard', 'midi controller', 'drum machine',
      'audio interface', 'mixer', 'sampler', 'groovebox'
    ];
    
    return audioGearCategories.some(c => category.toLowerCase().includes(c));
  }
}

export default ApiIntegrationService;
