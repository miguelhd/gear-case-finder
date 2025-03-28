import { NextApiRequest, NextApiResponse } from 'next';
import connectToMongoDB from '../../../../lib/mongodb';
import { GearCaseMatch } from '../../../../lib/models/gear-models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
    
    // Get all matches with populated gear and case
    const matches = await GearCaseMatch.find()
      .populate('gear')
      .populate('case');
    
    // Extract unique gear types
    const gearTypes = [...new Set(matches.map(match => {
      const gear = match.get('gear');
      return gear ? gear.type : null;
    }).filter(Boolean))];
    
    // Extract unique case types
    const caseTypes = [...new Set(matches.map(match => {
      const caseItem = match.get('case');
      return caseItem ? caseItem.type : null;
    }).filter(Boolean))];
    
    // Return the results
    return res.status(200).json({
      gearTypes,
      caseTypes
    });
  } catch (error) {
    console.error('Error fetching gear and case types:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
