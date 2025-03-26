/**
 * Setup script for Analytics collection
 * 
 * This script creates the Analytics collection and sets up appropriate indexes
 */

module.exports = async function setupAnalyticsCollection(db) {
  console.log('Setting up Analytics collection...');
  
  try {
    // Check if collection exists, create it if it doesn't
    const collections = await db.listCollections({ name: 'Analytics' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('Analytics', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['date', 'pageViews', 'searches', 'matches', 'clicks', 'revenue'],
            properties: {
              date: {
                bsonType: 'date',
                description: 'Date of the analytics data'
              },
              pageViews: {
                bsonType: 'object',
                required: ['total', 'unique'],
                properties: {
                  total: {
                    bsonType: 'number',
                    description: 'Total page views'
                  },
                  unique: {
                    bsonType: 'number',
                    description: 'Unique page views'
                  },
                  byPage: {
                    bsonType: 'object',
                    description: 'Page views by page URL'
                  }
                }
              },
              searches: {
                bsonType: 'object',
                required: ['total'],
                properties: {
                  total: {
                    bsonType: 'number',
                    description: 'Total searches'
                  },
                  queries: {
                    bsonType: 'object',
                    description: 'Search counts by query'
                  }
                }
              },
              matches: {
                bsonType: 'object',
                required: ['total'],
                properties: {
                  total: {
                    bsonType: 'number',
                    description: 'Total matches viewed'
                  },
                  byGear: {
                    bsonType: 'object',
                    description: 'Match views by gear ID'
                  },
                  byCase: {
                    bsonType: 'object',
                    description: 'Match views by case ID'
                  }
                }
              },
              clicks: {
                bsonType: 'object',
                required: ['total'],
                properties: {
                  total: {
                    bsonType: 'number',
                    description: 'Total clicks'
                  },
                  affiliateLinks: {
                    bsonType: 'object',
                    description: 'Clicks by affiliate link'
                  },
                  adClicks: {
                    bsonType: 'number',
                    description: 'Ad clicks'
                  }
                }
              },
              revenue: {
                bsonType: 'object',
                required: ['total'],
                properties: {
                  total: {
                    bsonType: 'number',
                    description: 'Total revenue'
                  },
                  byAffiliate: {
                    bsonType: 'object',
                    description: 'Revenue by affiliate'
                  },
                  adRevenue: {
                    bsonType: 'number',
                    description: 'Ad revenue'
                  }
                }
              }
            }
          }
        }
      });
      console.log('Analytics collection created');
    } else {
      console.log('Analytics collection already exists');
    }
    
    // Create indexes
    const collection = db.collection('Analytics');
    
    // Unique index for date
    await collection.createIndex({ date: 1 }, { unique: true });
    
    console.log('Analytics indexes created');
    
    return true;
  } catch (error) {
    console.error('Error setting up Analytics collection:', error);
    throw error;
  }
};
