import { randomBytes } from 'crypto';

/**
 * Generate a random user agent string to avoid detection
 */
export function randomUserAgent(): string {
  const userAgents = [
    // Chrome on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    // Chrome on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    // Firefox on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
    // Firefox on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:119.0) Gecko/20100101 Firefox/119.0',
    // Safari on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
    // Edge on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
    // Mobile User Agents
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36'
  ];
  
  const randomIndex = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomIndex];
}

/**
 * Generate a random delay between min and max milliseconds
 */
export function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Extract dimensions from a string
 * Handles various formats like "10 x 5 x 2 inches", "10x5x2 in", etc.
 */
export function extractDimensions(dimensionString: string): { length?: number; width?: number; height?: number; unit?: string } | null {
  if (!dimensionString) return null;
  
  // Common dimension patterns
  const patterns = [
    // 10 x 5 x 2 inches
    /(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)\s*(inch(?:es)?|in|cm|mm|m)/i,
    // 10x5x2 inches
    /(\d+(?:\.\d+)?)[xX×](\d+(?:\.\d+)?)[xX×](\d+(?:\.\d+)?)\s*(inch(?:es)?|in|cm|mm|m)/i,
    // 10 x 5 x 2
    /(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)/i,
    // 10x5x2
    /(\d+(?:\.\d+)?)[xX×](\d+(?:\.\d+)?)[xX×](\d+(?:\.\d+)?)/i
  ];
  
  for (const pattern of patterns) {
    const match = dimensionString.match(pattern);
    if (match) {
      const [_, length, width, height, unit] = match;
      return {
        length: parseFloat(length),
        width: parseFloat(width),
        height: parseFloat(height),
        unit: unit ? unit.toLowerCase().replace(/es$/, '') : 'in' // Default to inches if no unit specified
      };
    }
  }
  
  return null;
}

/**
 * Extract weight from a string
 * Handles various formats like "2 pounds", "2 lbs", "500g", etc.
 */
export function extractWeight(weightString: string): { value?: number; unit?: string } | null {
  if (!weightString) return null;
  
  // Common weight patterns
  const patterns = [
    // 2 pounds
    /(\d+(?:\.\d+)?)\s*(pound(?:s)?|lb(?:s)?|kilogram(?:s)?|kg|gram(?:s)?|g|oz|ounce(?:s)?)/i,
    // 2lb
    /(\d+(?:\.\d+)?)(lb|kg|g|oz)/i
  ];
  
  for (const pattern of patterns) {
    const match = weightString.match(pattern);
    if (match) {
      const [_, value, unit] = match;
      let normalizedUnit = unit.toLowerCase().replace(/s$/, '');
      
      // Normalize units
      if (normalizedUnit === 'pound' || normalizedUnit === 'lb') normalizedUnit = 'lb';
      else if (normalizedUnit === 'kilogram' || normalizedUnit === 'kg') normalizedUnit = 'kg';
      else if (normalizedUnit === 'gram' || normalizedUnit === 'g') normalizedUnit = 'g';
      else if (normalizedUnit === 'ounce' || normalizedUnit === 'oz') normalizedUnit = 'oz';
      
      return {
        value: parseFloat(value),
        unit: normalizedUnit
      };
    }
  }
  
  return null;
}

/**
 * Generate a unique ID for tracking requests
 */
export function generateRequestId(): string {
  return randomBytes(8).toString('hex');
}

/**
 * Clean and normalize product titles
 */
export function normalizeProductTitle(title: string): string {
  if (!title) return '';
  
  // Remove excessive whitespace
  let normalized = title.trim().replace(/\s+/g, ' ');
  
  // Remove common marketplace prefixes/suffixes
  normalized = normalized.replace(/^Amazon Basics:?\s*/i, '');
  normalized = normalized.replace(/\s*\(Sponsored\)$/i, '');
  normalized = normalized.replace(/\s*\(Ad\)$/i, '');
  
  return normalized;
}

/**
 * Extract price from a string
 * Handles various formats like "$10.99", "10,99 €", etc.
 */
export function extractPrice(priceString: string): { price: number; currency: string } | null {
  if (!priceString) return null;
  
  // Remove all whitespace
  const cleaned = priceString.replace(/\s/g, '');
  
  // Common price patterns with currency symbols
  const patterns = [
    // $10.99
    /\$(\d+(?:\.\d+)?)/,
    // €10.99 or 10.99€
    /€(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)€/,
    // £10.99 or 10.99£
    /£(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)£/,
    // 10.99 USD
    /(\d+(?:\.\d+)?)(USD|EUR|GBP)/i,
    // Just a number (fallback)
    /^(\d+(?:\.\d+)?)$/
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      // Determine which group captured the price
      let price;
      let currency;
      
      if (match[1] !== undefined) {
        price = parseFloat(match[1]);
        if (cleaned.includes('$')) currency = 'USD';
        else if (cleaned.includes('€')) currency = 'EUR';
        else if (cleaned.includes('£')) currency = 'GBP';
        else if (cleaned.includes('USD')) currency = 'USD';
        else if (cleaned.includes('EUR')) currency = 'EUR';
        else if (cleaned.includes('GBP')) currency = 'GBP';
        else currency = 'USD'; // Default
      } else if (match[2] !== undefined) {
        price = parseFloat(match[2]);
        if (cleaned.includes('€')) currency = 'EUR';
        else if (cleaned.includes('£')) currency = 'GBP';
        else currency = 'USD'; // Default
      }
      
      if (price !== undefined && currency !== undefined) {
        return { price, currency };
      }
    }
  }
  
  return null;
}
