import { IAudioGear, ICase, GearCaseMatch, AudioGear, Case } from '../models/gear-models';
import mongoose from 'mongoose';

export interface MatchingOptions {
  minCompatibilityScore?: number | undefined;
  preferredProtectionLevel?: 'low' | 'medium' | 'high' | undefined;
  maxPriceUSD?: number | undefined;
  preferredFeatures?: string[] | undefined;
  preferredBrands?: string[] | undefined;
  allowWaterproof?: boolean | undefined;
  allowShockproof?: boolean | undefined;
  requireHandle?: boolean | undefined;
  requireWheels?: boolean | undefined;
  maxResults?: number | undefined;
  sortBy?: 'compatibilityScore' | 'price' | 'rating' | undefined;
  sortDirection?: 'asc' | 'desc' | undefined;
}

export class ProductMatcher {
  /**
   * Find compatible cases for a specific audio gear item
   */
  async findCompatibleCases(
    gear: IAudioGear | string,
    options: MatchingOptions = {}
  ): Promise<Array<ICase & { compatibilityScore: number }>> {
    // If gear is a string (ID), fetch the gear details
    let gearItem: IAudioGear;
    if (typeof gear === 'string') {
      const foundGear = await AudioGear.findById(gear);
      if (!foundGear) {
        throw new Error(`Audio gear with ID ${gear} not found`);
      }
      gearItem = foundGear;
    } else {
      gearItem = gear;
    }

    // Set default options
    const defaultOptions: MatchingOptions = {
      minCompatibilityScore: 70,
      maxResults: 20,
      sortBy: 'compatibilityScore',
      sortDirection: 'desc'
    };

    const mergedOptions = { ...defaultOptions, ...options };

    // Build the query for finding compatible cases
    const query: any = {};

    // Ensure the internal dimensions of the case are larger than the gear dimensions
    // Add a small buffer (0.5 inches) to account for padding
    const buffer = 0.5;
    query['internalDimensions.length'] = { $gte: gearItem.dimensions.length + buffer };
    query['internalDimensions.width'] = { $gte: gearItem.dimensions.width + buffer };
    query['internalDimensions.height'] = { $gte: gearItem.dimensions.height + buffer };

    // Apply additional filters based on options
    if (mergedOptions.maxPriceUSD) {
      query.price = { $lte: mergedOptions.maxPriceUSD };
      query.currency = 'USD'; // Only consider USD prices for simplicity
    }

    if (mergedOptions.preferredProtectionLevel) {
      query.protectionLevel = mergedOptions.preferredProtectionLevel;
    }

    if (mergedOptions.allowWaterproof !== undefined) {
      query.waterproof = mergedOptions.allowWaterproof;
    }

    if (mergedOptions.allowShockproof !== undefined) {
      query.shockproof = mergedOptions.allowShockproof;
    }

    if (mergedOptions.requireHandle) {
      query.hasHandle = true;
    }

    if (mergedOptions.requireWheels) {
      query.hasWheels = true;
    }

    if (mergedOptions.preferredBrands && mergedOptions.preferredBrands.length > 0) {
      query.brand = { $in: mergedOptions.preferredBrands };
    }

    // Find cases that match the criteria
    const cases = await Case.find(query);

    // Calculate compatibility score for each case
    const scoredCases = cases.map(caseItem => {
      const score = this.calculateCompatibilityScore(gearItem, caseItem, mergedOptions);
      return {
        ...caseItem.toObject(),
        compatibilityScore: score
      };
    });

    // Filter by minimum compatibility score
    const filteredCases = scoredCases.filter(
      caseItem => caseItem.compatibilityScore >= (mergedOptions.minCompatibilityScore || 70)
    );

    // Sort the results
    const sortField = mergedOptions.sortBy || 'compatibilityScore';
    const sortDirection = mergedOptions.sortDirection === 'asc' ? 1 : -1;
    
    filteredCases.sort((a, b) => {
      if (sortField === 'compatibilityScore') {
        return sortDirection * (b.compatibilityScore - a.compatibilityScore);
      } else if (sortField === 'price') {
        return sortDirection * ((a.price || 0) - (b.price || 0));
      } else if (sortField === 'rating') {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return sortDirection * (ratingB - ratingA);
      }
      return 0;
    });

    // Limit the number of results
    const limitedResults = filteredCases.slice(0, mergedOptions.maxResults);

    // Save the matches to the database
    await this.saveMatches(gearItem, limitedResults as Array<ICase & { compatibilityScore: number }>);

    return limitedResults as Array<ICase & { compatibilityScore: number }>;
  }

  /**
   * Calculate compatibility score between gear and case
   */
  calculateCompatibilityScore(
    gear: IAudioGear,
    caseItem: ICase,
    options: MatchingOptions = {}
  ): number {
    // Calculate dimension fit percentages
    const lengthFit = (gear.dimensions.length / caseItem.internalDimensions.length) * 100;
    const widthFit = (gear.dimensions.width / caseItem.internalDimensions.width) * 100;
    const heightFit = (gear.dimensions.height / caseItem.internalDimensions.height) * 100;

    // Calculate overall fit (average of all dimensions)
    const overallFit = (lengthFit + widthFit + heightFit) / 3;

    // Ideal fit is between 70% and 90% of the case's internal dimensions
    // Too small means the gear will move around, too tight means it might not fit
    let dimensionScore = 0;
    if (overallFit >= 70 && overallFit <= 90) {
      dimensionScore = 100; // Perfect fit
    } else if (overallFit < 70) {
      // Too small, score decreases as fit percentage decreases
      dimensionScore = 70 + (overallFit / 70) * 30;
    } else if (overallFit > 90 && overallFit <= 100) {
      // Too tight, but still fits
      dimensionScore = 100 - ((overallFit - 90) * 10);
    } else {
      // Won't fit
      dimensionScore = 0;
    }

    // Protection level score
    let protectionScore = 0;
    if (caseItem.protectionLevel === 'high') {
      protectionScore = 100;
    } else if (caseItem.protectionLevel === 'medium') {
      protectionScore = 75;
    } else if (caseItem.protectionLevel === 'low') {
      protectionScore = 50;
    }

    // Feature score
    let featureScore = 0;
    const desiredFeatures = options.preferredFeatures || [];
    if (desiredFeatures.length > 0 && caseItem.features && Array.isArray(caseItem.features)) {
      const matchedFeatures = desiredFeatures.filter(feature => 
        caseItem.features!.some(caseFeature => 
          caseFeature?.toLowerCase().includes(feature?.toLowerCase())
        )
      );
      featureScore = (matchedFeatures.length / desiredFeatures.length) * 100;
    } else {
      featureScore = 75; // Default if no specific features are requested
    }

    // Rating score
    let ratingScore = 0;
    if (caseItem.rating) {
      ratingScore = (caseItem.rating / 5) * 100;
    } else {
      ratingScore = 50; // Default if no rating
    }

    // Calculate final score with different weights
    const finalScore = (
      dimensionScore * 0.4 +  // Dimension fit is most important
      protectionScore * 0.25 + // Protection level is important
      featureScore * 0.2 +    // Features are somewhat important
      ratingScore * 0.15      // Rating is least important
    );

    return Math.round(finalScore);
  }

  /**
   * Calculate dimension fit between gear and case
   */
  calculateDimensionFit(gear: IAudioGear, caseItem: ICase): any {
    return {
      length: (gear.dimensions.length / caseItem.internalDimensions.length) * 100,
      width: (gear.dimensions.width / caseItem.internalDimensions.width) * 100,
      height: (gear.dimensions.height / caseItem.internalDimensions.height) * 100,
      overall: ((gear.dimensions.length / caseItem.internalDimensions.length) +
               (gear.dimensions.width / caseItem.internalDimensions.width) +
               (gear.dimensions.height / caseItem.internalDimensions.height)) / 3 * 100
    };
  }

  /**
   * Determine price category for a case
   */
  determinePriceCategory(caseItem: ICase): string {
    let priceCategory: 'budget' | 'mid-range' | 'premium' = 'mid-range';
    if (caseItem.price !== undefined) {
      if (caseItem.price < 50) {
        priceCategory = 'budget';
      } else if (caseItem.price > 150) {
        priceCategory = 'premium';
      }
    }
    return priceCategory;
  }

  /**
   * Save matches to the database for future reference
   */
  private async saveMatches(
    gear: IAudioGear,
    cases: Array<ICase & { compatibilityScore: number }>
  ): Promise<void> {
    const bulkOps = cases.map(caseItem => {
      const dimensionFit = this.calculateDimensionFit(gear, caseItem);
      const priceCategory = this.determinePriceCategory(caseItem);

      return {
        updateOne: {
          filter: {
            gearId: gear._id,
            caseId: caseItem._id
          },
          update: {
            $set: {
              compatibilityScore: caseItem.compatibilityScore,
              dimensionFit,
              priceCategory,
              protectionLevel: caseItem.protectionLevel || 'medium',
              features: caseItem.features || []
            }
          },
          upsert: true
        }
      };
    });

    if (bulkOps.length > 0) {
      await GearCaseMatch.bulkWrite(bulkOps);
    }
  }

  /**
   * Find audio gear by name, brand, or type
   */
  async findAudioGear(
    searchTerm: string,
    options: { limit?: number; category?: string; brand?: string } = {}
  ): Promise<IAudioGear[]> {
    const query: any = {};
    
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { brand: { $regex: searchTerm, $options: 'i' } },
        { type: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    if (options.category) {
      query.category = options.category;
    }
    
    if (options.brand) {
      query.brand = options.brand;
    }
    
    return AudioGear.find(query)
      .limit(options.limit || 20)
      .sort({ popularity: -1 });
  }

  /**
   * Find cases by name, brand, or type
   */
  async findCases(
    searchTerm: string,
    options: { 
      limit?: number; 
      type?: string; 
      brand?: string;
      minPrice?: number;
      maxPrice?: number;
      protectionLevel?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<ICase[]> {
    const query: any = {};
    
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { brand: { $regex: searchTerm, $options: 'i' } },
        { type: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    if (options.type) {
      query.type = options.type;
    }
    
    if (options.brand) {
      query.brand = options.brand;
    }
    
    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      query.price = {};
      if (options.minPrice !== undefined) {
        query.price.$gte = options.minPrice;
      }
      if (options.maxPrice !== undefined) {
        query.price.$lte = options.maxPrice;
      }
    }
    
    if (options.protectionLevel) {
      query.protectionLevel = options.protectionLevel;
    }
    
    return Case.find(query)
      .limit(options.limit || 20)
      .sort({ rating: -1 });
  }

  /**
   * Get popular matches (most viewed or highest compatibility)
   */
  async getPopularMatches(limit: number = 10): Promise<any[]> {
    const matches = await GearCaseMatch.find()
      .sort({ compatibilityScore: -1 })
      .limit(limit)
      .populate('gearId')
      .populate('caseId');
    
    return matches.map(match => ({
      gear: match.gearId,
      case: match.caseId,
      compatibilityScore: match.compatibilityScore,
      dimensionFit: match.dimensionFit as any,
      priceCategory: match.priceCategory as string | undefined,
      protectionLevel: match.protectionLevel as string | undefined
    }));
  }
}
