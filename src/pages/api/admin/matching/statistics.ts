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
    
    // Get match statistics
    const totalMatches = await GearCaseMatch.countDocuments();
    
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
    
    // Get score distribution
    const scoreRanges = [
      { min: 0, max: 20, range: '0-20' },
      { min: 20, max: 40, range: '20-40' },
      { min: 40, max: 60, range: '40-60' },
      { min: 60, max: 80, range: '60-80' },
      { min: 80, max: 100, range: '80-100' }
    ];
    
    const scoreDistribution = await Promise.all(
      scoreRanges.map(async ({ min, max, range }) => {
        const count = await GearCaseMatch.countDocuments({
          compatibilityScore: { $gte: min, $lt: max }
        });
        
        return {
          range,
          count,
          percentage: totalMatches > 0 ? (count / totalMatches) * 100 : 0
        };
      })
    );
    
    // Get matches by gear type
    const matchesByGearType = await GearCaseMatch.aggregate([
      {
        $lookup: {
          from: 'AudioGear',
          localField: 'gearId',
          foreignField: '_id',
          as: 'gear'
        }
      },
      {
        $unwind: '$gear'
      },
      {
        $group: {
          _id: '$gear.type',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    
    // Calculate percentages for gear types
    const matchesByGearTypeWithPercentage = matchesByGearType.map(item => ({
      ...item,
      percentage: totalMatches > 0 ? (item.count / totalMatches) * 100 : 0
    }));
    
    // Get matches by case type
    const matchesByCaseType = await GearCaseMatch.aggregate([
      {
        $lookup: {
          from: 'Case',
          localField: 'caseId',
          foreignField: '_id',
          as: 'case'
        }
      },
      {
        $unwind: '$case'
      },
      {
        $group: {
          _id: '$case.type',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    
    // Calculate percentages for case types
    const matchesByCaseTypeWithPercentage = matchesByCaseType.map(item => ({
      ...item,
      percentage: totalMatches > 0 ? (item.count / totalMatches) * 100 : 0
    }));
    
    // Get recent matches
    const recentMatches = await GearCaseMatch.find()
      .sort({ createdAt: -1 })
      .limit(10)
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
    
    // Return the statistics
    return res.status(200).json({
      totalMatches,
      averageScore,
      scoreDistribution,
      matchesByGearType: matchesByGearTypeWithPercentage,
      matchesByCaseType: matchesByCaseTypeWithPercentage,
      recentMatches: formattedRecentMatches
    });
  } catch (error) {
    console.error('Error fetching match statistics:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
