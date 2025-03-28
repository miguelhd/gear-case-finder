/**
 * Represents a normalized product from any source
 * This replaces the previous NormalizedProduct from the scraper code
 */
export interface NormalizedProduct {
  id: string;
  sourceId: string;
  marketplace: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  url: string;
  imageUrls: string[];
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  rating: number;
  reviewCount: number;
  availability: string;
  seller: {
    name: string;
    url: string;
    rating: number;
  };
  category: string;
  features: string[];
  scrapedAt: Date;
  normalizedAt: Date;
  productType: string;
  isCase: boolean;
  caseCompatibility?: {
    minLength: number;
    maxLength: number;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    dimensionUnit: string;
  };
}
