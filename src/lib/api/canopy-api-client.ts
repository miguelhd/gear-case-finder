/**
 * Canopy API Client
 * 
 * This module provides a client for interacting with the Canopy API
 * to fetch product data for audio gear and protective cases across multiple marketplaces.
 */

import axios from 'axios';

interface CanopyApiConfig {
  apiKey: string;
  baseUrl?: string;
}

interface SearchItemsRequest {
  query?: string;
  category?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export class CanopyApiClient {
  private config: CanopyApiConfig;
  
  constructor(config: CanopyApiConfig) {
    this.config = {
      baseUrl: 'https://graphql.canopyapi.co',
      ...config
    };
  }

  /**
   * Generate the required headers for the Canopy API
   */
  private generateHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Execute a GraphQL query against the Canopy API
   */
  private async executeQuery(query: string, variables: any = {}): Promise<any> {
    try {
      const headers = this.generateHeaders();
      
      const response = await axios({
        method: 'post',
        url: this.config.baseUrl,
        headers: headers,
        data: {
          query,
          variables
        }
      });
      
      if (response.data.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error executing GraphQL query:', error);
      throw error;
    }
  }

  /**
   * Search for products using various criteria
   */
  async searchProducts(request: SearchItemsRequest): Promise<any> {
    try {
      const query = `
        query amazonProductSearch($input: AmazonProductSearchResultsInput!) {
          amazonProductSearch(input: $input) {
            results {
              title
              brand
              mainImageUrl
              images {
                hiRes
                large
                medium
                thumb
              }
              rating
              ratingsTotal
              price {
                display
                value
                currency
              }
              dimensions {
                length
                width
                height
                unit
              }
              weight {
                value
                unit
              }
              description
              features
              asin
              categories
              technicalDetails {
                name
                value
              }
            }
          }
        }
      `;
      
      // Build variables for the GraphQL query
      const variables = {
        input: {
          searchTerm: request.query || '',
          domain: 'US',
          limit: request.limit || 20,
          categoryId: request.category || undefined, // Initialize with category if provided
          refinements: request.minPrice || request.maxPrice ? {
            price: {
              min: request.minPrice,
              max: request.maxPrice
            }
          } : undefined // Initialize refinements if price filters are provided
        }
      };
      
      // Category and refinements are already added during initialization
      
      const result = await this.executeQuery(query, variables);
      
      // Transform the result to match the expected format
      return {
        products: result.amazonProductSearch.results.map((item: any) => ({
          title: item.title,
          brand: item.brand,
          image: item.mainImageUrl,
          images: item.images ? [
            item.images.hiRes,
            item.images.large,
            item.images.medium,
            item.images.thumb
          ].filter(Boolean) : [],
          price: item.price,
          dimensions: item.dimensions,
          weight: item.weight,
          description: item.description,
          features: item.features,
          id: item.asin,
          category: item.categories && item.categories.length > 0 ? item.categories[0] : '',
          attributes: item.technicalDetails,
          rating: item.rating,
          reviewCount: item.ratingsTotal,
          marketplace: 'amazon'
        }))
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Get detailed information for a specific product by ID
   */
  async getProduct(productId: string): Promise<any> {
    try {
      const query = `
        query amazonProduct($input: AmazonProductInput!) {
          amazonProduct(input: $input) {
            title
            brand
            mainImageUrl
            images {
              hiRes
              large
              medium
              thumb
            }
            rating
            ratingsTotal
            price {
              display
              value
              currency
            }
            dimensions {
              length
              width
              height
              unit
            }
            weight {
              value
              unit
            }
            description
            features
            asin
            categories
            technicalDetails {
              name
              value
            }
          }
        }
      `;
      
      const variables = {
        input: {
          asinLookup: {
            asin: productId
          }
        }
      };
      
      const result = await this.executeQuery(query, variables);
      
      // Transform the result to match the expected format
      const item = result.amazonProduct;
      return {
        title: item.title,
        brand: item.brand,
        image: item.mainImageUrl,
        images: item.images ? [
          item.images.hiRes,
          item.images.large,
          item.images.medium,
          item.images.thumb
        ].filter(Boolean) : [],
        price: item.price,
        dimensions: item.dimensions,
        weight: item.weight,
        description: item.description,
        features: item.features,
        id: item.asin,
        category: item.categories && item.categories.length > 0 ? item.categories[0] : '',
        attributes: item.technicalDetails,
        rating: item.rating,
        reviewCount: item.ratingsTotal,
        marketplace: 'amazon'
      };
    } catch (error) {
      console.error(`Error getting product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Search for products by dimensions (with tolerance)
   */
  async searchByDimensions(length: number, width: number, height: number, unit: string = 'in', tolerance: number = 0.5): Promise<any> {
    try {
      // For dimension search, we'll use a more general search and filter the results
      const query = `
        query amazonProductSearch($input: AmazonProductSearchResultsInput!) {
          amazonProductSearch(input: $input) {
            results {
              title
              brand
              mainImageUrl
              images {
                hiRes
                large
                medium
                thumb
              }
              rating
              ratingsTotal
              price {
                display
                value
                currency
              }
              dimensions {
                length
                width
                height
                unit
              }
              weight {
                value
                unit
              }
              description
              features
              asin
              categories
              technicalDetails {
                name
                value
              }
            }
          }
        }
      `;
      
      // Search for cases or containers
      const variables = {
        input: {
          searchTerm: 'case container box protective',
          domain: 'US',
          limit: 50
        }
      };
      
      const result = await this.executeQuery(query, variables);
      
      // Filter results by dimensions with tolerance
      const filteredProducts = result.amazonProductSearch.results.filter((item: any) => {
        if (!item.dimensions) return false;
        
        const itemLength = item.dimensions.length;
        const itemWidth = item.dimensions.width;
        const itemHeight = item.dimensions.height;
        
        // Skip items without dimensions
        if (!itemLength || !itemWidth || !itemHeight) return false;
        
        // Convert units if necessary
        const conversionFactor = item.dimensions.unit === unit ? 1 : 
                                (unit === 'in' && item.dimensions.unit === 'cm') ? 0.393701 :
                                (unit === 'cm' && item.dimensions.unit === 'in') ? 2.54 : 1;
        
        const normalizedItemLength = itemLength * conversionFactor;
        const normalizedItemWidth = itemWidth * conversionFactor;
        const normalizedItemHeight = itemHeight * conversionFactor;
        
        // Check if dimensions are within tolerance
        const lengthMin = length - tolerance;
        const lengthMax = length + tolerance;
        const widthMin = width - tolerance;
        const widthMax = width + tolerance;
        const heightMin = height - tolerance;
        const heightMax = height + tolerance;
        
        return (normalizedItemLength >= lengthMin && normalizedItemLength <= lengthMax) ||
               (normalizedItemWidth >= widthMin && normalizedItemWidth <= widthMax) ||
               (normalizedItemHeight >= heightMin && normalizedItemHeight <= heightMax);
      });
      
      // Transform the result to match the expected format
      return {
        products: filteredProducts.map((item: any) => ({
          title: item.title,
          brand: item.brand,
          image: item.mainImageUrl,
          images: item.images ? [
            item.images.hiRes,
            item.images.large,
            item.images.medium,
            item.images.thumb
          ].filter(Boolean) : [],
          price: item.price,
          dimensions: item.dimensions,
          weight: item.weight,
          description: item.description,
          features: item.features,
          id: item.asin,
          category: item.categories && item.categories.length > 0 ? item.categories[0] : '',
          attributes: item.technicalDetails,
          rating: item.rating,
          reviewCount: item.ratingsTotal,
          marketplace: 'amazon'
        }))
      };
    } catch (error) {
      console.error('Error searching products by dimensions:', error);
      throw error;
    }
  }

  /**
   * Search for audio gear on various marketplaces
   */
  async searchAudioGear(keywords: string, limit: number = 20): Promise<any> {
    return this.searchProducts({
      query: keywords + ' synthesizer keyboard "desktop synth"',
      category: 'electronics',
      limit: limit
    });
  }

  /**
   * Search for protective cases on various marketplaces
   */
  async searchCases(keywords: string, limit: number = 20): Promise<any> {
    return this.searchProducts({
      query: keywords + ' case protective container',
      limit: limit
    });
  }

  /**
   * Search for cases that match specific gear dimensions
   */
  async searchCasesByGearDimensions(gear: { length: number, width: number, height: number, unit: string }, tolerance: number = 0.5): Promise<any> {
    return this.searchByDimensions(
      gear.length,
      gear.width,
      gear.height,
      gear.unit,
      tolerance
    );
  }
}

export default CanopyApiClient;
