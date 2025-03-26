/**
 * Setup script for Case collection
 * 
 * This script creates the Case collection and sets up appropriate indexes
 */

module.exports = async function setupCaseCollection(db) {
  console.log('Setting up Case collection...');
  
  try {
    // Check if collection exists, create it if it doesn't
    const collections = await db.listCollections({ name: 'Case' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('Case', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'brand', 'type', 'dimensions'],
            properties: {
              name: {
                bsonType: 'string',
                description: 'Name of the case'
              },
              brand: {
                bsonType: 'string',
                description: 'Brand of the case'
              },
              type: {
                bsonType: 'string',
                description: 'Type of the case'
              },
              dimensions: {
                bsonType: 'object',
                required: ['interior'],
                properties: {
                  interior: {
                    bsonType: 'object',
                    required: ['length', 'width', 'height', 'unit'],
                    properties: {
                      length: {
                        bsonType: 'number',
                        description: 'Interior length of the case'
                      },
                      width: {
                        bsonType: 'number',
                        description: 'Interior width of the case'
                      },
                      height: {
                        bsonType: 'number',
                        description: 'Interior height of the case'
                      },
                      unit: {
                        bsonType: 'string',
                        description: 'Unit of measurement for dimensions'
                      }
                    }
                  },
                  exterior: {
                    bsonType: 'object',
                    properties: {
                      length: {
                        bsonType: 'number',
                        description: 'Exterior length of the case'
                      },
                      width: {
                        bsonType: 'number',
                        description: 'Exterior width of the case'
                      },
                      height: {
                        bsonType: 'number',
                        description: 'Exterior height of the case'
                      },
                      unit: {
                        bsonType: 'string',
                        description: 'Unit of measurement for dimensions'
                      }
                    }
                  }
                }
              },
              internalDimensions: {
                bsonType: 'object',
                properties: {
                  length: {
                    bsonType: 'number',
                    description: 'Internal length of the case'
                  },
                  width: {
                    bsonType: 'number',
                    description: 'Internal width of the case'
                  },
                  height: {
                    bsonType: 'number',
                    description: 'Internal height of the case'
                  },
                  unit: {
                    bsonType: 'string',
                    description: 'Unit of measurement for dimensions'
                  }
                }
              },
              externalDimensions: {
                bsonType: 'object',
                properties: {
                  length: {
                    bsonType: 'number',
                    description: 'External length of the case'
                  },
                  width: {
                    bsonType: 'number',
                    description: 'External width of the case'
                  },
                  height: {
                    bsonType: 'number',
                    description: 'External height of the case'
                  },
                  unit: {
                    bsonType: 'string',
                    description: 'Unit of measurement for dimensions'
                  }
                }
              },
              weight: {
                bsonType: 'object',
                properties: {
                  value: {
                    bsonType: 'number',
                    description: 'Weight value of the case'
                  },
                  unit: {
                    bsonType: 'string',
                    description: 'Unit of measurement for weight'
                  }
                }
              },
              features: {
                bsonType: 'array',
                description: 'List of case features'
              },
              price: {
                bsonType: 'number',
                description: 'Price of the case'
              },
              currency: {
                bsonType: 'string',
                description: 'Currency of the price'
              },
              rating: {
                bsonType: 'number',
                description: 'Rating of the case'
              },
              reviewCount: {
                bsonType: 'number',
                description: 'Number of reviews'
              },
              imageUrl: {
                bsonType: 'string',
                description: 'URL to the image of the case'
              },
              productUrl: {
                bsonType: 'string',
                description: 'URL to the product page'
              },
              description: {
                bsonType: 'string',
                description: 'Description of the case'
              },
              protectionLevel: {
                enum: ['low', 'medium', 'high'],
                description: 'Protection level of the case'
              },
              waterproof: {
                bsonType: 'bool',
                description: 'Whether the case is waterproof'
              },
              shockproof: {
                bsonType: 'bool',
                description: 'Whether the case is shockproof'
              },
              hasPadding: {
                bsonType: 'bool',
                description: 'Whether the case has padding'
              },
              hasCompartments: {
                bsonType: 'bool',
                description: 'Whether the case has compartments'
              },
              hasHandle: {
                bsonType: 'bool',
                description: 'Whether the case has a handle'
              },
              hasWheels: {
                bsonType: 'bool',
                description: 'Whether the case has wheels'
              },
              hasLock: {
                bsonType: 'bool',
                description: 'Whether the case has a lock'
              },
              material: {
                bsonType: 'string',
                description: 'Material of the case'
              },
              color: {
                bsonType: 'string',
                description: 'Color of the case'
              },
              marketplace: {
                bsonType: 'string',
                description: 'Marketplace where the case is sold'
              },
              url: {
                bsonType: 'string',
                description: 'URL to the case'
              },
              imageUrls: {
                bsonType: 'array',
                description: 'List of image URLs'
              },
              availability: {
                bsonType: 'string',
                description: 'Availability status of the case'
              },
              seller: {
                bsonType: 'object',
                properties: {
                  name: {
                    bsonType: 'string',
                    description: 'Name of the seller'
                  },
                  url: {
                    bsonType: 'string',
                    description: 'URL to the seller'
                  },
                  rating: {
                    bsonType: 'number',
                    description: 'Rating of the seller'
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
      console.log('Case collection created');
    } else {
      console.log('Case collection already exists');
    }
    
    // Create indexes
    const collection = db.collection('Case');
    
    // Index for searching by name and brand
    await collection.createIndex({ name: 1, brand: 1 });
    
    // Index for filtering by type
    await collection.createIndex({ type: 1 });
    
    // Index for filtering by features
    await collection.createIndex({ features: 1 });
    
    // Index for filtering by protection level
    await collection.createIndex({ protectionLevel: 1 });
    
    // Index for filtering by price
    await collection.createIndex({ price: 1 });
    
    // Compound index for dimension-based searches
    await collection.createIndex({ 
      "dimensions.interior.length": 1, 
      "dimensions.interior.width": 1, 
      "dimensions.interior.height": 1 
    });
    
    console.log('Case indexes created');
    
    return true;
  } catch (error) {
    console.error('Error setting up Case collection:', error);
    throw error;
  }
};
