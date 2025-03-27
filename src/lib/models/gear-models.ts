import { Schema, model, Document, models, Model } from 'mongoose';
import mongoose from 'mongoose';

// Audio Gear interface
export interface IAudioGear extends Document {
  name: string;
  brand: string;
  category: string;
  type: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  weight: {
    value: number;
    unit: string;
  };
  imageUrl?: string;
  productUrl?: string;
  description?: string;
  popularity?: number;
  releaseYear?: number;
  discontinued?: boolean;
  marketplace?: string;
  price?: number;
  currency?: string;
  url?: string;
  imageUrls?: string[];
  availability?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Audio Gear schema
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

// Case interface
export interface ICase extends Document {
  name: string;
  brand: string;
  type: string;
  dimensions: {
    interior: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
    exterior?: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
  };
  // Add internalDimensions property to match usage in the codebase
  internalDimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  externalDimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  features?: string[];
  price?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  productUrl?: string;
  description?: string;
  protectionLevel?: 'low' | 'medium' | 'high';
  waterproof?: boolean;
  shockproof?: boolean;
  hasPadding?: boolean;
  hasCompartments?: boolean;
  hasHandle?: boolean;
  hasWheels?: boolean;
  hasLock?: boolean;
  material?: string;
  color?: string;
  marketplace?: string;
  url?: string;
  imageUrls?: string[];
  availability?: string;
  seller?: {
    name?: string;
    url?: string;
    rating?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Case schema
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

// Gear-Case Match interface
export interface IGearCaseMatch extends Document {
  gearId: string;
  caseId: string;
  compatibilityScore: number;
  dimensionScore: number;
  featureScore: number;
  userFeedbackScore: number;
  totalFeedback: number;
  positiveCount: number;
  negativeCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Gear-Case Match schema
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

// Create and export models
export const AudioGear = models.AudioGear || model<IAudioGear>('AudioGear', AudioGearSchema, 'AudioGear');
export const Case = models.Case || model<ICase>('Case', CaseSchema, 'Case');
export const GearCaseMatch = models.GearCaseMatch || model<IGearCaseMatch>('GearCaseMatch', GearCaseMatchSchema, 'GearCaseMatch');
