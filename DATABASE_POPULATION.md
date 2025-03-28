# Database Population Guide for Gear Case Finder

## Table of Contents
1. [Introduction](#introduction)
2. [Database Schema Overview](#database-schema-overview)
3. [API Data Sources](#api-data-sources)
4. [Data Transformation Process](#data-transformation-process)
5. [Database Population Methods](#database-population-methods)
   - [Manual Population](#manual-population)
   - [Batch Processing](#batch-processing)
   - [Scheduled Jobs](#scheduled-jobs)
6. [Example Scripts](#example-scripts)
7. [Monitoring and Validation](#monitoring-and-validation)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Introduction

This guide explains how to populate the MongoDB database for the Gear Case Finder application using data from various API sources. The application uses a combination of real-time API calls and batch processing to maintain an up-to-date database of audio gear and protective cases.

## Database Schema Overview

The Gear Case Finder application uses MongoDB with Mongoose as the ODM (Object Document Mapper). The main data models are:

### AudioGear Model

Represents audio equipment with detailed specifications:

```typescript
interface IAudioGear {
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
```

### Case Model

Represents protective cases with interior and exterior dimensions:

```typescript
interface ICase {
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
```

### GearCaseMatch Model

Represents a match between audio gear and a compatible case:

```typescript
interface IGearCaseMatch {
  audioGearId: string;
  caseId: string;
  matchScore: number;
  dimensionDifference: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  isExactMatch: boolean;
  isRecommended: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Normalized Product Interface

Used as an intermediate format when transforming API data:

```typescript
interface NormalizedProduct {
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
```

## API Data Sources

The application retrieves data from the following API sources:

### Canopy API

Used for searching products across multiple marketplaces:

- **Client**: `CanopyApiClient`
- **Data Mapper**: `canopy-data-mapper.ts`
- **Methods**:
  - `searchAudioGear(keywords, limit)`: Search for audio gear
  - `searchCases(keywords, limit)`: Search for protective cases
  - `getProduct(productId)`: Get detailed product information

### Reverb API

Specialized for musical instruments and gear:

- **Client**: `ReverbApiClient`
- **Data Mapper**: `reverb-data-mapper.ts`
- **Methods**:
  - `searchItems(request)`: Search for items on Reverb
  - `getItem(listingId)`: Get detailed information for a specific listing
  - `searchAudioGear(keywords, itemCount)`: Search for audio gear
  - `searchCases(keywords, itemCount)`: Search for cases

### AliExpress API

Provides access to AliExpress marketplace products:

- **Client**: `AliExpressApiClient`
- **Data Mapper**: `aliexpress-data-mapper.ts`
- **Methods**:
  - `searchProducts(query, options)`: Search for products
  - `getProductInfo(productId, options)`: Get detailed product information
  - `getShippingInfo(productId, country, options)`: Get shipping information
  - `searchAudioGear(keywords, options)`: Search for audio gear
  - `searchCases(keywords, options)`: Search for cases

## Data Transformation Process

API data goes through a transformation process before being stored in the database:

1. **API Response**: Raw data from the API
2. **Data Mapping**: Processed by the corresponding data mapper
3. **Normalization**: Converted to `NormalizedProduct` format
4. **Model Conversion**: Transformed into Mongoose model instances
5. **Database Storage**: Saved to the MongoDB database

### Example Transformation Flow

```
API Response → Data Mapper → NormalizedProduct → Mongoose Model → Database
```

### Code Example: Transforming API Data

```typescript
// From api-integration-service.ts
private convertAudioGearToNormalizedProduct(audioGear: IAudioGear): NormalizedProduct {
  const now = new Date();
  
  // Create a base product
  const baseProduct = {
    id: audioGear._id?.toString() || `audio_gear_${Date.now()}`,
    sourceId: audioGear._id?.toString() || `audio_gear_${Date.now()}`,
    marketplace: audioGear.marketplace || 'unknown',
    title: audioGear.name,
    description: audioGear.description || '',
    price: audioGear.price || 0,
    currency: audioGear.currency || 'USD',
    url: audioGear.productUrl || '',
    imageUrls: audioGear.imageUrl ? [audioGear.imageUrl] : [],
    dimensions: {
      length: audioGear.dimensions.length,
      width: audioGear.dimensions.width,
      height: audioGear.dimensions.height,
      unit: audioGear.dimensions.unit
    },
    rating: 0,
    reviewCount: 0,
    availability: 'in_stock',
    seller: {
      name: 'Unknown Seller',
      url: '',
      rating: 0
    },
    category: audioGear.category,
    features: [],
    scrapedAt: now,
    normalizedAt: now,
    productType: 'audio_gear',
    isCase: false
  };
  
  // Use type assertion to add the weight property conditionally
  const result = baseProduct as NormalizedProduct;
  
  // Only add weight property if it exists in the source
  if (audioGear.weight) {
    result.weight = {
      value: audioGear.weight.value,
      unit: audioGear.weight.unit
    };
  }
  
  return result;
}
```

## Database Population Methods

There are three main methods for populating the database:

### Manual Population

Use the API integration service to manually populate the database:

```typescript
import { ApiIntegrationService } from '../lib/api/api-integration-service';

async function populateDatabase() {
  const apiService = new ApiIntegrationService();
  await apiService.initialize();
  
  // Search for audio gear
  const synthesizers = await apiService.searchAudioGear('synthesizer', { limit: 20 });
  console.log(`Found ${synthesizers.length} synthesizers`);
  
  // Search for cases
  const cases = await apiService.searchCases('keyboard case', { limit: 20 });
  console.log(`Found ${cases.length} cases`);
  
  // Get product details
  const product = await apiService.getProductDetails('reverb', 'product123');
  console.log(`Got details for ${product?.title}`);
}
```

### Batch Processing

Use the batch processing system for bulk operations:

```typescript
import { BatchProcessingSystem } from '../lib/api/batch-processing-system';

async function runBatchProcess() {
  const batchSystem = new BatchProcessingSystem({
    canopyApiKey: process.env.CANOPY_API_KEY || '',
    reverbAccessToken: process.env.REVERB_API_TOKEN || ''
  });
  
  await batchSystem.initialize();
  
  // Refresh product data
  await batchSystem.refreshProductData();
  console.log('Product data refresh completed');
  
  // Refresh dimension data
  await batchSystem.refreshDimensionData();
  console.log('Dimension data refresh completed');
  
  // Refresh price data
  await batchSystem.refreshPriceData();
  console.log('Price data refresh completed');
}
```

### Scheduled Jobs

Configure the batch processing system to run jobs on a schedule:

```typescript
import { BatchProcessingSystem } from '../lib/api/batch-processing-system';

async function setupScheduledJobs() {
  const batchSystem = new BatchProcessingSystem({
    canopyApiKey: process.env.CANOPY_API_KEY || '',
    reverbAccessToken: process.env.REVERB_API_TOKEN || '',
    schedules: {
      productRefresh: '0 0 * * *',  // Daily at midnight
      dimensionRefresh: '0 0 1 * *', // Monthly on the 1st
      priceRefresh: '0 */12 * * *'  // Every 12 hours
    }
  });
  
  await batchSystem.initialize();
  console.log('Scheduled jobs are now running');
}
```

## Example Scripts

### Initial Database Population

This script performs an initial population of the database with audio gear and cases:

```typescript
// scripts/initial-population.ts
import { ApiIntegrationService } from '../lib/api/api-integration-service';
import connectToMongoDB from '../lib/mongodb';

async function initialPopulation() {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Initialize API service
    const apiService = new ApiIntegrationService();
    await apiService.initialize();
    
    console.log('Starting initial database population...');
    
    // Define search terms for audio gear
    const audioGearKeywords = [
      'synthesizer keyboard',
      'digital piano',
      'midi controller',
      'drum machine',
      'audio interface',
      'mixer console',
      'groovebox',
      'sampler'
    ];
    
    // Define search terms for cases
    const caseKeywords = [
      'keyboard case',
      'synthesizer case',
      'instrument case',
      'gear protection case',
      'equipment case',
      'drum machine case',
      'audio interface case'
    ];
    
    // Search and store audio gear
    for (const keyword of audioGearKeywords) {
      console.log(`Searching for audio gear: ${keyword}`);
      const results = await apiService.searchAudioGear(keyword, { limit: 10 });
      console.log(`Found ${results.length} items for "${keyword}"`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Search and store cases
    for (const keyword of caseKeywords) {
      console.log(`Searching for cases: ${keyword}`);
      const results = await apiService.searchCases(keyword, { limit: 10 });
      console.log(`Found ${results.length} items for "${keyword}"`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Initial database population completed successfully');
  } catch (error) {
    console.error('Error during initial population:', error);
  }
}

initialPopulation();
```

### Scheduled Data Refresh

This script sets up scheduled jobs to keep the database up-to-date:

```typescript
// scripts/scheduled-refresh.ts
import { BatchProcessingSystem } from '../lib/api/batch-processing-system';
import connectToMongoDB from '../lib/mongodb';

async function setupScheduledRefresh() {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Initialize batch processing system
    const batchSystem = new BatchProcessingSystem({
      canopyApiKey: process.env.CANOPY_API_KEY || '',
      reverbAccessToken: process.env.REVERB_API_TOKEN || '',
      schedules: {
        productRefresh: '0 0 * * *',  // Daily at midnight
        dimensionRefresh: '0 0 1 * *', // Monthly on the 1st
        priceRefresh: '0 */12 * * *'  // Every 12 hours
      }
    });
    
    await batchSystem.initialize();
    console.log('Scheduled refresh jobs are now running');
    
    // Keep the process running
    process.stdin.resume();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Stopping scheduled jobs...');
      batchSystem.stopScheduledJobs();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error setting up scheduled refresh:', error);
  }
}

setupScheduledRefresh();
```

### Manual Data Update

This script allows manual updating of specific data:

```typescript
// scripts/manual-update.ts
import { ApiIntegrationService } from '../lib/api/api-integration-service';
import connectToMongoDB from '../lib/mongodb';

async function manualUpdate() {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Initialize API service
    const apiService = new ApiIntegrationService();
    await apiService.initialize();
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const operation = args[0];
    
    if (operation === 'search-gear') {
      const keyword = args[1] || 'synthesizer';
      console.log(`Searching for audio gear: ${keyword}`);
      const results = await apiService.searchAudioGear(keyword, { limit: 10 });
      console.log(`Found ${results.length} items for "${keyword}"`);
    } else if (operation === 'search-cases') {
      const keyword = args[1] || 'keyboard case';
      console.log(`Searching for cases: ${keyword}`);
      const results = await apiService.searchCases(keyword, { limit: 10 });
      console.log(`Found ${results.length} items for "${keyword}"`);
    } else if (operation === 'run-batch') {
      const jobType = args[1] || 'productRefresh';
      console.log(`Running batch job: ${jobType}`);
      await apiService.runBatchJob(jobType);
      console.log(`Batch job ${jobType} completed`);
    } else {
      console.log('Available operations:');
      console.log('  search-gear [keyword]');
      console.log('  search-cases [keyword]');
      console.log('  run-batch [jobType]');
    }
  } catch (error) {
    console.error('Error during manual update:', error);
  }
}

manualUpdate();
```

## Monitoring and Validation

### Monitoring Database Population

The batch processing system records job execution in the `batch_processing` collection:

```typescript
// Example of querying job history
import { ApiIntegrationService } from '../lib/api/api-integration-service';

async function checkJobHistory() {
  const apiService = new ApiIntegrationService();
  await apiService.initialize();
  
  const jobHistory = await apiService.getBatchJobHistory(10);
  console.log('Recent batch jobs:');
  jobHistory.forEach(job => {
    console.log(`${job.jobType}: ${job.status} (${job.createdAt})`);
    console.log(`  Items processed: ${job.itemsProcessed}`);
    console.log(`  Duration: ${job.duration}ms`);
  });
}
```

### Validating Data Quality

Use these methods to validate the quality of the data in the database:

```typescript
import { AudioGear, Case } from '../lib/models/gear-models';
import mongoose from 'mongoose';
import connectToMongoDB from '../lib/mongodb';

async function validateDatabaseData() {
  await connectToMongoDB();
  
  // Check for audio gear with missing dimensions
  const invalidAudioGear = await AudioGear.find({
    $or: [
      { 'dimensions.length': { $lte: 0 } },
      { 'dimensions.width': { $lte: 0 } },
      { 'dimensions.height': { $lte: 0 } }
    ]
  });
  console.log(`Found ${invalidAudioGear.length} audio gear items with invalid dimensions`);
  
  // Check for cases with missing interior dimensions
  const invalidCases = await Case.find({
    $or: [
      { 'dimensions.interior.length': { $lte: 0 } },
      { 'dimensions.interior.width': { $lte: 0 } },
      { 'dimensions.interior.height': { $lte: 0 } }
    ]
  });
  console.log(`Found ${invalidCases.length} cases with invalid interior dimensions`);
  
  // Check for duplicate products
  const duplicateAudioGear = await AudioGear.aggregate([
    { $group: { _id: { name: '$name', brand: '$brand' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  console.log(`Found ${duplicateAudioGear.length} potential duplicate audio gear items`);
  
  // Check database statistics
  const audioGearCount = await AudioGear.countDocuments();
  const caseCount = await Case.countDocuments();
  console.log(`Database contains ${audioGearCount} audio gear items and ${caseCount} cases`);
}
```

## Troubleshooting

### Common Issues and Solutions

#### API Rate Limiting

**Issue**: API requests fail due to rate limiting.

**Solution**:
- Implement exponential backoff and retry logic
- Add delays between API requests
- Use the batch processing system with appropriate scheduling

```typescript
// Example of implementing retry logic
async function fetchWithRetry(fetchFn, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fetchFn();
    } catch (error) {
      if (error.message.includes('rate limit') && retries < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, retries);
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      } else {
        throw error;
      }
    }
  }
}
```

#### Duplicate Data

**Issue**: The database contains duplicate entries for the same product.

**Solution**:
- Implement upsert operations instead of insert
- Use unique indexes on appropriate fields
- Run a deduplication script

```typescript
// Example of using upsert to avoid duplicates
async function storeAudioGearWithUpsert(audioGear) {
  const filter = {
    name: audioGear.name,
    brand: audioGear.brand,
    marketplace: audioGear.marketplace
  };
  
  const update = {
    $set: audioGear,
    $setOnInsert: { createdAt: new Date() }
  };
  
  const options = { upsert: true, new: true };
  
  return await AudioGear.findOneAndUpdate(filter, update, options);
}
```

#### Missing or Invalid Data

**Issue**: Some products have missing or invalid data.

**Solution**:
- Implement data validation before storage
- Use Mongoose schema validation
- Run data quality checks regularly

```typescript
// Example of validating data before storage
function validateAudioGear(audioGear) {
  const errors = [];
  
  if (!audioGear.name) errors.push('Name is required');
  if (!audioGear.brand) errors.push('Brand is required');
  
  if (!audioGear.dimensions) {
    errors.push('Dimensions are required');
  } else {
    if (audioGear.dimensions.length <= 0) errors.push('Length must be positive');
    if (audioGear.dimensions.width <= 0) errors.push('Width must be positive');
    if (audioGear.dimensions.height <= 0) errors.push('Height must be positive');
    if (!audioGear.dimensions.unit) errors.push('Dimension unit is required');
  }
  
  return errors;
}
```

## Best Practices

### Efficient Database Population

1. **Use Batch Processing**: Prefer batch operations over individual API calls and database operations.

2. **Implement Caching**: Cache API responses to reduce duplicate requests.

3. **Schedule Regular Updates**: Use scheduled jobs to keep the database up-to-date.

4. **Validate Data**: Implement validation to ensure data quality.

5. **Handle Errors Gracefully**: Implement proper error handling and retry logic.

6. **Monitor Performance**: Track API call times, database operation times, and job execution times.

7. **Use Upsert Operations**: Avoid duplicates by using upsert operations.

8. **Implement Indexes**: Create appropriate indexes to improve query performance.

9. **Normalize Dimensions**: Store dimensions in a consistent unit system.

10. **Document Your Process**: Keep documentation up-to-date with any changes to the population process.

### Dimension Data Caching

For optimal performance when working with dimensional data:

1. **Create a permanent cache for instrument dimensions** since these are static values that rarely change.

2. **Build a local dimensional search index** to eliminate repeated API calls for the same or similar dimensions.

3. **Implement dimensional range matching** to find cases within acceptable tolerance ranges of the instrument dimensions.

4. **Pre-populate the database with common instrument dimensions** to reduce initial API calls.

5. **Store dimensional data in a normalized format** to enable efficient searching across different measurement units.

6. **Implement a dimensional similarity algorithm** to find cases that might work with slight modifications or padding.

```typescript
// Example of dimension caching implementation
import { DimensionCacheService } from '../lib/api/dimension-cache-service';

async function cacheDimensions() {
  const dimensionCache = new DimensionCacheService();
  await dimensionCache.initialize();
  
  // Cache common instrument dimensions
  await dimensionCache.cacheInstrumentDimensions();
  
  // Build search index
  await dimensionCache.buildSearchIndex();
  
  console.log('Dimension caching completed');
}
```

By following these guidelines and using the provided examples, you can efficiently populate and maintain the Gear Case Finder database with up-to-date information from various API sources.
