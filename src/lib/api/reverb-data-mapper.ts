/**
 * Reverb Product Data Mapper
 * 
 * This module provides functions to map Reverb API responses
 * to the internal data models used in the Gear Case Finder application.
 */

import { IAudioGear, ICase } from '../models/gear-models';

/**
 * Extract dimensions from Reverb product attributes
 */
function extractDimensions(item: any): any {
  try {
    const dimensions: any = {};
    
    // Reverb doesn't provide structured dimension data, so we need to parse from description
    const description = item.description || '';
    
    // Try to extract dimensions from description using regex
    const lengthMatch = description.match(/length[:\s]+(\d+\.?\d*)\s*([a-zA-Z]+)/i);
    const widthMatch = description.match(/width[:\s]+(\d+\.?\d*)\s*([a-zA-Z]+)/i);
    const heightMatch = description.match(/height[:\s]+(\d+\.?\d*)\s*([a-zA-Z]+)/i);
    
    if (lengthMatch) {
      dimensions.length = parseFloat(lengthMatch[1]);
      dimensions.unit = lengthMatch[2].toLowerCase();
    }
    
    if (widthMatch) {
      dimensions.width = parseFloat(widthMatch[1]);
      if (!dimensions.unit) dimensions.unit = widthMatch[2].toLowerCase();
    }
    
    if (heightMatch) {
      dimensions.height = parseFloat(heightMatch[1]);
      if (!dimensions.unit) dimensions.unit = heightMatch[2].toLowerCase();
    }
    
    // Default unit if none found
    if (!dimensions.unit) dimensions.unit = 'in';
    
    return dimensions;
  } catch (error) {
    console.error('Error extracting dimensions:', error);
    return {};
  }
}

/**
 * Extract weight from Reverb product attributes
 */
function extractWeight(item: any): any {
  try {
    const weight: any = {};
    
    // Reverb doesn't provide structured weight data, so we need to parse from description
    const description = item.description || '';
    
    // Try to extract weight from description using regex
    const weightMatch = description.match(/weight[:\s]+(\d+\.?\d*)\s*([a-zA-Z]+)/i);
    
    if (weightMatch) {
      weight.value = parseFloat(weightMatch[1]);
      weight.unit = weightMatch[2].toLowerCase();
    } else {
      weight.value = 0;
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
    const title = item.title || '';
    const caseKeywords = ['case', 'bag', 'cover', 'carrying', 'protection', 'protective'];
    
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
    if (item.categories && Array.isArray(item.categories)) {
      for (const category of item.categories) {
        if (category.toLowerCase().includes('case') || 
            category.toLowerCase().includes('bag') || 
            category.toLowerCase().includes('accessory')) {
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
 * Map Reverb product data to AudioGear model
 */
export function mapToAudioGear(item: any): any {
  try {
    const dimensions = extractDimensions(item);
    const weight = extractWeight(item);
    
    // Extract price information
    let price = 0;
    let currency = 'USD';
    
    if (item.price) {
      price = parseFloat(item.price.amount) || 0;
      currency = item.price.currency || 'USD';
    }
    
    // Determine product type from title and categories
    let type = 'unknown';
    const title = item.title || '';
    
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
    
    // Extract features from description
    const description = item.description || '';
    const features = description
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => line.trim());
    
    // Create AudioGear object
    const audioGear: any = {
      name: item.title || '',
      brand: item.make || '',
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
      imageUrl: item.photos && item.photos.length > 0 ? item.photos[0].full : '',
      productUrl: item._links?.web?.href || '',
      marketplace: 'reverb',
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
 * Map Reverb product data to Case model
 */
export function mapToCase(item: any): any {
  try {
    const dimensions = extractDimensions(item);
    
    // Extract price information
    let price = 0;
    let currency = 'USD';
    
    if (item.price) {
      price = parseFloat(item.price.amount) || 0;
      currency = item.price.currency || 'USD';
    }
    
    // Extract features from description
    const description = item.description || '';
    const features = description
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => line.trim());
    
    // Determine case properties from description
    let waterproof = false;
    let shockproof = false;
    let dustproof = false;
    let color = '';
    let material = '';
    let protectionLevel = 'Medium'; // Default
    
    const descriptionLower = description.toLowerCase();
    
    if (descriptionLower.includes('waterproof')) {
      waterproof = true;
    }
    
    if (descriptionLower.includes('shockproof') || descriptionLower.includes('shock proof') || 
        descriptionLower.includes('shock-proof') || descriptionLower.includes('impact')) {
      shockproof = true;
    }
    
    if (descriptionLower.includes('dustproof') || descriptionLower.includes('dust proof') || 
        descriptionLower.includes('dust-proof')) {
      dustproof = true;
    }
    
    // Try to extract color
    const colorKeywords = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 
                          'purple', 'pink', 'brown', 'gray', 'grey', 'silver', 'gold'];
    
    for (const colorKeyword of colorKeywords) {
      if (descriptionLower.includes(colorKeyword)) {
        color = colorKeyword.charAt(0).toUpperCase() + colorKeyword.slice(1);
        break;
      }
    }
    
    // Try to extract material
    const materialKeywords = ['leather', 'plastic', 'nylon', 'polyester', 'aluminum', 
                             'aluminium', 'metal', 'wood', 'carbon fiber', 'rubber'];
    
    for (const materialKeyword of materialKeywords) {
      if (descriptionLower.includes(materialKeyword)) {
        material = materialKeyword.charAt(0).toUpperCase() + materialKeyword.slice(1);
        break;
      }
    }
    
    // Determine protection level
    if (descriptionLower.includes('heavy duty') || descriptionLower.includes('heavy-duty') || 
        descriptionLower.includes('rugged') || descriptionLower.includes('maximum protection')) {
      protectionLevel = 'High';
    } else if (descriptionLower.includes('light') || descriptionLower.includes('basic protection')) {
      protectionLevel = 'Low';
    }
    
    // Create Case object
    const caseItem: any = {
      name: item.title || '',
      brand: item.make || '',
      type: 'case', // Default type
      description: item.description || '',
      price: price,
      currency: currency,
      url: item._links?.web?.href || '',
      imageUrl: item.photos && item.photos.length > 0 ? item.photos[0].full : '',
      imageUrls: item.photos ? item.photos.map((photo: any) => photo.full) : [],
      marketplace: 'reverb',
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
    
    return caseItem;
  } catch (error) {
    console.error('Error mapping to Case:', error);
    throw error;
  }
}

/**
 * Process Reverb search results and map to appropriate models
 */
export function processSearchResults(searchResults: any): { audioGear: any[], cases: any[] } {
  try {
    const audioGear: any[] = [];
    const cases: any[] = [];
    
    if (!searchResults.listings) {
      return { audioGear, cases };
    }
    
    for (const item of searchResults.listings) {
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
