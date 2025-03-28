/**
 * AliExpress Data Mapper
 * 
 * This module provides mapping functions to transform AliExpress API responses
 * into standardized formats used by the application.
 */

interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit?: string;
}

interface MappedProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl: string;
  additionalImages?: string[];
  url: string;
  dimensions?: ProductDimensions;
  weight?: number;
  weightUnit?: string;
  brand?: string;
  category?: string;
  source: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  shippingInfo?: any;
}

export class AliExpressDataMapper {
  /**
   * Map a single product from AliExpress API response to the application's standard format
   */
  mapProduct(product: any): MappedProduct | null {
    if (!product) return null;
    
    try {
      // Extract dimensions from the product specifications if available
      const dimensions = this.extractDimensions(product);
      
      // Extract weight from the product specifications if available
      const weightInfo = this.extractWeight(product);
      
      return {
        id: product.product_id || '',
        title: product.title || '',
        description: product.description || '',
        price: parseFloat(product.sale_price) || 0,
        currency: product.currency || 'USD',
        imageUrl: this.getMainImageUrl(product),
        additionalImages: this.getAdditionalImageUrls(product),
        url: product.product_url || '',
        dimensions: dimensions,
        weight: weightInfo.weight,
        weightUnit: weightInfo.unit,
        brand: product.brand || '',
        category: product.category_id || '',
        source: 'aliexpress',
        rating: parseFloat(product.evaluation_rating) || 0,
        reviewCount: parseInt(product.evaluation_count) || 0,
        inStock: true // Assuming products returned by API are in stock
      };
    } catch (error) {
      console.error('Error mapping AliExpress product:', error);
      return null;
    }
  }

  /**
   * Map multiple products from AliExpress API response
   */
  mapProducts(products: any[]): MappedProduct[] {
    if (!products || !Array.isArray(products)) return [];
    
    return products
      .map(product => this.mapProduct(product))
      .filter((product): product is MappedProduct => product !== null);
  }

  /**
   * Extract dimensions from product specifications
   */
  private extractDimensions(product: any): ProductDimensions | undefined {
    try {
      // Check if product has specifications
      if (!product.specifications || !Array.isArray(product.specifications)) {
        return undefined;
      }
      
      // Look for dimension-related specifications
      const dimensionSpecs = product.specifications.filter((spec: any) => {
        const name = (spec.name || '').toLowerCase();
        return name.includes('dimension') || 
               name.includes('size') || 
               name.includes('length') || 
               name.includes('width') || 
               name.includes('height');
      });
      
      if (dimensionSpecs.length === 0) return undefined;
      
      // Try to parse dimensions from specifications
      const dimensions: ProductDimensions = { unit: 'cm' };
      
      for (const spec of dimensionSpecs) {
        const value = spec.value || '';
        
        // Try to extract length, width, height
        const dimensionMatch = value.match(/(\d+\.?\d*)\s*[xX*×]\s*(\d+\.?\d*)\s*[xX*×]\s*(\d+\.?\d*)\s*(\w+)?/);
        if (dimensionMatch) {
          dimensions.length = parseFloat(dimensionMatch[1]);
          dimensions.width = parseFloat(dimensionMatch[2]);
          dimensions.height = parseFloat(dimensionMatch[3]);
          if (dimensionMatch[4]) {
            dimensions.unit = dimensionMatch[4].toLowerCase();
          }
          return dimensions;
        }
        
        // Try individual dimensions
        if (spec.name.toLowerCase().includes('length')) {
          const match = value.match(/(\d+\.?\d*)\s*(\w+)?/);
          if (match) {
            dimensions.length = parseFloat(match[1]);
            if (match[2]) dimensions.unit = match[2].toLowerCase();
          }
        } else if (spec.name.toLowerCase().includes('width')) {
          const match = value.match(/(\d+\.?\d*)\s*(\w+)?/);
          if (match) {
            dimensions.width = parseFloat(match[1]);
            if (match[2]) dimensions.unit = match[2].toLowerCase();
          }
        } else if (spec.name.toLowerCase().includes('height')) {
          const match = value.match(/(\d+\.?\d*)\s*(\w+)?/);
          if (match) {
            dimensions.height = parseFloat(match[1]);
            if (match[2]) dimensions.unit = match[2].toLowerCase();
          }
        }
      }
      
      // Return dimensions if at least one dimension was found
      if (dimensions.length || dimensions.width || dimensions.height) {
        return dimensions;
      }
      
      return undefined;
    } catch (error) {
      console.error('Error extracting dimensions:', error);
      return undefined;
    }
  }

  /**
   * Extract weight from product specifications
   */
  private extractWeight(product: any): { weight?: number, unit?: string } {
    try {
      // Check if product has specifications
      if (!product.specifications || !Array.isArray(product.specifications)) {
        return {};
      }
      
      // Look for weight-related specifications
      const weightSpecs = product.specifications.filter((spec: any) => {
        const name = (spec.name || '').toLowerCase();
        return name.includes('weight') || name.includes('mass');
      });
      
      if (weightSpecs.length === 0) return {};
      
      // Try to parse weight from specifications
      for (const spec of weightSpecs) {
        const value = spec.value || '';
        const weightMatch = value.match(/(\d+\.?\d*)\s*(\w+)?/);
        
        if (weightMatch) {
          return {
            weight: parseFloat(weightMatch[1]),
            unit: weightMatch[2]?.toLowerCase() || 'g'
          };
        }
      }
      
      return {};
    } catch (error) {
      console.error('Error extracting weight:', error);
      return {};
    }
  }

  /**
   * Get the main image URL from a product
   */
  private getMainImageUrl(product: any): string {
    if (product.main_image_url) return product.main_image_url;
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    return '';
  }

  /**
   * Get additional image URLs from a product
   */
  private getAdditionalImageUrls(product: any): string[] {
    if (product.images && Array.isArray(product.images) && product.images.length > 1) {
      return product.images.slice(1);
    }
    return [];
  }

  /**
   * Map shipping information from AliExpress API response
   */
  mapShippingInfo(shippingInfo: any): any {
    if (!shippingInfo) return null;
    
    try {
      return {
        methods: Array.isArray(shippingInfo.shipping_methods) 
          ? shippingInfo.shipping_methods.map((method: any) => ({
              name: method.name || '',
              price: parseFloat(method.price) || 0,
              currency: method.currency || 'USD',
              deliveryTime: method.delivery_time || '',
              trackingAvailable: method.tracking_available || false
            }))
          : [],
        country: shippingInfo.country || '',
        source: 'aliexpress'
      };
    } catch (error) {
      console.error('Error mapping AliExpress shipping info:', error);
      return null;
    }
  }
}

export default AliExpressDataMapper;
