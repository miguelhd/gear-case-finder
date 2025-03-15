import axios from 'axios';
import cheerio from 'cheerio';
import { AudioGear, Case } from '../types';

// Function to scrape gear data from music equipment websites
export async function scrapeGearData(url: string): Promise<AudioGear[]> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const gearItems: AudioGear[] = [];
    
    // This is a simplified example - actual implementation would depend on the website structure
    // For demonstration purposes, we'll assume a generic product listing page
    
    $('.product-item').each((index, element) => {
      const name = $(element).find('.product-name').text().trim();
      const brand = $(element).find('.product-brand').text().trim();
      const type = $(element).find('.product-type').text().trim();
      const imageUrl = $(element).find('.product-image img').attr('src');
      
      // Extract dimensions if available
      const dimensionsText = $(element).find('.product-dimensions').text().trim();
      let dimensions;
      
      if (dimensionsText) {
        // Parse dimensions from text like "50 x 30 x 15 cm"
        const dims = dimensionsText.split('x').map(d => parseFloat(d.trim()));
        if (dims.length === 3) {
          dimensions = {
            width: dims[0],
            height: dims[1],
            depth: dims[2]
          };
        }
      }
      
      // Extract weight if available
      const weightText = $(element).find('.product-weight').text().trim();
      let weight;
      
      if (weightText) {
        // Parse weight from text like "2.8 kg"
        const weightMatch = weightText.match(/(\d+(\.\d+)?)/);
        if (weightMatch) {
          weight = parseFloat(weightMatch[1]);
        }
      }
      
      // Create gear item
      const gear: AudioGear = {
        id: `scraped-${index + 1}`,
        name,
        brand,
        type,
        imageUrl,
        dimensions,
        weight
      };
      
      gearItems.push(gear);
    });
    
    return gearItems;
  } catch (error) {
    console.error('Error scraping gear data:', error);
    return [];
  }
}

// Function to scrape case data from case manufacturer websites
export async function scrapeCaseData(url: string): Promise<Case[]> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const caseItems: Case[] = [];
    
    // This is a simplified example - actual implementation would depend on the website structure
    // For demonstration purposes, we'll assume a generic product listing page
    
    $('.case-item').each((index, element) => {
      const name = $(element).find('.case-name').text().trim();
      const brand = $(element).find('.case-brand').text().trim();
      const type = $(element).find('.case-type').text().trim();
      const imageUrl = $(element).find('.case-image img').attr('src');
      
      // Extract dimensions if available
      const innerDimensionsText = $(element).find('.case-inner-dimensions').text().trim();
      const outerDimensionsText = $(element).find('.case-outer-dimensions').text().trim();
      
      let dimensions;
      
      if (innerDimensionsText && outerDimensionsText) {
        // Parse inner dimensions from text like "50 x 30 x 15 cm"
        const innerDims = innerDimensionsText.split('x').map(d => parseFloat(d.trim()));
        // Parse outer dimensions from text like "55 x 35 x 20 cm"
        const outerDims = outerDimensionsText.split('x').map(d => parseFloat(d.trim()));
        
        if (innerDims.length === 3 && outerDims.length === 3) {
          dimensions = {
            innerWidth: innerDims[0],
            innerHeight: innerDims[1],
            innerDepth: innerDims[2],
            outerWidth: outerDims[0],
            outerHeight: outerDims[1],
            outerDepth: outerDims[2]
          };
        }
      }
      
      // Extract max weight if available
      const maxWeightText = $(element).find('.case-max-weight').text().trim();
      let maxWeight = 0;
      
      if (maxWeightText) {
        // Parse max weight from text like "5 kg"
        const weightMatch = maxWeightText.match(/(\d+(\.\d+)?)/);
        if (weightMatch) {
          maxWeight = parseFloat(weightMatch[1]);
        }
      }
      
      // Extract price if available
      const priceText = $(element).find('.case-price').text().trim();
      let price;
      
      if (priceText) {
        // Parse price from text like "$129.99"
        const priceMatch = priceText.match(/(\d+(\.\d+)?)/);
        if (priceMatch) {
          price = parseFloat(priceMatch[1]);
        }
      }
      
      // Extract features if available
      const features: string[] = [];
      $(element).find('.case-features li').each((i, featureElement) => {
        features.push($(featureElement).text().trim());
      });
      
      // Create case item
      const caseItem: Case = {
        id: `scraped-${index + 1}`,
        name,
        brand,
        type,
        dimensions: dimensions || {
          innerWidth: 0,
          innerHeight: 0,
          innerDepth: 0,
          outerWidth: 0,
          outerHeight: 0,
          outerDepth: 0
        },
        maxWeight,
        imageUrl,
        price,
        features: features.length > 0 ? features : undefined
      };
      
      caseItems.push(caseItem);
    });
    
    return caseItems;
  } catch (error) {
    console.error('Error scraping case data:', error);
    return [];
  }
}

// Function to find compatible cases for a specific gear item
export function findCompatibleCases(gear: AudioGear, cases: Case[]): Case[] {
  if (!gear.dimensions) {
    return [];
  }
  
  // Find cases that can fit the gear
  const compatibleCases = cases.filter(caseItem => {
    // Add some tolerance (e.g., case should be at least 1cm larger in each dimension)
    const tolerance = 1;
    return (
      caseItem.dimensions.innerWidth >= gear.dimensions!.width + tolerance &&
      caseItem.dimensions.innerHeight >= gear.dimensions!.height + tolerance &&
      caseItem.dimensions.innerDepth >= gear.dimensions!.depth + tolerance &&
      (gear.weight === undefined || caseItem.maxWeight >= gear.weight)
    );
  });
  
  // Calculate fit score for each compatible case
  const casesWithScores = compatibleCases.map(caseItem => {
    const fitScore = calculateFitScore(gear, caseItem);
    return { ...caseItem, fitScore };
  });
  
  // Sort by fit score (highest first)
  casesWithScores.sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0));
  
  return casesWithScores;
}

// Function to calculate fit score between gear and case
export function calculateFitScore(gear: AudioGear, caseItem: Case): number {
  if (!gear.dimensions) return 0;
  
  // Calculate how well the gear fits in the case (higher is better)
  const widthFit = caseItem.dimensions.innerWidth - gear.dimensions.width;
  const heightFit = caseItem.dimensions.innerHeight - gear.dimensions.height;
  const depthFit = caseItem.dimensions.innerDepth - gear.dimensions.depth;
  
  // If any dimension is negative, the gear doesn't fit
  if (widthFit < 0 || heightFit < 0 || depthFit < 0) {
    return 0;
  }
  
  // If the gear is too heavy, it doesn't fit
  if (gear.weight && gear.weight > caseItem.maxWeight) {
    return 0;
  }
  
  // Calculate fit score - perfect fit would be close to 100
  // Too much extra space reduces the score
  const idealExtraSpace = 2; // cm
  const maxExtraSpace = 10; // cm
  
  const widthScore = 100 - Math.min(100, Math.max(0, Math.abs(widthFit - idealExtraSpace) / maxExtraSpace * 100));
  const heightScore = 100 - Math.min(100, Math.max(0, Math.abs(heightFit - idealExtraSpace) / maxExtraSpace * 100));
  const depthScore = 100 - Math.min(100, Math.max(0, Math.abs(depthFit - idealExtraSpace) / maxExtraSpace * 100));
  
  // Average the scores
  return Math.round((widthScore + heightScore + depthScore) / 3);
}
