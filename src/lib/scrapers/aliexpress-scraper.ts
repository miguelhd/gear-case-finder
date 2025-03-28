import axios from 'axios';
import cheerio from 'cheerio';
import { IScrapedProduct, IScrapedProductDetails } from '../models/scraper-models';
import { normalizeProductTitle } from '../utils/string-utils';

export class AliExpressScraper {
  private baseUrl: string;
  private userAgent: string;
  
  constructor() {
    this.baseUrl = 'https://www.aliexpress.com';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }
  
  /**
   * Search for products on AliExpress
   */
  async searchProducts(query: string, options: { page?: number } = {}): Promise<ScrapedProduct[]> {
    const page = options.page || 1;
    
    // Construct the search URL
    const searchUrl = `${this.baseUrl}/wholesale?SearchText=${encodeURIComponent(query)}&page=${page}`;
    
    try {
      const response = await this.fetchWithRetry(searchUrl);
      
      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];
      
      // Try to extract the product data from the script tag
      let scriptData = '';
      $('script').each((_, element) => {
        const scriptContent = $(element).html() || '';
        if (scriptContent.includes('_init_data_')) {
          scriptData = scriptContent;
        }
      });
      
      if (scriptData) {
        // Extract the JSON data using regex
        const dataMatch = scriptData.match(/_init_data_\s*=\s*{\s*data:\s*({.+}) }/);
        if (dataMatch && dataMatch[1]) {
          try {
            const jsonData = JSON.parse(dataMatch[1]);
            const items = jsonData.data?.root?.fields?.mods?.itemList?.content || [];
            
            items.forEach((item: any) => {
              if (!item.productId) return;
              
              const id = item.productId;
              const title = normalizeProductTitle(item.title?.displayTitle || '');
              const price = item.prices?.salePrice?.minPrice || 0;
              const currency = item.prices?.salePrice?.currencyCode || 'USD';
              const imageUrl = item.image?.imgUrl ? `https://${item.image.imgUrl.replace(/^\/\//, '')}` : '';
              const productUrl = `${this.baseUrl}/item/${id}.html`;
              
              // Extract rating if available
              let rating;
              if (item.evaluation && item.evaluation.starRating) {
                rating = parseFloat(item.evaluation.starRating);
              }
              
              products.push({
                id,
                title,
                price,
                currency,
                imageUrl,
                productUrl,
                rating,
                source: 'aliexpress'
              });
            });
          } catch (error) {
            console.error('Error parsing AliExpress JSON data:', error);
          }
        }
      }
      
      return products;
    } catch (error) {
      console.error(`Error fetching AliExpress search results for ${query}:`, error);
      return [];
    }
  }
  
  /**
   * Get product details from AliExpress
   */
  async getProductDetails(productId: string): Promise<ScrapedProductDetails> {
    const productUrl = `${this.baseUrl}/item/${productId}.html`;
    
    try {
      const response = await this.fetchWithRetry(productUrl);
      const $ = cheerio.load(response.data);
      
      // Try to extract the product data from the script tag
      let scriptData = '';
      $('script').each((_, element) => {
        const scriptContent = $(element).html() || '';
        if (scriptContent.includes('window.runParams = {')) {
          scriptData = scriptContent;
        }
      });
      
      let title = '';
      let price = 0;
      let currency = 'USD';
      let description = '';
      let imageUrls: string[] = [];
      let rating;
      let reviewCount;
      
      if (scriptData) {
        // Extract the JSON data using regex
        const dataMatch = scriptData.match(/window\.runParams\s*=\s*({.+});/);
        if (dataMatch && dataMatch[1]) {
          try {
            const jsonData = JSON.parse(dataMatch[1]);
            const data = jsonData.data || {};
            
            title = normalizeProductTitle(data.titleModule?.subject || '');
            price = data.priceModule?.formatedActivityPrice || data.priceModule?.formatedPrice || 0;
            currency = data.currencyModule?.currencyCode || 'USD';
            description = data.descriptionModule?.description || '';
            
            // Extract images
            if (data.imageModule && data.imageModule.imagePathList) {
              imageUrls = data.imageModule.imagePathList.map((path: string) => 
                `https://${path.replace(/^\/\//, '')}`
              );
            }
            
            // Extract rating and review count
            if (data.titleModule && data.titleModule.feedbackRating) {
              rating = parseFloat(data.titleModule.feedbackRating.averageStar);
              reviewCount = parseInt(data.titleModule.feedbackRating.totalValidNum);
            }
          } catch (error) {
            console.error('Error parsing AliExpress product data:', error);
          }
        }
      }
      
      // Fallback to HTML parsing if script data extraction fails
      if (!title) {
        title = normalizeProductTitle($('.product-title').text().trim());
      }
      
      if (!description) {
        description = $('.product-description').text().trim();
      }
      
      if (imageUrls.length === 0) {
        $('.product-image img').each((_, element) => {
          const src = $(element).attr('src');
          if (src) {
            imageUrls.push(src);
          }
        });
      }
      
      // Use the first image URL as the main imageUrl if available
      const imageUrl = imageUrls.length > 0 ? imageUrls[0] : '';
      
      return {
        id: productId,
        title,
        price,
        currency,
        description,
        imageUrls,
        imageUrl,
        productUrl,
        rating,
        reviewCount,
        source: 'aliexpress'
      };
    } catch (error) {
      console.error(`Error fetching AliExpress product details for ${productId}:`, error);
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
      // as AliExpress uses the same structure for search and category pages
      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];
      
      // Try to extract the product data from the script tag
      let scriptData = '';
      $('script').each((_, element) => {
        const scriptContent = $(element).html() || '';
        if (scriptContent.includes('_init_data_')) {
          scriptData = scriptContent;
        }
      });
      
      if (scriptData) {
        // Extract the JSON data using regex
        const dataMatch = scriptData.match(/_init_data_\s*=\s*{\s*data:\s*({.+}) }/);
        if (dataMatch && dataMatch[1]) {
          try {
            const jsonData = JSON.parse(dataMatch[1]);
            const items = jsonData.data?.root?.fields?.mods?.itemList?.content || [];
            
            items.forEach((item: any) => {
              if (!item.productId) return;
              
              const id = item.productId;
              const title = normalizeProductTitle(item.title?.displayTitle || '');
              const price = item.prices?.salePrice?.minPrice || 0;
              const currency = item.prices?.salePrice?.currencyCode || 'USD';
              const imageUrl = item.image?.imgUrl ? `https://${item.image.imgUrl.replace(/^\/\//, '')}` : '';
              const productUrl = `${this.baseUrl}/item/${id}.html`;
              
              // Extract rating if available
              let rating;
              if (item.evaluation && item.evaluation.starRating) {
                rating = parseFloat(item.evaluation.starRating);
              }
              
              products.push({
                id,
                title,
                price,
                currency,
                imageUrl,
                productUrl,
                rating,
                source: 'aliexpress'
              });
            });
          } catch (error) {
            console.error('Error parsing AliExpress JSON data:', error);
          }
        }
      }
      
      return products;
    } catch (error) {
      console.error(`Error fetching AliExpress category products for ${category}:`, error);
      return [];
    }
  }
  
  /**
   * Helper method to fetch with retry logic
   */
  private async fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<any> {
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await axios.get(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
          },
          timeout: 10000
        });
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
    
    throw lastError;
  }
}
