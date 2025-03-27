# Interface Documentation

## Overview
This document provides detailed documentation for the key interfaces used in the Gear Case Finder project. These interfaces define the core data structures and API contracts throughout the application.

## Core Data Models

### IAudioGear
```typescript
/**
 * Represents an audio gear item with its properties and dimensions.
 * Used for storing and retrieving audio equipment data.
 */
export interface IAudioGear extends Document {
  /**
   * Name of the audio gear item.
   */
  name: string;
  
  /**
   * Brand or manufacturer of the audio gear.
   */
  brand: string;
  
  /**
   * Category of the audio gear (e.g., 'synthesizer', 'mixer', 'audio interface').
   */
  category: string;
  
  /**
   * Specific type of the audio gear within its category.
   */
  type: string;
  
  /**
   * Physical dimensions of the audio gear.
   */
  dimensions: {
    /**
     * Length of the audio gear in the specified unit.
     */
    length: number;
    
    /**
     * Width of the audio gear in the specified unit.
     */
    width: number;
    
    /**
     * Height of the audio gear in the specified unit.
     */
    height: number;
    
    /**
     * Unit of measurement (e.g., 'in', 'cm', 'mm').
     */
    unit: string;
  };
  
  /**
   * Weight information of the audio gear.
   */
  weight: {
    /**
     * Weight value of the audio gear.
     */
    value: number;
    
    /**
     * Unit of weight measurement (e.g., 'lbs', 'kg').
     */
    unit: string;
  };
  
  /**
   * URL to the primary image of the audio gear.
   */
  imageUrl?: string;
  
  /**
   * URL to the product page of the audio gear.
   */
  productUrl?: string;
  
  /**
   * Textual description of the audio gear.
   */
  description?: string;
  
  /**
   * Popularity score of the audio gear (higher is more popular).
   */
  popularity?: number;
  
  /**
   * Year when the audio gear was released.
   */
  releaseYear?: number;
  
  /**
   * Whether the audio gear has been discontinued by the manufacturer.
   */
  discontinued?: boolean;
  
  /**
   * Marketplace where the audio gear is available (e.g., 'amazon', 'reverb').
   */
  marketplace?: string;
  
  /**
   * Current price of the audio gear.
   */
  price?: number;
  
  /**
   * Currency of the price (e.g., 'USD', 'EUR').
   */
  currency?: string;
  
  /**
   * URL to the product listing.
   */
  url?: string;
  
  /**
   * Array of URLs to additional images of the audio gear.
   */
  imageUrls?: string[];
  
  /**
   * Availability status of the audio gear.
   */
  availability?: string;
  
  /**
   * Date when the record was created.
   */
  createdAt?: Date;
  
  /**
   * Date when the record was last updated.
   */
  updatedAt?: Date;
}
```

### ICase
```typescript
/**
 * Represents a case or container suitable for audio gear.
 * Used for storing and retrieving case data.
 */
export interface ICase extends Document {
  /**
   * Name of the case.
   */
  name: string;
  
  /**
   * Brand or manufacturer of the case.
   */
  brand: string;
  
  /**
   * Type of case (e.g., 'hard case', 'soft case', 'gig bag').
   */
  type: string;
  
  /**
   * Dimensions of the case, including interior and optional exterior measurements.
   */
  dimensions: {
    /**
     * Interior dimensions of the case.
     */
    interior: {
      /**
       * Interior length of the case in the specified unit.
       */
      length: number;
      
      /**
       * Interior width of the case in the specified unit.
       */
      width: number;
      
      /**
       * Interior height of the case in the specified unit.
       */
      height: number;
      
      /**
       * Unit of measurement (e.g., 'in', 'cm', 'mm').
       */
      unit: string;
    };
    
    /**
     * Exterior dimensions of the case.
     */
    exterior?: {
      /**
       * Exterior length of the case in the specified unit.
       */
      length: number;
      
      /**
       * Exterior width of the case in the specified unit.
       */
      width: number;
      
      /**
       * Exterior height of the case in the specified unit.
       */
      height: number;
      
      /**
       * Unit of measurement (e.g., 'in', 'cm', 'mm').
       */
      unit: string;
    };
  };
  
  /**
   * Internal dimensions of the case (alias for dimensions.interior).
   * @deprecated Use dimensions.interior instead for consistency.
   */
  internalDimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  
  /**
   * External dimensions of the case (alias for dimensions.exterior).
   * @deprecated Use dimensions.exterior instead for consistency.
   */
  externalDimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  
  /**
   * Weight information of the case.
   */
  weight?: {
    /**
     * Weight value of the case.
     */
    value: number;
    
    /**
     * Unit of weight measurement (e.g., 'lbs', 'kg').
     */
    unit: string;
  };
  
  /**
   * Array of features that the case has.
   */
  features?: string[];
  
  /**
   * Current price of the case.
   */
  price?: number;
  
  /**
   * Currency of the price (e.g., 'USD', 'EUR').
   */
  currency?: string;
  
  /**
   * Rating of the case (typically 1-5).
   */
  rating?: number;
  
  /**
   * Number of reviews for the case.
   */
  reviewCount?: number;
  
  /**
   * URL to the primary image of the case.
   */
  imageUrl?: string;
  
  /**
   * URL to the product page of the case.
   */
  productUrl?: string;
  
  /**
   * Textual description of the case.
   */
  description?: string;
  
  /**
   * Level of protection offered by the case.
   */
  protectionLevel?: 'low' | 'medium' | 'high';
  
  /**
   * Whether the case is waterproof.
   */
  waterproof?: boolean;
  
  /**
   * Whether the case is shockproof.
   */
  shockproof?: boolean;
  
  /**
   * Whether the case has padding.
   */
  hasPadding?: boolean;
  
  /**
   * Whether the case has compartments.
   */
  hasCompartments?: boolean;
  
  /**
   * Whether the case has a handle.
   */
  hasHandle?: boolean;
  
  /**
   * Whether the case has wheels.
   */
  hasWheels?: boolean;
  
  /**
   * Whether the case has a lock.
   */
  hasLock?: boolean;
  
  /**
   * Material the case is made of.
   */
  material?: string;
  
  /**
   * Color of the case.
   */
  color?: string;
  
  /**
   * Marketplace where the case is available (e.g., 'amazon', 'reverb').
   */
  marketplace?: string;
  
  /**
   * URL to the product listing.
   */
  url?: string;
  
  /**
   * Array of URLs to additional images of the case.
   */
  imageUrls?: string[];
  
  /**
   * Availability status of the case.
   */
  availability?: string;
  
  /**
   * Information about the seller of the case.
   */
  seller?: {
    /**
     * Name of the seller.
     */
    name?: string;
    
    /**
     * URL to the seller's page.
     */
    url?: string;
    
    /**
     * Rating of the seller (typically 1-5).
     */
    rating?: number;
  };
  
  /**
   * Date when the record was created.
   */
  createdAt?: Date;
  
  /**
   * Date when the record was last updated.
   */
  updatedAt?: Date;
}
```

### IGearCaseMatch
```typescript
/**
 * Represents a match between an audio gear item and a compatible case.
 * Used for storing and retrieving compatibility matches.
 */
export interface IGearCaseMatch extends Document {
  /**
   * ID of the audio gear item.
   */
  gearId: string;
  
  /**
   * ID of the compatible case.
   */
  caseId: string;
  
  /**
   * Overall compatibility score between the gear and case (0-100).
   */
  compatibilityScore: number;
  
  /**
   * Score based on dimensional compatibility (0-100).
   */
  dimensionScore: number;
  
  /**
   * Score based on feature compatibility (0-100).
   */
  featureScore: number;
  
  /**
   * Score based on user feedback (0-100).
   */
  userFeedbackScore: number;
  
  /**
   * Total number of user feedback submissions for this match.
   */
  totalFeedback: number;
  
  /**
   * Count of positive feedback submissions.
   */
  positiveCount: number;
  
  /**
   * Count of negative feedback submissions.
   */
  negativeCount: number;
  
  /**
   * Date when the record was created.
   */
  createdAt?: Date;
  
  /**
   * Date when the record was last updated.
   */
  updatedAt?: Date;
}
```

## API Service Interfaces

### IDimensions
```typescript
/**
 * Represents the physical dimensions of an object.
 */
export interface IDimensions {
  /**
   * Length of the object in the specified unit.
   */
  length: number;
  
  /**
   * Width of the object in the specified unit.
   */
  width: number;
  
  /**
   * Height of the object in the specified unit.
   */
  height: number;
  
  /**
   * Unit of measurement (e.g., 'in', 'cm', 'mm').
   */
  unit: string;
}
```

### ICompatibleCaseDimensions
```typescript
/**
 * Represents the dimensional requirements for a compatible case.
 */
export interface ICompatibleCaseDimensions {
  /**
   * Minimum length required for a compatible case in the specified unit.
   */
  minLength: number;
  
  /**
   * Maximum length allowed for a compatible case in the specified unit.
   */
  maxLength: number;
  
  /**
   * Minimum width required for a compatible case in the specified unit.
   */
  minWidth: number;
  
  /**
   * Maximum width allowed for a compatible case in the specified unit.
   */
  maxWidth: number;
  
  /**
   * Minimum height required for a compatible case in the specified unit.
   */
  minHeight: number;
  
  /**
   * Maximum height allowed for a compatible case in the specified unit.
   */
  maxHeight: number;
  
  /**
   * Unit of measurement (e.g., 'in', 'cm', 'mm').
   */
  unit: string;
}
```

### IInstrumentDimensions
```typescript
/**
 * Represents the dimensions of a musical instrument or audio gear
 * along with compatible case requirements.
 */
export interface IInstrumentDimensions {
  /**
   * Type of instrument (e.g., 'synthesizer', 'audio interface').
   */
  instrumentType: string;
  
  /**
   * Brand or manufacturer of the instrument.
   */
  brand: string;
  
  /**
   * Model name or number of the instrument.
   */
  model: string;
  
  /**
   * Physical dimensions of the instrument.
   */
  dimensions: IDimensions;
  
  /**
   * Dimensional requirements for a compatible case.
   */
  compatibleCaseDimensions: ICompatibleCaseDimensions;
  
  /**
   * Date when the dimensions were last verified.
   */
  lastVerified: Date;
}
```

### ICacheOptions
```typescript
/**
 * Options for configuring cache behavior.
 */
export interface ICacheOptions {
  /**
   * Time to live in seconds. Determines how long the cached item remains valid.
   */
  ttl?: number;
  
  /**
   * Cache namespace for grouping related items.
   */
  namespace?: string;
}
```

### IApiManagerOptions
```typescript
/**
 * Configuration options for the API Manager.
 */
export interface IApiManagerOptions {
  /**
   * Directory for storing log files.
   */
  logDirectory?: string;
  
  /**
   * Directory for storing data files.
   */
  dataDirectory?: string;
  
  /**
   * Directory for storing downloaded images.
   */
  imageDirectory?: string;
  
  /**
   * Maximum number of retry attempts for failed API calls.
   */
  maxRetries?: number;
  
  /**
   * Delay in milliseconds between retry attempts.
   */
  delayBetweenRetries?: number;
  
  /**
   * Whether to save API results to the database.
   */
  saveToDatabase?: boolean;
  
  /**
   * Whether to download images from API results.
   */
  downloadImages?: boolean;
  
  /**
   * MongoDB connection URI.
   */
  mongodbUri?: string;
  
  /**
   * API key for the Canopy API.
   */
  canopyApiKey?: string;
  
  /**
   * Access token for the Reverb API.
   */
  reverbAccessToken?: string;
  
  /**
   * Whether to enable batch processing of API requests.
   */
  enableBatchProcessing?: boolean;
  
  /**
   * Whether to enable caching of API responses.
   */
  enableCaching?: boolean;
}
```

### IImageDownloaderOptions
```typescript
/**
 * Configuration options for the Image Downloader.
 */
export interface IImageDownloaderOptions {
  /**
   * Directory for storing downloaded images.
   */
  imageDirectory?: string;
  
  /**
   * Maximum number of retry attempts for failed downloads.
   */
  maxRetries?: number;
  
  /**
   * Delay in milliseconds between retry attempts.
   */
  delayBetweenRetries?: number;
  
  /**
   * Directory for storing log files.
   */
  logDirectory?: string;
}
```

## Usage Examples

### Using the IAudioGear Interface
```typescript
import { IAudioGear, AudioGear } from '../models/gear-models';

// Creating a new audio gear item
const newGear: Partial<IAudioGear> = {
  name: 'Scarlett 2i2',
  brand: 'Focusrite',
  category: 'audio equipment',
  type: 'audio interface',
  dimensions: {
    length: 7.17,
    width: 3.77,
    height: 1.89,
    unit: 'in'
  },
  weight: {
    value: 1.32,
    unit: 'lbs'
  },
  price: 159.99,
  currency: 'USD',
  marketplace: 'amazon'
};

// Saving to database
const audioGear = new AudioGear(newGear);
await audioGear.save();
```

### Using the ICase Interface
```typescript
import { ICase, Case } from '../models/gear-models';

// Creating a new case
const newCase: Partial<ICase> = {
  name: 'Protective Case for Audio Interfaces',
  brand: 'Gator',
  type: 'hard case',
  dimensions: {
    interior: {
      length: 8.5,
      width: 5.0,
      height: 2.5,
      unit: 'in'
    },
    exterior: {
      length: 9.5,
      width: 6.0,
      height: 3.0,
      unit: 'in'
    }
  },
  price: 49.99,
  currency: 'USD',
  protectionLevel: 'high',
  waterproof: true,
  shockproof: true
};

// Saving to database
const caseItem = new Case(newCase);
await caseItem.save();
```

### Using the API Cache Service
```typescript
import { ApiCacheService } from '../lib/api/api-cache-service';

// Initialize cache service
const cacheService = new ApiCacheService();
await cacheService.initialize();

// Cache API response
await cacheService.set(
  'canopy_search_audio_gear',
  { query: 'audio interface', limit: 10 },
  apiResponseData,
  { ttl: 3600, namespace: 'audio_gear' }
);

// Retrieve cached response
const cachedData = await cacheService.get(
  'canopy_search_audio_gear',
  { query: 'audio interface', limit: 10 }
);
```
