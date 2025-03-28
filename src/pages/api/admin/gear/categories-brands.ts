import { NextApiRequest, NextApiResponse } from 'next';
import connectToMongoDB from '../../../../lib/mongodb';
import { AudioGear } from '../../../../lib/models/gear-models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
    
    // Get all unique categories
    const categoriesResult = await AudioGear.distinct('category');
    
    // Get all unique brands
    const brandsResult = await AudioGear.distinct('brand');
    
    // Return the results
    return res.status(200).json({
      categories: categoriesResult,
      brands: brandsResult
    });
  } catch (error) {
    console.error('Error fetching categories and brands:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
