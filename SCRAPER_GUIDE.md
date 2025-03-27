# Guide: Running Scrapers Locally to Populate MongoDB with Real Data

This guide will walk you through the process of running the enhanced scrapers locally to populate your MongoDB database with real data and images for the Gear Case Finder application.

## Prerequisites

1. Node.js (v16 or higher)
2. npm (v7 or higher)
3. Git
4. MongoDB connection string (already configured)
5. Local clone of the repository

## Setup Instructions

### 1. Clone the Repository (if you haven't already)

```bash
git clone https://github.com/miguelhd/gear-case-finder.git
cd gear-case-finder
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Required Directories

The scrapers need certain directories to store data and images:

```bash
mkdir -p data
mkdir -p logs
mkdir -p public/images
```

### 4. Create Environment File

Create a `.env.local` file in the root directory with your MongoDB connection string:

```bash
echo "MONGODB_URI=mongodb+srv://gearCaseApp:rucwoj-watxor-Rocji5@gearcasefindercluster.emncnyk.mongodb.net/?retryWrites=true&w=majority&appName=GearCaseFinderCluster" > .env.local
```

## Running the Scrapers

### 1. Restore Scripts Directory

The scripts directory was moved to `.vercel-exclude` during our Vercel deployment fixes. Let's restore it:

```bash
# Create scripts directory if it doesn't exist
mkdir -p scripts

# Copy the scripts from .vercel-exclude
cp -r .vercel-exclude/scripts/* scripts/
```

### 2. Compile TypeScript Files

Before running the scrapers, we need to compile the TypeScript files:

```bash
# Install ts-node globally if you don't have it
npm install -g ts-node typescript

# Compile the TypeScript files
npx tsc --skipLibCheck
```

### 3. Run the Enhanced Scrapers

Now you can run the enhanced scrapers to populate your MongoDB database with real data and images:

```bash
# Using ts-node (recommended for development)
npx ts-node scripts/run-enhanced-scrapers.ts

# Alternatively, if you compiled the TypeScript files
node dist/scripts/run-enhanced-scrapers.js
```

This script will:
- Connect to MongoDB using your connection string
- Run scrapers for multiple marketplaces (Amazon, eBay, Etsy, etc.)
- Download product images and store them in `public/images`
- Save product data to MongoDB in the appropriate collections
- Create relationships between audio gear and compatible cases

The script may take some time to run as it scrapes multiple websites and downloads images.

## Monitoring Progress

You can monitor the progress of the scrapers in several ways:

### 1. Console Output

The scrapers will output progress information to the console, including:
- Connection status to MongoDB
- Search queries being executed
- Number of results found for each query
- Image download status
- Database save operations

### 2. Log Files

The scrapers also write detailed logs to the `logs` directory:
- `logs/image-downloader.log` - Image download operations
- `logs/mongodb.log` - Database operations
- `logs/error.log` - Any errors encountered

You can view these logs in real-time using:

```bash
tail -f logs/image-downloader.log
```

### 3. Data Files

The scrapers save raw data to the `data` directory as JSON files, which can be useful for debugging or backup purposes.

## Verifying Results

After the scrapers have completed, you can verify that the data has been properly saved to MongoDB:

### 1. Check MongoDB Collections

You can use MongoDB Compass or the MongoDB Atlas web interface to check that the collections have been populated:
- `AudioGear` collection should contain synthesizers, keyboards, mixers, etc.
- `Case` collection should contain protective cases
- `GearCaseMatch` collection should contain compatibility matches

### 2. Check Downloaded Images

The downloaded images should be in the `public/images` directory, organized by marketplace and product ID.

### 3. Run the Application Locally

Start the application locally to see the real data:

```bash
npm run dev
```

Then open your browser to `http://localhost:3000` to see the application with real data and images.

## Troubleshooting

### Connection Issues

If you encounter MongoDB connection issues:
- Verify that your MongoDB connection string is correct in `.env.local`
- Check that your IP address is whitelisted in MongoDB Atlas
- Ensure that the MongoDB user has the correct permissions

### Scraper Issues

If the scrapers fail to retrieve data:
- Some websites may block scraping attempts
- Try reducing the number of concurrent requests
- Add delays between requests by modifying the scraper configuration

### Image Download Issues

If images fail to download:
- Check that the `public/images` directory exists and is writable
- Verify that the image URLs are accessible
- Some websites may block direct image downloads

## Advanced Configuration

You can customize the scraper behavior by modifying the options in `scripts/run-enhanced-scrapers.ts`:

```typescript
// Create enhanced scraper manager with custom options
const manager = new EnhancedScraperManager({
  dataDirectory: path.resolve('./data'),
  logDirectory: path.resolve('./logs'),
  imageDirectory: path.resolve('./public/images'),
  saveToDatabase: true,
  downloadImages: true,
  mongodbUri: process.env.MONGODB_URI || 'mongodb+srv://gearCaseApp:rucwoj-watxor-Rocji5@gearcasefindercluster.emncnyk.mongodb.net/?retryWrites=true&w=majority&appName=GearCaseFinderCluster',
  maxRetries: 3,                // Number of retry attempts for failed requests
  delayBetweenRetries: 2000,    // Delay in ms between retries
  concurrentRequests: 5,        // Number of concurrent requests
  userAgentRotation: true       // Rotate user agents to avoid detection
});
```

## Scheduling Regular Updates

For keeping your database up-to-date with fresh data, consider setting up a cron job to run the scrapers regularly:

```bash
# Add to crontab to run daily at 2 AM
0 2 * * * cd /path/to/gear-case-finder && npx ts-node scripts/run-enhanced-scrapers.ts >> logs/cron.log 2>&1
```

## Conclusion

By following this guide, you should now have your MongoDB database populated with real data and images from various marketplaces. The Gear Case Finder application will use this data to match audio gear with compatible cases.

If you encounter any issues or need further assistance, please refer to the troubleshooting section or reach out for support.
