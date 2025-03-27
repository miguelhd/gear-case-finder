/**
 * User Collection Import Script
 * 
 * This script imports user data into the User collection in MongoDB.
 * Note: In a real application, user data would typically come from authentication
 * systems rather than being imported from JSON files.
 */

module.exports = async function importUser(db, items = []) {
  console.log('Starting User import...');
  
  // Initialize counters
  const result = {
    insertedCount: 0,
    updatedCount: 0,
    skippedCount: 0
  };
  
  try {
    // Get reference to User collection
    const collection = db.collection('User');
    
    // If no items provided, we'll create some sample users for testing
    if (items.length === 0) {
      console.log('No user data provided. Creating sample users for testing...');
      
      const sampleUsers = [
        {
          email: 'admin@gearcase.com',
          name: 'Admin User',
          role: 'admin',
          preferences: {
            theme: 'dark',
            notifications: true
          },
          history: {
            searches: [],
            views: [],
            favorites: []
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'test@gearcase.com',
          name: 'Test User',
          role: 'user',
          preferences: {
            theme: 'light',
            notifications: true
          },
          history: {
            searches: [],
            views: [],
            favorites: []
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      // Check if users already exist
      for (const user of sampleUsers) {
        const existingUser = await collection.findOne({ email: user.email });
        
        if (existingUser) {
          console.log(`User ${user.email} already exists. Skipping...`);
          result.skippedCount++;
        } else {
          // Insert new user
          const insertResult = await collection.insertOne(user);
          
          if (insertResult.acknowledged) {
            console.log(`Created sample user: ${user.email}`);
            result.insertedCount++;
          } else {
            result.skippedCount++;
          }
        }
      }
    } else {
      // Process provided user items
      for (const item of items) {
        // Skip items that don't have required fields
        if (!item.email) {
          console.warn('Skipping user with missing email');
          result.skippedCount++;
          continue;
        }
        
        // Transform item to User schema
        const user = {
          email: item.email,
          name: item.name || item.email.split('@')[0],
          role: item.role || 'user',
          preferences: item.preferences || {
            theme: 'light',
            notifications: true
          },
          history: item.history || {
            searches: [],
            views: [],
            favorites: []
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Check if user already exists
        const existingUser = await collection.findOne({ email: user.email });
        
        if (existingUser) {
          // Update existing user
          const updateResult = await collection.updateOne(
            { _id: existingUser._id },
            { 
              $set: {
                ...user,
                createdAt: existingUser.createdAt, // Preserve original creation date
                updatedAt: new Date() // Update the updatedAt timestamp
              }
            }
          );
          
          if (updateResult.modifiedCount > 0) {
            result.updatedCount++;
          } else {
            result.skippedCount++;
          }
        } else {
          // Insert new user
          const insertResult = await collection.insertOne(user);
          
          if (insertResult.acknowledged) {
            result.insertedCount++;
          } else {
            result.skippedCount++;
          }
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error importing User data:', error);
    throw error;
  }
};
