import { BaseScraper, ScraperOptions, ScrapedProduct } from './base-scraper';
import { JSDOM } from 'jsdom';
import { extractDimensions, extractWeight, normalizeProductTitle, extractPrice } from './utils';
import * as cheerio from 'cheerio';

export interface TemuScraperOptions extends ScraperOptions {
  region?: string;
}

export class TemuScraper extends BaseScraper {
  private baseUrl: string;
  
  constructor(options: TemuScraperOptions = {}) {
    super(options);
    this.baseUrl = 'https://www.temu.com';
  }
  
  /**
   * Search for products on Temu
   */
  async searchProducts(query: string, options: { page?: number, category?: string } = {}): Promise<ScrapedProduct[]> {
    const page = options.page || 1;
    
    // Construct the search URL
    let searchUrl = `${this.baseUrl}/search_result.html?search_key=${encodeURIComponent(query)}&page=${page}`;
    
    // Add category if provided
    if (options.category) {
      searchUrl += `&category=${options.category}`;
    }
    
    try {
      const response = await this.fetchWithRetry(searchUrl);
      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];
      
      // Try to extract the product data from the script tag
      // Temu stores product data in a JavaScript variable
      let scriptData = '';
      $('script').each((_, element) => {
        const scriptContent = $(element).html() || '';
        if (scriptContent.includes('window.__INITIAL_STATE__')) {
          scriptData = scriptContent;
        }
      });
      
      if (scriptData) {
        // Extract the JSON data using regex
        const dataMatch = scriptData.match(/window\.__INITIAL_STATE__\s*=\s*({.+});/);
        if (dataMatch && dataMatch[1]) {
          try {
            const jsonData = JSON.parse(dataMatch[1]);
            const items = jsonData.searchResult?.result?.items || [];
            
            items.forEach((item: any) => {
              if (!item.goodsId) return;
              
              const id = item.goodsId;
              const title = normalizeProductTitle(item.goodsName || '');
              const price = item.finalPrice || item.price || 0;
              const currency = item.currencySymbol || '$';
              const imageUrl = item.goodsImage || '';
              const productUrl = `${this.baseUrl}/product_detail.html?goods_id=${id}`;
              
              // Extract rating if available
              let rating;
              if (item.goodsReviewStar) {
                rating = parseFloat(item.goodsReviewStar);
              }
              
              // Extract review count if available
              let reviewCount;
              if (item.goodsReviewCount) {
                reviewCount = parseInt(item.goodsReviewCount, 10);
              }
              
              products.push({
                id,
                title,
                description: '',  // Need product details page for full description
                price: typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price,
                currency: currency === '$' ? 'USD' : currency,
                url: productUrl,
                imageUrls: imageUrl ? [imageUrl] : [],
                marketplace: 'temu',
                rating,
                reviewCount,
                scrapedAt: new Date()
              });
            });
            
            return products;
          } catch (error) {
            console.error('Error parsing Temu JSON data:', error);
          }
        }
      }
      
      // Fallback to HTML parsing if script extraction fails
      $('.product-item').each((_, element) => {
        const $element = $(element);
        
        const id = $element.attr('data-id') || '';
        const title = normalizeProductTitle($element.find('.product-title').text().trim());
        const priceText = $element.find('.product-price').text().trim();
        const priceData = extractPrice(priceText);
        const imageUrl = $element.find('.product-image img').attr('src') || 
                         $element.find('.product-image img').attr('data-src') || '';
        const productUrl = `${this.baseUrl}/product_detail.html?goods_id=${id}`;
        
        // Extract rating if available
        const ratingText = $element.find('.product-rating').text().trim();
        let rating;
        if (ratingText) {
          const ratingMatch = ratingText.match(/([0-9.]+)/);
          if (ratingMatch) {
            rating = parseFloat(ratingMatch[1]);
          }
        }
        
        // Extract review count if available
        const reviewText = $element.find('.product-reviews').text().trim();
        let reviewCount;
        if (reviewText) {
          const reviewMatch = reviewText.match(/([0-9,]+)/);
          if (reviewMatch) {
            reviewCount = parseInt(reviewMatch[1].replace(/,/g, ''), 10);
          }
        }
        
        products.push({
          id,
          title,
          description: '',  // Need product details page for full description
          price: priceData?.price || 0,
          currency: priceData?.currency || 'USD',
          url: productUrl,
          imageUrls: imageUrl ? [imageUrl] : [],
          marketplace: 'temu',
          rating,
          reviewCount,
          scrapedAt: new Date()
        });
      });
      
      return products;
    } catch (error) {
      console.error('Error searching Temu products:', error);
      return [];
    }
  }
  
  /**
   * Get product details from Temu
   */
  async getProductDetails(productId: string): Promise<ScrapedProduct> {
    const productUrl = `${this.baseUrl}/product_detail.html?goods_id=${productId}`;
    
    try {
      const response = await this.fetchWithRetry(productUrl);
      
      // Initialize variables for dimensions and weight
      let dimensions;
      let weight;
      
      // Try to extract the product data from the script tag
      // Temu stores product data in a JavaScript variable
      const $ = cheerio.load(response.data);
      let scriptData = '';
      $('script').each((_, element) => {
        const scriptContent = $(element).html() || '';
        if (scriptContent.includes('window.__INITIAL_STATE__')) {
          scriptData = scriptContent;
        }
      });
      
      if (scriptData) {
        // Extract the JSON data using regex
        const dataMatch = scriptData.match(/window\.__INITIAL_STATE__\s*=\s*({.+});/);
        if (dataMatch && dataMatch[1]) {
          try {
            const jsonData = JSON.parse(dataMatch[1]);
            const data = jsonData.productDetail?.data || {};
            
            // Extract basic product information
            const title = normalizeProductTitle(data.goodsName || '');
            const description = data.goodsDesc || '';
            const price = data.finalPrice || data.price || 0;
            const currency = data.currencySymbol || '$';
            
            // Extract images
            const imageUrls: string[] = [];
            if (data.goodsImageList && Array.isArray(data.goodsImageList)) {
              data.goodsImageList.forEach((img: any) => {
                if (img.url) {
                  imageUrls.push(img.url);
                }
              });
            } else if (data.goodsImage) {
              imageUrls.push(data.goodsImage);
            }
            
            // Extract features
            const features: string[] = [];
            if (data.goodsProperties && Array.isArray(data.goodsProperties)) {
              data.goodsProperties.forEach((prop: any) => {
                if (prop.name && prop.value) {
                  features.push(`${prop.name}: ${prop.value}`);
                }
              });
            }
            
            // Extract dimensions and weight
            if (data.goodsProperties) {
              data.goodsProperties.forEach((prop: any) => {
                if (/dimensions|size|measurements/i.test(prop.name) && prop.value) {
                  dimensions = extractDimensions(prop.value);
                }
                if (/weight/i.test(prop.name) && prop.value) {
                  weight = extractWeight(prop.value);
                }
              });
            }
            
            // Extract rating
            const rating = data.goodsReviewStar ? parseFloat(data.goodsReviewStar) : undefined;
            
            // Extract review count
            const reviewCount = data.goodsReviewCount ? parseInt(data.goodsReviewCount, 10) : undefined;
            
            // Extract availability
            const availability = data.goodsStock 
              ? `${data.goodsStock} available` 
              : undefined;
            
            // Extract category
            const category = data.categoryName || '';
            
            return {
              id: productId,
              title,
              description,
              price,
              currency: currency === '$' ? 'USD' : currency,
              url: productUrl,
              imageUrls,
              dimensions,
              weight,
              marketplace: 'temu',
              rating,
              reviewCount,
              availability,
              category,
              features,
              scrapedAt: new Date()
            };
          }
          catch (error) {
            console.error(`Error parsing Temu product JSON data for ${productId}:`, error);
          }
        }
      }
      
      // Fallback to HTML parsing if script extraction fails
      const dom = new JSDOM(response.data);
      const document = dom.window.document;
      
      // Extract product title
      const titleElement = document.querySelector('.product-title');
      const title = normalizeProductTitle(titleElement?.textContent?.trim() || '');
      
      // Extract product price
      const priceElement = document.querySelector('.product-price');
      const priceText = priceElement?.textContent?.trim() || '';
      const priceData = extractPrice(priceText);
      
      // Extract product images
      const imageElements = document.querySelectorAll('.product-image-item img');
      const imageUrls: string[] = [];
      imageElements.forEach(img => {
        const src = img.getAttribute('src') || img.getAttribute('data-src');
        if (src) {
          imageUrls.push(src);
        }
      });
      
      // Extract product description
      const descriptionElement = document.querySelector('.product-description');
      const description = descriptionElement?.textContent?.trim() || '';
      
      // Extract product specifications
      const features: string[] = [];
      const specElements = document.querySelectorAll('.product-specs-item');
      specElements.forEach(element => {
        const label = element.querySelector('.specs-label')?.textContent?.trim();
        const value = element.querySelector('.specs-value')?.textContent?.trim();
        if (label && value) {
          features.push(`${label}: ${value}`);
          
          // Check for dimensions or weight
          if (/dimensions|size|measurements/i.test(label)) {
            const extractedDimensions = extractDimensions(value);
            if (extractedDimensions) {
              dimensions = extractedDimensions;
            }
          }
          
          if (/weight/i.test(label)) {
            const extractedWeight = extractWeight(value);
            if (extractedWeight) {
              weight = extractedWeight;
            }
          }
        }
      });
      
      // Extract product rating
      const ratingElement = document.querySelector('.product-rating-value');
      const ratingText = ratingElement?.textContent?.trim() || '';
      const rating = ratingText ? parseFloat(ratingText) : undefined;
      
      // Extract review count
      const reviewCountElement = document.querySelector('.product-review-count');
      const reviewCountText = reviewCountElement?.textContent?.trim() || '';
      const reviewCountMatch = reviewCountText.match(/\d+/);
      const reviewCount = reviewCountMatch ? parseInt(reviewCountMatch[0], 10) : undefined;
      
      // Extract availability
      const availabilityElement = document.querySelector('.product-availability');
      const availability = availabilityElement?.textContent?.trim() || '';
      
      // Extract category
      const categoryElement = document.querySelector('.breadcrumb-item:last-child');
      const category = categoryElement?.textContent?.trim() || '';
      
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
        marketplace: 'temu',
        rating,
        reviewCount,
        availability,
        category,
        features,
        scrapedAt: new Date()
      };
    } catch (error) {
      console.error(`Error fetching Temu product details for ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get products by category from Temu
   */
  async getProductsByCategory(category: string, options: { page?: number } = {}): Promise<ScrapedProduct[]> {
    const page = options.page || 1;
    
    // Construct the category URL
    const categoryUrl = `${this.baseUrl}/category.html?category=${encodeURIComponent(category)}&page=${page}`;
    
    try {
      // Reuse the searchProducts method as the page structure is similar
      return await this.searchProducts('', { category, page });
    } catch (error) {
      console.error(`Error fetching Temu products for category ${category}:`, error);
      return [];
    }
  }
}
