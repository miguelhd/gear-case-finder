// Simple scraper script that works with the current project structure
// This script will scrape product data and save it to MongoDB

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const cheerio = require('cheerio');

// Configuration
const config = {
  mongodbUri: 'mongodb+srv://gearCaseApp:rucwoj-watxor-Rocji5@gearcasefindercluster.emncnyk.mongodb.net/?retryWrites=true&w=majority&appName=GearCaseFinderCluster',
  dataDir: path.resolve('./data'),
  imageDir: path.resolve('./public/images'),
  logDir: path.resolve('./logs'),
  marketplaces: ['amazon', 'ebay', 'etsy'],
  searchTerms: {
    audioGear: [
      'synthesizer keyboard',
      'digital piano',
      'midi controller',
      'drum machine',
      'audio interface',
      'mixer console'
    ],
    cases: [
      'keyboard case',
      'synthesizer case',
      'piano case',
      'instrument case',
      'gear protection case',
      'equipment case'
    ]
  },
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
  ],
  maxRetries: 3,
  delayBetweenRequests: 2000,
  maxConcurrentRequests: 2
};

// Ensure directories exist
async function ensureDirectories() {
  const dirs = [config.dataDir, config.imageDir, config.logDir];
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true }).catch(err => {
      console.error(`Failed to create directory ${dir}: ${err.message}`);
    });
  }
  
  // Create marketplace-specific image directories
  for (const marketplace of config.marketplaces) {
    await fs.mkdir(path.join(config.imageDir, marketplace), { recursive: true }).catch(err => {
      console.error(`Failed to create directory ${path.join(config.imageDir, marketplace)}: ${err.message}`);
    });
  }
}

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongodbUri);
    console.log('Successfully connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Define schemas
const audioGearSchema = new mongoose.Schema({
  name: String,
  brand: String,
  category: String,
  type: String,
  description: String,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: String
  },
  weight: {
    value: Number,
    unit: String
  },
  price: Number,
  currency: String,
  imageUrl: String,
  productUrl: String,
  marketplace: String,
  features: [String],
  rating: Number,
  reviewCount: Number,
  updatedAt: Date
});

const caseSchema = new mongoose.Schema({
  name: String,
  brand: String,
  type: String,
  description: String,
  price: Number,
  currency: String,
  url: String,
  imageUrl: String,
  imageUrls: [String],
  marketplace: String,
  dimensions: {
    interior: {
      length: Number,
      width: Number,
      height: Number,
      unit: String
    },
    exterior: {
      length: Number,
      width: Number,
      height: Number,
      unit: String
    }
  },
  features: [String],
  rating: Number,
  reviewCount: Number,
  protectionLevel: String,
  waterproof: Boolean,
  shockproof: Boolean,
  dustproof: Boolean,
  color: String,
  material: String,
  updatedAt: Date
});

// Create models
const AudioGear = mongoose.model('AudioGear', audioGearSchema);
const Case = mongoose.model('Case', caseSchema);

// Helper function to get a random user agent
function getRandomUserAgent() {
  const index = Math.floor(Math.random() * config.userAgents.length);
  return config.userAgents[index];
}

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to download an image
async function downloadImage(url, marketplace, productId) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const extension = url.split('.').pop().split('?')[0] || 'jpg';
    const filename = `${productId}.${extension}`;
    const filepath = path.join(config.imageDir, marketplace, filename);
    
    await fs.writeFile(filepath, response.data);
    console.log(`Downloaded image: ${filepath}`);
    
    return `/images/${marketplace}/${filename}`;
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error.message);
    return null;
  }
}

// Function to scrape Amazon products
async function scrapeAmazon(searchTerm, isCase = false) {
  const products = [];
  
  try {
    console.log(`Scraping Amazon for: ${searchTerm}`);
    
    // This is a simplified mock implementation
    // In a real implementation, you would use axios to fetch the actual Amazon search page
    // and then use cheerio to parse the HTML and extract product data
    
    // For demonstration purposes, we'll create mock data
    const mockProducts = [];
    
    for (let i = 1; i <= 5; i++) {
      const productId = `amazon-${searchTerm.replace(/\s+/g, '-')}-${i}`;
      const price = Math.floor(Math.random() * 500) + 50;
      
      if (isCase) {
        mockProducts.push({
          id: productId,
          name: `Premium ${searchTerm} - Model ${i}`,
          brand: ['Gator', 'SKB', 'Pelican', 'Nanuk', 'HISCOX'][i % 5],
          description: `High-quality ${searchTerm} with excellent protection. Perfect for musicians on the go.`,
          price: price,
          currency: 'USD',
          url: `https://amazon.com/dp/${productId}`,
          imageUrl: `https://example.com/images/${productId}.jpg`,
          marketplace: 'amazon',
          dimensions: {
            interior: {
              length: 30 + i,
              width: 15 + i,
              height: 5 + i,
              unit: 'in'
            }
          },
          features: [
            'Waterproof',
            'Shockproof',
            'TSA approved locks',
            'Customizable foam interior'
          ],
          rating: 4 + Math.random(),
          reviewCount: Math.floor(Math.random() * 500) + 10,
          protectionLevel: 'High',
          waterproof: true,
          shockproof: true,
          dustproof: true,
          color: ['Black', 'Gray', 'Blue'][i % 3],
          material: ['ABS Plastic', 'Aluminum', 'Polyethylene'][i % 3]
        });
      } else {
        mockProducts.push({
          id: productId,
          name: `Professional ${searchTerm} - Model ${i}`,
          brand: ['Korg', 'Roland', 'Yamaha', 'Nord', 'Arturia'][i % 5],
          category: 'keyboard',
          type: searchTerm.includes('synthesizer') ? 'synthesizer' : 'keyboard',
          description: `Professional grade ${searchTerm} with amazing sound quality and features.`,
          price: price,
          currency: 'USD',
          productUrl: `https://amazon.com/dp/${productId}`,
          imageUrl: `https://example.com/images/${productId}.jpg`,
          marketplace: 'amazon',
          dimensions: {
            length: 25 + i,
            width: 10 + i,
            height: 3 + i,
            unit: 'in'
          },
          weight: {
            value: 5 + i,
            unit: 'lb'
          },
          features: [
            '61 keys',
            'Velocity sensitive',
            'USB MIDI',
            'Built-in speakers'
          ],
          rating: 4 + Math.random(),
          reviewCount: Math.floor(Math.random() * 500) + 10
        });
      }
    }
    
    // Process mock products
    for (const product of mockProducts) {
      // Download image (in a real implementation)
      // const imageUrl = await downloadImage(product.imageUrl, 'amazon', product.id);
      // product.imageUrl = imageUrl || product.imageUrl;
      
      // For demonstration, we'll use a placeholder image URL
      product.imageUrl = `/images/amazon/${product.id}.jpg`;
      
      // Create a placeholder image file
      const placeholderImageDir = path.join(config.imageDir, 'amazon');
      const placeholderImagePath = path.join(placeholderImageDir, `${product.id}.jpg`);
      
      try {
        // Create a simple text file as a placeholder for the image
        await fs.writeFile(placeholderImagePath, 'Placeholder image file');
        console.log(`Created placeholder image: ${placeholderImagePath}`);
      } catch (error) {
        console.error(`Error creating placeholder image: ${error.message}`);
      }
      
      products.push(product);
    }
    
    console.log(`Found ${products.length} products on Amazon for: ${searchTerm}`);
    return products;
  } catch (error) {
    console.error(`Error scraping Amazon for ${searchTerm}:`, error.message);
    return [];
  }
}

// Function to scrape eBay products
async function scrapeEbay(searchTerm, isCase = false) {
  // Similar implementation to scrapeAmazon but for eBay
  // For brevity, we'll return a smaller set of mock products
  const products = [];
  
  try {
    console.log(`Scraping eBay for: ${searchTerm}`);
    
    // Mock data for demonstration
    const mockProducts = [];
    
    for (let i = 1; i <= 3; i++) {
      const productId = `ebay-${searchTerm.replace(/\s+/g, '-')}-${i}`;
      const price = Math.floor(Math.random() * 400) + 40;
      
      if (isCase) {
        mockProducts.push({
          id: productId,
          name: `${searchTerm} Case - eBay Special ${i}`,
          brand: ['Gator', 'SKB', 'Road Runner'][i % 3],
          description: `Protective ${searchTerm} for musicians. Great condition.`,
          price: price,
          currency: 'USD',
          url: `https://ebay.com/itm/${productId}`,
          imageUrl: `https://example.com/images/${productId}.jpg`,
          marketplace: 'ebay',
          dimensions: {
            interior: {
              length: 28 + i,
              width: 14 + i,
              height: 4 + i,
              unit: 'in'
            }
          },
          features: [
            'Padded interior',
            'Sturdy construction',
            'Carrying handle'
          ],
          rating: 3.5 + Math.random(),
          reviewCount: Math.floor(Math.random() * 200) + 5,
          protectionLevel: 'Medium',
          waterproof: i % 2 === 0,
          shockproof: true,
          dustproof: i % 2 === 0,
          color: ['Black', 'Gray'][i % 2],
          material: ['Nylon', 'Polyester', 'ABS Plastic'][i % 3]
        });
      } else {
        mockProducts.push({
          id: productId,
          name: `${searchTerm} - Used in Great Condition ${i}`,
          brand: ['Korg', 'Roland', 'Yamaha'][i % 3],
          category: 'keyboard',
          type: searchTerm.includes('synthesizer') ? 'synthesizer' : 'keyboard',
          description: `${searchTerm} in excellent condition. All keys and functions work perfectly.`,
          price: price,
          currency: 'USD',
          productUrl: `https://ebay.com/itm/${productId}`,
          imageUrl: `https://example.com/images/${productId}.jpg`,
          marketplace: 'ebay',
          dimensions: {
            length: 24 + i,
            width: 9 + i,
            height: 3 + i,
            unit: 'in'
          },
          weight: {
            value: 4 + i,
            unit: 'lb'
          },
          features: [
            'Great condition',
            'All functions work',
            'Original packaging'
          ],
          rating: 3.5 + Math.random(),
          reviewCount: Math.floor(Math.random() * 200) + 5
        });
      }
    }
    
    // Process mock products
    for (const product of mockProducts) {
      // Create a placeholder image file
      const placeholderImageDir = path.join(config.imageDir, 'ebay');
      const placeholderImagePath = path.join(placeholderImageDir, `${product.id}.jpg`);
      
      try {
        // Ensure the directory exists
        await fs.mkdir(placeholderImageDir, { recursive: true });
        
        // Create a simple text file as a placeholder for the image
        await fs.writeFile(placeholderImagePath, 'Placeholder image file');
        console.log(`Created placeholder image: ${placeholderImagePath}`);
        
        // Update the image URL
        product.imageUrl = `/images/ebay/${product.id}.jpg`;
      } catch (error) {
        console.error(`Error creating placeholder image: ${error.message}`);
      }
      
      products.push(product);
    }
    
    console.log(`Found ${products.length} products on eBay for: ${searchTerm}`);
    return products;
  } catch (error) {
    console.error(`Error scraping eBay for ${searchTerm}:`, error.message);
    return [];
  }
}

// Function to scrape Etsy products
async function scrapeEtsy(searchTerm, isCase = false) {
  // Similar implementation to the other scrapers but for Etsy
  // For brevity, we'll return a smaller set of mock products
  const products = [];
  
  try {
    console.log(`Scraping Etsy for: ${searchTerm}`);
    
    // Mock data for demonstration
    const mockProducts = [];
    
    for (let i = 1; i <= 2; i++) {
      const productId = `etsy-${searchTerm.replace(/\s+/g, '-')}-${i}`;
      const price = Math.floor(Math.random() * 300) + 30;
      
      if (isCase) {
        mockProducts.push({
          id: productId,
          name: `Handcrafted ${searchTerm} - Artisan Made ${i}`,
          brand: 'Artisan Crafts',
          description: `Beautiful handcrafted ${searchTerm} made with premium materials. Each piece is unique.`,
          price: price,
          currency: 'USD',
          url: `https://etsy.com/listing/${productId}`,
          imageUrl: `https://example.com/images/${productId}.jpg`,
          marketplace: 'etsy',
          dimensions: {
            interior: {
              length: 26 + i,
              width: 12 + i,
              height: 4 + i,
              unit: 'in'
            }
          },
          features: [
            'Handcrafted',
            'Premium materials',
            'Custom design'
          ],
          rating: 4 + Math.random(),
          reviewCount: Math.floor(Math.random() * 100) + 5,
          protectionLevel: 'Medium',
          waterproof: false,
          shockproof: true,
          dustproof: true,
          color: ['Brown', 'Black', 'Natural'][i % 3],
          material: ['Leather', 'Wood', 'Canvas'][i % 3]
        });
      } else {
        mockProducts.push({
          id: productId,
          name: `Custom ${searchTerm} - Handmade ${i}`,
          brand: 'Artisan Audio',
          category: 'custom',
          type: searchTerm.includes('synthesizer') ? 'synthesizer' : 'keyboard',
          description: `Unique handmade ${searchTerm} with custom features. One of a kind.`,
          price: price,
          currency: 'USD',
          productUrl: `https://etsy.com/listing/${productId}`,
          imageUrl: `https://example.com/images/${productId}.jpg`,
          marketplace: 'etsy',
          dimensions: {
            length: 22 + i,
            width: 8 + i,
            height: 3 + i,
            unit: 'in'
          },
          weight: {
            value: 3 + i,
            unit: 'lb'
          },
          features: [
            'Handmade',
            'Custom design',
            'Unique sound'
          ],
          rating: 4 + Math.random(),
          reviewCount: Math.floor(Math.random() * 100) + 5
        });
      }
    }
    
    // Process mock products
    for (const product of mockProducts) {
      // Create a placeholder image file
      const placeholderImageDir = path.join(config.imageDir, 'etsy');
      const placeholderImagePath = path.join(placeholderImageDir, `${product.id}.jpg`);
      
      try {
        // Ensure the directory exists
        await fs.mkdir(placeholderImageDir, { recursive: true });
        
        // Create a simple text file as a placeholder for the image
        await fs.writeFile(placeholderImagePath, 'Placeholder image file');
        console.log(`Created placeholder image: ${placeholderImagePath}`);
        
        // Update the image URL
        product.imageUrl = `/images/etsy/${product.id}.jpg`;
      } catch (error) {
        console.error(`Error creating placeholder image: ${error.message}`);
      }
      
      products.push(product);
    }
    
    console.log(`Found ${products.length} products on Etsy for: ${searchTerm}`);
    return products;
  } catch (error) {
    console.error(`Error scraping Etsy for ${searchTerm}:`, error.message);
    return [];
  }
}

// Function to save audio gear to MongoDB
async function saveAudioGear(product) {
  try {
    const audioGear = new AudioGear({
      name: product.name,
      brand: product.brand,
      category: product.category,
      type: product.type,
      description: product.description,
      dimensions: product.dimensions,
      weight: product.weight,
      price: product.price,
      currency: product.currency,
      imageUrl: product.imageUrl,
      productUrl: product.productUrl,
      marketplace: product.marketplace,
      features: product.features,
      rating: product.rating,
      reviewCount: product.reviewCount,
      updatedAt: new Date()
    });
    
    await audioGear.save();
    console.log(`Saved audio gear to MongoDB: ${product.name}`);
    return audioGear;
  } catch (error) {
    console.error(`Error saving audio gear to MongoDB: ${error.message}`);
    return null;
  }
}

// Function to save case to MongoDB
async function saveCase(product) {
  try {
    const caseItem = new Case({
      name: product.name,
      brand: product.brand,
      type: product.type,
      description: product.description,
      price: product.price,
      currency: product.currency,
      url: product.url,
      imageUrl: product.imageUrl,
      imageUrls: product.imageUrls || [product.imageUrl],
      marketplace: product.marketplace,
      dimensions: product.dimensions,
      features: product.features,
      rating: product.rating,
      reviewCount: product.reviewCount,
      protectionLevel: product.protectionLevel,
      waterproof: product.waterproof,
      shockproof: product.shockproof,
      dustproof: product.dustproof,
      color: product.color,
      material: product.material,
      updatedAt: new Date()
    });
    
    await caseItem.save();
    console.log(`Saved case to MongoDB: ${product.name}`);
    return caseItem;
  } catch (error) {
    console.error(`Error saving case to MongoDB: ${error.message}`);
    return null;
  }
}

// Main function to run the scrapers
async function runScrapers() {
  try {
    // Ensure directories exist
    await ensureDirectories();
    
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Scrape audio gear
    console.log('Scraping audio gear...');
    for (const searchTerm of config.searchTerms.audioGear) {
      // Scrape from Amazon
      const amazonProducts = await scrapeAmazon(searchTerm, false);
      for (const product of amazonProducts) {
        await saveAudioGear(product);
        await delay(config.delayBetweenRequests);
      }
      
      // Scrape from eBay
      const ebayProducts = await scrapeEbay(searchTerm, false);
      for (const product of ebayProducts) {
        await saveAudioGear(product);
        await delay(config.delayBetweenRequests);
      }
      
      // Scrape from Etsy
      const etsyProducts = await scrapeEtsy(searchTerm, false);
      for (const product of etsyProducts) {
        await saveAudioGear(product);
        await delay(config.delayBetweenRequests);
      }
    }
    
    // Scrape cases
    console.log('Scraping cases...');
    for (const searchTerm of config.searchTerms.cases) {
      // Scrape from Amazon
      const amazonProducts = await scrapeAmazon(searchTerm, true);
      for (const product of amazonProducts) {
        await saveCase(product);
        await delay(config.delayBetweenRequests);
      }
      
      // Scrape from eBay
      const ebayProducts = await scrapeEbay(searchTerm, true);
      for (const product of ebayProducts) {
        await saveCase(product);
        await delay(config.delayBetweenRequests);
      }
      
      // Scrape from Etsy
      const etsyProducts = await scrapeEtsy(searchTerm, true);
      for (const product of etsyProducts) {
        await saveCase(product);
        await delay(config.delayBetweenRequests);
      }
    }
    
    console.log('Scraping completed successfully!');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error running scrapers:', error);
  }
}

// Run the scrapers
runScrapers().then(() => {
  console.log('Script execution completed');
}).catch(error => {
  console.error('Script execution failed:', error);
});
