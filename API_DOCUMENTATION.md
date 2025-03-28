# Gear Case Finder API Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [API Overview](#api-overview)
3. [Environment Configuration](#environment-configuration)
4. [API Services](#api-services)
   - [Canopy API](#canopy-api)
   - [Reverb API](#reverb-api)
   - [AliExpress API](#aliexpress-api)
5. [Usage Examples](#usage-examples)
6. [Error Handling](#error-handling)
7. [Caching](#caching)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Configuration](#advanced-configuration)

## Introduction

The Gear Case Finder application uses multiple API services to search for audio gear and matching protective cases across various marketplaces. This documentation provides detailed information on how to configure and use these APIs within the application.

## API Overview

The application integrates with the following APIs:

1. **Canopy API**: Used for searching products across multiple marketplaces
2. **Reverb API**: Specialized for musical instruments and gear
3. **AliExpress API**: Provides access to AliExpress marketplace products

Each API is implemented using a consistent pattern:
- **API Client**: Handles direct communication with the external API
- **Data Mapper**: Transforms API responses into the application's standard format
- **API Service**: Provides business logic, caching, and high-level functionality

## Environment Configuration

To configure the APIs, you need to set up environment variables in a `.env.local` file at the root of the project. Here's a template:

```
# API Keys
CANOPY_API_KEY=your_canopy_api_key
REVERB_API_TOKEN=your_reverb_api_token
ALIEXPRESS_RAPIDAPI_KEY=your_aliexpress_rapidapi_key

# API Configuration
ENABLE_API_CACHING=true
API_CACHE_TTL=86400
MAX_SEARCH_RESULTS=50

# MongoDB Connection
MONGODB_URI=mongodb+srv://gearCaseApp:password@cluster0.mongodb.net/gearCaseDb
```

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| CANOPY_API_KEY | API key for Canopy API | Yes |
| REVERB_API_TOKEN | Access token for Reverb API | Yes |
| ALIEXPRESS_RAPIDAPI_KEY | RapidAPI key for AliExpress API | Yes |
| ENABLE_API_CACHING | Enable/disable API response caching | No (defaults to true) |
| API_CACHE_TTL | Cache time-to-live in seconds | No (defaults to 86400) |
| MAX_SEARCH_RESULTS | Maximum number of search results | No (defaults to 50) |
| MONGODB_URI | MongoDB connection string | Yes |

## API Services

### Canopy API

The Canopy API provides access to product data across multiple marketplaces.

#### Configuration

```typescript
// src/lib/api/api-factory.ts
const canopyConfig = {
  apiKey: process.env.CANOPY_API_KEY || '',
  baseUrl: 'https://api.canopyapi.co/v1'
};
```

#### Available Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| searchProducts | Search for products using various criteria | `request: SearchItemsRequest` |
| getProduct | Get detailed information for a specific product | `productId: string` |
| searchByDimensions | Search for products by dimensions | `length: number, width: number, height: number, unit: string, tolerance: number` |
| searchAudioGear | Search for audio gear | `keywords: string, limit: number` |
| searchCases | Search for protective cases | `keywords: string, limit: number` |
| searchCasesByGearDimensions | Search for cases that match specific gear dimensions | `gear: { length: number, width: number, height: number, unit: string }, tolerance: number` |

### Reverb API

The Reverb API is specialized for musical instruments and gear.

#### Configuration

```typescript
// src/lib/api/api-factory.ts
const reverbConfig = {
  accessToken: process.env.REVERB_API_TOKEN || '',
  baseUrl: 'https://api.reverb.com/api'
};
```

#### Available Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| searchItems | Search for items on Reverb | `request: SearchItemsRequest` |
| getItem | Get detailed information for a specific listing | `listingId: string` |
| searchAudioGear | Search for audio gear on Reverb | `keywords: string, itemCount: number` |
| searchCases | Search for cases on Reverb | `keywords: string, itemCount: number` |

### AliExpress API

The AliExpress API provides access to products on the AliExpress marketplace via RapidAPI.

#### Configuration

```typescript
// src/lib/api/api-factory.ts
const aliexpressConfig = {
  rapidApiKey: process.env.ALIEXPRESS_RAPIDAPI_KEY || '',
  rapidApiHost: 'aliexpress-true-api.p.rapidapi.com',
  baseUrl: 'https://aliexpress-true-api.p.rapidapi.com'
};
```

#### Available Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| searchProducts | Search for products on AliExpress | `query: string, options?: SearchOptions` |
| getProductInfo | Get detailed information for a specific product | `productId: string, options?: ProductOptions` |
| getShippingInfo | Get shipping information for a product | `productId: string, country: string, options?: ShippingOptions` |
| searchAudioGear | Search for audio gear on AliExpress | `keywords: string, options?: SearchOptions` |
| searchCases | Search for cases on AliExpress | `keywords: string, options?: SearchOptions` |
| findMatchingCases | Find cases that match specific audio gear dimensions | `audioGear: IAudioGear, options?: MatchingOptions` |

## Usage Examples

### Basic API Usage

```typescript
import { ApiManager } from '../lib/api/api-manager';

// Initialize API manager
const apiManager = new ApiManager();

// Search for audio gear
async function searchForSynthesizers() {
  const results = await apiManager.searchAudioGear('synthesizer', { limit: 10 });
  console.log(`Found ${results.length} synthesizers`);
  return results;
}

// Get product details
async function getProductDetails(marketplace: string, productId: string) {
  const details = await apiManager.getAudioGearDetails(marketplace, productId);
  console.log(`Product details: ${details.name} by ${details.brand}`);
  return details;
}

// Find matching cases for a specific audio gear
async function findCasesForGear(audioGear: IAudioGear) {
  const matchingCases = await apiManager.findMatchingCases(audioGear);
  console.log(`Found ${matchingCases.length} matching cases`);
  return matchingCases;
}
```

### Using Specific API Services

```typescript
import { ApiFactory } from '../lib/api/api-factory';

// Get specific API service
const aliexpressService = ApiFactory.createAliexpressApiService();

// Search for products
async function searchAliExpress(query: string) {
  const results = await aliexpressService.searchProducts(query);
  console.log(`Found ${results.length} products on AliExpress`);
  return results;
}

// Get product details
async function getAliExpressProductDetails(productId: string) {
  const details = await aliexpressService.getProductInfo(productId);
  console.log(`Product details: ${details.title}`);
  return details;
}
```

## Error Handling

All API methods include error handling to prevent application crashes. Errors are logged and can be handled in your application code.

```typescript
try {
  const results = await apiManager.searchAudioGear('synthesizer');
  // Process results
} catch (error) {
  console.error('Error searching for audio gear:', error);
  // Handle error (e.g., show error message to user)
}
```

The API services also include built-in error handling:

```typescript
// From src/lib/api/aliexpress-api-service.ts
async searchProducts(query: string, options?: SearchOptions): Promise<any[]> {
  try {
    // API call logic
    return results;
  } catch (error) {
    this.logger.error(`Error searching AliExpress products: ${error.message}`);
    return [];  // Return empty array instead of throwing
  }
}
```

## Caching

The API services include built-in caching to improve performance and reduce API calls. Caching is enabled by default and can be configured using environment variables.

```
ENABLE_API_CACHING=true
API_CACHE_TTL=86400  # Cache time-to-live in seconds (24 hours)
```

The caching system uses a memory cache by default but can be configured to use Redis or another caching solution.

### Cache Configuration

```typescript
// src/lib/api/api-factory.ts
const cacheOptions = {
  enabled: process.env.ENABLE_API_CACHING !== 'false',
  ttl: parseInt(process.env.API_CACHE_TTL || '86400', 10)
};
```

## Troubleshooting

### Common Issues

#### API Keys Not Working

1. Verify that your API keys are correctly set in the `.env.local` file
2. Check that the API keys have not expired
3. Ensure you have the necessary permissions for the API endpoints you're trying to access

#### Rate Limiting

1. Implement proper caching to reduce API calls
2. Add retry logic with exponential backoff for rate-limited requests
3. Consider upgrading your API plan if you consistently hit rate limits

#### Slow API Responses

1. Enable caching to reduce API calls
2. Optimize your queries to request only the data you need
3. Implement pagination to load data in smaller chunks

### Debugging

The application includes a logging system that can help debug API issues:

```typescript
// Enable debug logging
import { configureLogger } from '../lib/logging';
configureLogger({ level: 'debug' });

// API calls will now log detailed information
```

## Advanced Configuration

### Custom API Endpoints

You can configure custom API endpoints by modifying the baseUrl in the API configuration:

```typescript
// src/lib/api/api-factory.ts
const canopyConfig = {
  apiKey: process.env.CANOPY_API_KEY || '',
  baseUrl: process.env.CANOPY_API_BASE_URL || 'https://api.canopyapi.co/v1'
};
```

Then add the custom base URL to your environment variables:

```
CANOPY_API_BASE_URL=https://custom-endpoint.example.com/api
```

### Extending API Functionality

To add new API methods, extend the appropriate API client and service classes:

```typescript
// Example: Adding a new method to AliExpressApiClient
export class CustomAliExpressApiClient extends AliExpressApiClient {
  async getSellerInfo(sellerId: string): Promise<any> {
    // Implementation
  }
}

// Then update the factory to use your custom client
ApiFactory.createAliexpressApiClient = () => {
  return new CustomAliExpressApiClient(aliexpressConfig);
};
```

### Implementing New API Sources

To add a new API source:

1. Create a new API client class (e.g., `new-api-client.ts`)
2. Create a new data mapper (e.g., `new-api-data-mapper.ts`)
3. Create a new API service (e.g., `new-api-service.ts`)
4. Update `api-factory.ts` to create instances of your new classes
5. Update `api-manager.ts` to use your new API service

Example implementation for a new API source:

```typescript
// src/lib/api/new-api-client.ts
export class NewApiClient {
  // Implementation
}

// src/lib/api/new-api-data-mapper.ts
export class NewApiDataMapper {
  // Implementation
}

// src/lib/api/new-api-service.ts
export class NewApiService {
  // Implementation
}

// src/lib/api/api-factory.ts
export class ApiFactory {
  // Add methods to create your new API components
  static createNewApiClient() {
    // Implementation
  }
  
  static createNewApiService() {
    // Implementation
  }
}

// src/lib/api/api-manager.ts
export class ApiManager {
  private newApiService: NewApiService;
  
  constructor() {
    // Initialize your new API service
    this.newApiService = ApiFactory.createNewApiService();
  }
  
  // Add methods to use your new API service
}
```
