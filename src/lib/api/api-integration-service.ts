/**
 * API Integration Service
 * 
 * This module provides a service layer for integrating the API-based
 * approach with the existing application functionality.
 */

import { ApiManager, ApiManagerOptions } from './api-manager';
import { IAudioGear, ICase } from '../models/gear-models';
import { NormalizedProduct } from '../scrapers/data-normalizer';

export class ApiIntegrationService {
  private apiManager: ApiManager;
  
  constructor(options: ApiManagerOptions = {}) {
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
    // Search for both audio gear and cases
    const [audioGearResults, caseResults] = await Promise.all([
      this.apiManager.searchAudioGear(query, { page: options.page, limit: 10 }),
      this.apiManager.searchCases(query, { page: options.page, limit: 10 })
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
    // Determine if this is an audio gear category or a case category
    const isAudioGearCategory = this.isAudioGearCategory(category);
    
    if (isAudioGearCategory) {
      const audioGearResults = await this.apiManager.searchAudioGear(category, { page: options.page, limit: 10 });
      return this.convertAudioGearToNormalizedProducts(audioGearResults);
    } else {
      const caseResults = await this.apiManager.searchCases(category, { page: options.page, limit: 10 });
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
    return {
      id: audioGear._id?.toString() || `audio_gear_${Date.now()}`,
      name: audioGear.name,
      brand: audioGear.brand,
      price: audioGear.price || 0,
      currency: audioGear.currency || 'USD',
      description: audioGear.description || '',
      category: audioGear.category,
      type: audioGear.type,
      imageUrl: audioGear.imageUrl || '',
      imageUrls: audioGear.imageUrl ? [audioGear.imageUrl] : [],
      url: audioGear.productUrl || '',
      marketplace: audioGear.marketplace || 'unknown',
      sourceId: audioGear._id?.toString() || `audio_gear_${Date.now()}`,
      dimensions: {
        length: audioGear.dimensions.length,
        width: audioGear.dimensions.width,
        height: audioGear.dimensions.height,
        unit: audioGear.dimensions.unit
      },
      weight: audioGear.weight ? {
        value: audioGear.weight.value,
        unit: audioGear.weight.unit
      } : undefined,
      productType: 'audio_gear',
      features: [],
      rating: 0,
      reviewCount: 0,
      availability: 'in_stock',
      metadata: {}
    };
  }
  
  /**
   * Convert ICase to NormalizedProduct for compatibility with existing code
   */
  private convertCaseToNormalizedProduct(caseItem: ICase): NormalizedProduct {
    return {
      id: caseItem._id?.toString() || `case_${Date.now()}`,
      name: caseItem.name,
      brand: caseItem.brand,
      price: caseItem.price || 0,
      currency: caseItem.currency || 'USD',
      description: caseItem.description || '',
      category: 'case',
      type: caseItem.type,
      imageUrl: caseItem.imageUrl || '',
      imageUrls: caseItem.imageUrls || [],
      url: caseItem.url || '',
      marketplace: caseItem.marketplace || 'unknown',
      sourceId: caseItem._id?.toString() || `case_${Date.now()}`,
      dimensions: caseItem.dimensions.interior,
      weight: caseItem.weight,
      productType: 'case',
      features: caseItem.features || [],
      rating: caseItem.rating || 0,
      reviewCount: caseItem.reviewCount || 0,
      availability: 'in_stock',
      metadata: {
        protectionLevel: caseItem.protectionLevel,
        waterproof: caseItem.waterproof,
        shockproof: caseItem.shockproof,
        hasPadding: caseItem.hasPadding,
        hasCompartments: caseItem.hasCompartments,
        hasHandle: caseItem.hasHandle,
        hasWheels: caseItem.hasWheels,
        hasLock: caseItem.hasLock,
        material: caseItem.material,
        color: caseItem.color
      }
    };
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
