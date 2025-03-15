export interface AudioGear {
  id: string;
  name: string;
  brand: string;
  type: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  weight?: number;
  imageUrl?: string;
}

export interface Case {
  id: string;
  name: string;
  brand: string;
  type: string;
  dimensions: {
    innerWidth: number;
    innerHeight: number;
    innerDepth: number;
    outerWidth: number;
    outerHeight: number;
    outerDepth: number;
  };
  maxWeight: number;
  price?: number;
  imageUrl?: string;
  features?: string[];
  compatibleWith?: string[];
}

export interface SearchFilters {
  gearType?: string;
  brand?: string;
  caseType?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}
