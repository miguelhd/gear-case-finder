/**
 * Users Generator
 * 
 * Generates mock user data for testing purposes
 */

const { ObjectId } = require('mongodb');

// First names
const firstNames = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Avery', 'Quinn', 'Morgan', 'Hayden', 'Dakota'
];

// Last names
const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
  'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson',
  'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King'
];

// User roles
const roles = ['user', 'premium_user', 'admin'];

// User preferences
const preferredCategories = [
  'Microphone', 'Audio Interface', 'Mixer', 'Synthesizer', 'Drum Machine',
  'Sampler', 'Controller', 'Headphones', 'Monitors', 'Effects Processor'
];

const preferredBrands = [
  'Shure', 'Sennheiser', 'Audio-Technica', 'Focusrite', 'Universal Audio',
  'Roland', 'Yamaha', 'Korg', 'Moog', 'Arturia', 'Behringer', 'Elektron',
  'Novation', 'Akai', 'Native Instruments', 'Teenage Engineering'
];

// Generate a random number between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

// Generate a random email based on name
function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'example.com'];
  const domain = randomItem(domains);
  
  // 50% chance to use first initial + last name format
  if (randomBoolean()) {
    return `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}${randomInt(1, 999)}@${domain}`;
  } else {
    // 50% chance to use first name + last initial format
    return `${firstName.toLowerCase()}${lastName.charAt(0).toLowerCase()}${randomInt(1, 999)}@${domain}`;
  }
}

// Generate a single user
function generateUser(index) {
  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);
  const email = generateEmail(firstName, lastName);
  
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const createdAt = randomDate(oneYearAgo, now);
  
  // Determine user role (mostly regular users, some premium, few admins)
  let role;
  const roleRandom = Math.random();
  if (roleRandom < 0.8) {
    role = 'user';
  } else if (roleRandom < 0.95) {
    role = 'premium_user';
  } else {
    role = 'admin';
  }
  
  // Generate search history
  const searchHistoryCount = randomInt(0, 15);
  const searchHistory = [];
  
  for (let i = 0; i < searchHistoryCount; i++) {
    const searchType = randomBoolean() ? 'gear' : 'case';
    let searchQuery;
    
    if (searchType === 'gear') {
      searchQuery = randomBoolean() 
        ? randomItem(preferredBrands) 
        : randomItem(preferredCategories);
    } else {
      searchQuery = randomBoolean()
        ? `${randomItem(['hard', 'soft', 'waterproof', 'flight'])} case`
        : `case for ${randomItem(preferredCategories).toLowerCase()}`;
    }
    
    searchHistory.push({
      query: searchQuery,
      type: searchType,
      timestamp: randomDate(createdAt, now)
    });
  }
  
  // Sort search history by timestamp (newest first)
  searchHistory.sort((a, b) => b.timestamp - a.timestamp);
  
  // Generate viewed items
  const viewedItemsCount = randomInt(0, 20);
  const viewedItems = [];
  
  for (let i = 0; i < viewedItemsCount; i++) {
    const itemType = randomBoolean() ? 'gear' : 'case';
    
    viewedItems.push({
      itemId: new ObjectId(),
      itemType,
      timestamp: randomDate(createdAt, now)
    });
  }
  
  // Sort viewed items by timestamp (newest first)
  viewedItems.sort((a, b) => b.timestamp - a.timestamp);
  
  // Generate saved matches
  const savedMatchesCount = randomInt(0, 10);
  const savedMatches = [];
  
  for (let i = 0; i < savedMatchesCount; i++) {
    savedMatches.push({
      gearId: new ObjectId(),
      caseId: new ObjectId(),
      savedAt: randomDate(createdAt, now)
    });
  }
  
  // Sort saved matches by timestamp (newest first)
  savedMatches.sort((a, b) => b.savedAt - a.savedAt);
  
  return {
    _id: new ObjectId(),
    firstName,
    lastName,
    email,
    role,
    preferences: {
      preferredCategories: randomSubset(preferredCategories, 0, 5),
      preferredBrands: randomSubset(preferredBrands, 0, 5),
      notificationEnabled: randomBoolean(0.7),
      darkModeEnabled: randomBoolean(0.4)
    },
    searchHistory,
    viewedItems,
    savedMatches,
    createdAt,
    updatedAt: new Date(),
    lastLoginAt: randomDate(createdAt, now)
  };
}

// Generate multiple users
function generateUsers(count) {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(generateUser(i));
  }
  return users;
}

module.exports = {
  generateUsers,
  generateUser
};
