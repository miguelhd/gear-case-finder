import { NextApiRequest, NextApiResponse } from 'next';
import connectToMongoDB from '../../../lib/mongodb';
import { AudioGear } from '../../../lib/models/gear-models';

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
    console.error('Error in gear API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Handle GET requests for audio gear
 */
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  const { 
    id, 
    page = '1', 
    limit = '10', 
    search = '', 
    category = '', 
    brand = '',
    sort = 'name',
    direction = 'asc'
  } = req.query;
  
  // If ID is provided, return a single gear item
  if (id) {
    const gear = await AudioGear.findById(id);
    if (!gear) {
      return res.status(404).json({ message: 'Audio gear not found' });
    }
    return res.status(200).json(gear);
  }
  
  // Build query for filtering
  const query: any = {};
  
  // Add search filter if provided
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { type: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Add category filter if provided
  if (category) {
    query.category = category;
  }
  
  // Add brand filter if provided
  if (brand) {
    query.brand = brand;
  }
  
  // Calculate pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;
  
  // Build sort object
  const sortObj: any = {};
  sortObj[sort as string] = direction === 'asc' ? 1 : -1;
  
  // Get total count for pagination
  const total = await AudioGear.countDocuments(query);
  
  // Get gear items with pagination and sorting
  const items = await AudioGear.find(query)
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
 * Handle POST requests to create new audio gear
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
        
        const result = await AudioGear.insertMany(items);
        return res.status(201).json({ 
          message: `Successfully imported ${result.length} audio gear items`,
          count: result.length
        });
      } catch (error) {
        console.error('Error importing audio gear:', error);
        return res.status(500).json({ message: 'Failed to import audio gear' });
      }
      
    default:
      // Handle single item creation
      try {
        const newGear = new AudioGear(req.body);
        const savedGear = await newGear.save();
        return res.status(201).json(savedGear);
      } catch (error) {
        console.error('Error creating audio gear:', error);
        return res.status(500).json({ message: 'Failed to create audio gear' });
      }
  }
}

/**
 * Handle PUT requests to update existing audio gear
 */
async function handlePutRequest(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }
  
  try {
    const updatedGear = await AudioGear.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedGear) {
      return res.status(404).json({ message: 'Audio gear not found' });
    }
    
    return res.status(200).json(updatedGear);
  } catch (error) {
    console.error('Error updating audio gear:', error);
    return res.status(500).json({ message: 'Failed to update audio gear' });
  }
}

/**
 * Handle DELETE requests to remove audio gear
 */
async function handleDeleteRequest(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }
  
  try {
    const deletedGear = await AudioGear.findByIdAndDelete(id);
    
    if (!deletedGear) {
      return res.status(404).json({ message: 'Audio gear not found' });
    }
    
    return res.status(200).json({ message: 'Audio gear deleted successfully' });
  } catch (error) {
    console.error('Error deleting audio gear:', error);
    return res.status(500).json({ message: 'Failed to delete audio gear' });
  }
}
