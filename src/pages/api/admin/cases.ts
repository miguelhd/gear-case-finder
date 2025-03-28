import { NextApiRequest, NextApiResponse } from 'next';
import connectToMongoDB from '../../../lib/mongodb';
import { Case } from '../../../lib/models/gear-models';

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
    console.error('Error in cases API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Handle GET requests for cases
 */
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  const { 
    id, 
    page = '1', 
    limit = '10', 
    search = '', 
    type = '', 
    brand = '',
    protectionLevel = '',
    minPrice = '',
    maxPrice = '',
    sort = 'name',
    direction = 'asc'
  } = req.query;
  
  // If ID is provided, return a single case item
  if (id) {
    const caseItem = await Case.findById(id);
    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }
    return res.status(200).json(caseItem);
  }
  
  // Build query for filtering
  const query: any = {};
  
  // Add search filter if provided
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { type: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { material: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Add type filter if provided
  if (type) {
    query.type = type;
  }
  
  // Add brand filter if provided
  if (brand) {
    query.brand = brand;
  }
  
  // Add protection level filter if provided
  if (protectionLevel) {
    query.protectionLevel = protectionLevel;
  }
  
  // Add price range filters if provided
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) {
      query.price.$gte = parseFloat(minPrice as string);
    }
    if (maxPrice) {
      query.price.$lte = parseFloat(maxPrice as string);
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
  const total = await Case.countDocuments(query);
  
  // Get case items with pagination and sorting
  const items = await Case.find(query)
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
 * Handle POST requests to create new cases
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
        
        const result = await Case.insertMany(items);
        return res.status(201).json({ 
          message: `Successfully imported ${result.length} cases`,
          count: result.length
        });
      } catch (error) {
        console.error('Error importing cases:', error);
        return res.status(500).json({ message: 'Failed to import cases' });
      }
      
    default:
      // Handle single item creation
      try {
        const newCase = new Case(req.body);
        const savedCase = await newCase.save();
        return res.status(201).json(savedCase);
      } catch (error) {
        console.error('Error creating case:', error);
        return res.status(500).json({ message: 'Failed to create case' });
      }
  }
}

/**
 * Handle PUT requests to update existing cases
 */
async function handlePutRequest(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }
  
  try {
    const updatedCase = await Case.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedCase) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    return res.status(200).json(updatedCase);
  } catch (error) {
    console.error('Error updating case:', error);
    return res.status(500).json({ message: 'Failed to update case' });
  }
}

/**
 * Handle DELETE requests to remove cases
 */
async function handleDeleteRequest(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }
  
  try {
    const deletedCase = await Case.findByIdAndDelete(id);
    
    if (!deletedCase) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    return res.status(200).json({ message: 'Case deleted successfully' });
  } catch (error) {
    console.error('Error deleting case:', error);
    return res.status(500).json({ message: 'Failed to delete case' });
  }
}
