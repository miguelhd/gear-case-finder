/**
 * Affiliate Collection Import Script
 * 
 * This script imports affiliate program data into the Affiliate collection in MongoDB.
 * Affiliate data includes information about affiliate programs, tracking IDs, and commission rates.
 */

module.exports = async function importAffiliate(db, items = []) {
  console.log('Starting Affiliate import...');
  
  // Initialize counters
  const result = {
    insertedCount: 0,
    updatedCount: 0,
    skippedCount: 0
  };
  
  try {
    // Get reference to Affiliate collection
    const collection = db.collection('Affiliate');
    
    // If no items provided, we'll create some sample affiliate data for testing
    if (items.length === 0) {
      console.log('No affiliate data provided. Creating sample data for testing...');
      
      const sampleAffiliates = [
        {
          name: 'Amazon Associates',
          platform: 'amazon',
          trackingId: 'gearcase-20',
          baseUrl: 'https://www.amazon.com/dp/',
          commissionRate: 0.04,
          active: true,
          totalClicks: 1250,
          totalRevenue: 750.25,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'eBay Partner Network',
          platform: 'ebay',
          trackingId: 'gearcase-ebay',
          baseUrl: 'https://www.ebay.com/itm/',
          commissionRate: 0.03,
          active: true,
          totalClicks: 850,
          totalRevenue: 425.75,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Sweetwater Affiliate',
          platform: 'other',
          trackingId: 'gearcase-sw',
          baseUrl: 'https://www.sweetwater.com/store/detail/',
          commissionRate: 0.05,
          active: true,
          totalClicks: 650,
          totalRevenue: 520.50,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'AliExpress Affiliate',
          platform: 'aliexpress',
          trackingId: 'gearcase-ali',
          baseUrl: 'https://www.aliexpress.com/item/',
          commissionRate: 0.06,
          active: true,
          totalClicks: 450,
          totalRevenue: 215.30,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Temu Affiliate',
          platform: 'temu',
          trackingId: 'gearcase-temu',
          baseUrl: 'https://www.temu.com/item/',
          commissionRate: 0.05,
          active: false, // Not active yet
          totalClicks: 0,
          totalRevenue: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      // Check if affiliate data already exists
      for (const affiliate of sampleAffiliates) {
        const existingAffiliate = await collection.findOne({ 
          platform: affiliate.platform,
          name: affiliate.name
        });
        
        if (existingAffiliate) {
          console.log(`Affiliate ${affiliate.name} already exists. Skipping...`);
          result.skippedCount++;
        } else {
          // Insert new affiliate data
          const insertResult = await collection.insertOne(affiliate);
          
          if (insertResult.acknowledged) {
            console.log(`Created sample affiliate: ${affiliate.name}`);
            result.insertedCount++;
          } else {
            result.skippedCount++;
          }
        }
      }
    } else {
      // Process provided affiliate items
      for (const item of items) {
        // Skip items that don't have required fields
        if (!item.name || !item.platform || !item.trackingId || !item.baseUrl) {
          console.warn('Skipping affiliate with missing required fields');
          result.skippedCount++;
          continue;
        }
        
        // Transform item to Affiliate schema
        const affiliate = {
          name: item.name,
          platform: item.platform,
          trackingId: item.trackingId,
          baseUrl: item.baseUrl,
          commissionRate: item.commissionRate || 0.04,
          active: item.active !== undefined ? item.active : true,
          totalClicks: item.totalClicks || 0,
          totalRevenue: item.totalRevenue || 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Check if affiliate already exists
        const existingAffiliate = await collection.findOne({ 
          platform: affiliate.platform,
          name: affiliate.name
        });
        
        if (existingAffiliate) {
          // Update existing affiliate
          const updateResult = await collection.updateOne(
            { _id: existingAffiliate._id },
            { 
              $set: {
                ...affiliate,
                createdAt: existingAffiliate.createdAt, // Preserve original creation date
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
          // Insert new affiliate
          const insertResult = await collection.insertOne(affiliate);
          
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
    console.error('Error importing Affiliate data:', error);
    throw error;
  }
};
