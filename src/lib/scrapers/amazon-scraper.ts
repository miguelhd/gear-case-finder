import { BaseScraper, ScraperOptions, ScrapedProduct } from './base-scraper';
import { JSDOM } from 'jsdom';
import { extractDimensions, extractWeight, normalizeProductTitle, extractPrice } from './utils';
import * as cheerio from 'cheerio';

export interface AmazonScraperOptions extends ScraperOptions {
  country?: 'us' | 'uk' | 'ca' | 'de' | 'fr' | 'es' | 'it' | 'jp';
}

export class AmazonScraper extends BaseScraper {
  private baseUrl: string;
  
  constructor(options: AmazonScraperOptions = {}) {
    super(options);
    
    // Set the base URL based on the country
    const country = options.country || 'us';
    const countryTLDs = {
      'us': 'com',
      'uk': 'co.uk',
      'ca': 'ca',
      'de': 'de',
      'fr': 'fr',
      'es': 'es',
      'it': 'it',
      'jp': 'co.jp'
    };
    
    this.baseUrl = `https://www.amazon.${countryTLDs[country]}`;
  }
  
  /**
   * Search for products on Amazon
   */
  async searchProducts(query: string, options: { page?: number, category?: string } = {}): Promise<ScrapedProduct[]> {
    const page = options.page || 1;
    const category = options.category || 'aps'; // Default to all categories
    
    // Construct the search URL
    const searchUrl = `${this.baseUrl}/s?k=${encodeURIComponent(query)}&page=${page}&i=${category}`;
    
    try {
      const response = await this.fetchWithRetry(searchUrl);
      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];
      
      // Extract product data from search results
      $('.s-result-item[data-asin]:not([data-asin=""])').each((_, element) => {
        const asin = $(element).attr('data-asin') || '';
        if (!asin) return; // Skip items without ASIN
        
        const titleElement = $(element).find('h2 a.a-link-normal span');
        const title = normalizeProductTitle(titleElement.text().trim());
        
        const priceElement = $(element).find('.a-price .a-offscreen');
        const priceText = priceElement.first().text().trim();
        const priceData = extractPrice(priceText);
        
        const imageElement = $(element).find('img.s-image');
        const imageUrl = imageElement.attr('src') || '';
        
        const productUrl = `${this.baseUrl}/dp/${asin}`;
        
        const ratingElement = $(element).find('i.a-icon-star-small');
        const ratingText = ratingElement.text().trim();
        const rating = ratingText ? parseFloat(ratingText.split(' ')[0]) : undefined;
        
        const reviewCountElement = $(element).find('span.a-size-base.s-underline-text');
        const reviewCountText = reviewCountElement.text().trim().replace(/[(),]/g, '');
        const reviewCount = reviewCountText ? parseInt(reviewCountText, 10) : undefined;
        
        products.push({
          id: asin,
          title,
          description: '',  // Need product details page for full description
          price: priceData?.price || 0,
          currency: priceData?.currency || 'USD',
          url: productUrl,
          imageUrls: imageUrl ? [imageUrl] : [],
          marketplace: 'amazon',
          rating,
          reviewCount,
          scrapedAt: new Date()
        });
      });
      
      return products;
    } catch (error) {
      console.error('Error searching Amazon products:', error);
      return [];
    }
  }
  
  /**
   * Get detailed information about a specific product
   */
  async getProductDetails(productId: string): Promise<ScrapedProduct> {
    const productUrl = `${this.baseUrl}/dp/${productId}`;
    
    try {
      const response = await this.fetchWithRetry(productUrl);
      const dom = new JSDOM(response.data);
      const document = dom.window.document;
      
      // Extract product title
      const titleElement = document.querySelector('#productTitle');
      const title = normalizeProductTitle(titleElement?.textContent?.trim() || '');
      
      // Extract product price
      const priceElement = document.querySelector('.a-price .a-offscreen');
      const priceText = priceElement?.textContent?.trim() || '';
      const priceData = extractPrice(priceText);
      
      // Extract product images
      const imageElements = document.querySelectorAll('#imgTagWrapperId img, #imageBlock img.a-dynamic-image');
      const imageUrls: string[] = [];
      imageElements.forEach(img => {
        const src = img.getAttribute('src');
        const dataSrc = img.getAttribute('data-old-hires') || img.getAttribute('data-a-dynamic-image');
        
        if (dataSrc && dataSrc.startsWith('{')) {
          try {
            const imageData = JSON.parse(dataSrc);
            const urls = Object.keys(imageData);
            if (urls.length > 0) {
              imageUrls.push(urls[0]);
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        } else if (src && !src.includes('transparent-pixel')) {
          imageUrls.push(src);
        }
      });
      
      // Extract product description
      const descriptionElement = document.querySelector('#productDescription');
      const featureBullets = document.querySelector('#feature-bullets');
      let description = '';
      
      if (descriptionElement) {
        description = descriptionElement.textContent?.trim() || '';
      }
      
      // Extract product features
      const features: string[] = [];
      const featureElements = document.querySelectorAll('#feature-bullets li');
      featureElements.forEach(li => {
        const text = li.textContent?.trim();
        if (text) features.push(text);
      });
      
      // Extract product dimensions
      const dimensionsElement = document.querySelector('.product-information tr:has(th:contains("Dimensions")) td');
      const dimensionsText = dimensionsElement?.textContent?.trim();
      const dimensions = dimensionsText ? extractDimensions(dimensionsText) : undefined;
      
      // Extract product weight
      const weightElement = document.querySelector('.product-information tr:has(th:contains("Weight")) td');
      const weightText = weightElement?.textContent?.trim();
      const weight = weightText ? extractWeight(weightText) : undefined;
      
      // Extract product rating
      const ratingElement = document.querySelector('#acrPopover');
      const ratingText = ratingElement?.getAttribute('title')?.trim() || '';
      const rating = ratingText ? parseFloat(ratingText.split(' ')[0]) : undefined;
      
      // Extract review count
      const reviewCountElement = document.querySelector('#acrCustomerReviewText');
      const reviewCountText = reviewCountElement?.textContent?.trim() || '';
      const reviewCount = reviewCountText ? parseInt(reviewCountText.replace(/[^0-9]/g, ''), 10) : undefined;
      
      // Extract availability
      const availabilityElement = document.querySelector('#availability');
      const availability = availabilityElement?.textContent?.trim() || '';
      
      // Extract seller information
      const sellerElement = document.querySelector('#merchant-info');
      const sellerText = sellerElement?.textContent?.trim() || '';
      const sellerName = sellerText.includes('sold by') ? sellerText.split('sold by')[1].trim() : undefined;
      
      // Extract category
      const categoryElement = document.querySelector('#wayfinding-breadcrumbs_feature_div');
      const category = categoryElement?.textContent?.trim().split('\n').pop()?.trim() || '';
      
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
        marketplace: 'amazon',
        rating,
        reviewCount,
        availability,
        seller: {
          name: sellerName
        },
        category,
        features,
        scrapedAt: new Date()
      };
    } catch (error) {
      console.error(`Error fetching Amazon product details for ${productId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get products by category
   */
  async getProductsByCategory(category: string, options: { page?: number } = {}): Promise<ScrapedProduct[]> {
    const page = options.page || 1;
    
    // Construct the category URL
    const categoryUrl = `${this.baseUrl}/s?i=${category}&page=${page}`;
    
    try {
      // Reuse the search products method as the page structure is similar
      const response = await this.fetchWithRetry(categoryUrl);
      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];
      
      // Extract product data from category results (same as search results)
      $('.s-result-item[data-asin]:not([data-asin=""])').each((_, element) => {
        const asin = $(element).attr('data-asin') || '';
        if (!asin) return; // Skip items without ASIN
        
        const titleElement = $(element).find('h2 a.a-link-normal span');
        const title = normalizeProductTitle(titleElement.text().trim());
        
        const priceElement = $(element).find('.a-price .a-offscreen');
        const priceText = priceElement.first().text().trim();
        const priceData = extractPrice(priceText);
        
        const imageElement = $(element).find('img.s-image');
        const imageUrl = imageElement.attr('src') || '';
        
        const productUrl = `${this.baseUrl}/dp/${asin}`;
        
        const ratingElement = $(element).find('i.a-icon-star-small');
        const ratingText = ratingElement.text().trim();
        const rating = ratingText ? parseFloat(ratingText.split(' ')[0]) : undefined;
        
        const reviewCountElement = $(element).find('span.a-size-base.s-underline-text');
        const reviewCountText = reviewCountElement.text().trim().replace(/[(),]/g, '');
        const reviewCount = reviewCountText ? parseInt(reviewCountText, 10) : undefined;
        
        products.push({
          id: asin,
          title,
          description: '',  // Need product details page for full description
          price: priceData?.price || 0,
          currency: priceData?.currency || 'USD',
          url: productUrl,
          imageUrls: imageUrl ? [imageUrl] : [],
          marketplace: 'amazon',
          rating,
          reviewCount,
          scrapedAt: new Date()
        });
      });
      
      return products;
    } catch (error) {
      console.error('Error fetching Amazon category products:', error);
      return [];
    }
  }
}
