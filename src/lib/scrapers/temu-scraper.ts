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
        const titleElement = $(element).find('.product-title');
        const title = normalizeProductTitle(titleElement.text().trim());
        
        const linkElement = $(element).find('a.product-link');
        const url = linkElement.attr('href') || '';
        
        // Extract item ID from URL
        const idMatch = url.match(/goods_id=(\d+)/);
        const id = idMatch ? idMatch[1] : '';
        if (!id) return; // Skip items without ID
        
        const priceElement = $(element).find('.product-price');
        const priceText = priceElement.text().trim();
        const priceData = extractPrice(priceText);
        
        const imageElement = $(element).find('.product-image img');
        const imageUrl = imageElement.attr('src') || imageElement.attr('data-src') || '';
        
        const ratingElement = $(element).find('.product-rating');
        const ratingText = ratingElement.text().trim();
        const rating = ratingText ? parseFloat(ratingText) : undefined;
        
        const reviewCountElement = $(element).find('.product-reviews-count');
        const reviewCountText = reviewCountElement.text().trim();
        const reviewCountMatch = reviewCountText.match(/\d+/);
        const reviewCount = reviewCountMatch ? parseInt(reviewCountMatch[0], 10) : undefined;
        
        products.push({
          id,
          title,
          description: '',  // Need product details page for full description
          price: priceData?.price || 0,
          currency: priceData?.currency || 'USD',
          url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
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
   * Get detailed information about a specific product
   */
  async getProductDetails(productId: string): Promise<ScrapedProduct> {
    const productUrl = `${this.baseUrl}/product_detail.html?goods_id=${productId}`;
    
    try {
      const response = await this.fetchWithRetry(productUrl);
      const $ = cheerio.load(response.data);
      
      // Try to extract the product data from the script tag
      // Temu stores product data in a JavaScript variable
      let productData: any = null;
      $('script').each((_, element) => {
        const scriptContent = $(element).html() || '';
        if (scriptContent.includes('window.__INITIAL_STATE__')) {
          const dataMatch = scriptContent.match(/window\.__INITIAL_STATE__\s*=\s*({.+});/);
          if (dataMatch && dataMatch[1]) {
            try {
              productData = JSON.parse(dataMatch[1]);
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
        }
      });
      
      // Extract product details from the parsed data
      if (productData && productData.productDetail) {
        const data = productData.productDetail;
        
        // Extract title
        const title = normalizeProductTitle(data.goodsName || '');
        
        // Extract price
        const priceText = data.finalPrice || data.price || '';
        const currency = data.currencySymbol || '$';
        const price = typeof priceText === 'string' ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : priceText;
        
        // Extract images
        const imageUrls: string[] = [];
        if (data.goodsImageList) {
          data.goodsImageList.forEach((img: string) => {
            if (img) {
              imageUrls.push(img);
            }
          });
        } else if (data.goodsImage) {
          imageUrls.push(data.goodsImage);
        }
        
        // Extract description
        let description = data.goodsDesc || '';
        
        // Extract specifications
        const features: string[] = [];
        if (data.goodsProperties) {
          data.goodsProperties.forEach((prop: any) => {
            if (prop.name && prop.value) {
              features.push(`${prop.name}: ${prop.value}`);
            }
          });
        }
        
        // Extract dimensions and weight from specifications
        let dimensions;
        let weight;
        
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
        const label = element.querySelector('.specs-name')?.textContent?.trim();
        const value = element.querySelector('.specs-value')?.textContent?.trim();
        
        if (label && value) {
          features.push(`${label}: ${value}`);
        }
      });
      
      // Extract dimensions and weight from specifications
      let dimensions;
      let weight;
      
      features.forEach(feature => {
        if (/dimensions|size|measurements/i.test(feature)) {
          const value = feature.split(':')[1]?.trim();
          if (value) {
            dimensions = extractDimensions(value);
          }
        }
        if (/weight/i.test(feature)) {
          const value = feature.split(':')[1]?.trim();
          if (value) {
            weight = extractWeight(value);
          }
        }
      });
      
      // Extract product rating
      const ratingElement = document.querySelector('.product-rating');
      const ratingText = ratingElement?.textContent?.trim() || '';
      const rating = ratingText ? parseFloat(ratingText) : undefined;
      
      // Extract review count
      const reviewCountElement = document.querySelector('.product-reviews-count');
      const reviewCountText = reviewCountElement?.textContent?.trim() || '';
      const reviewCountMatch = reviewCountText.match(/\d+/);
      const reviewCount = reviewCountMatch ? parseInt(reviewCountMatch[0], 10) : undefined;
      
      // Extract availability
      const availabilityElement = document.querySelector('.product-stock');
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
   * Get products by category
   */
  async getProductsByCategory(category: string, options: { page?: number } = {}): Promise<ScrapedProduct[]> {
    const page = options.page || 1;
    
    // Construct the category URL
    const categoryUrl = `${this.baseUrl}/category/${category}.html?page=${page}`;
    
    try {
      // Reuse the search products method as the page structure is similar
      const response = await this.fetchWithRetry(categoryUrl);
      
      // The rest of the implementation is the same as searchProducts
      // as Temu uses the same structure for search and category pages
      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];
      
      // Try to extract the product data from the script tag
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
            const items = jsonData.categoryResult?.result?.items || [];
            
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
<response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>