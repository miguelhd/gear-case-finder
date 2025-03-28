/**
 * Canopy API Data Mapper
 * 
 * This module provides functions to map Canopy API responses
 * to the internal data models used in the Gear Case Finder application.
 */

import { IAudioGear, ICase } from '../models/gear-models';

/**
 * Extract dimensions from Canopy product attributes
 */
function extractDimensions(item: any): any {
  try {
    const dimensions: any = {};
    
    if (item.dimensions) {
      dimensions.length = item.dimensions.length || 0;
      dimensions.width = item.dimensions.width || 0;
      dimensions.height = item.dimensions.height || 0;
      dimensions.unit = item.dimensions.unit || 'in';
    } else if (item.attributes) {
      // Try to extract dimensions from attributes if not directly provided
      const attributes = item.attributes;
      
      for (const attr of attributes) {
        if (attr.name?.toLowerCase().includes('length') || attr.name?.toLowerCase().includes('depth')) {
          dimensions.length = parseFloat(attr.value.toString());
        } else if (attr.name?.toLowerCase().includes('width')) {
          dimensions.width = parseFloat(attr.value.toString());
        } else if (attr.name?.toLowerCase().includes('height')) {
          dimensions.height = parseFloat(attr.value.toString());
        }
      }
      
      // Try to determine the unit from any dimension value
      for (const attr of attributes) {
        if (attr.value && (attr.name?.toLowerCase().includes('dimensions') || 
                          attr.name?.toLowerCase().includes('length') || 
                          attr.name?.toLowerCase().includes('width') || 
                          attr.name?.toLowerCase().includes('height'))) {
          const valueStr = attr.value.toString();
          if (valueStr.includes('in') || valueStr.includes('inch')) {
            dimensions.unit = 'in';
            break;
          } else if (valueStr.includes('cm')) {
            dimensions.unit = 'cm';
            break;
          } else if (valueStr.includes('mm')) {
            dimensions.unit = 'mm';
            break;
          }
        }
      }
      
      // Default unit if none found
      if (!dimensions.unit) {
        dimensions.unit = 'in';
      }
    }
    
    return dimensions;
  } catch (error) {
    console.error('Error extracting dimensions:', error);
    return {};
  }
}

/**
 * Extract weight from Canopy product attributes
 */
function extractWeight(item: any): any {
  try {
    const weight: any = {};
    
    if (item.weight) {
      weight.value = item.weight.value || 0;
      weight.unit = item.weight.unit || 'lb';
    } else if (item.attributes) {
      // Try to extract weight from attributes if not directly provided
      const attributes = item.attributes;
      
      for (const attr of attributes) {
        if (attr.name?.toLowerCase().includes('weight')) {
          const valueStr = attr.value.toString();
          const match = valueStr.match(/(\d+\.?\d*)\s*([a-zA-Z]+)/);
          
          if (match) {
            weight.value = parseFloat(match[1]);
            weight.unit = match[2].toLowerCase();
            
            // Normalize unit
            if (weight.unit === 'lbs' || weight.unit === 'pound' || weight.unit === 'pounds') {
              weight.unit = 'lb';
            } else if (weight.unit === 'g' || weight.unit === 'gram' || weight.unit === 'grams') {
              weight.unit = 'g';
            } else if (weight.unit === 'kg' || weight.unit === 'kilogram' || weight.unit === 'kilograms') {
              weight.unit = 'kg';
            } else if (weight.unit === 'oz' || weight.unit === 'ounce' || weight.unit === 'ounces') {
              weight.unit = 'oz';
            }
          }
          break;
        }
      }
    }
    
    // Default values if none found
    if (!weight.value) {
      weight.value = 0;
    }
    
    if (!weight.unit) {
      weight.unit = 'lb';
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
    const title = item.title || item.name || '';
    const caseKeywords = ['case', 'bag', 'cover', 'carrying', 'protection', 'protective', 'enclosure', 'container'];
    
    for (const keyword of caseKeywords) {
      if (title.toLowerCase().includes(keyword)) {
        return true;
      }
    }
    
    // Check description for case-related keywords
    const description = item.description || '';
    for (const keyword of caseKeywords) {
      if (description.toLowerCase().includes(keyword)) {
        return true;
      }
    }
    
    // Check category
    const category = item.category || '';
    if (category.toLowerCase().includes('case') || 
        category.toLowerCase().includes('bag') || 
        category.toLowerCase().includes('accessory')) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error determining if product is a case:', error);
    return false;
  }
}

/**
 * Extract brand from product data
 */
function extractBrand(item: any): string {
  try {
    if (item.brand) {
      return item.brand;
    }
    
    if (item.manufacturer) {
      return item.manufacturer;
    }
    
    if (item.attributes) {
      for (const attr of item.attributes) {
        if (attr.name?.toLowerCase() === 'brand' || attr.name?.toLowerCase() === 'manufacturer') {
          return attr.value.toString();
        }
      }
    }
    
    // Try to extract brand from title
    const title = item.title || item.name || '';
    const commonBrands = [
      'Korg', 'Roland', 'Yamaha', 'Moog', 'Arturia', 'Elektron', 'Behringer', 
      'Teenage Engineering', 'Novation', 'Akai', 'Native Instruments', 'Sequential',
      'Pelican', 'SKB', 'Gator', 'Nanuk', 'HPRC', 'Thomann', 'Sweetwater'
    ];
    
    for (const brand of commonBrands) {
      if (title.includes(brand)) {
        return brand;
      }
    }
    
    return 'Unknown';
  } catch (error) {
    console.error('Error extracting brand:', error);
    return 'Unknown';
  }
}

/**
 * Map Canopy product data to AudioGear model
 */
export function mapToAudioGear(item: any): any {
  try {
    const dimensions = extractDimensions(item);
    const weight = extractWeight(item);
    const brand = extractBrand(item);
    
    // Extract price information
    let price = 0;
    let currency = 'USD';
    
    if (item.price) {
      price = parseFloat(item.price.amount || item.price.value || item.price) || 0;
      currency = item.price.currency || 'USD';
    }
    
    // Extract features from description
    const description = item.description || '';
    const features = description
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => line.trim());
    
    // Determine product type from title and category
    let type = 'unknown';
    const title = item.title || item.name || '';
    
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
    } else if (title.toLowerCase().includes('sampler')) {
      type = 'sampler';
    } else if (title.toLowerCase().includes('groovebox')) {
      type = 'groovebox';
    }
    
    // Create AudioGear object
    const audioGear: any = {
      name: item.title || item.name || '',
      brand: brand,
      category: 'keyboard', // Default category
      type: type,
      description: item.description || '',
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
      imageUrl: item.image || (item.images && item.images.length > 0 ? item.images[0] : ''),
      productUrl: item.url || '',
      marketplace: item.marketplace || 'canopy',
      features: features,
      rating: item.rating || 0,
      reviewCount: item.reviewCount || 0,
      updatedAt: new Date()
    };
    
    return audioGear;
  } catch (error) {
    console.error('Error mapping to AudioGear:', error);
    throw error;
  }
}

/**
 * Map Canopy product data to Case model
 */
export function mapToCase(item: any): any {
  try {
    const dimensions = extractDimensions(item);
    const brand = extractBrand(item);
    
    // Extract price information
    let price = 0;
    let currency = 'USD';
    
    if (item.price) {
      price = parseFloat(item.price.amount || item.price.value || item.price) || 0;
      currency = item.price.currency || 'USD';
    }
    
    // Extract features from description
    const description = item.description || '';
    const features = description
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => line.trim());
    
    // Determine case properties from description and features
    let waterproof = false;
    let shockproof = false;
    let dustproof = false;
    let color = '';
    let material = '';
    let protectionLevel = 'Medium'; // Default
    
    const descriptionLower = description.toLowerCase();
    const title = (item.title || item.name || '').toLowerCase();
    
    if (descriptionLower.includes('waterproof') || title.includes('waterproof')) {
      waterproof = true;
    }
    
    if (descriptionLower.includes('shockproof') || descriptionLower.includes('shock proof') || 
        descriptionLower.includes('shock-proof') || descriptionLower.includes('impact') ||
        title.includes('shockproof') || title.includes('shock proof')) {
      shockproof = true;
    }
    
    if (descriptionLower.includes('dustproof') || descriptionLower.includes('dust proof') || 
        descriptionLower.includes('dust-proof') || title.includes('dustproof')) {
      dustproof = true;
    }
    
    // Try to extract color
    const colorKeywords = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 
                          'purple', 'pink', 'brown', 'gray', 'grey', 'silver', 'gold'];
    
    for (const colorKeyword of colorKeywords) {
      if (descriptionLower.includes(colorKeyword) || title.includes(colorKeyword)) {
        color = colorKeyword.charAt(0).toUpperCase() + colorKeyword.slice(1);
        break;
      }
    }
    
    // Try to extract material
    const materialKeywords = ['leather', 'plastic', 'nylon', 'polyester', 'aluminum', 
                             'aluminium', 'metal', 'wood', 'carbon fiber', 'rubber', 'foam'];
    
    for (const materialKeyword of materialKeywords) {
      if (descriptionLower.includes(materialKeyword) || title.includes(materialKeyword)) {
        material = materialKeyword.charAt(0).toUpperCase() + materialKeyword.slice(1);
        break;
      }
    }
    
    // Determine protection level
    if (descriptionLower.includes('heavy duty') || descriptionLower.includes('heavy-duty') || 
        descriptionLower.includes('rugged') || descriptionLower.includes('maximum protection') ||
        title.includes('heavy duty') || title.includes('rugged')) {
      protectionLevel = 'High';
    } else if (descriptionLower.includes('light') || descriptionLower.includes('basic protection') ||
              title.includes('light') || title.includes('basic')) {
      protectionLevel = 'Low';
    }
    
    // Create Case object
    const caseItem: any = {
      name: item.title || item.name || '',
      brand: brand,
      type: 'case', // Default type
      description: item.description || '',
      price: price,
      currency: currency,
      url: item.url || '',
      imageUrl: item.image || (item.images && item.images.length > 0 ? item.images[0] : ''),
      imageUrls: item.images || [item.image || ''],
      marketplace: item.marketplace || 'canopy',
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
      rating: item.rating || 0,
      reviewCount: item.reviewCount || 0,
      protectionLevel: protectionLevel,
      waterproof: waterproof,
      shockproof: shockproof,
      dustproof: dustproof,
      color: color,
      material: material,
      updatedAt: new Date(),
      // Add accessory space information
      accessorySpace: {
        available: true,
        dimensions: {
          length: Math.max(0, dimensions.length - 2) || 0, // Estimate accessory space
          width: Math.max(0, dimensions.width - 2) || 0,
          height: Math.max(0, dimensions.height / 4) || 0,
          unit: dimensions.unit || 'in'
        }
      }
    };
    
    return caseItem;
  } catch (error) {
    console.error('Error mapping to Case:', error);
    throw error;
  }
}

/**
 * Process Canopy search results and map to appropriate models
 */
export function processSearchResults(searchResults: any): { audioGear: any[], cases: any[] } {
  try {
    const audioGear: any[] = [];
    const cases: any[] = [];
    
    if (!searchResults.products) {
      return { audioGear, cases };
    }
    
    for (const item of searchResults.products) {
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
