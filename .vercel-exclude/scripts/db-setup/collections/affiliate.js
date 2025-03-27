/**
 * Setup script for Affiliate collection
 * 
 * This script creates the Affiliate collection and sets up appropriate indexes
 */

module.exports = async function setupAffiliateCollection(db) {
  console.log('Setting up Affiliate collection...');
  
  try {
    // Check if collection exists, create it if it doesn't
    const collections = await db.listCollections({ name: 'Affiliate' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('Affiliate', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'platform', 'trackingId', 'baseUrl', 'commissionRate'],
            properties: {
              name: {
                bsonType: 'string',
                description: 'Name of the affiliate program'
              },
              platform: {
                enum: ['amazon', 'ebay', 'aliexpress', 'etsy', 'temu', 'other'],
                description: 'Platform of the affiliate program'
              },
              trackingId: {
                bsonType: 'string',
                description: 'Tracking ID for the affiliate program'
              },
              baseUrl: {
                bsonType: 'string',
                description: 'Base URL for affiliate links'
              },
              commissionRate: {
                bsonType: 'number',
                description: 'Commission rate for the affiliate program'
              },
              active: {
                bsonType: 'bool',
                description: 'Whether the affiliate program is active'
              },
              totalClicks: {
                bsonType: 'number',
                description: 'Total clicks on affiliate links'
              },
              totalRevenue: {
                bsonType: 'number',
                description: 'Total revenue from affiliate program'
              },
              createdAt: {
                bsonType: 'date',
                description: 'Date the document was created'
              },
              updatedAt: {
                bsonType: 'date',
                description: 'Date the document was last updated'
              }
            }
          }
        }
      });
      console.log('Affiliate collection created');
    } else {
      console.log('Affiliate collection already exists');
    }
    
    // Create indexes
    const collection = db.collection('Affiliate');
    
    // Index for platform
    await collection.createIndex({ platform: 1 });
    
    // Index for active status
    await collection.createIndex({ active: 1 });
    
    // Compound index for platform and active status
    await collection.createIndex({ platform: 1, active: 1 });
    
    console.log('Affiliate indexes created');
    
    return true;
  } catch (error) {
    console.error('Error setting up Affiliate collection:', error);
    throw error;
  }
};
