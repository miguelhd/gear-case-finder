// Interfaces for scraped product data

export interface ScrapedProduct {
  id: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  rating?: number;
  source: string;
}

export interface ScrapedProductDetails {
  id: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  description: string;
  imageUrls: string[];
  rating?: number;
  reviewCount?: number;
  source: string;
}
