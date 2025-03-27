/**
 * Setup script for AudioGear collection
 * 
 * This script creates the AudioGear collection and sets up appropriate indexes
 */

module.exports = async function setupAudioGearCollection(db) {
  console.log('Setting up AudioGear collection...');
  
  try {
    // Check if collection exists, create it if it doesn't
    const collections = await db.listCollections({ name: 'AudioGear' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('AudioGear', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'brand', 'category', 'type', 'dimensions', 'weight'],
            properties: {
              name: {
                bsonType: 'string',
                description: 'Name of the audio gear'
              },
              brand: {
                bsonType: 'string',
                description: 'Brand of the audio gear'
              },
              category: {
                bsonType: 'string',
                description: 'Category of the audio gear'
              },
              type: {
                bsonType: 'string',
                description: 'Type of the audio gear'
              },
              dimensions: {
                bsonType: 'object',
                required: ['length', 'width', 'height', 'unit'],
                properties: {
                  length: {
                    bsonType: 'number',
                    description: 'Length of the audio gear'
                  },
                  width: {
                    bsonType: 'number',
                    description: 'Width of the audio gear'
                  },
                  height: {
                    bsonType: 'number',
                    description: 'Height of the audio gear'
                  },
                  unit: {
                    bsonType: 'string',
                    description: 'Unit of measurement for dimensions'
                  }
                }
              },
              weight: {
                bsonType: 'object',
                required: ['value', 'unit'],
                properties: {
                  value: {
                    bsonType: 'number',
                    description: 'Weight value of the audio gear'
                  },
                  unit: {
                    bsonType: 'string',
                    description: 'Unit of measurement for weight'
                  }
                }
              },
              imageUrl: {
                bsonType: 'string',
                description: 'URL to the image of the audio gear'
              },
              productUrl: {
                bsonType: 'string',
                description: 'URL to the product page'
              },
              description: {
                bsonType: 'string',
                description: 'Description of the audio gear'
              },
              popularity: {
                bsonType: 'number',
                description: 'Popularity score of the audio gear'
              },
              releaseYear: {
                bsonType: 'number',
                description: 'Year the audio gear was released'
              },
              discontinued: {
                bsonType: 'bool',
                description: 'Whether the audio gear is discontinued'
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
      console.log('AudioGear collection created');
    } else {
      console.log('AudioGear collection already exists');
    }
    
    // Create indexes
    const collection = db.collection('AudioGear');
    
    // Index for searching by name and brand
    await collection.createIndex({ name: 1, brand: 1 });
    
    // Index for filtering by category and type
    await collection.createIndex({ category: 1, type: 1 });
    
    // Index for sorting by popularity
    await collection.createIndex({ popularity: -1 });
    
    console.log('AudioGear indexes created');
    
    return true;
  } catch (error) {
    console.error('Error setting up AudioGear collection:', error);
    throw error;
  }
};
