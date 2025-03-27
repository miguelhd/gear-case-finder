/**
 * Setup script for Content collection
 * 
 * This script creates the Content collection and sets up appropriate indexes
 */

module.exports = async function setupContentCollection(db) {
  console.log('Setting up Content collection...');
  
  try {
    // Check if collection exists, create it if it doesn't
    const collections = await db.listCollections({ name: 'Content' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('Content', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['title', 'slug', 'content', 'contentType', 'publishDate', 'status'],
            properties: {
              title: {
                bsonType: 'string',
                description: 'Title of the content'
              },
              slug: {
                bsonType: 'string',
                description: 'URL-friendly slug for the content'
              },
              content: {
                bsonType: 'string',
                description: 'Main content body'
              },
              excerpt: {
                bsonType: 'string',
                description: 'Short excerpt of the content'
              },
              metaTitle: {
                bsonType: 'string',
                description: 'SEO meta title'
              },
              metaDescription: {
                bsonType: 'string',
                description: 'SEO meta description'
              },
              keywords: {
                bsonType: 'array',
                description: 'SEO keywords'
              },
              contentType: {
                enum: ['article', 'guide', 'review', 'comparison'],
                description: 'Type of content'
              },
              relatedGearIds: {
                bsonType: 'array',
                description: 'IDs of related audio gear'
              },
              relatedCaseIds: {
                bsonType: 'array',
                description: 'IDs of related cases'
              },
              author: {
                bsonType: 'string',
                description: 'Author of the content'
              },
              publishDate: {
                bsonType: 'date',
                description: 'Date the content was published'
              },
              updateDate: {
                bsonType: 'date',
                description: 'Date the content was last updated'
              },
              status: {
                enum: ['draft', 'published', 'archived'],
                description: 'Publication status of the content'
              },
              viewCount: {
                bsonType: 'number',
                description: 'Number of views'
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
      console.log('Content collection created');
    } else {
      console.log('Content collection already exists');
    }
    
    // Create indexes
    const collection = db.collection('Content');
    
    // Unique index for slug
    await collection.createIndex({ slug: 1 }, { unique: true });
    
    // Index for content type
    await collection.createIndex({ contentType: 1 });
    
    // Index for status
    await collection.createIndex({ status: 1 });
    
    // Index for publish date (for sorting)
    await collection.createIndex({ publishDate: -1 });
    
    // Index for related gear and cases
    await collection.createIndex({ relatedGearIds: 1 });
    await collection.createIndex({ relatedCaseIds: 1 });
    
    // Text index for search
    await collection.createIndex({ 
      title: 'text', 
      content: 'text', 
      metaDescription: 'text',
      keywords: 'text'
    });
    
    console.log('Content indexes created');
    
    return true;
  } catch (error) {
    console.error('Error setting up Content collection:', error);
    throw error;
  }
};
