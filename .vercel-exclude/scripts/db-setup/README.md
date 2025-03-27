# Database Setup Scripts

This directory contains scripts for setting up the MongoDB Atlas database structure for the Gear Case Finder application.

## Overview

The scripts create the following collections with appropriate schema validation and indexes:

1. **AudioGear** - Stores audio equipment data
2. **Case** - Stores protective case data
3. **GearCaseMatch** - Stores compatibility matches between gear and cases
4. **User** - Stores user preferences and history
5. **Content** - Stores SEO-optimized content
6. **Analytics** - Tracks website performance
7. **Affiliate** - Manages affiliate links and tracking

## Usage

To run the database setup scripts:

```bash
npm run db:setup
```

This will:
1. Connect to your MongoDB Atlas instance using the connection string in your `.env.local` file
2. Create all required collections if they don't exist
3. Set up schema validation for each collection
4. Create appropriate indexes for optimized queries

## Environment Setup

Before running the scripts, make sure you have the following environment variable set in your `.env.local` file:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

Replace `<username>`, `<password>`, `<cluster-url>`, and `<database-name>` with your MongoDB Atlas credentials.

## Collection Details

### AudioGear
- Stores information about audio equipment
- Includes dimensions, weight, and other specifications
- Indexed for efficient searching by name, brand, category, and type

### Case
- Stores information about protective cases
- Includes interior and exterior dimensions, features, and specifications
- Indexed for efficient searching by name, brand, type, and dimensions

### GearCaseMatch
- Stores compatibility matches between audio gear and cases
- Includes compatibility scores based on dimensions and features
- Has a unique index on gearId and caseId to prevent duplicate matches

### User
- Stores user information, preferences, and history
- Includes search and view history
- Indexed for efficient user lookup by email

### Content
- Stores SEO-optimized content like articles and guides
- Includes metadata for SEO optimization
- Has text indexes for content search functionality

### Analytics
- Tracks website performance metrics
- Stores page views, searches, matches, clicks, and revenue data
- Indexed by date for efficient time-based queries

### Affiliate
- Manages affiliate program information
- Tracks clicks and revenue by affiliate
- Indexed by platform and active status
