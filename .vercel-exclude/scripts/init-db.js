// Database initialization script for Gear Case Finder
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env.local' });

// Sample data for audio gear
const sampleGear = [
  {
    name: "SM58",
    brand: "Shure",
    category: "Microphone",
    type: "Dynamic",
    dimensions: {
      length: 6.3,
      width: 2.0,
      height: 2.0,
      unit: "in"
    },
    weight: {
      value: 0.66,
      unit: "lb"
    },
    imageUrl: "https://example.com/sm58.jpg",
    productUrl: "https://example.com/products/sm58",
    description: "Industry standard dynamic vocal microphone",
    popularity: 95,
    releaseYear: 1966,
    discontinued: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Scarlett 2i2",
    brand: "Focusrite",
    category: "Audio Interface",
    type: "USB",
    dimensions: {
      length: 7.17,
      width: 3.03,
      height: 1.71,
      unit: "in"
    },
    weight: {
      value: 1.32,
      unit: "lb"
    },
    imageUrl: "https://example.com/scarlett2i2.jpg",
    productUrl: "https://example.com/products/scarlett2i2",
    description: "Popular USB audio interface for home studios",
    popularity: 90,
    releaseYear: 2016,
    discontinued: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "MPC One",
    brand: "Akai",
    category: "Sampler",
    type: "Standalone",
    dimensions: {
      length: 11.38,
      width: 7.44,
      height: 2.24,
      unit: "in"
    },
    weight: {
      value: 2.98,
      unit: "lb"
    },
    imageUrl: "https://example.com/mpcone.jpg",
    productUrl: "https://example.com/products/mpcone",
    description: "Standalone music production center",
    popularity: 85,
    releaseYear: 2020,
    discontinued: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample data for cases
const sampleCases = [
  {
    id: "case001",
    sourceId: "amz123456",
    marketplace: "Amazon",
    name: "Professional Microphone Case",
    brand: "GatorCases",
    type: "Hard Case",
    externalDimensions: {
      length: 8.5,
      width: 4.5,
      height: 3.5,
      unit: "in"
    },
    internalDimensions: {
      length: 7.5,
      width: 3.5,
      height: 2.5,
      unit: "in"
    },
    weight: {
      value: 1.2,
      unit: "lb"
    },
    price: 29.99,
    currency: "USD",
    url: "https://example.com/cases/mic-case",
    imageUrls: ["https://example.com/images/mic-case-1.jpg", "https://example.com/images/mic-case-2.jpg"],
    description: "Protective case for professional microphones",
    features: ["Foam padding", "Water resistant", "Impact resistant"],
    rating: 4.7,
    reviewCount: 253,
    availability: "In Stock",
    seller: {
      name: "AudioGear Store",
      url: "https://example.com/sellers/audiogear",
      rating: 4.8
    },
    protectionLevel: "high",
    waterproof: true,
    shockproof: true,
    hasHandle: true,
    hasWheels: false,
    material: "ABS Plastic",
    color: "Black",
    compatibleWith: ["Microphones", "Small Audio Gear"],
    scrapedAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "case002",
    sourceId: "amz789012",
    marketplace: "Amazon",
    name: "Audio Interface Protective Case",
    brand: "SKB",
    type: "Soft Case",
    externalDimensions: {
      length: 9.0,
      width: 5.0,
      height: 3.0,
      unit: "in"
    },
    internalDimensions: {
      length: 8.0,
      width: 4.0,
      height: 2.0,
      unit: "in"
    },
    weight: {
      value: 0.8,
      unit: "lb"
    },
    price: 24.99,
    currency: "USD",
    url: "https://example.com/cases/interface-case",
    imageUrls: ["https://example.com/images/interface-case-1.jpg"],
    description: "Padded case for audio interfaces",
    features: ["Padded interior", "Zippered closure", "Accessory pocket"],
    rating: 4.5,
    reviewCount: 187,
    availability: "In Stock",
    seller: {
      name: "Pro Audio Gear",
      url: "https://example.com/sellers/proaudio",
      rating: 4.6
    },
    protectionLevel: "medium",
    waterproof: false,
    shockproof: true,
    hasHandle: true,
    hasWheels: false,
    material: "Nylon",
    color: "Black",
    compatibleWith: ["Audio Interfaces", "Small Mixers"],
    scrapedAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "case003",
    sourceId: "amz345678",
    marketplace: "Amazon",
    name: "Production Equipment Hard Case",
    brand: "Pelican",
    type: "Hard Case",
    externalDimensions: {
      length: 14.0,
      width: 10.0,
      height: 5.0,
      unit: "in"
    },
    internalDimensions: {
      length: 12.0,
      width: 8.0,
      height: 3.0,
      unit: "in"
    },
    weight: {
      value: 3.5,
      unit: "lb"
    },
    price: 89.99,
    currency: "USD",
    url: "https://example.com/cases/production-case",
    imageUrls: ["https://example.com/images/production-case-1.jpg", "https://example.com/images/production-case-2.jpg"],
    description: "Waterproof case for music production equipment",
    features: ["Customizable foam", "Waterproof", "Crushproof", "Dustproof"],
    rating: 4.9,
    reviewCount: 412,
    availability: "In Stock",
    seller: {
      name: "Pro Gear Supply",
      url: "https://example.com/sellers/progearsupply",
      rating: 4.9
    },
    protectionLevel: "high",
    waterproof: true,
    shockproof: true,
    hasHandle: true,
    hasWheels: true,
    material: "High-impact polymer",
    color: "Black",
    compatibleWith: ["Samplers", "Drum Machines", "Controllers"],
    scrapedAt: new Date(),
    updatedAt: new Date()
  }
];

// Connect to MongoDB
async function initializeDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/gear-case-finder";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const database = client.db();
    
    // Create collections if they don't exist
    await database.createCollection("audiogears");
    await database.createCollection("cases");
    await database.createCollection("gearcasematches");
    
    // Insert sample data
    const audioGearCollection = database.collection("audiogears");
    const caseCollection = database.collection("cases");
    
    // Check if collections are empty before inserting
    const gearCount = await audioGearCollection.countDocuments();
    const caseCount = await caseCollection.countDocuments();
    
    if (gearCount === 0) {
      const gearResult = await audioGearCollection.insertMany(sampleGear);
      console.log(`${gearResult.insertedCount} audio gear documents inserted`);
    } else {
      console.log(`Audio gear collection already has ${gearCount} documents, skipping insertion`);
    }
    
    if (caseCount === 0) {
      const caseResult = await caseCollection.insertMany(sampleCases);
      console.log(`${caseResult.insertedCount} case documents inserted`);
    } else {
      console.log(`Case collection already has ${caseCount} documents, skipping insertion`);
    }
    
    console.log("Database initialization complete");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    await client.close();
  }
}

// Run the initialization
initializeDatabase().catch(console.error);
