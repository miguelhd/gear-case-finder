/**
 * Analytics Generator
 * 
 * Generates mock analytics data for testing purposes
 */

const { ObjectId } = require('mongodb');

// Event types
const eventTypes = [
  'page_view', 'search', 'gear_view', 'case_view', 'match_view', 
  'match_save', 'external_link_click', 'signup', 'login', 'logout'
];

// Pages
const pages = [
  '/', '/search', '/gear', '/cases', '/matches', '/about', 
  '/contact', '/faq', '/blog', '/admin', '/profile'
];

// User agents
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
];

// Referrers
const referrers = [
  'https://www.google.com/',
  'https://www.bing.com/',
  'https://www.duckduckgo.com/',
  'https://www.facebook.com/',
  'https://www.twitter.com/',
  'https://www.instagram.com/',
  'https://www.reddit.com/',
  'https://www.youtube.com/',
  'https://www.linkedin.com/',
  'https://www.producthunt.com/',
  'https://www.sweetwater.com/',
  'https://www.guitarcenter.com/',
  'https://www.thomann.de/',
  'https://www.musiciansfriend.com/',
  'https://www.bhphotovideo.com/',
  ''  // Direct traffic
];

// Countries
const countries = [
  'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'BR', 'IN', 'ES',
  'IT', 'NL', 'SE', 'NO', 'DK', 'FI', 'RU', 'CN', 'MX', 'AR'
];

// Generate a random number between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pick a random item from an array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate a random date between start and end dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate a random IP address
function generateIpAddress() {
  return `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}`;
}

// Generate a random session ID
function generateSessionId() {
  return `session_${Math.random().toString(36).substring(2, 15)}`;
}

// Generate a random user ID (some will be null for anonymous users)
function generateUserId() {
  return Math.random() < 0.7 ? null : new ObjectId();
}

// Generate event data based on event type
function generateEventData(eventType, audioGearItems, caseItems) {
  switch (eventType) {
    case 'page_view':
      return {
        page: randomItem(pages),
        timeOnPage: randomInt(5, 300) // seconds
      };
    case 'search':
      return {
        query: randomItem([
          'microphone case',
          'audio interface protection',
          'waterproof case',
          'shure sm58 case',
          'synthesizer flight case',
          'drum machine bag',
          'mixer case',
          'headphones case',
          'portable recorder protection',
          'keyboard case'
        ]),
        filters: {
          category: Math.random() < 0.5 ? randomItem(['Microphone', 'Audio Interface', 'Synthesizer', 'Mixer']) : null,
          brand: Math.random() < 0.5 ? randomItem(['Shure', 'Focusrite', 'Roland', 'Yamaha', 'Korg']) : null,
          priceRange: Math.random() < 0.5 ? randomItem(['0-50', '50-100', '100-200', '200+']) : null
        },
        resultsCount: randomInt(0, 50)
      };
    case 'gear_view':
      return {
        gearId: audioGearItems.length > 0 ? randomItem(audioGearItems)._id : new ObjectId(),
        timeOnPage: randomInt(10, 180) // seconds
      };
    case 'case_view':
      return {
        caseId: caseItems.length > 0 ? randomItem(caseItems)._id : new ObjectId(),
        timeOnPage: randomInt(10, 180) // seconds
      };
    case 'match_view':
      return {
        gearId: audioGearItems.length > 0 ? randomItem(audioGearItems)._id : new ObjectId(),
        caseId: caseItems.length > 0 ? randomItem(caseItems)._id : new ObjectId(),
        compatibilityScore: randomInt(50, 100),
        timeOnPage: randomInt(15, 240) // seconds
      };
    case 'match_save':
      return {
        gearId: audioGearItems.length > 0 ? randomItem(audioGearItems)._id : new ObjectId(),
        caseId: caseItems.length > 0 ? randomItem(caseItems)._id : new ObjectId(),
        compatibilityScore: randomInt(70, 100)
      };
    case 'external_link_click':
      return {
        destination: randomItem([
          'amazon.com',
          'sweetwater.com',
          'guitarcenter.com',
          'thomann.de',
          'bhphotovideo.com',
          'musiciansfriend.com',
          'reverb.com',
          'zzounds.com'
        ]),
        productType: randomItem(['gear', 'case']),
        productId: Math.random() < 0.5 
          ? (audioGearItems.length > 0 ? randomItem(audioGearItems)._id : new ObjectId())
          : (caseItems.length > 0 ? randomItem(caseItems)._id : new ObjectId())
      };
    case 'signup':
      return {
        method: randomItem(['email', 'google', 'facebook', 'apple']),
        referralSource: randomItem(['organic', 'social', 'referral', 'direct', 'paid'])
      };
    case 'login':
      return {
        method: randomItem(['email', 'google', 'facebook', 'apple']),
        success: Math.random() < 0.95 // 95% success rate
      };
    case 'logout':
      return {
        sessionDuration: randomInt(60, 3600) // seconds
      };
    default:
      return {};
  }
}

// Generate a single analytics record
function generateAnalyticsRecord(index, audioGearItems, caseItems) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const timestamp = randomDate(thirtyDaysAgo, now);
  
  const eventType = randomItem(eventTypes);
  const userId = generateUserId();
  const sessionId = generateSessionId();
  const ipAddress = generateIpAddress();
  const userAgent = randomItem(userAgents);
  const referrer = randomItem(referrers);
  const country = randomItem(countries);
  
  const eventData = generateEventData(eventType, audioGearItems, caseItems);
  
  return {
    _id: new ObjectId(),
    timestamp,
    eventType,
    userId,
    sessionId,
    ipAddress,
    userAgent,
    referrer,
    country,
    device: userAgent.includes('Mobile') || userAgent.includes('iPhone') || userAgent.includes('Android') 
      ? 'mobile' 
      : userAgent.includes('iPad') 
        ? 'tablet' 
        : 'desktop',
    browser: userAgent.includes('Chrome') 
      ? 'Chrome' 
      : userAgent.includes('Firefox') 
        ? 'Firefox' 
        : userAgent.includes('Safari') 
          ? 'Safari' 
          : 'Other',
    os: userAgent.includes('Windows') 
      ? 'Windows' 
      : userAgent.includes('Mac') 
        ? 'MacOS' 
        : userAgent.includes('iPhone') || userAgent.includes('iPad') 
          ? 'iOS' 
          : userAgent.includes('Android') 
            ? 'Android' 
            : userAgent.includes('Linux') 
              ? 'Linux' 
              : 'Other',
    eventData
  };
}

// Generate multiple analytics records
function generateAnalytics(count, audioGearItems = [], caseItems = []) {
  const records = [];
  for (let i = 0; i < count; i++) {
    records.push(generateAnalyticsRecord(i, audioGearItems, caseItems));
  }
  return records;
}

module.exports = {
  generateAnalytics,
  generateAnalyticsRecord
};
