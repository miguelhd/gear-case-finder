import { NextApiRequest, NextApiResponse } from 'next';
import connectToMongoDB from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB and get database
    await connectToMongoDB();
    const mongooseInstance = (await import('mongoose')).default;
    const db = (mongooseInstance.connection as any).db;
    
    // Get collection stats
    const audiogears = await db.collection('audiogears').countDocuments();
    const cases = await db.collection('cases').countDocuments();
    const matches = await db.collection('gearcasematches').countDocuments();
    
    // Get distinct values for categories, brands, etc.
    const gearCategories = await db.collection('audiogears').distinct('category');
    const gearBrands = await db.collection('audiogears').distinct('brand');
    const caseTypes = await db.collection('cases').distinct('type');
    const caseBrands = await db.collection('cases').distinct('brand');
    
    // Mock data for recent activity
    const recentActivity = [
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        collection: 'audiogears',
        operation: 'insert',
        count: 3
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        collection: 'cases',
        operation: 'insert',
        count: 5
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        collection: 'gearcasematches',
        operation: 'update',
        count: 12
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        collection: 'audiogears',
        operation: 'update',
        count: 2
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        collection: 'cases',
        operation: 'delete',
        count: 1
      }
    ];
    
    const stats = {
      gearCount: audiogears,
      caseCount: cases,
      matchCount: matches,
      gearCategories: gearCategories.length,
      gearBrands: gearBrands.length,
      caseTypes: caseTypes.length,
      caseBrands: caseBrands.length,
      avgCompatibility: 78.5, // Mock data
      highCompatibilityCount: Math.floor(matches * 0.35), // Mock data
      recentActivity
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching database stats:', error);
    res.status(500).json({ message: 'Failed to fetch database statistics' });
  }
}
