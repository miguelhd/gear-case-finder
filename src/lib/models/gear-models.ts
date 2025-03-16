// Database schema for audio gear dimensions
import mongoose, { Schema, Document } from 'mongoose';

// Interface for audio gear dimensions
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
  weight?: {
    value: number;
    unit: string;
  };
  imageUrl?: string;
  productUrl?: string;
  description?: string;
  popularity?: number;
  releaseYear?: number;
  discontinued?: boolean;
  additionalInfo?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for audio gear dimensions
const AudioGearSchema: Schema = new Schema({
  name: { type: String, required: true, index: true },
  brand: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  type: { type: String, required: true, index: true },
  dimensions: {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    unit: { type: String, required: true, default: 'in' }
  },
  weight: {
    value: { type: Number },
    unit: { type: String, default: 'lb' }
  },
  imageUrl: { type: String },
  productUrl: { type: String },
  description: { type: String },
  popularity: { type: Number, default: 0 },
  releaseYear: { type: Number },
  discontinued: { type: Boolean, default: false },
  additionalInfo: { type: Map, of: Schema.Types.Mixed },
}, { timestamps: true });

// Create indexes for faster queries
AudioGearSchema.index({ 'dimensions.length': 1 });
AudioGearSchema.index({ 'dimensions.width': 1 });
AudioGearSchema.index({ 'dimensions.height': 1 });
AudioGearSchema.index({ 'weight.value': 1 });

// Create the model
export const AudioGear = mongoose.model<IAudioGear>('AudioGear', AudioGearSchema);

// Interface for case dimensions
export interface ICase extends Document {
  id: string;
  sourceId: string;
  marketplace: string;
  name: string;
  brand?: string;
  type: string;
  externalDimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  internalDimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  price: number;
  currency: string;
  url: string;
  imageUrls: string[];
  description?: string;
  features?: string[];
  rating?: number;
  reviewCount?: number;
  availability?: string;
  seller?: {
    name?: string;
    url?: string;
    rating?: number;
  };
  protectionLevel?: 'low' | 'medium' | 'high';
  waterproof?: boolean;
  shockproof?: boolean;
  hasHandle?: boolean;
  hasWheels?: boolean;
  material?: string;
  color?: string;
  compatibleWith?: string[];
  scrapedAt: Date;
  updatedAt: Date;
}

// Schema for case dimensions
const CaseSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  sourceId: { type: String, required: true },
  marketplace: { type: String, required: true },
  name: { type: String, required: true, index: true },
  brand: { type: String },
  type: { type: String, required: true, index: true },
  externalDimensions: {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    unit: { type: String, required: true, default: 'in' }
  },
  internalDimensions: {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    unit: { type: String, required: true, default: 'in' }
  },
  weight: {
    value: { type: Number },
    unit: { type: String, default: 'lb' }
  },
  price: { type: Number, required: true },
  currency: { type: String, required: true },
  url: { type: String, required: true },
  imageUrls: [{ type: String }],
  description: { type: String },
  features: [{ type: String }],
  rating: { type: Number },
  reviewCount: { type: Number },
  availability: { type: String },
  seller: {
    name: { type: String },
    url: { type: String },
    rating: { type: Number }
  },
  protectionLevel: { type: String, enum: ['low', 'medium', 'high'] },
  waterproof: { type: Boolean },
  shockproof: { type: Boolean },
  hasHandle: { type: Boolean },
  hasWheels: { type: Boolean },
  material: { type: String },
  color: { type: String },
  compatibleWith: [{ type: String }],
  scrapedAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true }
});

// Create indexes for faster queries
CaseSchema.index({ 'internalDimensions.length': 1 });
CaseSchema.index({ 'internalDimensions.width': 1 });
CaseSchema.index({ 'internalDimensions.height': 1 });
CaseSchema.index({ price: 1 });
CaseSchema.index({ rating: 1 });
CaseSchema.index({ protectionLevel: 1 });

// Create the model
export const Case = mongoose.model<ICase>('Case', CaseSchema);

// Interface for matched gear and cases
export interface IGearCaseMatch extends Document {
  gearId: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  compatibilityScore: number;
  dimensionFit: {
    length: number; // percentage of available space used (0-100)
    width: number;
    height: number;
    overall: number;
  };
  priceCategory: 'budget' | 'mid-range' | 'premium';
  protectionLevel: 'low' | 'medium' | 'high';
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema for matched gear and cases
const GearCaseMatchSchema: Schema = new Schema({
  gearId: { type: Schema.Types.ObjectId, ref: 'AudioGear', required: true },
  caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
  compatibilityScore: { type: Number, required: true, index: true },
  dimensionFit: {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    overall: { type: Number, required: true }
  },
  priceCategory: { type: String, enum: ['budget', 'mid-range', 'premium'], required: true },
  protectionLevel: { type: String, enum: ['low', 'medium', 'high'], required: true },
  features: [{ type: String }],
}, { timestamps: true });

// Create compound index for gear and case
GearCaseMatchSchema.index({ gearId: 1, caseId: 1 }, { unique: true });

// Create the model
export const GearCaseMatch = mongoose.model<IGearCaseMatch>('GearCaseMatch', GearCaseMatchSchema);