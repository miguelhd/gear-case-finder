/**
 * Amazon Product Data Mapper
 * 
 * This module provides functions to map Amazon Product Advertising API responses
 * to the internal data models used in the Gear Case Finder application.
 */

import { AudioGear, Case } from '../models/gear-models';

/**
 * Extract dimensions from Amazon product attributes
 */
function extractDimensions(item: any): any {
  try {
    const dimensions: any = {};
    
    if (item.ItemInfo?.TechnicalInfo?.TechnicalAttributes) {
      const attributes = item.ItemInfo.TechnicalInfo.TechnicalAttributes;
      
      for (const attr of attributes) {
        if (attr.Name?.toLowerCase().includes('length')) {
          dimensions.length = parseFloat(attr.Value.split(' ')[0]);
        } else if (attr.Name?.toLowerCase().includes('width')) {
          dimensions.width = parseFloat(attr.Value.split(' ')[0]);
        } else if (attr.Name?.toLowerCase().includes('height')) {
          dimensions.height = parseFloat(attr.Value.split(' ')[0]);
        }
      }
      
      // Try to determine the unit from any dimension value
      for (const attr of attributes) {
        if (attr.Value && (attr.Name?.toLowerCase().includes('length') || 
                          attr.Name?.toLowerCase().includes('width') || 
                          attr.Name?.toLowerCase().includes('height'))) {
          const parts = attr.Value.split(' ');
          if (parts.length > 1) {
            dimensions.unit = parts[1].replace(/[^a-zA-Z]/g, ''); // Extract only letters for unit
            break;
          }
        }
      }
    }
    
    return dimensions;
  } catch (error) {
    console.error('Error extracting dimensions:', error);
    return {};
  }
}

/**
 * Extract weight from Amazon product attributes
 */
function extractWeight(item: any): any {
  try {
    const weight: any = {};
    
    if (item.ItemInfo?.TechnicalInfo?.TechnicalAttributes) {
      const attributes = item.ItemInfo.TechnicalInfo.TechnicalAttributes;
      
      for (const attr of attributes) {
        if (attr.Name?.toLowerCase().includes('weight')) {
          const parts = attr.Value.split(' ');
          weight.value = parseFloat(parts[0]);
          if (parts.length > 1) {
            weight.unit = parts[1].replace(/[^a-zA-Z]/g, ''); // Extract only letters for unit
          }
          break;
        }
      }
    }
    
    return weight;
  } catch (error) {
    console.error('Error extracting weight:', error);
    return {};
  }
}

/**
 * Determine if a product is likely a case based on its attributes
 */
function isLikelyCase(item: any): boolean {
  try {
    // Check title for case-related keywords
    const title = item.ItemInfo?.Title?.DisplayValue || '';
    const caseKeywords = ['case', 'bag', 'cover', 'carrying', 'protection', 'protective'];
    
    for (const keyword of caseKeywords) {
      if (title.toLowerCase().includes(keyword)) {
        return true;
      }
    }
    
    // Check features for case-related keywords
    const features = item.ItemInfo?.Features?.DisplayValues || [];
    for (const feature of features) {
      for (const keyword of caseKeywords) {
        if (feature.toLowerCase().includes(keyword)) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error determining if product is a case:', error);
    return false;
  }
}

/**
 * Map Amazon product data to AudioGear model
 */
export function mapToAudioGear(item: any): AudioGear {
  try {
    const dimensions = extractDimensions(item);
    const weight = extractWeight(item);
    
    // Extract price information
    let price = 0;
    let currency = 'USD';
    
    if (item.Offers?.Listings && item.Offers.Listings.length > 0) {
      const listing = item.Offers.Listings[0];
      if (listing.Price) {
        price = listing.Price.Amount || 0;
        currency = listing.Price.Currency || 'USD';
      }
    }
    
    // Extract features
    const features = item.ItemInfo?.Features?.DisplayValues || [];
    
    // Determine product type from title and features
    let type = 'unknown';
    const title = item.ItemInfo?.Title?.DisplayValue || '';
    
    if (title.toLowerCase().includes('synthesizer') || title.toLowerCase().includes('synth')) {
      type = 'synthesizer';
    } else if (title.toLowerCase().includes('keyboard')) {
      type = 'keyboard';
    } else if (title.toLowerCase().includes('midi controller')) {
      type = 'midi controller';
    } else if (title.toLowerCase().includes('drum machine')) {
      type = 'drum machine';
    } else if (title.toLowerCase().includes('audio interface')) {
      type = 'audio interface';
    } else if (title.toLowerCase().includes('mixer')) {
      type = 'mixer';
    }
    
    // Create AudioGear object
    const audioGear: AudioGear = {
      name: item.ItemInfo?.Title?.DisplayValue || '',
      brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || '',
      category: 'keyboard', // Default category
      type: type,
      description: item.ItemInfo?.ProductInfo?.ProductDescription?.DisplayValue || '',
      dimensions: {
        length: dimensions.length || 0,
        width: dimensions.width || 0,
        height: dimensions.height || 0,
        unit: dimensions.unit || 'in'
      },
      weight: {
        value: weight.value || 0,
        unit: weight.unit || 'lb'
      },
      price: price,
      currency: currency,
      imageUrl: item.Images?.Primary?.Large?.URL || '',
      productUrl: item.DetailPageURL || '',
      marketplace: 'amazon',
      features: features,
      rating: 0, // Not directly available in the API response
      reviewCount: 0, // Not directly available in the API response
      updatedAt: new Date()
    };
    
    return audioGear;
  } catch (error) {
    console.error('Error mapping to AudioGear:', error);
    throw error;
  }
}

/**
 * Map Amazon product data to Case model
 */
export function mapToCase(item: any): Case {
  try {
    const dimensions = extractDimensions(item);
    
    // Extract price information
    let price = 0;
    let currency = 'USD';
    
    if (item.Offers?.Listings && item.Offers.Listings.length > 0) {
      const listing = item.Offers.Listings[0];
      if (listing.Price) {
        price = listing.Price.Amount || 0;
        currency = listing.Price.Currency || 'USD';
      }
    }
    
    // Extract features
    const features = item.ItemInfo?.Features?.DisplayValues || [];
    
    // Determine case properties from features
    let waterproof = false;
    let shockproof = false;
    let dustproof = false;
    let color = '';
    let material = '';
    let protectionLevel = 'Medium'; // Default
    
    for (const feature of features) {
      const featureLower = feature.toLowerCase();
      
      if (featureLower.includes('waterproof')) {
        waterproof = true;
      }
      
      if (featureLower.includes('shockproof') || featureLower.includes('shock proof') || 
          featureLower.includes('shock-proof') || featureLower.includes('impact')) {
        shockproof = true;
      }
      
      if (featureLower.includes('dustproof') || featureLower.includes('dust proof') || 
          featureLower.includes('dust-proof')) {
        dustproof = true;
      }
      
      // Try to extract color
      const colorKeywords = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 
                            'purple', 'pink', 'brown', 'gray', 'grey', 'silver', 'gold'];
      
      for (const colorKeyword of colorKeywords) {
        if (featureLower.includes(colorKeyword)) {
          color = colorKeyword.charAt(0).toUpperCase() + colorKeyword.slice(1);
          break;
        }
      }
      
      // Try to extract material
      const materialKeywords = ['leather', 'plastic', 'nylon', 'polyester', 'aluminum', 
                               'aluminium', 'metal', 'wood', 'carbon fiber', 'rubber'];
      
      for (const materialKeyword of materialKeywords) {
        if (featureLower.includes(materialKeyword)) {
          material = materialKeyword.charAt(0).toUpperCase() + materialKeyword.slice(1);
          break;
        }
      }
      
      // Determine protection level
      if (featureLower.includes('heavy duty') || featureLower.includes('heavy-duty') || 
          featureLower.includes('rugged') || featureLower.includes('maximum protection')) {
        protectionLevel = 'High';
      } else if (featureLower.includes('light') || featureLower.includes('basic protection')) {
        protectionLevel = 'Low';
      }
    }
    
    // Create Case object
    const caseItem: Case = {
      name: item.ItemInfo?.Title?.DisplayValue || '',
      brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || '',
      type: 'case', // Default type
      description: item.ItemInfo?.ProductInfo?.ProductDescription?.DisplayValue || '',
      price: price,
      currency: currency,
      url: item.DetailPageURL || '',
      imageUrl: item.Images?.Primary?.Large?.URL || '',
      imageUrls: [item.Images?.Primary?.Large?.URL || ''],
      marketplace: 'amazon',
      dimensions: {
        interior: {
          length: dimensions.length || 0,
          width: dimensions.width || 0,
          height: dimensions.height || 0,
          unit: dimensions.unit || 'in'
        },
        exterior: {
          length: 0, // Not typically available
          width: 0,
          height: 0,
          unit: dimensions.unit || 'in'
        }
      },
      features: features,
      rating: 0, // Not directly available in the API response
      reviewCount: 0, // Not directly available in the API response
      protectionLevel: protectionLevel,
      waterproof: waterproof,
      shockproof: shockproof,
      dustproof: dustproof,
      color: color,
      material: material,
      updatedAt: new Date()
    };
    
    // Add variant images if available
    if (item.Images?.Variants) {
      for (const variant of item.Images.Variants) {
        if (variant.Large?.URL) {
          caseItem.imageUrls.push(variant.Large.URL);
        }
      }
    }
    
    return caseItem;
  } catch (error) {
    console.error('Error mapping to Case:', error);
    throw error;
  }
}

/**
 * Process Amazon search results and map to appropriate models
 */
export function processSearchResults(searchResults: any): { audioGear: AudioGear[], cases: Case[] } {
  try {
    const audioGear: AudioGear[] = [];
    const cases: Case[] = [];
    
    if (!searchResults.SearchResult?.Items) {
      return { audioGear, cases };
    }
    
    for (const item of searchResults.SearchResult.Items) {
      if (isLikelyCase(item)) {
        cases.push(mapToCase(item));
      } else {
        audioGear.push(mapToAudioGear(item));
      }
    }
    
    return { audioGear, cases };
  } catch (error) {
    console.error('Error processing search results:', error);
    return { audioGear: [], cases: [] };
  }
}

export default {
  mapToAudioGear,
  mapToCase,
  processSearchResults,
  isLikelyCase
};
