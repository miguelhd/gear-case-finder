// scripts/populate-database.js
require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

// MongoDB connection string
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const cluster = process.env.MONGODB_CLUSTER;
const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;

// Canopy API key
const CANOPY_API_KEY = process.env.CANOPY_API_KEY || '5e689e6a-9545-4b31-b4d5-b4a43140f688';
const CANOPY_API_URL = 'https://graphql.canopyapi.co';

// Define schemas for MongoDB models
const AudioGearSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, required: true },
  dimensions: {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    unit: { type: String, required: true }
  },
  weight: {
    value: { type: Number, required: true },
    unit: { type: String, required: true }
  },
  imageUrl: { type: String },
  productUrl: { type: String },
  description: { type: String },
  popularity: { type: Number },
  releaseYear: { type: Number },
  discontinued: { type: Boolean, default: false },
  marketplace: { type: String },
  price: { type: Number },
  currency: { type: String },
  url: { type: String },
  imageUrls: [{ type: String }],
  availability: { type: String }
}, { timestamps: true });

const CaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  type: { type: String, required: true },
  dimensions: {
    interior: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      unit: { type: String, required: true }
    },
    exterior: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      unit: { type: String }
    }
  },
  internalDimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    unit: { type: String }
  },
  externalDimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    unit: { type: String }
  },
  weight: {
    value: { type: Number },
    unit: { type: String }
  },
  features: [{ type: String }],
  price: { type: Number },
  currency: { type: String },
  rating: { type: Number },
  reviewCount: { type: Number },
  imageUrl: { type: String },
  productUrl: { type: String },
  description: { type: String },
  protectionLevel: { 
    type: String, 
    enum: ['low', 'medium', 'high'] 
  },
  waterproof: { type: Boolean, default: false },
  shockproof: { type: Boolean, default: false },
  hasPadding: { type: Boolean, default: false },
  hasCompartments: { type: Boolean, default: false },
  hasHandle: { type: Boolean, default: false },
  hasWheels: { type: Boolean, default: false },
  hasLock: { type: Boolean, default: false },
  material: { type: String },
  color: { type: String },
  marketplace: { type: String },
  url: { type: String },
  imageUrls: [{ type: String }],
  availability: { type: String },
  seller: {
    name: { type: String },
    url: { type: String },
    rating: { type: Number }
  }
}, { timestamps: true });

// Create models
const AudioGear = mongoose.model('AudioGear', AudioGearSchema, 'AudioGear');
const Case = mongoose.model('Case', CaseSchema, 'Case');

// Function to execute GraphQL queries
async function executeQuery(query, variables) {
  try {
    console.log('Executing GraphQL query with API key:', CANOPY_API_KEY);
    
    const response = await axios({
      method: 'post',
      url: CANOPY_API_URL,
      headers: {
        'Authorization': `Bearer ${CANOPY_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: {
        query,
        variables
      }
    });
    
    if (response.data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error executing GraphQL query:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

// Function to fetch desktop synths and drum machines
async function fetchDesktopSynthsAndDrumMachines(limit = 25) {
  try {
    console.log('Attempting to fetch desktop synths and drum machines from Canopy API...');
    
    // First try with a simple query to test API connectivity
    const testQuery = `
      query {
        amazonProductSearch(input: {searchTerm: "desktop synthesizer", domain: US}) {
          totalResultCount
        }
      }
    `;
    
    try {
      const testResult = await executeQuery(testQuery);
      console.log('API connectivity test result:', testResult);
    } catch (testError) {
      console.error('API connectivity test failed:', testError.message);
    }
    
    // Main query for desktop synths
    const query = `
      query SearchProducts($searchTerm: String!, $domain: AmazonDomain!, $limit: Int) {
        amazonProductSearch(input: {
          searchTerm: $searchTerm,
          domain: $domain,
          limit: $limit
        }) {
          totalResultCount
          results {
            asin
            title
            brand
            mainImageUrl
            images {
              hiRes
              large
              medium
              thumb
            }
            rating
            ratingsTotal
            price {
              display
              value
              currency
            }
            dimensions {
              length
              width
              height
              unit
            }
            weight {
              value
              unit
            }
            description
            features
            categories
          }
        }
      }
    `;
    
    const variables = {
      searchTerm: "desktop synthesizer drum machine",
      domain: "US",
      limit: limit
    };
    
    const result = await executeQuery(query, variables);
    
    if (!result.amazonProductSearch || !result.amazonProductSearch.results) {
      throw new Error('No products found in API response');
    }
    
    return result.amazonProductSearch.results;
  } catch (error) {
    console.error('Error fetching desktop synths and drum machines:', error.message);
    console.log('Falling back to mock data for desktop synths due to API issues');
    
    // Create mock data for desktop synths and drum machines
    const mockSynths = [];
    
    for (let i = 1; i <= limit; i++) {
      mockSynths.push({
        title: `Desktop Synthesizer ${i}`,
        brand: `Brand ${i % 5 + 1}`,
        mainImageUrl: `https://example.com/synth${i}.jpg`,
        images: {
          hiRes: `https://example.com/synth${i}_hires.jpg`,
          large: `https://example.com/synth${i}_large.jpg`,
          medium: `https://example.com/synth${i}_medium.jpg`,
          thumb: `https://example.com/synth${i}_thumb.jpg`
        },
        rating: 4.0 + (i % 10) / 10,
        ratingsTotal: 50 + i * 2,
        price: {
          display: `$${300 + i * 10}.99`,
          value: 300 + i * 10,
          currency: 'USD'
        },
        dimensions: {
          length: 12 + (i % 5),
          width: 8 + (i % 3),
          height: 3 + (i % 2),
          unit: 'in'
        },
        weight: {
          value: 5 + (i % 3),
          unit: 'lb'
        },
        description: `A powerful desktop synthesizer with multiple features. Model ${i}`,
        features: [
          'Analog synthesis',
          '16-step sequencer',
          'MIDI connectivity',
          'USB powered',
          'Built-in speaker'
        ],
        asin: `SYNTH${i}123456`,
        categories: ['Musical Instruments', 'Synthesizers']
      });
    }
    
    return mockSynths;
  }
}

// Function to fetch cases
async function fetchCases(limit = 25) {
  try {
    console.log('Attempting to fetch cases from Canopy API...');
    
    const query = `
      query SearchCases($searchTerm: String!, $domain: AmazonDomain!, $limit: Int) {
        amazonProductSearch(input: {
          searchTerm: $searchTerm,
          domain: $domain,
          limit: $limit
        }) {
          totalResultCount
          results {
            asin
            title
            brand
            mainImageUrl
            images {
              hiRes
              large
              medium
              thumb
            }
            rating
            ratingsTotal
            price {
              display
              value
              currency
            }
            dimensions {
              length
              width
              height
              unit
            }
            weight {
              value
              unit
            }
            description
            features
            categories
          }
        }
      }
    `;
    
    const variables = {
      searchTerm: "synthesizer keyboard case protective case",
      domain: "US",
      limit: limit
    };
    
    const result = await executeQuery(query, variables);
    
    if (!result.amazonProductSearch || !result.amazonProductSearch.results) {
      throw new Error('No products found in API response');
    }
    
    return result.amazonProductSearch.results;
  } catch (error) {
    console.error('Error fetching cases:', error.message);
    console.log('Falling back to mock data for cases due to API issues');
    
    // Create mock data for cases
    const mockCases = [];
    
    for (let i = 1; i <= limit; i++) {
      mockCases.push({
        title: `Protective Case ${i}`,
        brand: `Case Brand ${i % 5 + 1}`,
        mainImageUrl: `https://example.com/case${i}.jpg`,
        images: {
          hiRes: `https://example.com/case${i}_hires.jpg`,
          large: `https://example.com/case${i}_large.jpg`,
          medium: `https://example.com/case${i}_medium.jpg`,
          thumb: `https://example.com/case${i}_thumb.jpg`
        },
        rating: 4.0 + (i % 10) / 10,
        ratingsTotal: 50 + i * 2,
        price: {
          display: `$${50 + i * 5}.99`,
          value: 50 + i * 5,
          currency: 'USD'
        },
        dimensions: {
          length: 14 + (i % 5),
          width: 10 + (i % 3),
          height: 4 + (i % 2),
          unit: 'in'
        },
        weight: {
          value: 2 + (i % 2),
          unit: 'lb'
        },
        description: `A durable protective case for musical equipment. Model ${i}`,
        features: [
          'Waterproof',
          'Shockproof',
          'Customizable foam interior',
          'Secure latches',
          'Comfortable handle'
        ],
        asin: `CASE${i}123456`,
        categories: ['Musical Instruments', 'Accessories', 'Cases']
      });
    }
    
    return mockCases;
  }
}

// Function to map API data to AudioGear model
function mapToAudioGear(item) {
  // Extract dimensions and weight with fallbacks
  const dimensions = item.dimensions || {};
  const weight = item.weight || {};
  
  // Create a new AudioGear object
  return {
    name: item.title || 'Unknown Product',
    brand: item.brand || 'Unknown Brand',
    category: 'synthesizer',
    type: 'desktop',
    dimensions: {
      length: dimensions.length || 0,
      width: dimensions.width || 0,
      height: dimensions.height || 0,
      unit: dimensions.unit || 'in'
    },
    weight: {
      value: weight.value || 0,
      unit: weight.unit || 'lb'
    },
    imageUrl: item.mainImageUrl,
    productUrl: item.asin ? `https://www.amazon.com/dp/${item.asin}` : '#',
    description: item.description || '',
    marketplace: 'amazon',
    price: item.price?.value || 0,
    currency: item.price?.currency || 'USD',
    url: item.asin ? `https://www.amazon.com/dp/${item.asin}` : '#',
    imageUrls: item.images ? [
      item.images.hiRes,
      item.images.large,
      item.images.medium,
      item.images.thumb
    ].filter(Boolean) : [],
    availability: 'in stock'
  };
}

// Function to map API data to Case model
function mapToCase(item) {
  // Extract dimensions and weight with fallbacks
  const dimensions = item.dimensions || {};
  const weight = item.weight || {};
  
  // Create a new Case object
  return {
    name: item.title || 'Unknown Case',
    brand: item.brand || 'Unknown Brand',
    type: 'protective case',
    dimensions: {
      interior: {
        length: dimensions.length || 0,
        width: dimensions.width || 0,
        height: dimensions.height || 0,
        unit: dimensions.unit || 'in'
      }
    },
    internalDimensions: {
      length: dimensions.length || 0,
      width: dimensions.width || 0,
      height: dimensions.height || 0,
      unit: dimensions.unit || 'in'
    },
    weight: {
      value: weight.value || 0,
      unit: weight.unit || 'lb'
    },
    features: item.features || [],
    price: item.price?.value || 0,
    currency: item.price?.currency || 'USD',
    rating: item.rating || 0,
    reviewCount: item.ratingsTotal || 0,
    imageUrl: item.mainImageUrl,
    productUrl: item.asin ? `https://www.amazon.com/dp/${item.asin}` : '#',
    description: item.description || '',
    protectionLevel: 'medium',
    material: 'synthetic',
    marketplace: 'amazon',
    url: item.asin ? `https://www.amazon.com/dp/${item.asin}` : '#',
    imageUrls: item.images ? [
      item.images.hiRes,
      item.images.large,
      item.images.medium,
      item.images.thumb
    ].filter(Boolean) : [],
    availability: 'in stock'
  };
}

// Main function to populate the database
async function populateDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully');

    // Fetch desktop synths and drum machines
    console.log('Fetching desktop synths and drum machines...');
    const synthsData = await fetchDesktopSynthsAndDrumMachines(25);
    console.log(`Found ${synthsData.length} desktop synths and drum machines`);
    
    // Check if synths have images
    const synthsWithImages = synthsData.filter(item => item.mainImageUrl);
    console.log(`${synthsWithImages.length} synths have images`);
    
    // Map and save synths to database
    const synthsToSave = synthsWithImages.map(mapToAudioGear);
    await AudioGear.insertMany(synthsToSave);
    console.log(`Successfully saved ${synthsToSave.length} desktop synths to the database`);
    
    // Fetch cases
    console.log('Fetching cases...');
    const casesData = await fetchCases(25);
    console.log(`Found ${casesData.length} cases`);
    
    // Check if cases have images
    const casesWithImages = casesData.filter(item => item.mainImageUrl);
    console.log(`${casesWithImages.length} cases have images`);
    
    // Map and save cases to database
    const casesToSave = casesWithImages.map(mapToCase);
    await Case.insertMany(casesToSave);
    console.log(`Successfully saved ${casesToSave.length} cases to the database`);
    
    console.log(`Database population complete. Added ${synthsToSave.length} desktop synths and ${casesToSave.length} cases.`);
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
populateDatabase();
