# Amazon Product Advertising API Integration Guide

This guide explains how to set up and use the Amazon Product Advertising API integration for the Gear Case Finder project.

## Overview

Instead of using web scrapers, we've implemented integration with the Amazon Product Advertising API to fetch real product data. This approach offers several advantages:

- **Reliability**: Official API that doesn't break when websites change
- **Legal Compliance**: Officially sanctioned way to access Amazon product data
- **Data Quality**: Structured data directly from the source
- **Maintenance**: Less maintenance required compared to scrapers

## Prerequisites

To use the Amazon Product Advertising API, you need:

1. An Amazon Associates account
2. API credentials (Access Key and Secret Key)
3. A Partner Tag (also known as Associate Tag)

## Setup Instructions

### 1. Create a .env file

Create a `.env` file in the root directory with the following variables:

```
AMAZON_ACCESS_KEY=your_access_key
AMAZON_SECRET_KEY=your_secret_key
AMAZON_PARTNER_TAG=your_partner_tag
AMAZON_REGION=us-east-1
MONGODB_URI=mongodb+srv://gearCaseApp:rucwoj-watxor-Rocji5@gearcasefindercluster.emncnyk.mongodb.net/?retryWrites=true&w=majority&appName=GearCaseFinderCluster
```

Replace the placeholder values with your actual Amazon API credentials.

### 2. Install Dependencies

Make sure all required dependencies are installed:

```bash
npm install
```

## Using the API Integration

### Running the Test Script

To test the API integration and populate your database with product data:

```bash
node scripts/test-amazon-api.js
```

This script will:
- Search for audio gear and cases using predefined keywords
- Process the results and map them to your database schema
- Store the data in your MongoDB database
- Verify that the data was stored correctly

### Integration Components

The API integration consists of three main components:

1. **Amazon PAAPI Client** (`src/lib/api/amazon-paapi-client.ts`)
   - Handles authentication and API requests
   - Implements the AWS signature process
   - Provides methods for searching products

2. **Amazon Data Mapper** (`src/lib/api/amazon-data-mapper.ts`)
   - Maps Amazon product data to your internal models
   - Extracts product attributes like dimensions and weight
   - Determines if products are audio gear or cases

3. **Amazon API Service** (`src/lib/api/amazon-api-service.ts`)
   - Integrates the client and mapper with MongoDB
   - Provides high-level methods for searching and storing products
   - Handles duplicate detection and updates

## Customizing the Integration

### Adding New Search Keywords

To search for different types of products, modify the `audioGearKeywords` and `caseKeywords` arrays in the `runFullProductSearch` method of the `AmazonApiService` class.

### Modifying Data Mapping

If you need to change how Amazon product data is mapped to your models, modify the mapping functions in `amazon-data-mapper.ts`.

### Adjusting API Parameters

To change the API request parameters (like the number of results returned), modify the `searchItems` method in `amazon-paapi-client.ts`.

## Troubleshooting

### API Rate Limits

The Amazon Product Advertising API has rate limits. If you encounter errors related to rate limiting, try:
- Reducing the number of requests
- Adding longer delays between requests
- Implementing exponential backoff for retries

### Authentication Errors

If you see authentication errors:
- Verify your Access Key and Secret Key
- Check that your system clock is accurate (important for request signing)
- Ensure you're using the correct region

### Data Mapping Issues

If products aren't being mapped correctly:
- Check the console logs for mapping errors
- Modify the extraction functions in `amazon-data-mapper.ts`
- Add more logging to identify where the mapping is failing

## Production Deployment

For production deployment:
- Set up environment variables in your Vercel project
- Ensure your Amazon API credentials are kept secure
- Consider implementing caching to reduce API calls
- Monitor API usage to stay within rate limits

## Resources

- [Amazon Product Advertising API Documentation](https://webservices.amazon.com/paapi5/documentation/)
- [Amazon Associates Program](https://affiliate-program.amazon.com/)
- [AWS Signature Version 4](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html)
