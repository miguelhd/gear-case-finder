# Database Import Scripts

This directory contains scripts for importing data into the MongoDB Atlas database for the Gear Case Finder application.

## Overview

The import scripts read data from JSON files in the `data` directory and import them into the appropriate MongoDB collections. The scripts handle:

1. Data transformation to match collection schemas
2. Duplicate detection and updates
3. Relationship generation between collections
4. Sample data creation for testing

## Usage

To run the database import scripts:

```bash
npm run db:import
```

This will:
1. Connect to your MongoDB Atlas instance using the connection string in your `.env` file
2. Read all JSON files from the `data` directory
3. Process and transform the data to match collection schemas
4. Import the data into the appropriate collections
5. Generate matches between audio gear and cases

## Environment Setup

Before running the scripts, make sure you have the following environment variable set in your `.env` file:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

Replace `<username>`, `<password>`, `<cluster-url>`, and `<database-name>` with your MongoDB Atlas credentials.

## Data Format

The import scripts expect JSON files in the `data` directory to contain arrays of normalized product objects with the following structure:

```json
[
  {
    "title": "Product Title",
    "description": "Product Description",
    "price": 99.99,
    "currency": "USD",
    "url": "https://example.com/product",
    "imageUrls": ["https://example.com/image1.jpg"],
    "dimensions": {
      "length": 10,
      "width": 5,
      "height": 2,
      "unit": "in"
    },
    "weight": {
      "value": 2,
      "unit": "lb"
    },
    "marketplace": "amazon",
    "rating": 4.5,
    "reviewCount": 100,
    "availability": "In Stock",
    "seller": {
      "name": "Seller Name",
      "url": "https://example.com/seller",
      "rating": 4.8
    },
    "category": "Category",
    "features": ["Feature 1", "Feature 2"],
    "scrapedAt": "2025-03-26T20:00:00.000Z",
    "normalizedAt": "2025-03-26T20:00:00.000Z",
    "productType": "synthesizer",
    "isCase": false,
    "sourceId": "PRODUCT123"
  }
]
```

The `isCase` field is used to determine whether the product should be imported into the AudioGear or Case collection.

## Collection Import Scripts

### AudioGear

The AudioGear import script (`importers/audioGear.js`) imports audio equipment data into the AudioGear collection. It includes:

- Brand extraction from product title
- Popularity score calculation based on rating and review count
- Release year extraction from product description
- Duplicate detection and updates

### Case

The Case import script (`importers/case.js`) imports case data into the Case collection. It includes:

- Case type determination based on title and description
- Protection level assessment
- Feature detection (waterproof, shockproof, padding, etc.)
- Material and color extraction
- Duplicate detection and updates

### GearCaseMatch

The GearCaseMatch import script (`importers/gearCaseMatch.js`) generates compatibility matches between audio gear and cases. It includes:

- Compatibility score calculation based on dimensions, protection, and features
- Human-readable compatibility reason generation
- Match filtering to ensure quality matches
- Duplicate detection and updates

### Other Collections

The import scripts also include importers for:

- User data (`importers/user.js`)
- Content data (`importers/content.js`)
- Analytics data (`importers/analytics.js`)
- Affiliate data (`importers/affiliate.js`)

Each of these scripts includes sample data generation for testing purposes.

## Sample Data

The import scripts can generate sample data for testing if no data is provided. To use this feature, simply run the import script without any data files in the `data` directory:

```bash
rm -rf data/*.json  # Remove any existing data files
npm run db:import   # Run import with sample data generation
```

## Troubleshooting

If you encounter issues with the import scripts:

1. Check your MongoDB connection string in the `.env` file
2. Ensure your MongoDB Atlas cluster is accessible from your network
3. Verify that the data files in the `data` directory are in the correct format
4. Check the console output for specific error messages
