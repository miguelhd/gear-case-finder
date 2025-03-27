/**
 * Affiliates Generator
 * 
 * Generates mock affiliate data for testing purposes
 */

const { ObjectId } = require('mongodb');

// Affiliate partners
const affiliatePartners = [
  'Amazon', 'Sweetwater', 'Guitar Center', 'Thomann', 'B&H Photo',
  'Musician\'s Friend', 'zZounds', 'Reverb', 'Sam Ash', 'Gear4music',
  'Perfect Circuit', 'Vintage King', 'Andertons', 'Long & McQuade'
];

// Affiliate program types
const programTypes = [
  'CPA', 'CPC', 'Revenue Share', 'Hybrid'
];

// Commission rate ranges by program type
const commissionRanges = {
  'CPA': { min: 5, max: 20 },           // Fixed amount per acquisition
  'CPC': { min: 0.1, max: 2 },          // Amount per click
  'Revenue Share': { min: 3, max: 15 }, // Percentage of sale
  'Hybrid': { min: 2, max: 10 }         // Mix of models
};

// Product categories
const productCategories = [
  'Microphones', 'Audio Interfaces', 'Mixers', 'Synthesizers', 'Drum Machines',
  'Samplers', 'Controllers', 'Headphones', 'Monitors', 'Effects Processors',
  'Cases', 'Bags', 'Protection', 'Accessories', 'All Products'
];

// Generate a random number between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random float between min and max with specified precision
function randomFloat(min, max, precision = 2) {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(precision));
}

// Pick a random item from an array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate a random subset of items from an array
function randomSubset(array, minCount = 0, maxCount = array.length) {
  const count = randomInt(minCount, Math.min(maxCount, array.length));
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Generate a random boolean with specified probability of being true
function randomBoolean(probability = 0.5) {
  return Math.random() < probability;
}

// Generate a random date between start and end dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate a random tracking link
function generateTrackingLink(partner, category) {
  const sanitizedPartner = partner.toLowerCase().replace(/[^a-z0-9]/g, '');
  const sanitizedCategory = category.toLowerCase().replace(/[^a-z0-9]/g, '');
  const trackingId = `gcf_${sanitizedPartner}_${randomInt(10000, 99999)}`;
  
  return `https://${sanitizedPartner}.com/${sanitizedCategory}?ref=${trackingId}`;
}

// Generate a random API key
function generateApiKey() {
  return `${Math.random().toString(36).substring(2, 10)}_${Math.random().toString(36).substring(2, 10)}_${Math.random().toString(36).substring(2, 10)}`;
}

// Generate a single affiliate record
function generateAffiliateRecord(index) {
  const partner = randomItem(affiliatePartners);
  const programType = randomItem(programTypes);
  const categories = randomSubset(productCategories, 1, 5);
  
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const startDate = randomDate(oneYearAgo, now);
  
  // Generate commission rate based on program type
  const commissionRange = commissionRanges[programType];
  const commissionRate = randomFloat(commissionRange.min, commissionRange.max, 2);
  
  // Generate performance metrics
  const clicks = randomInt(100, 10000);
  const conversions = programType === 'CPC' ? 0 : randomInt(1, Math.floor(clicks * 0.05)); // Up to 5% conversion rate
  const revenue = programType === 'CPC' 
    ? clicks * commissionRate 
    : conversions * (programType === 'CPA' ? commissionRate : randomFloat(20, 200, 2));
  
  // Generate tracking links for each category
  const trackingLinks = {};
  categories.forEach(category => {
    trackingLinks[category] = generateTrackingLink(partner, category);
  });
  
  return {
    _id: new ObjectId(),
    partner,
    programType,
    commissionRate,
    commissionType: programType === 'Revenue Share' || programType === 'Hybrid' ? 'percentage' : 'fixed',
    categories,
    trackingLinks,
    apiCredentials: {
      apiKey: generateApiKey(),
      apiSecret: generateApiKey(),
      endpoint: `https://api.${partner.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/affiliates/v1`
    },
    contactInfo: {
      name: `${randomItem(['John', 'Jane', 'Alex', 'Sam', 'Chris'])} ${randomItem(['Smith', 'Johnson', 'Williams', 'Brown', 'Davis'])}`,
      email: `affiliates@${partner.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: `+1${randomInt(200, 999)}${randomInt(100, 999)}${randomInt(1000, 9999)}`
    },
    performance: {
      clicks,
      conversions,
      revenue,
      averageOrderValue: revenue / (conversions || 1),
      conversionRate: conversions / clicks * 100
    },
    paymentTerms: {
      minimumPayout: randomInt(25, 100),
      paymentFrequency: randomItem(['monthly', 'bi-weekly', 'quarterly']),
      paymentMethod: randomItem(['PayPal', 'Direct Deposit', 'Check', 'Wire Transfer'])
    },
    status: randomItem(['active', 'active', 'active', 'pending', 'inactive']),
    startDate,
    lastUpdated: randomDate(startDate, now),
    notes: randomItem([
      `Good performance with ${categories[0]} products.`,
      `Higher than average conversion rate.`,
      `Consider negotiating better commission rates.`,
      `Seasonal promotions available Q4.`,
      `Requires monthly reporting.`,
      `Deep linking available for product pages.`
    ])
  };
}

// Generate multiple affiliate records
function generateAffiliates(count) {
  const records = [];
  for (let i = 0; i < count; i++) {
    records.push(generateAffiliateRecord(i));
  }
  return records;
}

module.exports = {
  generateAffiliates,
  generateAffiliateRecord
};
