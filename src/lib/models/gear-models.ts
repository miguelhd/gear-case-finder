import mongoose, { Document, Model, Schema } from 'mongoose';

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

/**
 * Schema definition for AudioGear
 */
const AudioGearSchema = new Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, required: true },
  dimensions: {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    unit: { type: String, required: true }
  },
  weight: {
    value: { type: Number, required: true },
    unit: { type: String, required: true }
  },
  imageUrl: { type: String },
  productUrl: { type: String },
  description: { type: String },
  popularity: { type: Number },
  releaseYear: { type: Number },
  discontinued: { type: Boolean, default: false },
  marketplace: { type: String },
  price: { type: Number },
  currency: { type: String },
  url: { type: String },
  imageUrls: [{ type: String }],
  availability: { type: String }
}, { timestamps: true });

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

/**
 * Schema definition for Case
 */
const CaseSchema = new Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  type: { type: String, required: true },
  dimensions: {
    interior: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      unit: { type: String, required: true }
    },
    exterior: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      unit: { type: String }
    }
  },
  // Add internalDimensions to schema to match interface
  internalDimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    unit: { type: String }
  },
  externalDimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    unit: { type: String }
  },
  weight: {
    value: { type: Number },
    unit: { type: String }
  },
  features: [{ type: String }],
  price: { type: Number },
  currency: { type: String },
  rating: { type: Number },
  reviewCount: { type: Number },
  imageUrl: { type: String },
  productUrl: { type: String },
  description: { type: String },
  protectionLevel: { 
    type: String, 
    enum: ['low', 'medium', 'high'] 
  },
  waterproof: { type: Boolean, default: false },
  shockproof: { type: Boolean, default: false },
  hasPadding: { type: Boolean, default: false },
  hasCompartments: { type: Boolean, default: false },
  hasHandle: { type: Boolean, default: false },
  hasWheels: { type: Boolean, default: false },
  hasLock: { type: Boolean, default: false },
  material: { type: String },
  color: { type: String },
  marketplace: { type: String },
  url: { type: String },
  imageUrls: [{ type: String }],
  availability: { type: String },
  seller: {
    name: { type: String },
    url: { type: String },
    rating: { type: Number }
  }
}, { timestamps: true });

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
   * Dimension fit information.
   */
  dimensionFit?: any;
  
  /**
   * Price category of the case.
   */
  priceCategory?: string;
  
  /**
   * Protection level of the case.
   */
  protectionLevel?: string;
  
  /**
   * Date when the record was created.
   */
  createdAt?: Date;
  
  /**
   * Date when the record was last updated.
   */
  updatedAt?: Date;
}

/**
 * Schema definition for GearCaseMatch
 */
const GearCaseMatchSchema = new Schema({
  gearId: { type: String, required: true },
  caseId: { type: String, required: true },
  compatibilityScore: { type: Number, required: true },
  dimensionScore: { type: Number, required: true },
  featureScore: { type: Number, required: true },
  userFeedbackScore: { type: Number, default: 0 },
  totalFeedback: { type: Number, default: 0 },
  positiveCount: { type: Number, default: 0 },
  negativeCount: { type: Number, default: 0 }
}, { timestamps: true });

// Create index for unique gear-case combinations
GearCaseMatchSchema.index({ gearId: 1, caseId: 1 }, { unique: true });

// Type definitions for Mongoose models
export type AudioGearModel = Model<IAudioGear>;
export type CaseModel = Model<ICase>;
export type GearCaseMatchModel = Model<IGearCaseMatch>;

// Create and export models with proper typing
export const AudioGear: AudioGearModel = mongoose.models['AudioGear'] as AudioGearModel || 
  mongoose.model<IAudioGear, AudioGearModel>('AudioGear', AudioGearSchema, 'AudioGear');

export const Case: CaseModel = mongoose.models['Case'] as CaseModel || 
  mongoose.model<ICase, CaseModel>('Case', CaseSchema, 'Case');

export const GearCaseMatch: GearCaseMatchModel = mongoose.models['GearCaseMatch'] as GearCaseMatchModel || 
  mongoose.model<IGearCaseMatch, GearCaseMatchModel>('GearCaseMatch', GearCaseMatchSchema, 'GearCaseMatch');
