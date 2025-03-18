import { NormalizedProduct } from '../scrapers/data-normalizer';
import { IAudioGear, ICase } from '../models/gear-models';

export interface FeatureMatchingOptions {
  requireWaterproof?: boolean;
  requireShockproof?: boolean;
  requireHandle?: boolean;
  requireWheels?: boolean;
  requireLock?: boolean;
  requirePadding?: boolean;
  requireCompartments?: boolean;
  preferredMaterial?: string[];
  preferredColor?: string[];
  maxWeight?: number;
  weightUnit?: string;
}

export class FeatureMatcher {
  /**
   * Match audio gear with cases based on features beyond dimensions
   */
  matchFeatures(
    gear: IAudioGear,
    cases: ICase[],
    options: FeatureMatchingOptions = {}
  ): Array<ICase & { featureScore: number }> {
    return cases.map(caseItem => {
      const featureScore = this.calculateFeatureScore(gear, caseItem, options);
      return {
        ...caseItem.toObject(),
        featureScore
      };
    }).sort((a, b) => b.featureScore - a.featureScore);
  }

  /**
   * Calculate a feature compatibility score between gear and case
   */
  private calculateFeatureScore(
    gear: IAudioGear,
    caseItem: ICase,
    options: FeatureMatchingOptions
  ): number {
    let score = 0;
    let totalFactors = 0;

    // Check for required features
    if (options.requireWaterproof) {
      totalFactors++;
      if (caseItem.waterproof) {
        score += 100;
      }
    }

    if (options.requireShockproof) {
      totalFactors++;
      if (caseItem.shockproof) {
        score += 100;
      }
    }

    if (options.requireHandle) {
      totalFactors++;
      if (caseItem.hasHandle) {
        score += 100;
      }
    }

    if (options.requireWheels) {
      totalFactors++;
      if (caseItem.hasWheels) {
        score += 100;
      }
    }

    // Check for padding (important for sensitive equipment)
    if (options.requirePadding) {
      totalFactors++;
      const hasPadding = this.checkForPadding(caseItem);
      if (hasPadding) {
        score += 100;
      }
    }

    // Check for compartments (useful for accessories)
    if (options.requireCompartments) {
      totalFactors++;
      const hasCompartments = this.checkForCompartments(caseItem);
      if (hasCompartments) {
        score += 100;
      }
    }

    // Check for preferred materials
    if (options.preferredMaterial && options.preferredMaterial.length > 0 && caseItem.material) {
      totalFactors++;
      const materialMatches = options.preferredMaterial.some(material => 
        caseItem.material?.toLowerCase().includes(material.toLowerCase())
      );
      if (materialMatches) {
        score += 100;
      }
    }

    // Check for preferred colors
    if (options.preferredColor && options.preferredColor.length > 0 && caseItem.color) {
      totalFactors++;
      const colorMatches = options.preferredColor.some(color => 
        caseItem.color?.toLowerCase().includes(color?.toLowerCase())
      );
      if (colorMatches) {
        score += 100;
      }
    }

    // Check weight (if gear is heavy, case should be sturdy)
    if (gear.weight && gear.weight.value && caseItem.weight && caseItem.weight.value) {
      totalFactors++;
      
      // Convert weights to the same unit if necessary
      const gearWeightLb = this.convertWeightToLb(gear.weight.value, gear.weight.unit || 'lb');
      const caseWeightLb = this.convertWeightToLb(caseItem.weight.value, caseItem.weight.unit || 'lb');
      
      // Case should be sturdy enough for the gear (we assume sturdier cases are heavier)
      // But not too heavy (ideally less than 50% of gear weight added)
      const weightRatio = caseWeightLb / gearWeightLb;
      
      if (weightRatio <= 0.5) {
        // Ideal weight ratio
        score += 100;
      } else if (weightRatio <= 0.75) {
        // Acceptable weight ratio
        score += 75;
      } else if (weightRatio <= 1.0) {
        // Heavy but still reasonable
        score += 50;
      } else {
        // Too heavy
        score += 25;
      }
    }

    // Check protection level based on gear value/category
    totalFactors++;
    const recommendedProtection = this.getRecommendedProtectionLevel(gear);
    if (caseItem.protectionLevel === recommendedProtection) {
      score += 100;
    } else if (
      (recommendedProtection === 'high' && caseItem.protectionLevel === 'medium') ||
      (recommendedProtection === 'medium' && caseItem.protectionLevel === 'high')
    ) {
      // Close match
      score += 75;
    } else if (
      (recommendedProtection === 'medium' && caseItem.protectionLevel === 'low') ||
      (recommendedProtection === 'low' && caseItem.protectionLevel === 'medium')
    ) {
      // Less ideal match
      score += 50;
    } else {
      // Poor match (high protection needed but low provided, or vice versa)
      score += 25;
    }

    // If no factors were checked, return a default score
    if (totalFactors === 0) {
      return 75; // Default moderate score
    }

    // Return the average score across all factors
    return Math.round(score / totalFactors);
  }

  /**
   * Check if a case has padding based on description and features
   */
  private checkForPadding(caseItem: ICase): boolean {
    const paddingKeywords = ['padded', 'padding', 'foam', 'cushion', 'soft interior', 'plush'];
    
    // Check in description
    if (caseItem.description) {
      if (paddingKeywords.some(keyword => 
        caseItem.description?.toLowerCase().includes(keyword)
      )) {
        return true;
      }
    }
    
    // Check in features
    if (caseItem.features) {
      if (caseItem.features.some(feature => 
        paddingKeywords.some(keyword => feature?.toLowerCase().includes(keyword))
      )) {
        return true;
      }
    }
    
    // Check in name
    if (paddingKeywords.some(keyword => 
      caseItem.name?.toLowerCase().includes(keyword)
    )) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if a case has compartments based on description and features
   */
  private checkForCompartments(caseItem: ICase): boolean {
    const compartmentKeywords = ['compartment', 'pocket', 'divider', 'section', 'organizer'];
    
    // Check in description
    if (caseItem.description) {
      if (compartmentKeywords.some(keyword => 
        caseItem.description?.toLowerCase().includes(keyword)
      )) {
        return true;
      }
    }
    
    // Check in features
    if (caseItem.features) {
      if (caseItem.features.some(feature => 
        compartmentKeywords.some(keyword => feature?.toLowerCase().includes(keyword))
      )) {
        return true;
      }
    }
    
    // Check in name
    if (compartmentKeywords.some(keyword => 
      caseItem.name?.toLowerCase().includes(keyword)
    )) {
      return true;
    }
    
    return false;
  }

  /**
   * Convert weight to pounds for comparison
   */
  private convertWeightToLb(value: number, unit: string): number {
    switch (unit.toLowerCase()) {
      case 'kg':
        return value * 2.20462;
      case 'g':
        return value * 0.00220462;
      case 'oz':
        return value * 0.0625;
      case 'lb':
      default:
        return value;
    }
  }

  /**
   * Determine recommended protection level based on gear type and characteristics
   */
  private getRecommendedProtectionLevel(gear: IAudioGear): 'low' | 'medium' | 'high' {
    // High-value or sensitive equipment needs high protection
    if (
      gear.category === 'Synthesizer' || 
      gear.category === 'Mixer' ||
      gear.type?.includes('Analog') ||
      gear.type?.includes('Vintage')
    ) {
      return 'high';
    }
    
    // Medium-value equipment needs medium protection
    if (
      gear.category === 'Drum Machine' ||
      gear.category === 'Audio Interface' ||
      gear.type?.includes('Digital')
    ) {
      return 'medium';
    }
    
    // Lower-value or robust equipment can use low protection
    if (
      gear.category === 'Effects Pedal' ||
      gear.type?.includes('Pedal')
    ) {
      return 'low';
    }
    
    // Default to medium protection
    return 'medium';
  }
}
