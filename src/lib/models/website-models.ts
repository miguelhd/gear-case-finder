import { Schema, model, Document, models, Model } from 'mongoose';

// User model for storing user preferences and history
export interface IUser extends Document {
  email: string;
  name?: string;
  preferences?: {
    preferredBrands?: string[];
    excludedBrands?: string[];
    preferredFeatures?: string[];
    preferredProtectionLevel?: 'low' | 'medium' | 'high';
    maxPrice?: number;
  };
  searchHistory?: Array<{
    query: string;
    timestamp: Date;
  }>;
  viewHistory?: Array<{
    gearId: string;
    caseId: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  preferences: {
    preferredBrands: [{ type: String }],
    excludedBrands: [{ type: String }],
    preferredFeatures: [{ type: String }],
    preferredProtectionLevel: { 
      type: String, 
      enum: ['low', 'medium', 'high'] 
    },
    maxPrice: { type: Number }
  },
  searchHistory: [{
    query: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  viewHistory: [{
    gearId: { type: String },
    caseId: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Content model for storing SEO-optimized content
export interface IContent extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  contentType: 'article' | 'guide' | 'review' | 'comparison';
  relatedGearIds?: string[];
  relatedCaseIds?: string[];
  author?: string;
  publishDate: Date;
  updateDate?: Date;
  status: 'draft' | 'published' | 'archived';
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
  keywords: [{ type: String }],
  contentType: { 
    type: String, 
    enum: ['article', 'guide', 'review', 'comparison'],
    required: true
  },
  relatedGearIds: [{ type: String }],
  relatedCaseIds: [{ type: String }],
  author: { type: String },
  publishDate: { type: Date, default: Date.now },
  updateDate: { type: Date },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

// Analytics model for tracking website performance
export interface IAnalytics extends Document {
  date: Date;
  pageViews: {
    total: number;
    unique: number;
    byPage: Record<string, number>;
  };
  searches: {
    total: number;
    queries: Record<string, number>;
  };
  matches: {
    total: number;
    byGear: Record<string, number>;
    byCase: Record<string, number>;
  };
  clicks: {
    total: number;
    affiliateLinks: Record<string, number>;
    adClicks: number;
  };
  revenue: {
    total: number;
    byAffiliate: Record<string, number>;
    adRevenue: number;
  };
}

const AnalyticsSchema = new Schema({
  date: { type: Date, required: true, unique: true },
  pageViews: {
    total: { type: Number, default: 0 },
    unique: { type: Number, default: 0 },
    byPage: { type: Map, of: Number, default: {} }
  },
  searches: {
    total: { type: Number, default: 0 },
    queries: { type: Map, of: Number, default: {} }
  },
  matches: {
    total: { type: Number, default: 0 },
    byGear: { type: Map, of: Number, default: {} },
    byCase: { type: Map, of: Number, default: {} }
  },
  clicks: {
    total: { type: Number, default: 0 },
    affiliateLinks: { type: Map, of: Number, default: {} },
    adClicks: { type: Number, default: 0 }
  },
  revenue: {
    total: { type: Number, default: 0 },
    byAffiliate: { type: Map, of: Number, default: {} },
    adRevenue: { type: Number, default: 0 }
  }
});

// Affiliate model for managing affiliate links and tracking
export interface IAffiliate extends Document {
  name: string;
  platform: 'amazon' | 'ebay' | 'aliexpress' | 'etsy' | 'temu' | 'other';
  trackingId: string;
  baseUrl: string;
  commissionRate: number;
  active: boolean;
  totalClicks: number;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

const AffiliateSchema = new Schema({
  name: { type: String, required: true },
  platform: { 
    type: String, 
    enum: ['amazon', 'ebay', 'aliexpress', 'etsy', 'temu', 'other'],
    required: true
  },
  trackingId: { type: String, required: true },
  baseUrl: { type: String, required: true },
  commissionRate: { type: Number, required: true },
  active: { type: Boolean, default: true },
  totalClicks: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 }
}, { timestamps: true });

// Create and export models
export const User = models.User || model<IUser>('User', UserSchema);
export const Content = models.Content || model<IContent>('Content', ContentSchema);
export const Analytics = models.Analytics || model<IAnalytics>('Analytics', AnalyticsSchema);