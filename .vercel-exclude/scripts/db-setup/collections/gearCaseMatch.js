/**
 * Setup script for GearCaseMatch collection
 * 
 * This script creates the GearCaseMatch collection and sets up appropriate indexes
 */

module.exports = async function setupGearCaseMatchCollection(db) {
  console.log('Setting up GearCaseMatch collection...');
  
  try {
    // Check if collection exists, create it if it doesn't
    const collections = await db.listCollections({ name: 'GearCaseMatch' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('GearCaseMatch', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['gearId', 'caseId', 'compatibilityScore', 'dimensionScore', 'featureScore'],
            properties: {
              gearId: {
                bsonType: 'string',
                description: 'ID of the audio gear'
              },
              caseId: {
                bsonType: 'string',
                description: 'ID of the case'
              },
              compatibilityScore: {
                bsonType: 'number',
                description: 'Overall compatibility score'
              },
              dimensionScore: {
                bsonType: 'number',
                description: 'Dimension compatibility score'
              },
              featureScore: {
                bsonType: 'number',
                description: 'Feature compatibility score'
              },
              userFeedbackScore: {
                bsonType: 'number',
                description: 'User feedback score'
              },
              totalFeedback: {
                bsonType: 'number',
                description: 'Total number of user feedback'
              },
              positiveCount: {
                bsonType: 'number',
                description: 'Count of positive feedback'
              },
              negativeCount: {
                bsonType: 'number',
                description: 'Count of negative feedback'
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
      console.log('GearCaseMatch collection created');
    } else {
      console.log('GearCaseMatch collection already exists');
    }
    
    // Create indexes
    const collection = db.collection('GearCaseMatch');
    
    // Unique index for gear-case combinations
    await collection.createIndex({ gearId: 1, caseId: 1 }, { unique: true });
    
    // Index for searching by gearId
    await collection.createIndex({ gearId: 1 });
    
    // Index for searching by caseId
    await collection.createIndex({ caseId: 1 });
    
    // Index for sorting by compatibility score
    await collection.createIndex({ compatibilityScore: -1 });
    
    console.log('GearCaseMatch indexes created');
    
    return true;
  } catch (error) {
    console.error('Error setting up GearCaseMatch collection:', error);
    throw error;
  }
};
