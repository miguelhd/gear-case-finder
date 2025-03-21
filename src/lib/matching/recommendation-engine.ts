import { IAudioGear, ICase } from '../models/gear-models';
import { ProductMatcher } from './product-matcher';
import { FeatureMatcher } from './feature-matcher';

export interface RecommendationOptions {
  maxAlternatives?: number;
  includeUpgrades?: boolean;
  includeBudgetOptions?: boolean;
  includeAlternativeSizes?: boolean;
  maxPriceDifferencePercent?: number;
  minCompatibilityScore?: number;
  preferredBrands?: string[];
  excludedBrands?: string[];
}

export class RecommendationEngine {
  private productMatcher: ProductMatcher;
  private featureMatcher: FeatureMatcher;
  
  constructor() {
    this.productMatcher = new ProductMatcher();
    this.featureMatcher = new FeatureMatcher();
  }
  
  /**
   * Generate alternative case recommendations beyond the primary matches
   */
  async generateAlternativeRecommendations(
    gear: IAudioGear,
    primaryMatch: ICase,
    options: RecommendationOptions = {}
  ): Promise<Array<ICase & { recommendationType: string; compatibilityScore: number }>> {
    // Set default options
    const defaultOptions: RecommendationOptions = {
      maxAlternatives: 5,
      includeUpgrades: true,
      includeBudgetOptions: true,
      includeAlternativeSizes: true,
      maxPriceDifferencePercent: 50,
      minCompatibilityScore: 70
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    const recommendations: Array<ICase & { recommendationType: string; compatibilityScore: number }> = [];
    
    // Find budget alternatives (similar protection but lower price)
    if (mergedOptions.includeBudgetOptions) {
      const budgetOptions = await this.findBudgetAlternatives(gear, primaryMatch, mergedOptions);
      recommendations.push(...budgetOptions.map(item => ({
        ...item,
        recommendationType: 'budget'
      } as (ICase & { recommendationType: string; compatibilityScore: number }))));
    }
    
    // Find premium upgrades (better protection or features)
    if (mergedOptions.includeUpgrades) {
      const upgradeOptions = await this.findPremiumUpgrades(gear, primaryMatch, mergedOptions);
      recommendations.push(...upgradeOptions.map(item => ({
        ...item,
        recommendationType: 'premium'
      } as (ICase & { recommendationType: string; compatibilityScore: number }))));
    }
    
    // Find alternative sizes (different form factors)
    if (mergedOptions.includeAlternativeSizes) {
      const sizeAlternatives = await this.findSizeAlternatives(gear, primaryMatch, mergedOptions);
      recommendations.push(...sizeAlternatives.map(item => ({
        ...item,
        recommendationType: 'alternative_size'
      } as (ICase & { recommendationType: string; compatibilityScore: number }))));
    }
    
    // Filter by brand preferences if specified
    let filteredRecommendations = recommendations;
    
    if (mergedOptions.preferredBrands && mergedOptions.preferredBrands.length > 0) {
      filteredRecommendations = filteredRecommendations.filter(item => 
        item.brand && mergedOptions.preferredBrands!.includes(item.brand)
      );
    }
    
    if (mergedOptions.excludedBrands && mergedOptions.excludedBrands.length > 0) {
      filteredRecommendations = filteredRecommendations.filter(item => 
        !item.brand || !mergedOptions.excludedBrands!.includes(item.brand)
      );
    }
    
    // Sort by compatibility score and limit results
    filteredRecommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    return filteredRecommendations.slice(0, mergedOptions.maxAlternatives);
  }
  
  /**
   * Find budget alternatives to the primary match
   */
  private async findBudgetAlternatives(
    gear: IAudioGear,
    primaryMatch: ICase,
    options: RecommendationOptions
  ): Promise<Array<ICase & { compatibilityScore: number }>> {
    // Calculate the minimum price (e.g., 20% lower than primary match)
    const minPrice = primaryMatch.price! * 0.6;
    const maxPrice = primaryMatch.price! * 0.9;
    
    // Find cases with similar protection level but lower price
    const matchingOptions = {
      minCompatibilityScore: options.minCompatibilityScore,
      preferredProtectionLevel: primaryMatch.protectionLevel,
      maxPriceUSD: maxPrice,
      maxResults: 3,
      sortBy: 'price' as const,
      sortDirection: 'asc' as const
    };
    
    const budgetAlternatives = await this.productMatcher.findCompatibleCases(gear, matchingOptions);
    
    // Filter out cases that are too cheap (might be poor quality)
    return budgetAlternatives.filter(item => item.price! >= minPrice && item.price! < primaryMatch.price!);
  }
  
  /**
   * Find premium upgrades to the primary match
   */
  private async findPremiumUpgrades(
    gear: IAudioGear,
    primaryMatch: ICase,
    options: RecommendationOptions
  ): Promise<Array<ICase & { compatibilityScore: number }>> {
    // Calculate the maximum price (e.g., up to 50% more than primary match)
    const maxPriceDiff = options.maxPriceDifferencePercent! / 100;
    const maxPrice = primaryMatch.price! * (1 + maxPriceDiff);
    const minPrice = primaryMatch.price! * 1.1; // At least 10% more expensive
    
    // Determine if we should upgrade the protection level
    let preferredProtectionLevel: 'low' | 'medium' | 'high' = primaryMatch.protectionLevel as ('low' | 'medium' | 'high');
    if (primaryMatch.protectionLevel === 'low') {
      preferredProtectionLevel = 'medium';
    } else if (primaryMatch.protectionLevel === 'medium') {
      preferredProtectionLevel = 'high';
    }
    
    // Find cases with better protection level and higher price
    const matchingOptions = {
      minCompatibilityScore: options.minCompatibilityScore,
      preferredProtectionLevel,
      maxResults: 3,
      sortBy: 'compatibilityScore' as const,
      sortDirection: 'desc' as const
    };
    
    const premiumAlternatives = await this.productMatcher.findCompatibleCases(gear, matchingOptions);
    
    // Filter by price range
    return premiumAlternatives.filter(item => item.price! >= minPrice && item.price! <= maxPrice);
  }
  
  /**
   * Find alternatives with different form factors
   */
  private async findSizeAlternatives(
    gear: IAudioGear,
    primaryMatch: ICase,
    options: RecommendationOptions
  ): Promise<Array<ICase & { compatibilityScore: number }>> {
    // Find cases with different dimensions but still compatible
    const matchingOptions = {
      minCompatibilityScore: options.minCompatibilityScore,
      maxResults: 5,
      sortBy: 'compatibilityScore' as const,
      sortDirection: 'desc' as const
    };
    
    const allCompatibleCases = await this.productMatcher.findCompatibleCases(gear, matchingOptions);
    
    // Filter out cases that are too similar to the primary match
    return allCompatibleCases.filter(item => {
      // Skip the primary match itself
      if (item.id === primaryMatch.id) return false;
      
      // Calculate dimension differences
      const lengthDiff = Math.abs(item.internalDimensions.length - primaryMatch.internalDimensions.length);
      const widthDiff = Math.abs(item.internalDimensions.width - primaryMatch.internalDimensions.width);
      const heightDiff = Math.abs(item.internalDimensions.height - primaryMatch.internalDimensions.height);
      
      // Consider it different if any dimension differs by more than 20%
      const lengthDiffPercent = (lengthDiff / primaryMatch.internalDimensions.length) * 100;
      const widthDiffPercent = (widthDiff / primaryMatch.internalDimensions.width) * 100;
      const heightDiffPercent = (heightDiff / primaryMatch.internalDimensions.height) * 100;
      
      return (
        lengthDiffPercent > 20 ||
        widthDiffPercent > 20 ||
        heightDiffPercent > 20
      );
    });
  }
  
  /**
   * Calculate confidence score for a match
   * This indicates how confident we are that this case is a good match for the gear
   */
  calculateConfidenceScore(
    gear: IAudioGear,
    caseItem: ICase & { compatibilityScore: number }
  ): number {
    let confidenceScore = 0;
    
    // Base confidence on compatibility score (50% weight)
    confidenceScore += caseItem.compatibilityScore * 0.5;
    
    // Check if the case is explicitly designed for this type of gear (20% weight)
    const gearTypeKeywords = [
      gear.type?.toLowerCase(),
      gear.category?.toLowerCase(),
      ...gear.name?.toLowerCase().split(' ')
    ];
    
    const caseDescription = caseItem.description?.toLowerCase() || '';
    const caseName = caseItem.name?.toLowerCase() || '';
    
    const isExplicitlyDesigned = gearTypeKeywords.some(keyword => 
      keyword && ((caseDescription.includes(keyword) || caseName.includes(keyword)) &&
      (caseDescription.includes('case') || caseName.includes('case')))
    );
    
    if (isExplicitlyDesigned) {
      confidenceScore += 20;
    }
    
    // Check if dimensions are a very close fit (15% weight)
    const lengthFit = (gear.dimensions.length / caseItem.internalDimensions.length) * 100;
    const widthFit = (gear.dimensions.width / caseItem.internalDimensions.width) * 100;
    const heightFit = (gear.dimensions.height / caseItem.internalDimensions.height) * 100;
    
    const dimensionFitScore = (
      this.getDimensionFitScore(lengthFit) +
      this.getDimensionFitScore(widthFit) +
      this.getDimensionFitScore(heightFit)
    ) / 3;
    
    confidenceScore += dimensionFitScore * 0.15;
    
    // Check if the case has appropriate features for this gear (15% weight)
    const featureScore = this.getFeatureAppropriatenessScore(gear, caseItem);
    confidenceScore += featureScore * 0.15;
    
    // Ensure the score is between 0 and 100
    return Math.min(100, Math.max(0, Math.round(confidenceScore)));
  }
  
  /**
   * Get a score for how well a dimension fits (0-100)
   */
  private getDimensionFitScore(fitPercentage: number): number {
    // Ideal fit is between 75% and 90%
    if (fitPercentage >= 75 && fitPercentage <= 90) {
      return 100;
    } else if (fitPercentage > 90 && fitPercentage <= 95) {
      return 80; // A bit tight but still good
    } else if (fitPercentage >= 70 && fitPercentage < 75) {
      return 80; // A bit loose but still good
    } else if (fitPercentage > 95 && fitPercentage <= 100) {
      return 60; // Very tight fit
    } else if (fitPercentage >= 60 && fitPercentage < 70) {
      return 60; // Very loose fit
    } else {
      return 30; // Poor fit
    }
  }
  
  /**
   * Get a score for how appropriate the case features are for this gear
   */
  private getFeatureAppropriatenessScore(gear: IAudioGear, caseItem: ICase): number {
    let score = 0;
    
    // Synthesizers and mixers need padding and possibly compartments
    if (gear.category === 'Synthesizer' || gear.category === 'Mixer') {
      if (this.hasFeature(caseItem, ['padded', 'padding', 'foam'])) score += 40;
      if (this.hasFeature(caseItem, ['compartment', 'pocket'])) score += 30;
      if (caseItem.hasHandle) score += 30;
    }
    
    // Drum machines need protection from impacts
    else if (gear.category === 'Drum Machine') {
      if (this.hasFeature(caseItem, ['padded', 'padding', 'foam'])) score += 30;
      if (caseItem.shockproof) score += 40;
      if (this.hasFeature(caseItem, ['compartment', 'pocket'])) score += 30;
    }
    
    // Effects pedals need organization
    else if (gear.category === 'Effects Pedal') {
      if (this.hasFeature(caseItem, ['pedalboard', 'pedal board'])) score += 50;
      if (this.hasFeature(caseItem, ['loop', 'velcro', 'hook and loop'])) score += 30;
      if (this.hasFeature(caseItem, ['power', 'supply'])) score += 20;
    }
    
    // Audio interfaces need cable management
    else if (gear.category === 'Audio Interface') {
      if (this.hasFeature(caseItem, ['padded', 'padding', 'foam'])) score += 30;
      if (this.hasFeature(caseItem, ['cable', 'compartment', 'pocket'])) score += 40;
      if (caseItem.waterproof) score += 30;
    }
    
    // Default scoring for other gear types
    else {
      if (this.hasFeature(caseItem, ['padded', 'padding', 'foam'])) score += 40;
      if (caseItem.hasHandle) score += 30;
      if (this.hasFeature(caseItem, ['compartment', 'pocket'])) score += 30;
    }
    
    return Math.min(100, score);
  }
  
  /**
   * Check if a case has specific features
   */
  private hasFeature(caseItem: ICase, keywords: string[]): boolean {
    // Check in description
    if (caseItem.description) {
      if (keywords.some(keyword => 
        caseItem.description?.toLowerCase().includes(keyword)
      )) {
        return true;
      }
    }
    
    // Check in features
    if (caseItem.features) {
      if (caseItem.features.some(feature => 
        keywords.some(keyword => feature?.toLowerCase().includes(keyword))
      )) {
        return true;
      }
    }
    
    // Check in name
    if (keywords.some(keyword => 
      caseItem.name?.toLowerCase().includes(keyword)
    )) {
      return true;
    }
    
    return false;
  }
}
