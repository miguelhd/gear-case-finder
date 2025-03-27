/**
 * Represents a scraped product from an online marketplace.
 */
export interface IScrapedProduct {
  id: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  rating?: number;
  source: string;
}

/**
 * Represents detailed information about a scraped product.
 */
export interface IScrapedProductDetails extends IScrapedProduct {
  description: string;
  imageUrls: string[];
  reviewCount?: number;
}
