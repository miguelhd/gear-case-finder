import { BaseScraper, ScraperOptions, ScrapedProduct } from './base-scraper';
import { JSDOM } from 'jsdom';
import { extractDimensions, extractWeight, normalizeProductTitle, extractPrice } from './utils';
import * as cheerio from 'cheerio';

export interface EtsyScraperOptions extends ScraperOptions {
  region?: string;
}

export class EtsyScraper extends BaseScraper {
  private baseUrl: string;
  
  constructor(options: EtsyScraperOptions = {}) {
    super(options);
    this.baseUrl = 'https://www.etsy.com';
  }
  
  /**
   * Search for products on Etsy
   */
  async searchProducts(query: string, options: { page?: number, category?: string } = {}): Promise<ScrapedProduct[]> {
    const page = options.page || 1;
    
    // Construct the search URL
    let searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(query)}&page=${page}`;
    
    // Add category if provided
    if (options.category) {
      searchUrl += `&category=${options.category}`;
    }
    
    try {
      const response = await this.fetchWithRetry(searchUrl);
      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];
      
      // Extract product data from search results
      $('.wt-grid__item-xs-6').each((_, element) => {
        const linkElement = $(element).find('a.listing-link');
        const url = linkElement.attr('href') || '';
        
        // Extract item ID from URL
        const idMatch = url.match(/\/listing\/(\d+)/);
        const id = idMatch ? idMatch[1] : '';
        if (!id) return; // Skip items without ID
        
        const titleElement = $(element).find('.v2-listing-card__title');
        const title = normalizeProductTitle(titleElement.text().trim());
        
        const priceElement = $(element).find('.currency-value');
        const priceText = priceElement.text().trim();
        const currencySymbol = $(element).find('.currency-symbol').text().trim();
        const priceData = extractPrice(`${currencySymbol}${priceText}`);
        
        const imageElement = $(element).find('.wt-width-full img');
        const imageUrl = imageElement.attr('src') || imageElement.attr('data-src') || '';
        
        const ratingElement = $(element).find('.wt-display-inline-flex .wt-screen-reader-only');
        const ratingText = ratingElement.text().trim();
        const ratingMatch = ratingText.match(/(\d+(\.\d+)?)/);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
        
        const sellerElement = $(element).find('.wt-text-caption.wt-text-truncate');
        const sellerName = sellerElement.text().trim();
        
        products.push({
          id,
          title,
          description: '',  // Need product details page for full description
          price: priceData?.price || 0,
          currency: priceData?.currency || 'USD',
          url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
          imageUrls: imageUrl ? [imageUrl] : [],
          marketplace: 'etsy',
          rating,
          seller: {
            name: sellerName || undefined
          },
          scrapedAt: new Date()
        });
      });
      
      return products;
    } catch (error) {
      console.error('Error searching Etsy products:', error);
      return [];
    }
  }
  
  /**
   * Get detailed information about a specific product
   */
  async getProductDetails(productId: string): Promise<ScrapedProduct> {
    const productUrl = `${this.baseUrl}/listing/${productId}`;
    
    try {
      const response = await this.fetchWithRetry(productUrl);
      const dom = new JSDOM(response.data);
      const document = dom.window.document;
      
      // Extract product title
      const titleElement = document.querySelector('h1.wt-text-body-01');
      const title = normalizeProductTitle(titleElement?.textContent?.trim() || '');
      
      // Extract product price
      const priceElement = document.querySelector('.wt-text-title-03.wt-mr-xs-2');
      const priceText = priceElement?.textContent?.trim() || '';
      const priceData = extractPrice(priceText);
      
      // Extract product images
      const imageElements = document.querySelectorAll('.wt-max-width-full.wt-horizontal-center.wt-vertical-center.carousel-image');
      const imageUrls: string[] = [];
      imageElements.forEach(img => {
        const src = img.getAttribute('src') || img.getAttribute('data-src');
        if (src) {
          imageUrls.push(src);
        }
      });
      
      // Extract product description
      const descriptionElement = document.querySelector('#wt-content-toggle-product-details-read-more');
      let description = descriptionElement?.textContent?.trim() || '';
      
      if (!description) {
        // Try alternative description selector
        const altDescElement = document.querySelector('.wt-content-toggle__body');
        description = altDescElement?.textContent?.trim() || '';
      }
      
      // Extract item specifics
      const itemSpecifics: Record<string, string> = {};
      const specElements = document.querySelectorAll('.wt-pb-xs-2');
      
      specElements.forEach(element => {
        const label = element.querySelector('.wt-text-caption')?.textContent?.trim();
        const value = element.querySelector('.wt-text-body-01')?.textContent?.trim();
        
        if (label && value) {
          itemSpecifics[label] = value;
        }
      });
      
      // Extract dimensions and weight from item specifics
      let dimensions;
      let weight;
      
      for (const [key, value] of Object.entries(itemSpecifics)) {
        if (/dimensions|size|measurements/i.test(key)) {
          dimensions = extractDimensions(value);
        }
        if (/weight/i.test(key)) {
          weight = extractWeight(value);
        }
      }
      
      // Extract product rating
      const ratingElement = document.querySelector('.wt-display-inline-flex .wt-screen-reader-only');
      const ratingText = ratingElement?.textContent?.trim() || '';
      const ratingMatch = ratingText.match(/(\d+(\.\d+)?)/);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
      
      // Extract review count
      const reviewCountElement = document.querySelector('.wt-display-inline-flex .wt-text-body-01');
      const reviewCountText = reviewCountElement?.textContent?.trim() || '';
      const reviewCountMatch = reviewCountText.match(/\d+/);
      const reviewCount = reviewCountMatch ? parseInt(reviewCountMatch[0], 10) : undefined;
      
      // Extract availability
      const availabilityElement = document.querySelector('.wt-text-caption.wt-text-gray');
      const availability = availabilityElement?.textContent?.trim() || '';
      
      // Extract seller information
      const sellerNameElement = document.querySelector('.wt-text-body-01.wt-text-link');
      const sellerName = sellerNameElement?.textContent?.trim();
      
      const sellerUrlElement = document.querySelector('.wt-text-body-01.wt-text-link');
      const sellerUrl = sellerUrlElement?.getAttribute('href');
      
      // Extract category
      const categoryElement = document.querySelector('.wt-breadcrumbs');
      const category = categoryElement?.textContent?.trim().split('\n').pop()?.trim() || '';
      
      // Extract features
      const features: string[] = [];
      for (const [key, value] of Object.entries(itemSpecifics)) {
        features.push(`${key}: ${value}`);
      }
      
      // Extract shipping information
      const shippingElement = document.querySelector('.wt-text-caption.wt-text-gray.wt-mt-xs-2');
      const shippingInfo = shippingElement?.textContent?.trim();
      
      return {
        id: productId,
        title,
        description,
        price: priceData?.price || 0,
        currency: priceData?.currency || 'USD',
        url: productUrl,
        imageUrls,
        dimensions: dimensions || undefined,
        weight: weight || undefined,
        marketplace: 'etsy',
        rating,
        reviewCount,
        availability,
        seller: {
          name: sellerName,
          url: sellerUrl ? (sellerUrl.startsWith('http') ? sellerUrl : `${this.baseUrl}${sellerUrl}`) : undefined
        },
        category,
        features,
        scrapedAt: new Date()
      };
    } catch (error) {
      console.error(`Error fetching Etsy product details for ${productId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get products by category
   */
  async getProductsByCategory(category: string, options: { page?: number } = {}): Promise<ScrapedProduct[]> {
    const page = options.page || 1;
    
    // Construct the category URL
    const categoryUrl = `${this.baseUrl}/c/${category}?page=${page}`;
    
    try {
      const response = await this.fetchWithRetry(categoryUrl);
      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];
      
      // Extract product data from category results (similar to search results)
      $('.wt-grid__item-xs-6').each((_, element) => {
        const linkElement = $(element).find('a.listing-link');
        const url = linkElement.attr('href') || '';
        
        // Extract item ID from URL
        const idMatch = url.match(/\/listing\/(\d+)/);
        const id = idMatch ? idMatch[1] : '';
        if (!id) return; // Skip items without ID
        
        const titleElement = $(element).find('.v2-listing-card__title');
        const title = normalizeProductTitle(titleElement.text().trim());
        
        const priceElement = $(element).find('.currency-value');
        const priceText = priceElement.text().trim();
        const currencySymbol = $(element).find('.currency-symbol').text().trim();
        const priceData = extractPrice(`${currencySymbol}${priceText}`);
        
        const imageElement = $(element).find('.wt-width-full img');
        const imageUrl = imageElement.attr('src') || imageElement.attr('data-src') || '';
        
        const ratingElement = $(element).find('.wt-display-inline-flex .wt-screen-reader-only');
        const ratingText = ratingElement.text().trim();
        const ratingMatch = ratingText.match(/(\d+(\.\d+)?)/);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
        
        const sellerElement = $(element).find('.wt-text-caption.wt-text-truncate');
        const sellerName = sellerElement.text().trim();
        
        products.push({
          id,
          title,
          description: '',  // Need product details page for full description
          price: priceData?.price || 0,
          currency: priceData?.currency || 'USD',
          url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
          imageUrls: imageUrl ? [imageUrl] : [],
          marketplace: 'etsy',
          rating,
          seller: {
            name: sellerName || undefined
          },
          scrapedAt: new Date()
        });
      });
      
      return products;
    } catch (error) {
      console.error('Error fetching Etsy category products:', error);
      return [];
    }
  }
}
