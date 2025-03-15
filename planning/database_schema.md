# Database Schema Design

## Overview
The Musician Case Finder website requires several interconnected databases to store product information, audio gear specifications, content, and analytics data. This document outlines the schema design for each database collection.

## Collections

### 1. Products Collection
Stores information about cases scraped from various marketplaces.

```
{
  _id: ObjectId,
  title: String,
  description: String,
  type: String,  // "traditional" or "non-traditional"
  category: String,  // "makeup organizer", "camera case", "tackle box", etc.
  dimensions: {
    length: Number,  // in inches
    width: Number,   // in inches
    height: Number,  // in inches
    unit: String     // "in", "cm", etc.
  },
  weight: {
    value: Number,
    unit: String     // "lbs", "kg", etc.
  },
  features: [String],
  images: [
    {
      url: String,
      alt: String,
      isPrimary: Boolean
    }
  ],
  price: {
    current: Number,
    original: Number,
    currency: String,
    discountPercentage: Number
  },
  marketplace: {
    name: String,     // "Amazon", "eBay", "Etsy", etc.
    productUrl: String,
    affiliateUrl: String,
    sellerId: String,
    sellerName: String,
    rating: Number,   // Seller rating
    reviews: Number   // Number of seller reviews
  },
  productRating: {
    average: Number,
    count: Number
  },
  availability: {
    inStock: Boolean,
    quantity: Number,
    estimatedDelivery: String
  },
  compatibleGear: [ObjectId],  // References to AudioGear collection
  tags: [String],
  createdAt: Date,
  updatedAt: Date,
  lastScraped: Date
}
```

### 2. AudioGear Collection
Stores information about various audio equipment and their specifications.

```
{
  _id: ObjectId,
  name: String,
  brand: String,
  category: String,  // "synthesizer", "mixer", "sampler", "pedal", etc.
  model: String,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: String     // "in", "cm", etc.
  },
  weight: {
    value: Number,
    unit: String     // "lbs", "kg", etc.
  },
  image: String,
  description: String,
  releaseYear: Number,
  popularity: Number,  // Metric to track popularity (0-100)
  suggestedCases: [
    {
      productId: ObjectId,  // Reference to Products collection
      compatibilityScore: Number,  // 0-100
      notes: String
    }
  ],
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Content Collection
Stores generated SEO content for the website.

```
{
  _id: ObjectId,
  title: String,
  slug: String,
  content: String,  // HTML content
  excerpt: String,
  contentType: String,  // "article", "guide", "comparison", "tutorial", etc.
  author: String,
  publishDate: Date,
  lastUpdated: Date,
  seoData: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    focusKeyword: String,
    readabilityScore: Number
  },
  relatedGear: [ObjectId],  // References to AudioGear collection
  relatedProducts: [ObjectId],  // References to Products collection
  featuredImage: String,
  images: [String],
  tags: [String],
  categories: [String],
  status: String,  // "draft", "published", "archived"
  views: Number,
  engagement: {
    averageTimeOnPage: Number,
    bounceRate: Number,
    socialShares: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Marketplace Collection
Stores information about the marketplaces being scraped.

```
{
  _id: ObjectId,
  name: String,  // "Amazon", "eBay", "Etsy", etc.
  baseUrl: String,
  logo: String,
  affiliateProgram: {
    name: String,
    baseUrl: String,
    trackingIdPrefix: String,
    commissionRate: Number,
    cookieDuration: Number  // in days
  },
  apiCredentials: {
    apiKey: String,
    apiSecret: String,
    accessToken: String,
    refreshToken: String,
    expiresAt: Date
  },
  scrapingRules: {
    allowedFrequency: Number,  // in hours
    userAgent: String,
    selectors: {
      title: String,
      price: String,
      description: String,
      images: String,
      dimensions: String,
      availability: String,
      rating: String
    },
    paginationSelector: String,
    productLinkSelector: String
  },
  status: String,  // "active", "paused", "error"
  lastScraped: Date,
  errorLog: [
    {
      date: Date,
      message: String,
      stackTrace: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Analytics Collection
Stores website analytics and performance data.

```
{
  _id: ObjectId,
  date: Date,
  pageViews: {
    total: Number,
    unique: Number,
    byPage: [
      {
        url: String,
        views: Number,
        uniqueViews: Number
      }
    ]
  },
  visitors: {
    total: Number,
    new: Number,
    returning: Number,
    byCountry: [
      {
        country: String,
        count: Number
      }
    ],
    byDevice: [
      {
        deviceType: String,  // "desktop", "mobile", "tablet"
        count: Number
      }
    ]
  },
  traffic: {
    sources: [
      {
        source: String,  // "google", "direct", "referral", etc.
        count: Number
      }
    ],
    keywords: [
      {
        keyword: String,
        count: Number
      }
    ]
  },
  conversions: {
    affiliateClicks: Number,
    clickThroughRate: Number,
    byMarketplace: [
      {
        marketplace: String,
        clicks: Number,
        revenue: Number
      }
    ]
  },
  adPerformance: {
    impressions: Number,
    clicks: Number,
    revenue: Number,
    ctr: Number,
    byAdUnit: [
      {
        adUnit: String,
        impressions: Number,
        clicks: Number,
        revenue: Number
      }
    ]
  },
  createdAt: Date
}
```

### 6. ScrapingJobs Collection
Tracks the status and results of scraping operations.

```
{
  _id: ObjectId,
  marketplaceId: ObjectId,  // Reference to Marketplace collection
  jobType: String,  // "full", "incremental", "single-product"
  status: String,   // "pending", "in-progress", "completed", "failed"
  startTime: Date,
  endTime: Date,
  targetUrl: String,
  searchQuery: String,
  resultsCount: {
    total: Number,
    new: Number,
    updated: Number,
    unchanged: Number,
    failed: Number
  },
  productsProcessed: [ObjectId],  // References to Products collection
  errors: [
    {
      url: String,
      message: String,
      timestamp: Date
    }
  ],
  logs: [
    {
      level: String,  // "info", "warning", "error"
      message: String,
      timestamp: Date
    }
  ],
  nextScheduledRun: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Users Collection
Stores information about website users (for future expansion).

```
{
  _id: ObjectId,
  email: String,
  passwordHash: String,
  firstName: String,
  lastName: String,
  role: String,  // "admin", "user"
  preferences: {
    favoriteGear: [ObjectId],  // References to AudioGear collection
    favoriteProducts: [ObjectId],  // References to Products collection
    newsletterSubscribed: Boolean,
    theme: String  // "light", "dark", "system"
  },
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 8. AffiliateLinks Collection
Tracks affiliate link performance.

```
{
  _id: ObjectId,
  productId: ObjectId,  // Reference to Products collection
  marketplace: String,
  originalUrl: String,
  affiliateUrl: String,
  shortUrl: String,
  clicks: Number,
  conversions: Number,
  revenue: Number,
  lastClicked: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Relationships

1. **Products ↔ AudioGear**: Many-to-many relationship through `compatibleGear` field in Products and `suggestedCases` field in AudioGear.
2. **Content ↔ Products/AudioGear**: Many-to-many relationship through `relatedProducts` and `relatedGear` fields in Content.
3. **Marketplace ↔ Products**: One-to-many relationship through `marketplace.name` field in Products.
4. **Marketplace ↔ ScrapingJobs**: One-to-many relationship through `marketplaceId` field in ScrapingJobs.
5. **Products ↔ AffiliateLinks**: One-to-many relationship through `productId` field in AffiliateLinks.

## Indexing Strategy

### Products Collection
- `_id`: Default index
- `marketplace.name`: For filtering products by marketplace
- `dimensions`: For dimension-based queries in matching algorithm
- `type`, `category`: For filtering by case type and category
- `price.current`: For price-based sorting and filtering
- `updatedAt`, `lastScraped`: For maintenance and update operations

### AudioGear Collection
- `_id`: Default index
- `category`: For filtering by gear type
- `dimensions`: For dimension-based queries in matching algorithm
- `popularity`: For sorting popular gear first

### Content Collection
- `_id`: Default index
- `slug`: For URL routing
- `contentType`: For filtering by content type
- `publishDate`: For sorting by recency
- `tags`, `categories`: For content categorization
- `status`: For filtering published content

### Marketplace Collection
- `_id`: Default index
- `name`: For quick lookup by marketplace name
- `status`: For filtering active marketplaces

### Analytics Collection
- `_id`: Default index
- `date`: For time-series queries

### ScrapingJobs Collection
- `_id`: Default index
- `marketplaceId`: For filtering jobs by marketplace
- `status`: For monitoring active and failed jobs
- `nextScheduledRun`: For scheduling system

### Users Collection
- `_id`: Default index
- `email`: Unique index for user lookup
- `role`: For permission-based queries

### AffiliateLinks Collection
- `_id`: Default index
- `productId`: For linking to products
- `shortUrl`: For quick lookup when redirecting
