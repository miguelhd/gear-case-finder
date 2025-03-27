/**
 * Setup script for User collection
 * 
 * This script creates the User collection and sets up appropriate indexes
 */

module.exports = async function setupUserCollection(db) {
  console.log('Setting up User collection...');
  
  try {
    // Check if collection exists, create it if it doesn't
    const collections = await db.listCollections({ name: 'User' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('User', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['email'],
            properties: {
              email: {
                bsonType: 'string',
                description: 'Email address of the user'
              },
              name: {
                bsonType: 'string',
                description: 'Name of the user'
              },
              preferences: {
                bsonType: 'object',
                properties: {
                  preferredBrands: {
                    bsonType: 'array',
                    description: 'List of preferred brands'
                  },
                  excludedBrands: {
                    bsonType: 'array',
                    description: 'List of excluded brands'
                  },
                  preferredFeatures: {
                    bsonType: 'array',
                    description: 'List of preferred features'
                  },
                  preferredProtectionLevel: {
                    enum: ['low', 'medium', 'high'],
                    description: 'Preferred protection level'
                  },
                  maxPrice: {
                    bsonType: 'number',
                    description: 'Maximum price preference'
                  }
                }
              },
              searchHistory: {
                bsonType: 'array',
                items: {
                  bsonType: 'object',
                  required: ['query', 'timestamp'],
                  properties: {
                    query: {
                      bsonType: 'string',
                      description: 'Search query'
                    },
                    timestamp: {
                      bsonType: 'date',
                      description: 'Timestamp of the search'
                    }
                  }
                }
              },
              viewHistory: {
                bsonType: 'array',
                items: {
                  bsonType: 'object',
                  required: ['gearId', 'caseId', 'timestamp'],
                  properties: {
                    gearId: {
                      bsonType: 'string',
                      description: 'ID of the viewed gear'
                    },
                    caseId: {
                      bsonType: 'string',
                      description: 'ID of the viewed case'
                    },
                    timestamp: {
                      bsonType: 'date',
                      description: 'Timestamp of the view'
                    }
                  }
                }
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
      console.log('User collection created');
    } else {
      console.log('User collection already exists');
    }
    
    // Create indexes
    const collection = db.collection('User');
    
    // Unique index for email
    await collection.createIndex({ email: 1 }, { unique: true });
    
    // Index for search history
    await collection.createIndex({ 'searchHistory.timestamp': -1 });
    
    // Index for view history
    await collection.createIndex({ 'viewHistory.timestamp': -1 });
    
    console.log('User indexes created');
    
    return true;
  } catch (error) {
    console.error('Error setting up User collection:', error);
    throw error;
  }
};
