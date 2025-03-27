import { EnhancedScraperManager } from '../lib/scrapers/enhanced-scraper-manager';
import { AmazonScraper } from '../lib/scrapers/amazon-scraper';
import { EbayScraper } from '../lib/scrapers/ebay-scraper';
import { EtsyScraper } from '../lib/scrapers/etsy-scraper';
import { AliexpressScraper } from '../lib/scrapers/aliexpress-scraper';
import { TemuScraper } from '../lib/scrapers/temu-scraper';
import dotenv from 'dotenv';
import path from 'path';
import { promises as fs } from 'fs';

// Load environment variables
dotenv.config();

// Create directories if they don't exist
async function ensureDirectories() {
  const dirs = [
    './data',
    './logs',
    './public/images',
  ];
  
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
    console.log(`Ensured directory exists: ${dir}`);
  }
}

// Main function to run the scrapers
async function runScrapers() {
  try {
    // Ensure directories exist
    await ensureDirectories();
    
    console.log('Starting enhanced scraper manager...');
    
    // Create enhanced scraper manager
    const manager = new EnhancedScraperManager({
      dataDirectory: path.resolve('./data'),
      logDirectory: path.resolve('./logs'),
      imageDirectory: path.resolve('./public/images'),
      saveToDatabase: true,
      downloadImages: true,
      mongodbUri: process.env.MONGODB_URI || 'mongodb+srv://gearCaseApp:rucwoj-watxor-Rocji5@cluster0.mongodb.net/musician-case-finder'
    });
    
    // Register scrapers
    manager.registerScraper('amazon', new AmazonScraper());
    manager.registerScraper('ebay', new EbayScraper());
    manager.registerScraper('etsy', new EtsyScraper());
    manager.registerScraper('aliexpress', new AliexpressScraper());
    manager.registerScraper('temu', new TemuScraper());
    
    console.log('Scrapers registered successfully');
    
    // Define search queries for audio gear and cases
    const audioGearQueries = [
      'synthesizer',
      'midi keyboard',
      'audio mixer',
      'drum machine',
      'effects pedal',
      'audio interface',
      'studio microphone',
      'studio headphones',
      'studio monitors'
    ];
    
    const caseQueries = [
      'synthesizer case',
      'keyboard case',
      'mixer case',
      'drum machine case',
      'pedal case',
      'audio interface case',
      'microphone case',
      'headphone case',
      'studio monitor case',
      'gear case',
      'equipment case',
      'instrument case'
    ];
    
    // Run searches for audio gear
    console.log('Starting audio gear searches...');
    for (const query of audioGearQueries) {
      console.log(`Searching for: ${query}`);
      const results = await manager.searchAllMarketplaces(query, { page: 1 });
      console.log(`Found ${results.length} results for query: ${query}`);
    }
    
    // Run searches for cases
    console.log('Starting case searches...');
    for (const query of caseQueries) {
      console.log(`Searching for: ${query}`);
      const results = await manager.searchAllMarketplaces(query, { page: 1 });
      console.log(`Found ${results.length} results for query: ${query}`);
    }
    
    console.log('All searches completed successfully');
    
  } catch (error) {
    console.error('Error running scrapers:', error);
  }
}

// Run the scrapers
runScrapers().then(() => {
  console.log('Scraper script completed');
}).catch(error => {
  console.error('Fatal error running scraper script:', error);
});
