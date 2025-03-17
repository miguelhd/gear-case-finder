import { BaseScraper, ScraperOptions, ScrapedProduct } from './base-scraper';
import { JSDOM } from 'jsdom';
import { extractDimensions, extractWeight, normalizeProductTitle, extractPrice } from './utils';
import * as cheerio from 'cheerio';

export interface AliExpressScraperOptions extends ScraperOptions {
  language?: string;
  currency?: string;
}

export class AliExpressScraper extends BaseScraper {
  private baseUrl: string;
  
  constructor(options: AliExpressScraperOptions = {}) {
    super(options);
    this.baseUrl = 'https://www.aliexpress.com';
  }
  
  /**
   * Search for products on AliExpress
   */
  async searchProducts(query: string, options: { page?: number, category?: string } = {}): Promise<ScrapedProduct[]> {
    const page = options.page || 1;
    
    // Construct the search URL
    let searchUrl = `${this.baseUrl}/wholesale?SearchText=${encodeURIComponent(query)}&page=${page}`;
    
    // Add category if provided
    if (options.category) {
      searchUrl += `&catId=${options.category}`;
    }
    
    try {
      const response = await this.fetchWithRetry(searchUrl);
      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];
      
      // Try to extract the product data from the script tag
      // AliExpress stores product data in a JavaScript variable
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
              
              // Extract seller info if available
              const seller = {
                name: item.store?.storeName,
                url: item.store?.storeUrl ? `${this.baseUrl}${item.store.storeUrl}` : undefined,
              };
              
              products.push({
                id,
                title,
                description: '',  // Need product details page for full description
                price,
                currency,
                url: productUrl,
                imageUrls: imageUrl ? [imageUrl] : [],
                marketplace: 'aliexpress',
                rating,
                seller,
                scrapedAt: new Date()
              });
            });
            
            return products;
          } catch (error) {
            console.error('Error parsing AliExpress JSON data:', error);
          }
        }
      }
      
      // Fallback to HTML parsing if script extraction fails
      $('.product-card').each((_, element) => {
        const titleElement = $(element).find('.product-title');
        const title = normalizeProductTitle(titleElement.text().trim());
        
        const linkElement = $(element).find('a.product-card--clickable');
        const url = linkElement.attr('href') || '';
        
        // Extract item ID from URL
        const idMatch = url.match(/\/(\d+)\.html/);
        const id = idMatch ? idMatch[1] : '';
        if (!id) return; // Skip items without ID
        
        const priceElement = $(element).find('.product-price');
        const priceText = priceElement.text().trim();
        const priceData = extractPrice(priceText);
        
        const imageElement = $(element).find('.product-img img');
        const imageUrl = imageElement.attr('src') || imageElement.attr('data-src') || '';
        
        const ratingElement = $(element).find('.rating-value');
        const ratingText = ratingElement.text().trim();
        const rating = ratingText ? parseFloat(ratingText) : undefined;
        
        const sellerElement = $(element).find('.store-name');
        const sellerName = sellerElement.text().trim();
        
        products.push({
          id,
          title,
          description: '',  // Need product details page for full description
          price: priceData?.price || 0,
          currency: priceData?.currency || 'USD',
          url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
          imageUrls: imageUrl ? [imageUrl] : [],
          marketplace: 'aliexpress',
          rating,
          seller: {
            name: sellerName || undefined
          },
          scrapedAt: new Date()
        });
      });
      
      return products;
    } catch (error) {
      console.error('Error searching AliExpress products:', error);
      return [];
    }
  }
  
  /**
   * Get detailed information about a specific product
   */
  async getProductDetails(productId: string): Promise<ScrapedProduct> {
    const productUrl = `${this.baseUrl}/item/${productId}.html`;
    
    try {
      const response = await this.fetchWithRetry(productUrl);
      const $ = cheerio.load(response.data);
      
      // Try to extract the product data from the script tag
      // AliExpress stores product data in a JavaScript variable
      let productData: any = null;
      $('script').each((_, element) => {
        const scriptContent = $(element).html() || '';
        if (scriptContent.includes('window.runParams = {')) {
          const dataMatch = scriptContent.match(/window\.runParams\s*=\s*({.+});/);
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
      if (productData && productData.data) {
        const data = productData.data;
        
        // Extract title
        const title = normalizeProductTitle(data.titleModule?.subject || '');
        
        // Extract price
        const priceText = data.priceModule?.formatedPrice || '';
        const priceData = extractPrice(priceText);
        
        // Extract images
        const imageUrls: string[] = [];
        if (data.imageModule?.imagePathList) {
          data.imageModule.imagePathList.forEach((img: string) => {
            if (img) {
              imageUrls.push(img);
            }
          });
        }
        
        // Extract description
        let description = data.descriptionModule?.description || '';
        
        // Extract specifications
        const features: string[] = [];
        if (data.specsModule?.props) {
          data.specsModule.props.forEach((spec: any) => {
            if (spec.name && spec.value) {
              features.push(`${spec.name}: ${spec.value}`);
            }
          });
        }
        
        // Extract dimensions and weight from specifications
        let dimensions;
        let weight;
        
        if (data.specsModule?.props) {
          data.specsModule.props.forEach((spec: any) => {
            if (/dimensions|size|measurements/i.test(spec.name) && spec.value) {
              dimensions = extractDimensions(spec.value);
            }
            if (/weight/i.test(spec.name) && spec.value) {
              weight = extractWeight(spec.value);
            }
          });
        }
        
        // Extract rating
        const rating = data.titleModule?.feedbackRating?.averageStar;
        
        // Extract review count
        const reviewCount = data.titleModule?.feedbackRating?.totalValidNum;
        
        // Extract availability
        const availability = data.quantityModule?.totalAvailQuantity 
          ? `${data.quantityModule.totalAvailQuantity} available` 
          : undefined;
        
        // Extract seller information
        const seller = {
          name: data.storeModule?.storeName,
          url: data.storeModule?.storeURL ? `${this.baseUrl}${data.storeModule.storeURL}` : undefined,
          rating: data.storeModule?.positiveRate ? parseFloat(data.storeModule.positiveRate) : undefined
        };
        
        // Extract category
        const category = data.breadcrumbModule?.pathList?.length 
          ? data.breadcrumbModule.pathList[data.breadcrumbModule.pathList.length - 1].name 
          : '';
        
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
          marketplace: 'aliexpress',
          rating,
          reviewCount,
          availability,
          seller,
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
      const priceElement = document.querySelector('.product-price-value');
      const priceText = priceElement?.textContent?.trim() || '';
      const priceData = extractPrice(priceText);
      
      // Extract product images
      const imageElements = document.querySelectorAll('.images-view-item img');
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
      const specElements = document.querySelectorAll('.specification-keys');
      specElements.forEach(element => {
        const label = element.querySelector('.key-title')?.textContent?.trim();
        const value = element.querySelector('.key-value')?.textContent?.trim();
        
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
      const ratingElement = document.querySelector('.overview-rating-average');
      const ratingText = ratingElement?.textContent?.trim() || '';
      const rating = ratingText ? parseFloat(ratingText) : undefined;
      
      // Extract review count
      const reviewCountElement = document.querySelector('.product-reviewer-reviews');
      const reviewCountText = reviewCountElement?.textContent?.trim() || '';
      const reviewCountMatch = reviewCountText.match(/\d+/);
      const reviewCount = reviewCountMatch ? parseInt(reviewCountMatch[0], 10) : undefined;
      
      // Extract availability
      const availabilityElement = document.querySelector('.product-quantity-tip');
      const availability = availabilityElement?.textContent?.trim() || '';
      
      // Extract seller information
      const sellerNameElement = document.querySelector('.store-name');
      const sellerName = sellerNameElement?.textContent?.trim();
      
      const sellerUrlElement = document.querySelector('.store-name-link');
      const sellerUrl = sellerUrlElement?.getAttribute('href');
      
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
        marketplace: 'aliexpress',
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
              