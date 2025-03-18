import { ScrapedProduct } from './base-scraper';

export interface NormalizedProduct {
  id: string;
  sourceId: string;
  marketplace: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  url: string;
  imageUrls: string[];
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  weight?: {
    value?: number;
    unit?: string;
  };
  rating?: number;
  reviewCount?: number;
  availability?: string;
  seller?: {
    name?: string;
    url?: string;
    rating?: number;
  };
  category?: string;
  features?: string[];
  scrapedAt: Date;
  normalizedAt: Date;
  productType?: string;
  isCase?: boolean;
  caseCompatibility?: {
    minLength?: number;
    maxLength?: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    dimensionUnit?: string;
  };
}

export class DataNormalizer {
  /**
   * Normalize a scraped product to a common format
   */
  normalizeProduct(product: ScrapedProduct): NormalizedProduct {
    // Create a unique ID that includes the marketplace and original ID
    const id = `${product.marketplace}-${product.id}`;
    
    // Determine if the product is a case based on keywords in title and description
    const isCase = this.detectIfCase(product);
    
    // Extract case compatibility information if it's a case
    const caseCompatibility = isCase ? this.extractCaseCompatibility(product) : undefined;
    
    // Determine product type based on title and description
    const productType = this.determineProductType(product);
    
    return {
      id,
      sourceId: product.id,
      marketplace: product.marketplace,
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      url: product.url,
      imageUrls: product.imageUrls,
      dimensions: product.dimensions,
      weight: product.weight,
      rating: product.rating,
      reviewCount: product.reviewCount,
      availability: product.availability,
      seller: product.seller,
      category: product.category,
      features: product.features,
      scrapedAt: product.scrapedAt,
      normalizedAt: new Date(),
      productType,
      isCase,
      caseCompatibility
    };
  }
  
  /**
   * Normalize dimensions to a common unit (inches)
   */
  normalizeDimensions(dimensions: { length?: number; width?: number; height?: number; unit?: string }): { length?: number; width?: number; height?: number; unit: string } {
    if (!dimensions) return { unit: 'in' };
    
    const { length, width, height, unit = 'in' } = dimensions;
    let normalizedLength = length;
    let normalizedWidth = width;
    let normalizedHeight = height;
    
    // Convert to inches if necessary
    if (unit === 'cm') {
      normalizedLength = length ? length / 2.54 : undefined;
      normalizedWidth = width ? width / 2.54 : undefined;
      normalizedHeight = height ? height / 2.54 : undefined;
    } else if (unit === 'mm') {
      normalizedLength = length ? length / 25.4 : undefined;
      normalizedWidth = width ? width / 25.4 : undefined;
      normalizedHeight = height ? height / 25.4 : undefined;
    } else if (unit === 'm') {
      normalizedLength = length ? length * 39.37 : undefined;
      normalizedWidth = width ? width * 39.37 : undefined;
      normalizedHeight = height ? height * 39.37 : undefined;
    }
    
    return {
      length: normalizedLength,
      width: normalizedWidth,
      height: normalizedHeight,
      unit: 'in'
    };
  }
  
  /**
   * Normalize weight to a common unit (pounds)
   */
  normalizeWeight(weight: { value?: number; unit?: string }): { value?: number; unit: string } {
    if (!weight) return { unit: 'lb' };
    
    const { value, unit = 'lb' } = weight;
    let normalizedValue = value;
    
    // Convert to pounds if necessary
    if (unit === 'kg') {
      normalizedValue = value ? value * 2.20462 : undefined;
    } else if (unit === 'g') {
      normalizedValue = value ? value * 0.00220462 : undefined;
    } else if (unit === 'oz') {
      normalizedValue = value ? value * 0.0625 : undefined;
    }
    
    return {
      value: normalizedValue,
      unit: 'lb'
    };
  }
  
  /**
   * Detect if a product is a case based on keywords in title and description
   */
  private detectIfCase(product: ScrapedProduct): boolean {
    const caseKeywords = [
      'case', 'box', 'container', 'storage', 'organizer', 'carrying case',
      'hard case', 'soft case', 'protective case', 'travel case', 'gig bag',
      'road case', 'flight case', 'rack case', 'pedalboard', 'pedal board',
      'pedal case', 'keyboard case', 'synthesizer case', 'mixer case',
      'equipment case', 'gear case', 'instrument case', 'tackle box',
      'toolbox', 'tool box', 'makeup case', 'camera case'
    ];
    
    const title = product.title?.toLowerCase() || '';
    const description = product.description?.toLowerCase() || '';
    
    // Check if any of the case keywords appear in the title or description
    return caseKeywords.some(keyword => 
      title.includes(keyword) || description.includes(keyword)
    );
  }
  
  /**
   * Extract case compatibility information from product details
   */
  private extractCaseCompatibility(product: ScrapedProduct): {
    minLength?: number;
    maxLength?: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    dimensionUnit?: string;
  } {
    // If we have dimensions, use them as a starting point
    if (product.dimensions) {
      const normalizedDimensions = this.normalizeDimensions(product.dimensions);
      
      // Add a small buffer to the dimensions to account for padding
      const buffer = 0.5; // half an inch buffer
      
      return {
        minLength: 0,
        maxLength: normalizedDimensions.length ? normalizedDimensions.length - buffer : undefined,
        minWidth: 0,
        maxWidth: normalizedDimensions.width ? normalizedDimensions.width - buffer : undefined,
        minHeight: 0,
        maxHeight: normalizedDimensions.height ? normalizedDimensions.height - buffer : undefined,
        dimensionUnit: normalizedDimensions.unit
      };
    }
    
    // If no dimensions are available, try to extract from description or features
    const description = product.description?.toLowerCase() || '';
    const features = product.features ? product.features.join(' ').toLowerCase() : '';
    const combinedText = `${description} ${features}`;
    
    // Look for phrases like "fits items up to X x Y x Z inches"
    const dimensionPatterns = [
      /fits items up to (\d+(\.\d+)?)\s*[xX×]\s*(\d+(\.\d+)?)\s*[xX×]\s*(\d+(\.\d+)?)\s*(inch(?:es)?|in|cm|mm)/i,
      /internal dimensions:?\s*(\d+(\.\d+)?)\s*[xX×]\s*(\d+(\.\d+)?)\s*[xX×]\s*(\d+(\.\d+)?)\s*(inch(?:es)?|in|cm|mm)/i,
      /inside dimensions:?\s*(\d+(\.\d+)?)\s*[xX×]\s*(\d+(\.\d+)?)\s*[xX×]\s*(\d+(\.\d+)?)\s*(inch(?:es)?|in|cm|mm)/i,
      /interior dimensions:?\s*(\d+(\.\d+)?)\s*[xX×]\s*(\d+(\.\d+)?)\s*[xX×]\s*(\d+(\.\d+)?)\s*(inch(?:es)?|in|cm|mm)/i
    ];
    
    for (const pattern of dimensionPatterns) {
      const match = combinedText.match(pattern);
      if (match) {
        const [_, length, __, width, ___, height, ____, unit] = match;
        const unitStr = unit.toLowerCase().replace(/es$/, '');
        
        // Convert dimensions to inches if necessary
        let lengthVal = parseFloat(length);
        let widthVal = parseFloat(width);
        let heightVal = parseFloat(height);
        let dimensionUnit = 'in';
        
        if (unitStr === 'cm') {
          lengthVal = lengthVal / 2.54;
          widthVal = widthVal / 2.54;
          heightVal = heightVal / 2.54;
        } else if (unitStr === 'mm') {
          lengthVal = lengthVal / 25.4;
          widthVal = widthVal / 25.4;
          heightVal = heightVal / 25.4;
        }
        
        return {
          minLength: 0,
          maxLength: lengthVal,
          minWidth: 0,
          maxWidth: widthVal,
          minHeight: 0,
          maxHeight: heightVal,
          dimensionUnit
        };
      }
    }
    
    // If no specific compatibility information is found, return undefined
    return undefined;
  }
  
  /**
   * Determine product type based on title and description
   */
  private determineProductType(product: ScrapedProduct): string {
    const title = product.title?.toLowerCase() || '';
    const description = product.description?.toLowerCase() || '';
    const combinedText = `${title} ${description}`;
    
    // Define product type keywords
    const productTypes: Record<string, string[]> = {
      'synthesizer': ['synthesizer', 'synth', 'keyboard', 'workstation', 'digital piano', 'analog synth'],
      'mixer': ['mixer', 'mixing console', 'audio mixer', 'dj mixer', 'mixing desk'],
      'sampler': ['sampler', 'drum machine', 'beat maker', 'groove box', 'sequencer'],
      'effects pedal': ['pedal', 'effects pedal', 'guitar pedal', 'stompbox', 'multi-effects'],
      'audio interface': ['audio interface', 'sound card', 'recording interface'],
      'case': ['case', 'bag', 'container', 'organizer', 'box', 'storage'],
      'microphone': ['microphone', 'mic', 'condenser', 'dynamic mic'],
      'headphones': ['headphones', 'earphones', 'earbuds', 'monitors', 'studio headphones'],
      'speaker': ['speaker', 'monitor', 'studio monitor', 'pa system'],
      'cable': ['cable', 'wire', 'connector', 'adapter', 'midi cable', 'audio cable']
    };
    
    // Check each product type
    for (const [type, keywords] of Object.entries(productTypes)) {
      if (keywords.some(keyword => combinedText.includes(keyword))) {
        return type;
      }
    }
    
    // Default to 'other' if no specific type is detected
    return 'other';
  }
  
  /**
   * Batch normalize multiple products
   */
  normalizeProducts(products: ScrapedProduct[]): NormalizedProduct[] {
    return products.map(product => this.normalizeProduct(product));
  }
}
