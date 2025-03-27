/**
 * Analytics Collection Import Script
 * 
 * This script imports analytics data into the Analytics collection in MongoDB.
 * Analytics data includes page views, searches, matches, clicks, and revenue.
 */

module.exports = async function importAnalytics(db, items = []) {
  console.log('Starting Analytics import...');
  
  // Initialize counters
  const result = {
    insertedCount: 0,
    updatedCount: 0,
    skippedCount: 0
  };
  
  try {
    // Get reference to Analytics collection
    const collection = db.collection('Analytics');
    
    // If no items provided, we'll create some sample analytics data for testing
    if (items.length === 0) {
      console.log('No analytics data provided. Creating sample data for testing...');
      
      // Generate analytics data for the past 7 days
      const sampleAnalytics = [];
      const now = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0); // Set to beginning of day
        
        // Generate random data with some variation but trending upward for newer dates
        const factor = 1 + (7 - i) * 0.1; // Newer dates have higher numbers
        
        sampleAnalytics.push({
          date,
          pageViews: {
            total: Math.floor(100 * factor + Math.random() * 50),
            unique: Math.floor(70 * factor + Math.random() * 30),
            byPage: {
              '/': Math.floor(40 * factor + Math.random() * 20),
              '/search': Math.floor(30 * factor + Math.random() * 15),
              '/gear': Math.floor(20 * factor + Math.random() * 10),
              '/cases': Math.floor(10 * factor + Math.random() * 5)
            }
          },
          searches: {
            total: Math.floor(50 * factor + Math.random() * 25),
            queries: {
              'synthesizer case': Math.floor(10 * factor + Math.random() * 5),
              'keyboard case': Math.floor(8 * factor + Math.random() * 4),
              'audio interface case': Math.floor(7 * factor + Math.random() * 3),
              'mixer case': Math.floor(5 * factor + Math.random() * 2)
            }
          },
          matches: {
            total: Math.floor(40 * factor + Math.random() * 20),
            byGear: {
              'synth-1': Math.floor(10 * factor + Math.random() * 5),
              'keyboard-1': Math.floor(8 * factor + Math.random() * 4),
              'interface-1': Math.floor(7 * factor + Math.random() * 3)
            },
            byCase: {
              'case-1': Math.floor(10 * factor + Math.random() * 5),
              'case-2': Math.floor(8 * factor + Math.random() * 4),
              'case-3': Math.floor(7 * factor + Math.random() * 3)
            }
          },
          clicks: {
            total: Math.floor(30 * factor + Math.random() * 15),
            affiliateLinks: {
              'amazon': Math.floor(15 * factor + Math.random() * 7),
              'ebay': Math.floor(10 * factor + Math.random() * 5),
              'sweetwater': Math.floor(5 * factor + Math.random() * 2)
            },
            adClicks: Math.floor(10 * factor + Math.random() * 5)
          },
          revenue: {
            total: Math.floor(50 * factor + Math.random() * 25),
            byAffiliate: {
              'amazon': Math.floor(25 * factor + Math.random() * 12),
              'ebay': Math.floor(15 * factor + Math.random() * 7),
              'sweetwater': Math.floor(10 * factor + Math.random() * 5)
            },
            adRevenue: Math.floor(20 * factor + Math.random() * 10)
          }
        });
      }
      
      // Check if analytics data already exists for these dates
      for (const analytics of sampleAnalytics) {
        const existingAnalytics = await collection.findOne({ 
          date: {
            $gte: new Date(analytics.date.setHours(0, 0, 0, 0)),
            $lt: new Date(analytics.date.setHours(23, 59, 59, 999))
          }
        });
        
        if (existingAnalytics) {
          console.log(`Analytics data for ${analytics.date.toISOString().split('T')[0]} already exists. Skipping...`);
          result.skippedCount++;
        } else {
          // Insert new analytics data
          const insertResult = await collection.insertOne(analytics);
          
          if (insertResult.acknowledged) {
            console.log(`Created sample analytics data for ${analytics.date.toISOString().split('T')[0]}`);
            result.insertedCount++;
          } else {
            result.skippedCount++;
          }
        }
      }
    } else {
      // Process provided analytics items
      for (const item of items) {
        // Skip items that don't have required fields
        if (!item.date) {
          console.warn('Skipping analytics item with missing date');
          result.skippedCount++;
          continue;
        }
        
        // Ensure date is a Date object
        const date = new Date(item.date);
        
        // Transform item to Analytics schema
        const analytics = {
          date,
          pageViews: item.pageViews || {
            total: 0,
            unique: 0,
            byPage: {}
          },
          searches: item.searches || {
            total: 0,
            queries: {}
          },
          matches: item.matches || {
            total: 0,
            byGear: {},
            byCase: {}
          },
          clicks: item.clicks || {
            total: 0,
            affiliateLinks: {},
            adClicks: 0
          },
          revenue: item.revenue || {
            total: 0,
            byAffiliate: {},
            adRevenue: 0
          }
        };
        
        // Check if analytics data already exists for this date
        const existingAnalytics = await collection.findOne({ 
          date: {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lt: new Date(date.setHours(23, 59, 59, 999))
          }
        });
        
        if (existingAnalytics) {
          // Update existing analytics data
          const updateResult = await collection.updateOne(
            { _id: existingAnalytics._id },
            { $set: analytics }
          );
          
          if (updateResult.modifiedCount > 0) {
            result.updatedCount++;
          } else {
            result.skippedCount++;
          }
        } else {
          // Insert new analytics data
          const insertResult = await collection.insertOne(analytics);
          
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
    console.error('Error importing Analytics data:', error);
    throw error;
  }
};
