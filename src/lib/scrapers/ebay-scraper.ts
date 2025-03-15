import { BaseScraper, ScraperOptions, ScrapedProduct } from './base-scraper';
import { JSDOM } from 'jsdom';
import { extractDimensions, extractWeight, normalizeProductTitle, extractPrice } from './utils';
import * as cheerio from 'cheerio';

export interface EbayScraperOptions extends ScraperOptions {
  country?: 'us' | 'uk' | 'ca' | 'au' | 'de' | 'fr' | 'it' | 'es';
}

export class EbayScraper extends BaseScraper {
  private baseUrl: string;
  
  constructor(options: EbayScraperOptions = {}) {
    super(options);
    
    // Set the base URL based on the country
    const country = options.country || 'us';
    const countryTLDs = {
      'us': 'com',
      'uk': 'co.uk',
      'ca': 'ca',
      'au': 'com.au',
      'de': 'de',
      'fr': 'fr',
      'it': 'it',
      'es': 'es'
    };
    
    this.baseUrl = `https://www.ebay.${countryTLDs[country]}`;
  }
  
  /**
   * Search for products on eBay
   */
  async searchProducts(query: string, options: { page?: number, category?: string } = {}): Promise<ScrapedProduct[]> {
    const page = options.page || 1;
    
    // Construct the search URL
    let searchUrl = `${this.baseUrl}/sch/i.html?_nkw=${encodeURIComponent(query)}&_pgn=${page}`;
    
    // Add category if provided
    if (options.category) {
      searchUrl += `&_sacat=${options.category}`;
    }
    
    try {
      const response = await this.fetchWithRetry(searchUrl);
      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];
      
      // Extract product data from search results
      $('.s-item__wrapper').each((_, element) => {
        const titleElement = $(element).find('.s-item__title');
        const title = normalizeProductTitle(titleElement.text().trim());
        
        // Skip "Shop on eBay" items
        if (title === 'Shop on eBay') return;
        
        const linkElement = $(element).find('.s-item__link');
        const url = linkElement.attr('href') || '';
        
        // Extract item ID from URL
        const idMatch = url.match(/\/itm\/(\d+)/);
        const id = idMatch ? idMatch[1] : '';
        if (!id) return; // Skip items without ID
        
        const priceElement = $(element).find('.s-item__price');
        const priceText = priceElement.text().trim();
        const priceData = extractPrice(priceText);
        
        const imageElement = $(element).find('.s-item__image-img');
        const imageUrl = imageElement.attr('src') || imageElement.attr('data-src') || '';
        
        const ratingElement = $(element).find('.x-star-rating');
        const ratingText = ratingElement.text().trim();
        const ratingMatch = ratingText.match(/(\d+(\.\d+)?)/);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
        
        const sellerNameElement = $(element).find('.s-item__seller-info-text');
        const sellerName = sellerNameElement.text().trim();
        
        const shippingElement = $(element).find('.s-item__shipping');
        const shippingText = shippingElement.text().trim();
        
        products.push({
          id,
          title,
          description: '',  // Need product details page for full description
          price: priceData?.price || 0,
          currency: priceData?.currency || 'USD',
          url,
          imageUrls: imageUrl ? [imageUrl] : [],
          marketplace: 'ebay',
          rating,
          seller: {
            name: sellerName || undefined
          },
          availability: shippingText || undefined,
          scrapedAt: new Date()
        });
      });
      
      return products;
    } catch (error) {
      console.error('Error searching eBay products:', error);
      return [];
    }
  }
  
  /**
   * Get detailed information about a specific product
   */
  async getProductDetails(productId: string): Promise<ScrapedProduct> {
    const productUrl = `${this.baseUrl}/itm/${productId}`;
    
    try {
      const response = await this.fetchWithRetry(productUrl);
      const dom = new JSDOM(response.data);
      const document = dom.window.document;
      
      // Extract product title
      const titleElement = document.querySelector('#itemTitle');
      let title = titleElement?.textContent?.trim() || '';
      // Remove "Details about" prefix if present
      title = title.replace(/^Details about\s+/i, '');
      title = normalizeProductTitle(title);
      
      // Extract product price
      const priceElement = document.querySelector('#prcIsum, #mm-saleDscPrc');
      const priceText = priceElement?.textContent?.trim() || '';
      const priceData = extractPrice(priceText);
      
      // Extract product images
      const imageElements = document.querySelectorAll('#icImg, .ux-image-carousel-item img');
      const imageUrls: string[] = [];
      imageElements.forEach(img => {
        const src = img.getAttribute('src') || img.getAttribute('data-src');
        if (src) {
          // Convert thumbnail URLs to full-size images
          const fullSizeUrl = src.replace(/\/s-l\d+\./, '/s-l1600.');
          imageUrls.push(fullSizeUrl);
        }
      });
      
      // Extract product description
      const descriptionIframe = document.querySelector('#desc_ifr');
      let description = '';
      
      if (descriptionIframe) {
        const iframeSrc = descriptionIframe.getAttribute('src');
        if (iframeSrc) {
          try {
            const iframeResponse = await this.fetchWithRetry(iframeSrc);
            const iframeDoc = new JSDOM(iframeResponse.data).window.document;
            description = iframeDoc.body.textContent?.trim() || '';
          } catch (error) {
            console.error('Error fetching eBay description iframe:', error);
          }
        }
      } else {
        // Try alternative description selectors
        const descElement = document.querySelector('#viTabs_0_is, .item-desc');
        description = descElement?.textContent?.trim() || '';
      }
      
      // Extract item specifics (including dimensions and weight)
      const itemSpecifics: Record<string, string> = {};
      const specElements = document.querySelectorAll('.ux-labels-values__labels, .ux-labels-values__values');
      
      for (let i = 0; i < specElements.length; i += 2) {
        const label = specElements[i]?.textContent?.trim();
        const value = specElements[i + 1]?.textContent?.trim();
        
        if (label && value) {
          itemSpecifics[label] = value;
        }
      }
      
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
      const ratingElement = document.querySelector('.ebay-star-rating, .star-ratings');
      const ratingText = ratingElement?.textContent?.trim() || '';
      const ratingMatch = ratingText.match(/(\d+(\.\d+)?)/);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
      
      // Extract review count
      const reviewCountElement = document.querySelector('.reviews-total-rating-count');
      const reviewCountText = reviewCountElement?.textContent?.trim() || '';
      const reviewCountMatch = reviewCountText.match(/\d+/);
      const reviewCount = reviewCountMatch ? parseInt(reviewCountMatch[0], 10) : undefined;
      
      // Extract availability
      const availabilityElement = document.querySelector('#qtySubTxt, .vi-quantity-wrapper');
      const availability = availabilityElement?.textContent?.trim() || '';
      
      // Extract seller information
      const sellerNameElement = document.querySelector('.mbg-nw');
      const sellerName = sellerNameElement?.textContent?.trim();
      
      const sellerUrlElement = document.querySelector('.mbg-nw a');
      const sellerUrl = sellerUrlElement?.getAttribute('href');
      
      const sellerRatingElement = document.querySelector('.mbg-l a');
      const sellerRatingText = sellerRatingElement?.textContent?.trim() || '';
      const sellerRatingMatch = sellerRatingText.match(/\d+/);
      const sellerRating = sellerRatingMatch ? parseFloat(sellerRatingMatch[0]) : undefined;
      
      // Extract category
      const categoryElement = document.querySelector('.breadcrumbs');
      const category = categoryElement?.textContent?.trim().split('\n').pop()?.trim() || '';
      
      // Extract features
      const features: string[] = [];
      for (const [key, value] of Object.entries(itemSpecifics)) {
        features.push(`${key}: ${value}`);
      }
      
      return {
        id: productId,
        title,
        description,
        price: priceData?.price || 0,
        currency: priceData?.currency || 'USD',
        url: productUrl,
        imageUrls,
        dimensions,
        weight,
        marketplace: 'ebay',
        rating,
        reviewCount,
        availability,
        seller: {
          name: sellerName,
          url: sellerUrl,
          rating: sellerRating
        },
        category,
        features,
        scrapedAt: new Date()
      };
    } catch (error) {
      console.error(`Error fetching eBay product details for ${productId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get products by category
   */
  async getProductsByCategory(category: string, options: { page?: number } = {}): Promise<ScrapedProduct[]> {
    const page = options.page || 1;
    
    // Construct the category URL
    const categoryUrl = `${this.baseUrl}/b/${category}?_pgn=${page}`;
    
    try {
      const response = await this.fetchWithRetry(categoryUrl);
      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];
      
      // Extract product data from category results (similar to search results)
      $('.s-item__wrapper').each((_, element) => {
        const titleElement = $(element).find('.s-item__title');
        const title = normalizeProductTitle(titleElement.text().trim());
        
        // Skip "Shop on eBay" items
        if (title === 'Shop on eBay') return;
        
        const linkElement = $(element).find('.s-item__link');
        const url = linkElement.attr('href') || '';
        
        // Extract item ID from URL
        const idMatch = url.match(/\/itm\/(\d+)/);
        const id = idMatch ? idMatch[1] : '';
        if (!id) return; // Skip items without ID
        
        const priceElement = $(element).find('.s-item__price');
        const priceText = priceElement.text().trim();
        const priceData = extractPrice(priceText);
        
        const imageElement = $(element).find('.s-item__image-img');
        const imageUrl = imageElement.attr('src') || imageElement.attr('data-src') || '';
        
        const ratingElement = $(element).find('.x-star-rating');
        const ratingText = ratingElement.text().trim();
        const ratingMatch = ratingText.match(/(\d+(\.\d+)?)/);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
        
        const sellerNameElement = $(element).find('.s-item__seller-info-text');
        const sellerName = sellerNameElement.text().trim();
        
        const shippingElement = $(element).find('.s-item__shipping');
        const shippingText = shippingElement.text().trim();
        
        products.push({
          id,
          title,
          description: '',  // Need product details page for full description
          price: priceData?.price || 0,
          currency: priceData?.currency || 'USD',
          url,
          imageUrls: imageUrl ? [imageUrl] : [],
          marketplace: 'ebay',
          rating,
          seller: {
            name: sellerName || undefined
          },
          availability: shippingText || undefined,
          scrapedAt: new Date()
        });
      });
      
      return products;
    } catch (error) {
      console.error('Error fetching eBay category products:', error);
      return [];
    }
  }
}
