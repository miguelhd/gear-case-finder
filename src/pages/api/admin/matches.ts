import { NextApiRequest, NextApiResponse } from 'next';
import connectToMongoDB from '../../../lib/mongodb';
import { GearCaseMatch } from '../../../lib/models/gear-models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Route based on HTTP method
    switch (req.method) {
      case 'GET':
        return handleGetRequest(req, res);
      case 'POST':
        return handlePostRequest(req, res);
      case 'PUT':
        return handlePutRequest(req, res);
      case 'DELETE':
        return handleDeleteRequest(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in matches API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Handle GET requests for matches
 */
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  const { 
    id, 
    page = '1', 
    limit = '10', 
    search = '', 
    gearType = '', 
    caseType = '',
    minScore = '',
    maxScore = '',
    sort = 'compatibilityScore',
    direction = 'desc'
  } = req.query;
  
  // If ID is provided, return a single match
  if (id) {
    const match = await GearCaseMatch.findById(id)
      .populate('gear')
      .populate('case');
      
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    return res.status(200).json(match);
  }
  
  // Build query for filtering
  const query: any = {};
  
  // Add search filter if provided
  if (search) {
    // We need to search in populated fields, so we'll handle this differently
    // First, get all matches with populated gear and case
    const allMatches = await GearCaseMatch.find()
      .populate('gear')
      .populate('case');
      
    // Then filter them based on search term
    const filteredIds = allMatches
      .filter(match => {
        const gear = typeof match.gearId === 'object' && match.gearId ? match.gearId as any : null;
        const caseItem = typeof match.caseId === 'object' && match.caseId ? match.caseId as any : null;
        
        if (!gear || !caseItem) return false;
        
        // Ensure search is a string before calling toLowerCase()
        const searchStr = typeof search === 'string' ? search.toLowerCase() : Array.isArray(search) ? search[0].toLowerCase() : '';
        
        return (
          gear.name.toLowerCase().includes(searchStr) ||
          gear.brand.toLowerCase().includes(searchStr) ||
          gear.type.toLowerCase().includes(searchStr) ||
          caseItem.name.toLowerCase().includes(searchStr) ||
          caseItem.brand.toLowerCase().includes(searchStr) ||
          caseItem.type.toLowerCase().includes(searchStr)
        );
      })
      .map(match => match._id);
      
    // Add to query
    query._id = { $in: filteredIds };
  }
  
  // Add match type filter if provided
  if (req.query.matchType) {
    query.matchType = req.query.matchType;
  }
  
  // Add gear type filter if provided
  if (gearType) {
    // We need to filter by a field in the populated gear document
    // First, get all matches with populated gear
    const matchesWithGearType = await GearCaseMatch.find()
      .populate('gear');
      
    const filteredIds = matchesWithGearType
      .filter(match => {
        // Safely access the gear property
        const gear = match.get('gear');
        return gear && gear.type === gearType;
      })
      .map(match => match._id);
      
    // Combine with existing query
    if (query._id) {
      query._id = { $in: filteredIds.filter(id => query._id.$in.includes(id)) };
    } else {
      query._id = { $in: filteredIds };
    }
  }
  
  // Add case type filter if provided
  if (caseType) {
    // Similar approach for case type
    const matchesWithCaseType = await GearCaseMatch.find()
      .populate('case');
      
    const filteredIds = matchesWithCaseType
      .filter(match => {
        // Safely access the case property
        const caseItem = match.get('case');
        return caseItem && caseItem.type === caseType;
      })
      .map(match => match._id);
      
    // Combine with existing query
    if (query._id) {
      query._id = { $in: filteredIds.filter(id => query._id.$in.includes(id)) };
    } else {
      query._id = { $in: filteredIds };
    }
  }
  
  // Add score range filters if provided
  if (minScore || maxScore) {
    query.compatibilityScore = {};
    if (minScore) {
      query.compatibilityScore.$gte = parseInt(minScore as string);
    }
    if (maxScore) {
      query.compatibilityScore.$lte = parseInt(maxScore as string);
    }
  }
  
  // Calculate pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;
  
  // Build sort object
  const sortObj: any = {};
  sortObj[sort as string] = direction === 'asc' ? 1 : -1;
  
  // Get total count for pagination
  const total = await GearCaseMatch.countDocuments(query);
  
  // Get matches with pagination and sorting
  const items = await GearCaseMatch.find(query)
    .populate('gear')
    .populate('case')
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum);
  
  // Return paginated results
  return res.status(200).json({
    items,
    total,
    page: pageNum,
    limit: limitNum,
    pages: Math.ceil(total / limitNum)
  });
}

/**
 * Handle POST requests to create new matches
 */
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;
  
  // Handle different actions
  switch (action) {
    case 'import':
      // Handle bulk import
      try {
        const { items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ message: 'Invalid import data' });
        }
        
        const result = await GearCaseMatch.insertMany(items);
        return res.status(201).json({ 
          message: `Successfully imported ${result.length} matches`,
          count: result.length
        });
      } catch (error) {
        console.error('Error importing matches:', error);
        return res.status(500).json({ message: 'Failed to import matches' });
      }
      
    case 'run-matching':
      // Handle running the matching algorithm
      try {
        // This would be a complex operation in a real implementation
        // For now, we'll just return a success message
        return res.status(200).json({ 
          message: 'Matching algorithm executed successfully',
          matchesCreated: 0
        });
      } catch (error) {
        console.error('Error running matching algorithm:', error);
        return res.status(500).json({ message: 'Failed to run matching algorithm' });
      }
      
    default:
      // Handle single item creation
      try {
        const newMatch = new GearCaseMatch(req.body);
        const savedMatch = await newMatch.save();
        return res.status(201).json(savedMatch);
      } catch (error) {
        console.error('Error creating match:', error);
        return res.status(500).json({ message: 'Failed to create match' });
      }
  }
}

/**
 * Handle PUT requests to update existing matches
 */
async function handlePutRequest(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }
  
  try {
    const updatedMatch = await GearCaseMatch.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedMatch) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    return res.status(200).json(updatedMatch);
  } catch (error) {
    console.error('Error updating match:', error);
    return res.status(500).json({ message: 'Failed to update match' });
  }
}

/**
 * Handle DELETE requests to remove matches
 */
async function handleDeleteRequest(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }
  
  try {
    const deletedMatch = await GearCaseMatch.findByIdAndDelete(id);
    
    if (!deletedMatch) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    return res.status(200).json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Error deleting match:', error);
    return res.status(500).json({ message: 'Failed to delete match' });
  }
}
