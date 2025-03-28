import { NextApiRequest, NextApiResponse } from 'next';
import connectToMongoDB from '../../../../lib/mongodb';
import { Case } from '../../../../lib/models/gear-models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
    
    // Get all unique types
    const typesResult = await Case.distinct('type');
    
    // Get all unique brands
    const brandsResult = await Case.distinct('brand');
    
    // Return the results
    return res.status(200).json({
      types: typesResult,
      brands: brandsResult
    });
  } catch (error) {
    console.error('Error fetching types and brands:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
