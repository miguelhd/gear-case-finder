import { NextApiRequest, NextApiResponse } from 'next';
import connectToMongoDB from '../../../../lib/mongodb';
import { GearCaseMatch } from '../../../../lib/models/gear-models';

// Define proper types for populated documents
interface PopulatedGear {
  name: string;
  brand: string;
  // Add other properties as needed
}

interface PopulatedCase {
  name: string;
  brand: string;
  // Add other properties as needed
}

interface PopulatedGearCaseMatch {
  gearId: PopulatedGear | string;
  caseId: PopulatedCase | string;
  compatibilityScore: number;
  createdAt?: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
    
    // Get basic statistics for the dashboard
    const totalMatches = await GearCaseMatch.countDocuments();
    
    // Get high quality matches (score >= 80)
    const highQualityMatches = await GearCaseMatch.countDocuments({
      compatibilityScore: { $gte: 80 }
    });
    
    // Calculate average score
    const aggregateResult = await GearCaseMatch.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$compatibilityScore' }
        }
      }
    ]);
    
    const averageScore = aggregateResult.length > 0 ? aggregateResult[0].averageScore : 0;
    
    // Get recent matches
    const recentMatches = await GearCaseMatch.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('gearId')
      .populate('caseId');
    
    const formattedRecentMatches = recentMatches.map((match: PopulatedGearCaseMatch) => {
      // Check if gearId is a populated object or just a string ID
      const gearName = typeof match.gearId === 'object' && match.gearId !== null
        ? `${match.gearId.name} (${match.gearId.brand})`
        : 'Unknown Gear';
      
      // Check if caseId is a populated object or just a string ID
      const caseName = typeof match.caseId === 'object' && match.caseId !== null
        ? `${match.caseId.name} (${match.caseId.brand})`
        : 'Unknown Case';
      
      return {
        gearName,
        caseName,
        score: match.compatibilityScore,
        date: match.createdAt ? match.createdAt.toISOString() : new Date().toISOString()
      };
    });
    
    // Get last run information (in a real implementation, this would be stored in the database)
    // For now, we'll return mock data if there are any matches
    const lastRun = totalMatches > 0 ? {
      date: new Date().toISOString(),
      matchesCreated: Math.min(totalMatches, 50),
      duration: '2.35 seconds'
    } : null;
    
    // Return the dashboard statistics
    return res.status(200).json({
      stats: {
        totalMatches,
        highQualityMatches,
        averageScore,
        recentMatches: formattedRecentMatches
      },
      lastRun
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
