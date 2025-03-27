import { MongoDBIntegration } from '../lib/scrapers/mongodb-integration';
import { ImageDownloader } from '../lib/scrapers/image-downloader';
import dotenv from 'dotenv';
import path from 'path';
import { promises as fs } from 'fs';

// Load environment variables
dotenv.config();

// Sample product data for testing
const sampleProducts = [
  {
    id: 'test-synth-1',
    sourceId: 'synth123',
    marketplace: 'amazon',
    title: 'Korg Minilogue XD Synthesizer',
    description: 'The Korg Minilogue XD is a powerful analog/digital hybrid synthesizer with 4 voices, digital multi-engine, and effects.',
    price: 649.99,
    currency: 'USD',
    url: 'https://www.amazon.com/Korg-Minilogue-XD-Synthesizer/dp/B07MWDWGLT',
    imageUrls: [
      'https://m.media-amazon.com/images/I/71iT+WXxHzL._AC_SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71XcZVBF9HL._AC_SL1500_.jpg'
    ],
    dimensions: {
      length: 12.8,
      width: 7.44,
      height: 2.76,
      unit: 'in'
    },
    weight: {
      value: 5.73,
      unit: 'lb'
    },
    rating: 4.7,
    reviewCount: 245,
    availability: 'In Stock',
    seller: {
      name: 'Korg Official Store',
      url: 'https://www.amazon.com/stores/Korg/page/1234ABCD',
      rating: 4.8
    },
    category: 'synthesizer',
    features: [
      '4-voice analog synthesizer with digital multi-engine',
      '37 slim keys with velocity sensitivity',
      '16-step polyphonic sequencer',
      'Digital effects (modulation, reverb, delay)',
      'USB and MIDI connectivity'
    ],
    scrapedAt: new Date(),
    normalizedAt: new Date(),
    productType: 'synthesizer',
    isCase: false
  },
  {
    id: 'test-case-1',
    sourceId: 'case123',
    marketplace: 'amazon',
    title: 'Gator Cases Hardshell Case for Synthesizers',
    description: 'Gator Cases Hardshell Case for 61-key Synthesizers and Keyboards with TSA Latches, Wheels, and EPS Foam Interior (GK-61-TSA)',
    price: 249.99,
    currency: 'USD',
    url: 'https://www.amazon.com/Gator-Hardshell-Synthesizers-Keyboards-GK-61-TSA/dp/B00AKDQBXM',
    imageUrls: [
      'https://m.media-amazon.com/images/I/71F9+6XTDFL._AC_SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71jDOc5IQFL._AC_SL1500_.jpg'
    ],
    dimensions: {
      length: 45.5,
      width: 15.5,
      height: 6.5,
      unit: 'in'
    },
    weight: {
      value: 25.0,
      unit: 'lb'
    },
    rating: 4.8,
    reviewCount: 187,
    availability: 'In Stock',
    seller: {
      name: 'Gator Cases Official',
      url: 'https://www.amazon.com/stores/GatorCases/page/5678EFGH',
      rating: 4.9
    },
    category: 'case',
    features: [
      'Hardshell case with TSA-approved locking latches',
      'Wheels and tow handle for easy transport',
      'EPS foam interior for maximum protection',
      'Fits most 61-key synthesizers and keyboards',
      'Waterproof and shockproof design'
    ],
    scrapedAt: new Date(),
    normalizedAt: new Date(),
    productType: 'case',
    isCase: true,
    caseCompatibility: {
      minLength: 0,
      maxLength: 43.5,
      minWidth: 0,
      maxWidth: 14.5,
      minHeight: 0,
      maxHeight: 5.5,
      dimensionUnit: 'in'
    }
  }
];

// Function to ensure directories exist
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

// Main function to test database integration
async function testDatabaseIntegration() {
  try {
    // Ensure directories exist
    await ensureDirectories();
    
    console.log('Starting database integration test...');
    
    // Create MongoDB integration instance
    const mongoDBIntegration = new MongoDBIntegration({
      logDirectory: path.resolve('./logs'),
      connectionUri: process.env.MONGODB_URI || 'mongodb+srv://gearCaseApp:rucwoj-watxor-Rocji5@cluster0.mongodb.net/musician-case-finder'
    });
    
    // Create image downloader instance
    const imageDownloader = new ImageDownloader({
      imageDirectory: path.resolve('./public/images'),
      logDirectory: path.resolve('./logs')
    });
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const connected = await mongoDBIntegration.connect();
    
    if (!connected) {
      console.error('Failed to connect to MongoDB. Aborting test.');
      return;
    }
    
    console.log('Successfully connected to MongoDB');
    
    // Process each sample product
    for (const product of sampleProducts) {
      console.log(`Processing product: ${product.title}`);
      
      // Download images
      if (product.imageUrls && product.imageUrls.length > 0) {
        console.log(`Downloading ${product.imageUrls.length} images for product ${product.id}`);
        const localImagePaths = await imageDownloader.downloadImages(
          product.imageUrls,
          product.marketplace,
          product.sourceId
        );
        
        if (localImagePaths.length > 0) {
          console.log(`Successfully downloaded ${localImagePaths.length} images for product ${product.id}`);
          product.imageUrls = localImagePaths;
        } else {
          console.warn(`Failed to download any images for product ${product.id}`);
        }
      }
      
      // Save to database
      console.log(`Saving product ${product.id} to database`);
      const dbId = await mongoDBIntegration.saveProduct(product);
      
      if (dbId) {
        console.log(`Successfully saved product ${product.id} to database with ID ${dbId}`);
      } else {
        console.warn(`Failed to save product ${product.id} to database`);
      }
    }
    
    // Disconnect from MongoDB
    await mongoDBIntegration.disconnect();
    console.log('Disconnected from MongoDB');
    
    console.log('Database integration test completed successfully');
  } catch (error) {
    console.error('Error in database integration test:', error);
  }
}

// Run the test
testDatabaseIntegration().then(() => {
  console.log('Test script completed');
}).catch(error => {
  console.error('Fatal error running test script:', error);
});
